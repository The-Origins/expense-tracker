import { colorCycle } from "@/constants/colorSettings";
import { DictionaryEntryType } from "@/constants/common";
import icons from "@/constants/icons";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
import ThemedIcon from "../themedIcon";
import ThemedText from "../themedText";

const DictionaryEntry = ({
  index,
  entry,
  type,
}: {
  index: number;
  entry: DictionaryEntryType;
  type: "keyword" | "recipient";
}) => {
  const router = useRouter();
  const isPaper = useMemo(() => index % 4 === 3, [index]);

  return (
    <Pressable
      onPress={() =>
        router.navigate({
          pathname: "/edit/dictionary/entry",
          params: { entry: " ", type, mode: "edit" },
        })
      }
      className={` flex-row p-[20px] mt-[10px] mb-[10px] rounded-[20px] bg-${colorCycle[(index % 4) as keyof typeof colorCycle]}  ${isPaper ? "dark:bg-paper-dark" : ""}`}
    >
      <View className=" flex-1 flex-col gap-2">
        <View className=" flex-row gap-1 items-center ">
          <ThemedText
            toggleOnDark={false}
            className=" text-divider capitalize "
          >
            {type}:
          </ThemedText>
          <ThemedText
            toggleOnDark={isPaper}
            className=" flex-wrap text-wrap max-w-[80%] text-black text-[1.1rem] capitalize "
          >
            {entry[type]}
          </ThemedText>
        </View>
        {entry.title ? (
          <View className=" flex-row gap-1 items-center ">
            <ThemedText
              toggleOnDark={false}
              className=" flex-row flex-wrap max-w-[80%] text-divider "
            >
              Title:
            </ThemedText>
            <ThemedText
              toggleOnDark={isPaper}
              className=" flex-wrap text-wrap max-w-[80%] text-black text-[1.1rem] capitalize "
            >
              {entry.title}
            </ThemedText>
          </View>
        ) : (
          <></>
        )}
        {entry.category ? (
          <View className=" flex-row gap-1 items-center ">
            <ThemedText
              toggleOnDark={false}
              className=" flex-row flex-wrap max-w-[80%] text-divider "
            >
              Category:
            </ThemedText>
            <ThemedText
              toggleOnDark={isPaper}
              className=" flex-wrap text-wrap max-w-[80%] text-black text-[1.1rem] capitalize "
            >
              {entry.category}
            </ThemedText>
          </View>
        ) : (
          <></>
        )}
      </View>
      <View className=" flex-col ">
        <Pressable>
          <ThemedIcon
            toggleOnDark={isPaper}
            source={icons.delete}
            className=" w-[20px] h-[20px] "
          />
        </Pressable>
      </View>
    </Pressable>
  );
};

export default DictionaryEntry;
