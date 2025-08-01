import { tintColors } from "@/constants/colorSettings";
import icons from "@/constants/icons";
import { getTimeStatistics, parseData } from "@/lib/statisticsUtils";
import { Scope } from "@/types/common";
import { Link } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import * as Progress from "react-native-progress";
import ThemedText from "../themedText";

const HomeChart = ({
  timeString,
  scope,
  setTotal,
}: {
  timeString: string;
  scope: Scope;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<{ labels: string[]; data: number[] }>({
    labels: [],
    data: [],
  });
  const [statistics, setStatistics] = useState<{
    total: number;
    average?: { amount: number; unit: string };
  }>({ total: 0 });

  const width = useMemo<number>(() => data.data.length * 130, [data]);

  useEffect(() => {
    const fetchTimeStatistics = async () => {
      setLoading(true);
      console.log("fetched home statistics");
      let [year, month, date] =
        timeString !== "all" ? timeString.split("/") : [];
      const results = await getTimeStatistics({ year, month, date });
      const formatedResults = parseData(results.data, results.scope);
      setStatistics({
        total: results.statistics?.total || 0,
        average:
          results.statistics?.total && results.scope
            ? {
                amount: results.statistics.total / results.data.length,
                unit: results.scope === "date" ? "day" : results.scope,
              }
            : undefined,
      });
      setTotal(results.statistics?.total || 0);
      setData({ labels: formatedResults.labels, data: formatedResults.data });
      setLoading(false);
    };
    fetchTimeStatistics();
  }, [timeString]);

  return (
    <View className="w-[100%] bg-primary rounded-[20px] flex-col gap-5 p-[10px]">
      <Link href={{ pathname: "/statistics/main", params: {} }} asChild>
        <Pressable className=" w-[100%] flex-row gap-1 p-[10px]">
          <View className=" flex-col gap-2 flex-1">
            <ThemedText
              toggleOnDark={false}
              className=" font-urbanistMedium text-[1.3rem] capitalize"
            >
              {scope}
            </ThemedText>
            <ThemedText
              toggleOnDark={false}
              className=" font-urbanistBold text-[2.3rem] "
            >
              -{statistics.total}
            </ThemedText>

            {statistics.average && (
              <View className=" flex-row items-center gap-1 ">
                <ThemedText
                  toggleOnDark={false}
                  className=" font-urbanistBold "
                >
                  Avg:
                </ThemedText>
                <ThemedText toggleOnDark={false} className="">
                  {statistics.average.amount} per {statistics.average.unit}
                </ThemedText>
              </View>
            )}
          </View>
          <Image
            source={icons["arrow"]}
            className=" w-[20px] h-[20px] rotate-[-45deg]"
          ></Image>
        </Pressable>
      </Link>
      {data.labels.length > 2 ? (
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
        <View className=" h-[200px] flex-col justify-center items-center gap-2 ">
          {loading ? (
            <Progress.CircleSnail color={["#3b82f6", "#10b981"]} />
          ) : (
            <>
              <Image
                source={icons.statistics.filled}
                className=" w-[40px] h-[40px] "
                tintColor={tintColors.divider}
              />
              <ThemedText toggleOnDark={false}>No data</ThemedText>
              <Link href={"/expenses/edit/expense"} asChild>
                <Pressable className=" mt-[30px] mb-[20px] flex-row gap-2 items-center p-[20px] pt-[10px] pb-[10px] rounded-[20px] bg-black ">
                  <Image
                    source={icons.add}
                    className=" w-[10px] h-[10px] "
                    tintColor={tintColors.light}
                  />
                  <ThemedText toggleOnDark={false} className=" text-white ">
                    Add Expense
                  </ThemedText>
                </Pressable>
              </Link>
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default HomeChart;
