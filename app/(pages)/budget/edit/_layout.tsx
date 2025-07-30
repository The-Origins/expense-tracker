import { BudgetItem } from "@/constants/common";
import { Slot } from "expo-router";
import React, { useDebugValue, useEffect, useState } from "react";
import { View } from "react-native";

const EditorLayout = () => {
  const [data, setData] = useState<
    { type: "keyword" | "recipient"; data: BudgetItem[] }[]
  >([]);

  useEffect(() => {

  }, [])

  return (
    <View className={` flex-1 pr-[10px] pl-[10px] `}>
      <Slot />
    </View>
  );
};

export default EditorLayout;
