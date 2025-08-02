import * as Clipboard from "expo-clipboard";

export const copyToClipboard = async (text: string) => {
  await Clipboard.setStringAsync(text);
  alert("Copied to clipboard");
};

export const pasteFromClipboard = async () => {
  const text = await Clipboard.getStringAsync();
  alert("Pasted from clipboard");
  return text;
};
