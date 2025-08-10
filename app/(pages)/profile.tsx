import ZipPasswordModal from "@/components/profile/zipPasswordModal";
import StatusModal from "@/components/statusModal";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { tintColors } from "@/constants/colorSettings";
import icons from "@/constants/icons";
import { useThemeContext } from "@/context/themeContext";
import { exportDb, importDb, selectDbImport } from "@/lib/exportUtils";
import { Status } from "@/types/common";
import { DocumentPickerAsset } from "expo-document-picker";
import { Link, router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";
import Toast from "react-native-root-toast";

const Profile = () => {
  const { theme, toggleTheme } = useThemeContext();
  const [importFile, setImportFile] = useState<DocumentPickerAsset>();
  const isDarkTheme = useMemo(() => theme === "dark", [theme]);
  const [zipPasswordModal, setZipPasswordModal] = useState<
    "import" | "export" | ""
  >("");
  const [status, setStatus] = useState<Status>({
    open: false,
    type: "info",
    handleClose() {},
    action: { callback() {} },
  });

  const handleStatusClose = () => {
    setStatus({
      open: false,
      type: "info",
      handleClose() {},
      action: { callback() {} },
    });
  };

  const handleZipPasswordModalSubmit = async (password: string) => {
    switch (zipPasswordModal) {
      case "import":
        handleImport(password);
        break;

      case "export":
        handleExport(password);
        break;
      default:
        break;
    }
  };

  const handleExport = async (password: string) => {
    try {
      setStatus({
        open: true,
        type: "loading",
        title: "Exporting data",
        message: "This may take a while.",
        handleClose: handleStatusClose,
        action: {
          callback() {},
        },
      });
      await exportDb(password);
      handleStatusClose();
    } catch (error: any) {
      if (error.cause === 1) {
        Toast.show(error.message, { duration: Toast.durations.SHORT });
      } else {
        Toast.show(`There was an error importing data `);
      }
      handleStatusClose();
      console.error(error);
    }
  };

  const selectImportFile = async () => {
    try {
      setStatus({
        open: true,
        type: "warning",
        title: "Overwrite data?",
        message:
          "All your current data will be lost, and replaced with the imported data. Export your data first if you want to keep it.",
        handleClose: handleStatusClose,
        action: {
          callback: async () => {
            const file = await selectDbImport();
            setImportFile(file);
            setZipPasswordModal("import");
          },
        },
      });
    } catch (error: any) {
      if (error.cause === 1) {
        Toast.show(error.message, { duration: Toast.durations.SHORT });
      } else {
        Toast.show(`There was an error importing data `);
      }
      console.error(error);
    }
  };

  const handleImport = async (password: string) => {
    try {
      if (importFile) {
        setStatus({
          open: true,
          type: "loading",
          title: "Importing data",
          message: "This may take a while.",
          handleClose: handleStatusClose,
          action: {
            callback() {},
          },
        });
        await importDb(importFile, password);
        setStatus({
          open: true,
          type: "success",
          title: "Data imported",
          message: "New data imported",
          handleClose: handleStatusClose,
          action: {
            callback: () => {
              router.push("/");
            },
          },
        });
      } else {
        throw new Error(`No Image selected`);
      }
    } catch (error: any) {
      if (error.cause === 1) {
        Toast.show(error.message, { duration: Toast.durations.SHORT });
      } else {
        Toast.show(`There was an error importing data `);
      }
      console.error(error);
    }
  };

  return (
    <>
      <View className=" flex-1 flex-col pr-[10px] pl-[10px] ">
        <View className=" pt-[5px] pb-[5px] flex-row items-center justify-between ">
          <View className=" flex-row items-center ">
            <Pressable
              onPress={router.back}
              className=" w-[40px] h-[40px] flex-row items-center "
            >
              <ThemedIcon
                source={icons.arrow}
                className=" w-[20px] h-[20px] rotate-180 "
              />
            </Pressable>
            <ThemedText className=" font-urbanistBold text-[2rem] ">
              Preferences
            </ThemedText>
          </View>
        </View>
        <ScrollView>
          <View className=" flex-1 flex-col gap-[30px] pt-[40px] pb-[20px] ">
            <View className=" flex-col gap-[10px] ">
              <ThemedText className=" font-urbanistBold text-[1.2rem] ">
                Data
              </ThemedText>
              <View className=" p-[20px]  bg-paper-light flex-col gap-[20px] rounded-[20px] dark:bg-paper-dark ">
                <View className=" flex-row gap-[20px] ">
                  <Pressable
                    onPress={selectImportFile}
                    className=" flex-1 flex-row justify-center items-center gap-2 pt-[5px] pb-[5px] rounded-[20px] border dark:border-white "
                  >
                    <ThemedIcon
                      source={icons.import}
                      className=" w-[15px] h-[15px] "
                    />
                    <ThemedText>Import Data</ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => setZipPasswordModal("export")}
                    className=" flex-1 flex-row justify-center items-center gap-2 pt-[5px] pb-[5px] rounded-[20px] border dark:border-white "
                  >
                    <ThemedIcon
                      source={icons.export}
                      className=" w-[15px] h-[15px] "
                    />
                    <ThemedText>Export Data</ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>
            <View className=" flex-col gap-[10px] ">
              <ThemedText className=" font-urbanistBold text-[1.2rem] ">
                Settings
              </ThemedText>
              <View className=" p-[20px]  bg-paper-light flex-col gap-[20px] rounded-[20px] dark:bg-paper-dark ">
                <View className=" flex-row justify-between items-center ">
                  <ThemedText className=" text-[1.1rem] font-urbanistMedium ">
                    Theme
                  </ThemedText>
                  <View className=" flex-row items-center gap-2 ">
                    <ThemedText>Light</ThemedText>
                    <Switch
                      trackColor={{
                        false: tintColors.divider,
                        true: tintColors.divider,
                      }}
                      thumbColor={
                        isDarkTheme
                          ? tintColors.paper.light
                          : tintColors.paper.dark
                      }
                      ios_backgroundColor="#3e3e3e"
                      onValueChange={toggleTheme}
                      value={isDarkTheme}
                    />
                    <ThemedText>Dark</ThemedText>
                  </View>
                </View>
              </View>
            </View>
            <View className=" flex-col gap-[10px] ">
              <ThemedText className=" font-urbanistBold text-[1.2rem] ">
                Dictionary
              </ThemedText>
              <View className=" p-[20px]   bg-paper-light flex-col gap-[20px] rounded-[20px] dark:bg-paper-dark ">
                <Link href="/dictionary/main" asChild>
                  <Pressable className=" flex-row items-center gap-1 ">
                    <View className=" flex-1 flex-col gap-1">
                      <ThemedText className=" text-[1.1rem] font-urbanistMedium ">
                        My Dictionary
                      </ThemedText>
                      <ThemedText
                        toggleOnDark={false}
                        className=" text-divider  text-[0.9rem] max-w-[200px] "
                      >
                        This is used to
                        <Text className=" font-urbanistBold ">
                          {" "}
                          automaticaly{" "}
                        </Text>
                        assign
                        <Text className=" font-urbanistBold "> titles </Text>
                        and
                        <Text className=" font-urbanistBold "> categories</Text>
                        .
                      </ThemedText>
                    </View>
                    <ThemedIcon
                      source={icons.chevron}
                      className=" w-[15px] h-[15px] rotate-[-90deg] "
                    />
                  </Pressable>
                </Link>
              </View>
            </View>
            <View className=" flex-col gap-[10px] ">
              <ThemedText className=" font-urbanistBold text-[1.2rem] ">
                About
              </ThemedText>
              <View className=" flex-col gap-[10px] p-[20px] rounded-[20px] bg-paper-light dark:bg-paper-dark ">
                <Pressable className=" flex-row pt-[10px] pb-[10px] justify-between items-center ">
                  <ThemedText className=" font-urbanistMedium text-[1.2rem] ">
                    Send Feedback
                  </ThemedText>
                  <ThemedIcon
                    source={icons.chevron}
                    className=" w-[15px] h-[15px] rotate-[-90deg] "
                  />
                </Pressable>
                <Pressable className=" flex-row pt-[10px] pb-[10px] justify-between items-center ">
                  <ThemedText className=" font-urbanistMedium text-[1.2rem] ">
                    Factory Reset
                  </ThemedText>
                  <ThemedIcon
                    source={icons.history}
                    className=" w-[15px] h-[15px] "
                  />
                </Pressable>
                <View className=" flex-row pt-[10px] pb-[10px] justify-between items-center ">
                  <ThemedText className=" font-urbanistMedium text-[1.2rem] ">
                    Version
                  </ThemedText>
                  <ThemedText toggleOnDark={false} className=" text-divider ">
                    Alpha 1.0.1
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
      <StatusModal status={status} />
      <ZipPasswordModal
        open={!!zipPasswordModal}
        handleClose={() => setZipPasswordModal("")}
        handleSubmit={handleZipPasswordModalSubmit}
      />
    </>
  );
};

export default Profile;
