import BottomTabs from "@/components/layout/bottomTabs";
import DateSelection from "@/components/statistics/dateSelection";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { DateParts, StatisticsOption } from "@/constants/common";
import icons from "@/constants/icons";
import { AppPropsProvider } from "@/context/propContext";
import { getTimeStatistics, parseData } from "@/lib/statisticsUtils";
import dayjs from "dayjs";
import { Slot, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import * as Progress from "react-native-progress";

const StatisticsLayout = () => {
  const { year, month, day } = useLocalSearchParams();

  const [loading, setLoading] = useState<boolean>(true);
  const [timeString, setTimeString] = useState<string>("all");
  const [dateOptions, setDateOptions] = useState<{
    year?: StatisticsOption[];
    month?: StatisticsOption[];
    date?: StatisticsOption[];
  }>({});
  const [dateOption, setDateOption] = useState<"year" | "month" | "date">(
    "year"
  );
  const [statistics, setStatistics] = useState<{
    total: number;
    average?: { amount: number; unit: string };
  }>({ total: 0 });
  const [data, setData] = useState<{ labels: string[]; data: number[] }>({
    labels: [],
    data: [],
  });
  const [expand, setExpand] = useState<boolean>(false);
  const [dateParts, setDateParts] = useState<DateParts>({});

  const date = useMemo<string>(() => {
    let str: string = "All time";
    let timeStr = "all";

    if (dateParts.year) {
      timeStr = `${dateParts.year}`;
      if (dateParts.month !== undefined) {
        timeStr += `/${dateParts.month}`;
        if (dateParts.date) {
          timeStr += `/${dateParts.date}`;
          str = dayjs(
            new Date(dateParts.year, dateParts.month, dateParts.date)
          ).format("dddd DD MMMM, YYYY");
        } else {
          str = dayjs(new Date(dateParts.year, dateParts.month)).format(
            "MMMM YYYY"
          );
        }
      } else {
        str = dayjs(new Date(dateParts.year, 0)).format("YYYY");
      }
    }
    setTimeString(timeStr);
    return str;
  }, [dateParts]);

  const handleNext = () => {
    setDateOption((prev) => (prev === "year" ? "month" : "date"));
  };

  const handleBack = () => {
    setDateOption((prev) => (prev === "date" ? "month" : "year"));
  };

  const handleClearDate = () => {
    setDateParts({});
    setExpand(false);
    setDateOption("year");
  };

  useEffect(() => {
    const fetchTimeStatistics = async () => {
      setLoading(true);
      console.log("time fetched");
      const results = await getTimeStatistics(dateParts);
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

      setData({ labels: formatedResults.labels, data: formatedResults.data });
      setDateOptions((prev) => ({
        ...prev,
        [results.scope]: formatedResults.options,
      }));

      setLoading(false);
    };

    fetchTimeStatistics();
  }, [dateParts]);

  return (
    <>
      <View className=" flex-1 pr-[10px] pl-[10px] ">
        <View className=" pt-[20px] pb-[10px] ">
          <View className="flex-col bg-paper-light rounded-[20px] dark:bg-paper-dark ">
            <Pressable
              onPress={() => setExpand((prev) => !prev)}
              className=" p-[10px] flex-row justify-between items-center gap-1 "
            >
              <ThemedIcon source={icons.date} className=" w-[20px] h-[20px] " />
              <ThemedText className=" font-urbanistBold text-[1.5rem] ">
                {date}
              </ThemedText>
              <ThemedIcon
                source={icons.chevron}
                className={` w-[15px] h-[15px] ${expand ? "rotate-180" : "rotate-0"} `}
              />
            </Pressable>
            <View
              className={` pl-[10px] pr-[10px]  overflow-hidden ${expand ? "h-[auto] p-[10px]" : "h-[0px]"}`}
            >
              {loading ? (
                <View className=" flex-1 flex-row justify-center items-center ">
                  <Progress.CircleSnail color={["#3b82f6", "#10b981"]} />
                </View>
              ) : (
                <>
                  <DateSelection
                    {...{
                      options: dateOptions[dateOption],
                      type: dateOption,
                      dateParts,
                      setDateParts,
                      handleNext,
                      handleBack,
                      setExpand
                    }}
                  />
                  <View className=" relative flex-row justify-between gap-1 ">
                    {dateOption !== "year" ? (
                      <Pressable
                        onPress={handleBack}
                        className=" flex-row items-center gap-1 p-[10px] pt-[3px] pb-[3px] bg-secondary rounded-[20px] "
                      >
                        <Image
                          source={icons.arrow}
                          className=" rotate-180 w-[10px] h-[10px] "
                        />
                        <Text>Back</Text>
                      </Pressable>
                    ) : (
                      <View></View>
                    )}
                    {dateParts.year ? (
                      <Pressable
                        onPress={handleClearDate}
                        className=" absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex-row items-center gap-1 p-[10px] pt-[3px] pb-[3px] bg-accent rounded-[20px] "
                      >
                        <Image
                          source={icons.add}
                          className=" rotate-45 w-[10px] h-[10px] "
                        />
                        <Text>Clear Date</Text>
                      </Pressable>
                    ) : (
                      <></>
                    )}
                    {dateOption !== "date" && dateParts.month ? (
                      <Pressable
                        onPress={handleNext}
                        className=" flex-row items-center gap-1 p-[10px] pt-[3px] pb-[3px] bg-primary rounded-[20px]"
                      >
                        <Text>Next</Text>
                        <Image
                          source={icons.arrow}
                          className=" w-[10px] h-[10px] "
                        />
                      </Pressable>
                    ) : (
                      <View></View>
                    )}
                  </View>
                </>
              )}
            </View>
          </View>
        </View>
        <AppPropsProvider
          value={{
            loading,
            setLoading,
            date,
            dateParts,
            timeString,
            data,
            statistics,
          }}
        >
          <Slot />
        </AppPropsProvider>
      </View>
      <BottomTabs />
    </>
  );
};

export default StatisticsLayout;
