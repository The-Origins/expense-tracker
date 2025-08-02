import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";

export const takeImage = async () => {};

export const pickImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    quality: 1,
  });

  console.log(result);

  if (!result.canceled) {
    return result.assets[0].uri;
  } else {
    return null;
  }
};

export const saveImage = async (uri: string) => {
  const fileName = uri.split("/").pop();
  const newPath = `${FileSystem.documentDirectory}${fileName}`;
  await FileSystem.copyAsync({
    from: uri,
    to: newPath,
  });
  return newPath;
};

export const deleteImage = async (uri: string) => {
  await FileSystem.deleteAsync(uri);
};

export const fileExists = async (uri: string) => {
  const info = await FileSystem.getInfoAsync(uri);
  return info.exists;
};

export const requestMediaLibraryPermissions = async () => {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  return status === "granted";
};

export const dowloadImage = async (uri: string) => {
  const permitted = await requestMediaLibraryPermissions();

  if (!permitted) {
    throw new Error(`Permission denied`);
  }

  await MediaLibrary.saveToLibraryAsync(uri);
};
