import { tintColors } from "@/constants/colorSettings";
import { Statistic } from "@/constants/common";
import icons from "@/constants/icons";
import { getCategoryStatistics } from "@/lib/statisticsUtils";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";
import * as Progress from "react-native-progress";
import ThemedText from "../themedText";
import CategoryCard from "./categoryCard";

const Categories = ({
  timePath,
  total,
  limit,
  indexOffset = 0,
}: {
  timePath?: string;
  total?: number;
  limit?: number;
  indexOffset?: number;
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<Statistic[]>([]);

  useEffect(() => {
    if (timePath) {
      setLoading(true);
      const fetchCategoryStatistics = async () => {
        const statistics = await getCategoryStatistics(timePath);
        setData(statistics);
      };
      fetchCategoryStatistics();
    }
    setLoading(false);
  }, [timePath]);

  return (
    <View>
      <View className=" flex-row flex-wrap gap-[20px]">
        {data.length ? (
          <>
            {data.map((item, index) => (
              <CategoryCard
                key={index}
                {...item}
                index={index + indexOffset}
                percent={total ? ((item.total / total) * 100).toFixed(1) : 0}
              />
            ))}
            {data.length % 2 !== 0 && (
              <View className=" grow w-[150px] "></View>
            )}
          </>
        ) : (
          <View className=" flex-1 h-[200px] flex-col items-center justify-center ">
            {loading ? (
              <Progress.CircleSnail color={["#3b82f6", "#10b981"]} />
            ) : (
              <>
                <Image
                  source={icons.pieChart}
                  className=" w-[40px] h-[40px] "
                  tintColor={tintColors.divider}
                />
                <ThemedText>No data</ThemedText>
              </>
            )}
          </View>
        )}
      </View>
      {limit && limit < data.length ? (
        <Link href={{ pathname: "/statistics/main", params: {} }} asChild>
          <Pressable className=" w-[100%] flex-row justify-center p-[20px]">
            <ThemedText>View More</ThemedText>
          </Pressable>
        </Link>
      ) : (
        <></>
      )}
    </View>
  );
};

export default Categories;
