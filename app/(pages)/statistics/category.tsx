import CategoryItem from "@/components/statistics/categoryItem";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { tintColors } from "@/constants/colorSettings";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import { useThemeContext } from "@/context/themeContext";
import { formatAmount } from "@/lib/appUtils";
import {
  getCategoryStatistics,
  parseExpenseStatistic,
} from "@/lib/statisticsUtils";
import { Statistic } from "@/types/common";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, View } from "react-native";
import { PieChart } from "react-native-chart-kit";
import * as Progress from "react-native-progress";

const CategoryStatistics = () => {
  const { theme } = useThemeContext();
  const { category, total } = useLocalSearchParams();

  const { timeString } = useAppProps() as {
    timeString: string;
  };

  const [loading, setLoading] = useState<boolean>(true);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [data, setData] = useState<Statistic[]>([]);
  const parsedData = useMemo<{ name: string; amount: number; color: string }[]>(
    () =>
      data.map((item, index) =>
        parseExpenseStatistic(index, item, highlight, theme)
      ),
    [data, highlight]
  );

  useEffect(() => {
    const fetchExpenseStatistics = async () => {
      const statistics = await getCategoryStatistics(
        timeString,
        category as string
      );
      setData(statistics);
      setLoading(false);
    };
    fetchExpenseStatistics();
  }, []);

  const handleClick = useCallback((value: number) => {
    setHighlight((prev) => (prev === value ? null : value));
  }, []);

  return (
    <View className=" flex-1 flex-col gap-[20px] pt-[20px]  ">
      <View className=" relative flex-row items-center justify-center ">
        <Pressable
          onPress={router.back}
          style={{ zIndex: 10 }}
          className=" absolute left-[0] top-[10] w-[40px] h-[40px] bg-paper-light rounded-[50%] flex-row justify-center items-center dark:bg-paper-dark "
        >
          <ThemedIcon
            source={icons.arrow}
            className=" w-[20px] h-[20px] rotate-180 "
          />
        </Pressable>
        {parsedData.length ? (
          <PieChart
            width={300}
            height={300}
            data={parsedData}
            accessor="amount"
            backgroundColor={"transparent"}
            paddingLeft="0"
            chartConfig={{
              backgroundColor: "#D8DFE9",
              backgroundGradientFrom: "#D8DFE9",
              backgroundGradientTo: "#D8DFE9",
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            hasLegend={false}
            center={[75, 0]}
          />
        ) : (
          <View className=" flex-1 flex-col justify-center items-center">
            {loading ? (
              <Progress.CircleSnail color={["#3b82f6", "#10b981"]} />
            ) : (
              <>
                <Image
                  source={icons.pieChart}
                  className=" w-[50px] h-[50px] "
                  tintColor={tintColors.divider}
                />
                <ThemedText>No data</ThemedText>
              </>
            )}
          </View>
        )}
        <View className=" absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150px] rounded-[50%] aspect-square bg-background-light flex-col items-center justify-center gap-1 dark:bg-background-dark  ">
          {highlight && (
            <ThemedText>
              {(
                (parsedData[highlight - 1].amount / Number(total)) *
                100
              ).toFixed(1)}
              %
            </ThemedText>
          )}
          <ThemedText className=" capitalize font-urbanistBold text-[1.2rem] ">
            -Ksh{" "}
            {highlight
              ? formatAmount(parsedData[highlight - 1].amount, 10000)
              : formatAmount(Number(total), 10000)}
          </ThemedText>
          <ThemedText className=" capitalize text-center w-[80%] ">
            {highlight ? parsedData[highlight - 1].name : category}
          </ThemedText>
        </View>
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={parsedData}
        renderItem={({ item, index }) => (
          <CategoryItem
            key={index}
            {...item}
            index={index + 1}
            percent={(item.amount / Number(total)) * 100}
            highlight={highlight}
            handleClick={handleClick}
          />
        )}
        ItemSeparatorComponent={() => <View className=" p-[10px] "></View>}
        ListFooterComponent={() => <View className=" p-[10px] "></View>}
      />
    </View>
  );
};

export default CategoryStatistics;
