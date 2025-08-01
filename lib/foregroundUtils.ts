import VIForegroundService from "@voximplant/react-native-foreground-service";

export const registerForeground = async () => {
  console.log("registered foreground");
  const channelConfig = {
    id: "receiptListener",
    name: "receipt listener",
    description: "Listens for sms messages with m-pesa receipts",
    enableVibration: false,
  };
  await VIForegroundService.getInstance().createNotificationChannel(
    channelConfig
  );
};

export const startForeground = async () => {
  console.log("started foreground");
  const notificationConfig = {
    channelId: "receiptListener",
    id: 3456,
    title: "Title",
    text: "Some text",
    icon: "ic_icon",
    button: "Some text",
  };
  await VIForegroundService.getInstance().startService(notificationConfig);
};
