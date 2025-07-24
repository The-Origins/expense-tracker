import { Slot } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const TabsLayout = () => {
  return (
    <>
      <SafeAreaView
        className={`flex-1 bg-background-light dark:bg-background-dark`}
      >
        <Slot />
      </SafeAreaView>
    </>
  );
};

export default TabsLayout;
