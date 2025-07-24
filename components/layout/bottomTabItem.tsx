import { tintColors } from "@/constants/colorSettings";
import icons from "@/constants/icons";
import { useThemeContext } from "@/context/themeContext";
import { Href, Link, useSegments } from "expo-router";
import React, { useMemo } from "react";
import { Image, Pressable, View } from "react-native";
import ThemedIcon from "../themedIcon";
import ThemedText from "../themedText";

const paths: Record<string, Href> = {
  home: "/",
  add: "/expenses/edit/expense",
  expenses: "/expenses/display/collections",
  statistics: {
    pathname: "/statistics/main",
    params: { year: "2025", month: "2", day: "12" },
  },
  budget: "/budget",
};

const BottomTabItem = ({
  type,
}: {
  type: "home" | "expenses" | "add" | "statistics" | "budget";
}) => {
  const { theme } = useThemeContext();
  const [_, tab] = useSegments();
  const active = useMemo<boolean>(
    () => tab === type || (!tab && type === "home"),
    [tab]
  );

  return (
    <Link href={paths[type]} asChild>
      <Pressable className="flex-1">
        {type !== "add" ? (
          <View className="flex-1 flex-col items-center justify-center">
            <ThemedIcon
              source={icons[type][active ? "filled" : "outlined"]}
              alt={type}
              className=" w-[24px] h-[24px]"
            />
            <ThemedText
              className={`text-[0.8rem] ${active ? " font-urbanistBold" : ""}`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </ThemedText>
          </View>
        ) : (
          <View className=" w-[100%] h-[100%] flex-row justify-center items-center ">
            <View className=" w-[40px] h-[40px] flex-row justify-center  items-center rounded-[20px] bg-black dark:bg-white">
              <Image
                source={icons.add}
                className="w-[20px] h-[20px]"
                tintColor={tintColors[theme]}
              />
            </View>
          </View>
        )}
      </Pressable>
    </Link>
  );
};

export default BottomTabItem;
