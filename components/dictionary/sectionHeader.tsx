import icons from "@/constants/icons";
import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
import ThemedIcon from "../themedIcon";
import ThemedText from "../themedText";

const DictionarySectionHeader = ({
  type,
  allSelected,
  selectMode,
  handleSelectSection,
  handleSectionNavigation,
}: {
  type: "keywords" | "recipients";
  allSelected: boolean;
  selectMode: boolean;
  handleSelectSection: (
    type: "keywords" | "recipients",
    allSelected: boolean
  ) => void;
  handleSectionNavigation: (type: "keywords" | "recipients") => void;
}) => {
  const handlePress = () => {
    if (selectMode) {
      handleSelectSection(type, allSelected);
    } else {
      handleSectionNavigation(type);
    }
  };
  return (
    <View className=" mt-[20px] mb-[20px] flex-row justify-between items-center ">
      <ThemedText className=" capitalize font-urbanistBold text-[1.5rem] ">
        {type}
      </ThemedText>
      <Pressable onPress={handlePress}>
        {selectMode ? (
          <ThemedIcon
            source={icons.checkbox[allSelected ? "checked" : "unchecked"]}
            className=" w-[20px] h-[20px] "
          />
        ) : (
          <View className=" flex-row gap-2 items-center p-[15px] pt-[10px] pb-[10px] rounded-[20px] bg-black dark:bg-white ">
            <ThemedIcon
              reverse
              source={icons.add}
              className=" w-[10px] h-[10px] "
            />
            <ThemedText reverse>Add</ThemedText>
          </View>
        )}
      </Pressable>
    </View>
  );
};

export default DictionarySectionHeader;
