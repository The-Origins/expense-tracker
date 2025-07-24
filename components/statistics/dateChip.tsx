import React, { useMemo } from "react";
import { Pressable } from "react-native";
import ThemedText from "../themedText";

const DateChip = ({
  value,
  label,
  datePart,
  size = "md",
  handleClick,
}: {
  value: number;
  label?: string;
  datePart: number | undefined;
  size?: "sm" | "md";
  handleClick: (value: number) => void;
}) => {
  const active = useMemo(() => datePart === value, [datePart]);

  return (
    <Pressable
      onPress={() => handleClick(value)}
      className={` ${size === "sm" ? "w-[55px]" : size === "md" ? "w-[100px]" : ""} pt-[10px] flex-row items-center justify-center pb-[10px] rounded-[20px] border ${active ? "bg-black dark:bg-white" : ""} dark:border-white `}
    >
      <ThemedText reverse={active}>{label || value}</ThemedText>
    </Pressable>
  );
};

export default DateChip;
