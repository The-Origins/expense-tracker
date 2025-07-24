import icons from "@/constants/icons";
import { Link } from "expo-router";
import React from "react";
import { Image, Pressable, View } from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import ThemedText from "../themedText";

const HomeBudgetWidget = () => {
  const data = {
    data: [0.7],
  };

  return (
    <Link href={"/budget"} asChild>
      <Pressable className=" p-[10px] rounded-[20px] bg-secondary flex-row gap-2">
        <View className=" relative">
          <ProgressChart
            data={data}
            width={60}
            height={60}
            strokeWidth={10}
            radius={25}
            hideLegend={true}
            chartConfig={{
              backgroundColor: "#CFDECA",
              backgroundGradientFrom: "#CFDECA",
              backgroundGradientTo: "#CFDECA",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 1.5})`,
            }}
          />
          <View className=" absolute h-[100%] w-[100%] flex-row justify-center items-center">
            <ThemedText toggleOnDark={false}>70%</ThemedText>
          </View>
        </View>
        <View className=" flex-1 justify-center flex-col gap-1">
          <ThemedText toggleOnDark={false} className="font-urbanistBold text-[1.4rem]">
            Total Buget Usage: 70%
          </ThemedText>
          <View className=" flex-row gap-1 items-center">
            <Image source={icons.check} className=" w-[10px] h-[10px]" />
            <ThemedText toggleOnDark={false}>in budget</ThemedText>
          </View>
        </View>
        <View className=" flex-row items-center">
          <Image
            source={icons.chevron}
            className=" w-[20px] h-[20px] rotate-[-90deg]"
          />
        </View>
      </Pressable>
    </Link>
  );
};

export default HomeBudgetWidget;
