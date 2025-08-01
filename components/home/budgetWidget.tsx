import { getPercentColor, tintColors } from "@/constants/colorSettings";
import icons from "@/constants/icons";
import { getBudgets } from "@/lib/budgetUtils";
import { Budget } from "@/types/common";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, View } from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import ThemedText from "../themedText";

const HomeBudgetWidget = () => {
  const [budget, setBudget] = useState<Budget>();
  const percent = useMemo(
    () => (budget?.current || 1) / (budget?.total || 1),
    [budget]
  );
  const percentColor = useMemo(() => getPercentColor(percent), [percent]);

  useEffect(() => {
    const fetchBudget = async () => {
      const [data] = await getBudgets(1, true);
      setBudget(data);
    };
    fetchBudget();
  }, []);

  const handlePress = () => {
    if (budget) {
      router.push({
        pathname: "/(pages)/budget/display/details",
        params: { id: budget.id },
      });
    } else {
      router.push("/budget/edit/main");
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className=" p-[10px] rounded-[20px] bg-secondary flex-row gap-2"
    >
      {budget && (
        <View className=" relative">
          {percent <= 1 ? (
            <ProgressChart
              data={{ data: [percent] }}
              width={60}
              height={60}
              strokeWidth={10}
              radius={25}
              hideLegend={true}
              chartConfig={{
                backgroundColor: "#FFFFFF",
                backgroundGradientFrom: "#FFFFFF",
                backgroundGradientTo: "#FFFFFF",
                backgroundGradientFromOpacity: 0,
                backgroundGradientToOpacity: 0,
                color: (opacity = 1) =>
                  `rgba(${percentColor.chart}, ${opacity * 1.5})`,
              }}
            />
          ) : (
            <View className={` w-[60px] h-[60px] rounded-[50%] "bg-error" `} />
          )}
          <View className=" absolute h-[100%] w-[100%]  flex-row justify-center items-center">
            <View
              className={` flex-col justify-center items-center w-[40px] h-[40px] rounded-[50%] bg-secondary `}
            >
              <ThemedText toggleOnDark={false} className={percentColor.class}>
                {percent <= 1 ? (percent * 100).toFixed(1) : ">100"}%
              </ThemedText>
            </View>
          </View>
        </View>
      )}
      {budget ? (
        <>
          <View className=" flex-1 justify-center flex-col">
            <ThemedText
              toggleOnDark={false}
              className={` capitalize font-urbanistMedium text-[1.2rem] `}
            >
              {budget.title}
            </ThemedText>
            <ThemedText
              toggleOnDark={false}
              className={` font-urbanistBold text-[1.5rem] `}
            >
              {budget.total}
            </ThemedText>
            <ThemedText
              toggleOnDark={false}
              className={`${percentColor.class}`}
            >
              <ThemedText
                toggleOnDark={false}
                className={` font-urbanistBold ${percentColor.class} `}
              >
                Total:{" "}
              </ThemedText>
              {budget.current}
            </ThemedText>
          </View>
          <View className=" flex-row items-center">
            <Image
              source={icons.chevron}
              className=" w-[20px] h-[20px] rotate-[-90deg]"
            />
          </View>
        </>
      ) : (
        <View className=" flex-1 flex-row justify-between items-center ">
          <View className=" flex-row items-center gap-2 ">
            <Image
              source={icons.budget.filled}
              className=" w-[20px] h-[20px] "
            />
            <ThemedText
              toggleOnDark={false}
              className=" font-urbanistBold text-[1.2rem] "
            >
              No Active Budget
            </ThemedText>
          </View>
          <View className=" p-[20px] pt-[5px] pb-[5px] bg-black rounded-[20px] flex-row gap-1 items-center ">
            <Image
              source={icons.add}
              className=" w-[10px] h-[10px] "
              tintColor={tintColors.light}
            />
            <ThemedText toggleOnDark={false} className=" text-white ">
              Add budget
            </ThemedText>
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default HomeBudgetWidget;
