import { Expense, ManifestEntry } from "@/types/common";
import CryptoJS from "crypto-js";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import * as Sharing from "expo-sharing";
import { nanoid } from "nanoid/non-secure";
import * as path from "path";
import { unzipWithPassword, zipWithPassword } from "react-native-zip-archive";
import XLSX from "xlsx";
import { updateExpense } from "./expenseUtils";
import { requestMediaLibraryPermissions } from "./imageUtils";

const APP_SECRET = "🔥YourSuperSecretKey🔥";
const DB_PATH = `${FileSystem.documentDirectory}SQLite/app.db`;
const IMAGES_PATH = `${FileSystem.documentDirectory}images`;
const EXPORTS_PATH = `${FileSystem.cacheDirectory}exports`;
const IMPORTS_PATH = `${FileSystem.cacheDirectory}imports`;

const generateManifest = async (files: string[]) => {
  const promises: Promise<ManifestEntry>[] = [];

  for (const file of files) {
    promises.push(getFileInfo(file));
  }

  const manifestEntries = await Promise.all(promises);
  return manifestEntries;
};

const verifyEntry = async (entry: ManifestEntry, filePath: string) => {
  const info = await FileSystem.getInfoAsync(filePath);
  if (!info.exists) throw new Error(`Missing file: ${entry.relativePath}`);
  if (info.size !== entry.size)
    throw new Error(`Size mismatch: ${entry.relativePath}`);

  const fileDataBase64 = await FileSystem.readAsStringAsync(filePath, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const sha256 = CryptoJS.SHA256(
    CryptoJS.enc.Base64.parse(fileDataBase64)
  ).toString(CryptoJS.enc.Hex);

  if (sha256 !== entry.sha256)
    throw new Error(`Hash mismatch: ${entry.relativePath}`);
};

const getFileInfo = async (fileUri: string) => {
  const info = await FileSystem.getInfoAsync(fileUri);
  if (!info.exists) throw new Error(`File not found: ${fileUri}`);

  const fileDataBase64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const sha256 = CryptoJS.SHA256(
    CryptoJS.enc.Base64.parse(fileDataBase64)
  ).toString(CryptoJS.enc.Hex);

  return {
    relativePath: path.basename(fileUri), // keep only file name for zip
    size: info.size,
    sha256,
  };
};

export const selectDbImport = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/zip",
  });

  if (result.canceled) {
    throw new Error(`Operation canceled`);
  }

  const file = result.assets[0];
  return file;
};

export const importDb = async (
  file: DocumentPicker.DocumentPickerAsset,
  password: string
) => {
  const unzipDir = `${IMPORTS_PATH}/${file.name}`;

  await FileSystem.makeDirectoryAsync(unzipDir, { intermediates: true });
  await unzipWithPassword(file.uri, unzipDir, password);

  const files = await FileSystem.readDirectoryAsync(unzipDir);
  const hmacFileName = "_INTEGRITY.HMAC";
  if (!files.includes(hmacFileName))
    throw new Error("Missing integrity file", { cause: 1 });

  const integrityData = await FileSystem.readAsStringAsync(
    `${unzipDir}/${hmacFileName}`,
    {
      encoding: FileSystem.EncodingType.UTF8,
    }
  );
  const { manifest, hmac: storedHmac } = JSON.parse(integrityData);

  const recomputedHmac = CryptoJS.HmacSHA256(
    JSON.stringify(manifest),
    APP_SECRET
  ).toString(CryptoJS.enc.Hex);
  if (storedHmac !== recomputedHmac)
    throw new Error("Manifest tampering detected", { cause: 1 });

  let promises: Promise<void>[] = [];

  for (const entry of manifest) {
    const filePath = `${unzipDir}/${entry.relativePath}`;
    promises.push(verifyEntry(entry, filePath));
  }

  promises.push(
    FileSystem.deleteAsync(`${FileSystem.documentDirectory}images`, {
      idempotent: true,
    })
  );
  await Promise.all(promises);
  promises = [];

  promises.push(
    FileSystem.copyAsync({
      from: `${unzipDir}/app.db`,
      to: DB_PATH,
    })
  );

  const imageFiles = await FileSystem.readDirectoryAsync(`${unzipDir}/images`);
  for (const file of imageFiles) {
    promises.push(
      FileSystem.copyAsync({
        from: `${unzipDir}/images/${file}`,
        to: `${FileSystem.documentDirectory}images/${file}`,
      })
    );
  }
  await Promise.all(promises);

  await FileSystem.deleteAsync(unzipDir, { idempotent: true });
};

export const exportDb = async (password: string) => {
  const imageFiles = await FileSystem.readDirectoryAsync(IMAGES_PATH);
  let allFiles = imageFiles.map((file) => `${IMAGES_PATH}/${file}`);
  allFiles.push(DB_PATH);

  const manifest = await generateManifest(allFiles);
  const manifestJson = JSON.stringify(manifest);

  const hmac = CryptoJS.HmacSHA256(manifestJson, APP_SECRET).toString(
    CryptoJS.enc.Hex
  );

  const integrityData = JSON.stringify({ manifest, hmac });
  const hmacFile = `${FileSystem.cacheDirectory}_INTEGRITY.HMAC`;
  await FileSystem.writeAsStringAsync(hmacFile, integrityData, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  allFiles.push(hmacFile);

  const zipUri = `${EXPORTS_PATH}/export_${new Date().toISOString()}.zip`;
  await zipWithPassword(allFiles, zipUri, password);

  await Sharing.shareAsync(zipUri);
};

export const exportExpenses = async (
  expenses: Partial<Expense>[],
  properties: string[],
  images: boolean
) => {
  if (images) {
    const permitted = await requestMediaLibraryPermissions();

    if (!permitted) {
      throw new Error(`Permission denied`);
    }
  }

  let promises = [];
  let data = [];

  for (let expense of expenses) {
    data.push(
      properties.reduce(
        (obj, property) => {
          obj[property] = expense[property as keyof typeof expense];
          return obj;
        },
        {} as Record<string, string | number | undefined>
      )
    );

    if (images && expense.image) {
      promises.push(
        MediaLibrary.saveToLibraryAsync(
          `${FileSystem.documentDirectory}images/${expense.image}`
        )
      );
    }
  }

  await Promise.all(promises);

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Expenses");

  const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });
  const excelUri = `${EXPORTS_PATH}/export_${new Date().toISOString()}`;

  await FileSystem.writeAsStringAsync(excelUri, wbout, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await Sharing.shareAsync(excelUri);
};

export const selectExpensesImport = async () => {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  if (result.canceled) {
    throw new Error(`Operation canceled`, { cause: 1 });
  }
  return result.assets[0].uri;
};

export const importExpenses = async (uri: string) => {
  const b64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const wb = XLSX.read(b64, { type: "base64" });
  const ws = wb.Sheets["Expenses"];

  const expenses: Partial<Expense>[] = XLSX.utils.sheet_to_json(ws);
  let promises = [];

  for (let expense of expenses) {
    if (
      !expense.title ||
      !expense.category ||
      !expense.date ||
      !expense.recipient ||
      !expense.amount
    ) {
      expense.collection = "failed";
    } else {
      expense.collection = expense.category;
    }
    expense.id = nanoid();
    expense.currency = "Ksh";

    promises.push(updateExpense(expense));
  }

  await Promise.all(promises);
  return expenses;
};
