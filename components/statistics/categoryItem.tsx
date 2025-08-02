import { formatAmount } from "@/lib/appUtils";
import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
import ThemedText from "../themedText";

const CategoryItem = React.memo(
  ({
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
    const disabled = useMemo(
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
            toggleOnDark={disabled}
            className=" text-[1.2rem] font-urbanistMedium capitalize "
          >
            {name}
          </ThemedText>
        </View>
        <View className=" flex-1 flex-row items-center justify-center ">
          <ThemedText toggleOnDark={disabled} className="">
            {percent.toFixed(1)}%
          </ThemedText>
        </View>
        <View className=" flex-1 flex-row items-center justify-end ">
          <ThemedText
            toggleOnDark={disabled}
            className=" text-[1.2rem] font-urbanistBold "
          >
            -Ksh {formatAmount(amount, 10000)}
          </ThemedText>
        </View>
      </Pressable>
    );
  }
);

export default CategoryItem;
