import Categories from "@/components/statistics/categories";
import ThemedText from "@/components/themedText";
import { tintColors } from "@/constants/colorSettings";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import React, { useMemo } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import * as Progress from "react-native-progress";

const Statistics = () => {
  const appProps = useAppProps();

  const { loading, date, timeString, data, statistics } = useMemo<{
    loading: boolean;
    date: string;
    timeString: string;
    data: { labels: string[]; data: number[] };
    statistics: {
      total: number;
      average?: { amount: number; unit: string };
    };
  }>(
    () => ({
      loading: appProps.loading,
      date: appProps.date,
      timeString: appProps.timeString,
      data: appProps.data,
      statistics: appProps.statistics,
    }),
    [appProps]
  );
  const width = useMemo<number>(() => data.labels.length * 130, [data]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className=" flex-1 flex-col gap-[30px] pt-[20px] pb-[30px] ">
        <View className=" p-[20px] pr-[10px] pl-[10px] bg-primary rounded-[20px] flex-col gap-[30px] ">
          <View className=" flex-col gap-[10px] ">
            <View className=" flex-col gap-1 ">
              <ThemedText
                toggleOnDark={false}
                className=" font-urbanistMedium text-[1.5rem] "
              >
                {date}
              </ThemedText>
            </View>
            <View className=" flex-row justify-between items-center ">
              <View className=" flex-row gap-2 items-end ">
                <ThemedText
                  toggleOnDark={false}
                  className=" font-urbanistBold text-[2rem] "
                >
                  -{statistics.total}
                </ThemedText>
              </View>
              {statistics.average && (
                <View className=" flex-row gap-1 ">
                  <ThemedText toggleOnDark={false} className="">
                    Avg:
                  </ThemedText>
                  <ThemedText
                    toggleOnDark={false}
                    className=" font-urbanistMedium text-[1.1rem]  "
                  >
                    -{statistics.average.amount} per {statistics.average.unit}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
          {loading ? (
            <View className=" flex-1 h-[80px] flex-row justify-center items-center ">
              <Progress.CircleSnail color={["#3b82f6", "#10b981"]} />
            </View>
          ) : data.data.length > 2 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <LineChart
                data={{
                  labels: data.labels,
                  datasets: [{ data: data.data, strokeWidth: 1 }],
                }}
                width={width}
                height={200}
                withInnerLines={false}
                fromZero={true}
                chartConfig={{
                  backgroundColor: "#D8DFE9",
                  backgroundGradientFrom: "#D8DFE9",
                  backgroundGradientTo: "#D8DFE9",
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                bezier
              />
            </ScrollView>
          ) : (
            <View className=" flex-1 h-[80px] flex-col gap-2 justify-center items-center  ">
              <Image
                source={icons.statistics.filled}
                className=" w-[40px] h-[40px] "
                tintColor={tintColors.divider}
              />
              <Text>No data</Text>
            </View>
          )}
        </View>
        <Categories
          indexOffset={1}
          total={statistics.total}
          timePath={timeString}
        />
      </View>
    </ScrollView>
  );
};

export default Statistics;
