import { DictionaryItem } from "@/constants/common";
import icons from "@/constants/icons";
import React, { useMemo } from "react";
import { Image, Pressable, View } from "react-native";
import ThemedText from "../themedText";

const DictionaryItemComponent = ({
  index,
  item,
  type,
  selected,
  selectMode,
  handleItemSelect,
  handleItemEdit,
}: {
  index: number;
  item: DictionaryItem;
  type: "keywords" | "recipients";
  selected: Set<string>;
  selectMode: boolean;
  handleItemSelect: (
    id: string,
    action: "add" | "delete",
    type: "keywords" | "recipients"
  ) => void;
  handleItemEdit: (index: number, type: "keywords" | "recipients") => void;
}) => {
  const formattedType = useMemo<"keyword" | "recipient">(
    () => (type === "keywords" ? "keyword" : "recipient"),
    [type]
  );
  const picked = useMemo<boolean>(
    () => selected.has(item.id),
    [item, selected]
  );

  const handleLongPress = () => {
    if (!picked) {
      handleItemSelect(item.id, "add", type);
    }
  };

  const handlePress = () => {
    if (selectMode) {
      handleItemSelect(item.id, picked ? "delete" : "add", type);
    } else {
      handleItemEdit(index, type);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      className={` flex-row items-center gap-2 p-[20px] rounded-[20px] ${type === "keywords" ? "bg-primary" : "bg-secondary"} `}
    >
      <View className=" flex-1 flex-col gap-1 ">
        {selectMode && (
          <Image
            source={icons.checkbox[picked ? "checked" : "unchecked"]}
            className=" w-[15px] h-[15px] "
          />
        )}
        <ThemedText toggleOnDark={false} className=" capitalize text-[1.2rem] ">
          <ThemedText toggleOnDark={false} className=" font-bold text-[1rem] ">
            {formattedType}:{" "}
          </ThemedText>
          {item[formattedType]}
        </ThemedText>
        {item.category && (
          <ThemedText
            toggleOnDark={false}
            className=" capitalize text-[1.2rem] "
          >
            <ThemedText
              toggleOnDark={false}
              className=" font-bold text-[1rem] "
            >
              Category:{" "}
            </ThemedText>
            {item.category}
          </ThemedText>
        )}
        {item.title && (
          <ThemedText
            toggleOnDark={false}
            className=" capitalize text-[1.2rem] "
          >
            <ThemedText
              toggleOnDark={false}
              className=" font-bold text-[1rem] "
            >
              Title:{" "}
            </ThemedText>
            {item.title}
          </ThemedText>
        )}
      </View>
      <Image
        source={icons.chevron}
        className=" w-[20px] h-[20px] rotate-[-90deg] "
      />
    </Pressable>
  );
};

export default DictionaryItemComponent;
