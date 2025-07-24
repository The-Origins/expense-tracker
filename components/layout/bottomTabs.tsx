import React from "react";
import { View } from "react-native";
import BottomTabItem from "./bottomTabItem";

const BottomTabs = () => {
  return (
    <View className=" h-[50px] flex-row gap-2 rounded-[10px] bg-paper-light dark:bg-paper-dark ">
      <BottomTabItem type="home" />
      <BottomTabItem type="expenses" />
      <BottomTabItem type="add" />
      <BottomTabItem type="statistics" />
      <BottomTabItem type="budget" />
    </View>
  );
};

export default BottomTabs;
