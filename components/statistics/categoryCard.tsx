import { colorCycle } from "@/constants/colorSettings";
import icons from "@/constants/icons";
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
  const isPaper = useMemo(() => index % 4 === 3, [index]);
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
        className={` grow w-[150px] p-[20px] rounded-[20px] flex-col gap-5 bg-${colorCycle[(index % 4) as keyof typeof colorCycle]} ${isPaper ? "dark:bg-paper-dark" : ""}`}
      >
        <View className=" flex-row gap-1">
          <View className=" flex-1 flex-col gap-1">
            <ThemedText toggleOnDark={isPaper} className=" text-[1.3rem]">
              {percent}%
            </ThemedText>
            <ThemedText
              toggleOnDark={isPaper}
              className=" font-urbanistBold text-[1.5rem]"
            >
              -{total}
            </ThemedText>
            <ThemedText
              toggleOnDark={isPaper}
              className=" font-urbanistMedium capitalize text-[1.2rem]"
            >
              {title}
            </ThemedText>
          </View>
          <ThemedIcon
            source={icons["arrow"]}
            className=" w-[15px] h-[15px] rotate-[-45deg]"
            toggleOnDark={isPaper}
          />
        </View>
      </Pressable>
    </Link>
  );
};

export default CategoryCard;
