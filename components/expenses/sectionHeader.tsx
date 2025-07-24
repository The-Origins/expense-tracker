import { tintColors } from "@/constants/colorSettings";
import icons from "@/constants/icons";
import { useThemeContext } from "@/context/themeContext";
import React, { useMemo } from "react";
import { Image, Pressable, View } from "react-native";
import ThemedText from "../themedText";

const ExpenseSectionHeader = ({
  section,
  selectMode,
  selectedSections,
  handleSelectSection,
}: {
  section: { id: string; data: number[] };
  selectMode: boolean;
  selectedSections: Record<string, number>;
  handleSelectSection: (
    section: { id: string; data: number[] },
    action: "add" | "delete"
  ) => void;
}) => {
  const { theme } = useThemeContext();
  const picked = useMemo(
    () =>
      selectedSections[section.id] &&
      selectedSections[section.id] >= section.data.length,
    [section, selectedSections]
  );
  const handleSelectAll = () => {
    handleSelectSection(section, picked ? "delete" : "add");
  };
  return (
    <View className=" flex-row justify-between items-center ">
      <ThemedText className=" text-divider ">{section.id}</ThemedText>
      <Pressable style={{ zIndex: 100 }} onPress={handleSelectAll}>
        <Image
          source={icons.checkbox[picked ? "checked" : "unchecked"]}
          tintColor={
            selectMode
              ? theme === "dark"
                ? tintColors.light
                : tintColors.dark
              : tintColors.divider
          }
          className=" w-[20px] h-[20px] "
        />
      </Pressable>
    </View>
  );
};

export default ExpenseSectionHeader;
