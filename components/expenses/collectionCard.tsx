import icons from "@/constants/icons";
import React, { useMemo } from "react";
import { Pressable } from "react-native";
import ThemedIcon from "../themedIcon";
import ThemedText from "../themedText";

const CollectionCard = ({
  name,
  selected,
  selectMode,
  count,
  onPress,
  onLongPress,
}: {
  name: "add" | string;
  selected: Set<string>;
  selectMode: boolean;
  count?: number;
  onPress: (name: string) => void;
  onLongPress: (name: string) => void;
}) => {
  const picked = useMemo(() => selected.has(name), [selected]);
  return (
    <Pressable
      onLongPress={() => onLongPress(name)}
      onPress={() => onPress(name)}
      className=" relative w-[100px] h-[100px] p-[10px] gap-1 rounded-[20px] bg-paper-light flex-col justify-center items-center dark:bg-paper-dark "
    >
      {selectMode && name !== "add" && (
        <ThemedIcon
          source={icons.checkbox[picked ? "checked" : "unchecked"]}
          className=" absolute right-2 top-3 w-[15px] h-[15px] "
        />
      )}
      <ThemedIcon
        source={icons[name === "add" ? "add" : "folder"]}
        className={`${name === "add" ? "h-[30px] w-[30px]" : "w-[40px] h-[40px]"} `}
      />
      <ThemedText className=" capitalize ">{name}</ThemedText>
      {count !== undefined && (
        <ThemedText toggleOnDark={false} className=" text-divider ">
          {count}
        </ThemedText>
      )}
    </Pressable>
  );
};

export default CollectionCard;
