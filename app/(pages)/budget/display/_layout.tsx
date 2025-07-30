import BottomTabs from "@/components/layout/bottomTabs";
import { Slot } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const BudgetMainLayout = () => {
  return (
    <View className={` flex-1`}>
      <View className={" pr-[10px] pl-[10px] flex-1"}>
        <Slot />
      </View>
      <BottomTabs />
    </View>
  );
};

export default BudgetMainLayout;
