import { colorCycle } from "@/constants/colorSettings";
import icons from "@/constants/icons";
import { formatAmount } from "@/lib/appUtils";
import { Link } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
import ThemedIcon from "../themedIcon";
import ThemedText from "../themedText";

const CategoryCard = ({
  index,
  path,
  total,
  percent,
}: {
  index: number;
  path: string;
  total: number;
  percent: number | string;
}) => {
  let title = useMemo<string>(() => {
    return path.split("/").slice(-1)[0];
  }, [path]);

  return (
    <Link
      href={{
        pathname: "/statistics/category",
        params: { category: title, total },
      }}
      asChild
    >
      <Pressable
        className={` grow w-[150px] p-[20px] rounded-[20px] flex-col gap-5 bg-${colorCycle[index % 3]}`}
      >
        <View className=" flex-row gap-1">
          <View className=" flex-1 flex-col gap-1">
            <ThemedText toggleOnDark={false} className=" text-[1.3rem]">
              {percent}%
            </ThemedText>
            <ThemedText
              toggleOnDark={false}
              className=" font-urbanistBold text-[1.5rem]"
            >
              -Ksh {formatAmount(total, 10000)}
            </ThemedText>
            <ThemedText
              toggleOnDark={false}
              className=" font-urbanistMedium capitalize text-[1.2rem]"
            >
              {title}
            </ThemedText>
          </View>
          <ThemedIcon
            source={icons["arrow"]}
            className=" w-[15px] h-[15px] rotate-[-45deg]"
            toggleOnDark={false}
          />
        </View>
      </Pressable>
    </Link>
  );
};

export default CategoryCard;
