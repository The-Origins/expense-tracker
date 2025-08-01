import { PermissionsAndroid, Platform } from "react-native";

export const requestSMSPermission = async () => {
  if (Platform.OS === "android") {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
      PermissionsAndroid.PERMISSIONS.READ_SMS,
    ]);
    if (
      granted[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      granted[PermissionsAndroid.PERMISSIONS.READ_SMS] ===
        PermissionsAndroid.RESULTS.GRANTED
    ) {
      console.log("SMS permissions granted");
      // You can now expect SMS to be received
    } else {
      console.log("SMS permissions denied");
    }
    console.log("Permission:", granted);
  }
};
