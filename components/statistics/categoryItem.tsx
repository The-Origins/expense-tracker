import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
import ThemedText from "../themedText";

const CategoryItem = ({
  index,
  name,
  percent,
  amount,
  color,
  highlight,
  handleClick,
}: {
  index: number;
  name: string;
  percent: number;
  amount: number;
  color: string;
  highlight: number | null;
  handleClick: (value: number) => void;
}) => {
  const isPaper = useMemo(
    () => !!highlight && highlight !== index,
    [highlight]
  );
  return (
    <Pressable
      onPress={() => handleClick(index)}
      style={{
        backgroundColor: color,
      }}
      className={` p-[20px] rounded-[20px] flex-row gap-1 `}
    >
      <View className=" flex-1 flex-row justify-start ">
        <ThemedText
          toggleOnDark={isPaper}
          className=" text-[1.2rem] font-urbanistMedium capitalize "
        >
          {name}
        </ThemedText>
      </View>
      <View className=" flex-1 flex-row items-center justify-center ">
        <ThemedText toggleOnDark={isPaper} className="">
          {percent.toFixed(1)}%
        </ThemedText>
      </View>
      <View className=" flex-1 flex-row items-center justify-end ">
        <ThemedText
          toggleOnDark={isPaper}
          className=" text-[1.2rem] font-urbanistBold "
        >
          -${amount}
        </ThemedText>
      </View>
    </Pressable>
  );
};

export default CategoryItem;
