import { tintColors } from "@/constants/colorSettings";
import icons from "@/constants/icons";
import { useThemeContext } from "@/context/themeContext";
import React, { useEffect, useMemo } from "react";
import { Image, Pressable, View } from "react-native";
import ThemedText from "../themedText";

const ExpenseSectionHeader = React.memo(
  ({
    section,
    selectMode,
    selectAll,
    selected,
    handleSectionSelect,
  }: {
    section: { id: string; data: number[] };
    selectMode: boolean;
    selectAll: boolean | null;
    selected: Set<number> | undefined;
    handleSectionSelect: (
      section: { id: string; data: number[] },
      selectAll: boolean
    ) => void;
  }) => {
    const { theme } = useThemeContext();
    const picked = useMemo(
      () => !!(selected?.size === section.data.length),
      [selected]
    );
    const handleSelect = () => {
      handleSectionSelect(section, !picked);
    };

    useEffect(() => {
      if (selectAll !== null) {
        handleSectionSelect(section, selectAll);
      }
    }, [selectAll]);

    return (
      <View className=" flex-row justify-between items-center ">
        <ThemedText className=" text-divider ">{section.id}</ThemedText>
        <Pressable style={{ zIndex: 100 }} onPress={handleSelect}>
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
  }
);

export default ExpenseSectionHeader;
