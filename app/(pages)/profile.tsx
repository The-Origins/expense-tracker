import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { tintColors } from "@/constants/colorSettings";
import icons from "@/constants/icons";
import { useThemeContext } from "@/context/themeContext";
import { Link, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Image, Pressable, ScrollView, Switch, Text, View } from "react-native";

const Profile = () => {
  const router = useRouter();
  const { theme, toggleTheme } = useThemeContext();
  const isDarkTheme = useMemo(() => theme === "dark", [theme]);

  return (
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
            Profile
          </ThemedText>
        </View>
      </View>
      <ScrollView>
        <View className=" flex-1 flex-col gap-[30px] pt-[40px] pb-[20px] ">
          <View className=" p-[20px] bg-primary rounded-[20px] flex-row gap-[10px] items-center ">
            <View className=" h-[40px] w-[40px] bg-paper-light rounded-[20px] flex-row justify-center items-center">
              <Image source={icons.avatar} className="w-[20px] h-[20px]" />
            </View>
            <View className=" flex-1 flex-col ">
              <Text className=" font-urbanistBold text-[1.5rem] ">
                John Doe
              </Text>
              <Text>johndoe@gmail.com</Text>
            </View>
            <Pressable className=" flex-row justify-center items-center h-[30px] w-[30px] bg-black rounded-[15px] ">
              <Image
                source={icons.logout}
                className=" ml-[4px] w-[15px] h-[15px]"
                tintColor={tintColors.light}
              />
            </Pressable>
          </View>
          <View className=" flex-col gap-[10px] ">
            <ThemedText className=" font-urbanistBold text-[1.2rem] ">
              Data
            </ThemedText>
            <View className=" p-[20px] pr-[10px] pl-[10px]  bg-paper-light flex-col gap-[20px] rounded-[20px] dark:bg-paper-dark ">
              <View className=" flex-row justify-between items-center ">
                <ThemedText className=" text-wrap max-w-[200px] ">
                  Backup your data to avoid loosing it
                </ThemedText>
                <Pressable className=" p-[10px] pt-[5px] pb-[5px] bg-black rounded-[20px] dark:bg-white ">
                  <ThemedText reverse className=" text-white ">
                    Link Google Drive
                  </ThemedText>
                </Pressable>
              </View>
              <View className=" flex-row gap-[20px] ">
                <Pressable className=" flex-1 flex-row justify-center pt-[5px] pb-[5px] rounded-[20px] border dark:border-white ">
                  <ThemedText>Import Data</ThemedText>
                </Pressable>
                <Pressable className=" flex-1 flex-row justify-center pt-[5px] pb-[5px] rounded-[20px] border dark:border-white ">
                  <ThemedText>Export Data</ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
          <View className=" flex-col gap-[10px] ">
            <ThemedText className=" font-urbanistBold text-[1.2rem] ">
              Preferences
            </ThemedText>
            <View className=" p-[10px]  bg-paper-light flex-col gap-[20px] rounded-[20px] dark:bg-paper-dark ">
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
            <View className=" p-[20px]  pl-[10px] pr-[10px]  bg-paper-light flex-col gap-[20px] rounded-[20px] dark:bg-paper-dark ">
              <Link href="/dictionary" asChild>
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
                      <Text className=" font-urbanistBold "> categories</Text>.
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
        </View>
      </ScrollView>
    </View>
  );
};

export default Profile;
