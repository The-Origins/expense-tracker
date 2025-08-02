import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

export const pickImage = async () => {
  // No permissions request is necessary for launching the image library
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
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
