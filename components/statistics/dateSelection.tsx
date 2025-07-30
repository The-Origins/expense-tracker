import { tintColors } from "@/constants/colorSettings";
import { DateParts, StatisticsOption } from "@/constants/common";
import icons from "@/constants/icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, View } from "react-native";
import ThemedText from "../themedText";
import DateChip from "./dateChip";

const DateSelection = ({
  options,
  type,
  dateParts,
  setDateParts,
  handleNext,
  handleBack,
  setExpand,
}: {
  options: StatisticsOption[] | undefined;
  type: "year" | "month" | "date";
  dateParts: DateParts;
  setDateParts: React.Dispatch<React.SetStateAction<DateParts>>;
  handleNext: () => void;
  handleBack: () => void;
  setExpand: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const path = usePathname().split("/")[2];
  const router = useRouter();
  const handleChipClick = (value: number) => {
    if (path !== "date") {
      router.push("/statistics/main");
      setExpand(false);
    }
    setDateParts((prev) => {
      if (prev[type as keyof typeof prev] === value && type !== "year") {
        handleBack();
      } else if (type !== "date") {
        handleNext();
      }

      if (type === "year") {
        return {
          year: prev.year === value ? undefined : value,
          month: undefined,
          day: undefined,
        };
      }

      if (type === "month") {
        return {
          year: prev.year,
          month: prev.month === value ? undefined : value,
          day: undefined,
        };
      }

      return {
        ...prev,
        date: prev.date === value ? undefined : value,
      };
    });
  };

  return (
    <View className=" min-h-[100px] max-h-[200px] flex-row pt-[10px] pb-[20px] ">
      <ScrollView className=" flex-1 " showsVerticalScrollIndicator={true}>
        {options && options.length ? (
          <View className=" flex-row flex-wrap gap-[10px] ">
            {options.map(({ value, label }, index) => (
              <DateChip
                key={index}
                value={value}
                label={label}
                size={type === "date" ? "sm" : "md"}
                datePart={dateParts[type]}
                handleClick={handleChipClick}
              />
            ))}
          </View>
        ) : (
          <View className=" flex-1 flex-col justify-center items-center gap-2 ">
            <Image
              source={icons.date}
              className=" w-[30px] h-[30px] "
              tintColor={tintColors.divider}
            />
            <ThemedText>No data</ThemedText>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DateSelection;
