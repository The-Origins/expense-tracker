import { colorCycle, getPercentColor } from "@/constants/colorSettings";
import icons from "@/constants/icons";
import { Budget } from "@/types/common";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { Image, Pressable, View } from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import ThemedText from "../themedText";
import { formatAmount } from "@/lib/appUtils";

const BudgetCard = ({
  index,
  budget,
  editMode = false,
  selectMode,
  selected,
  handleSelect,
  handleNavigate,
  onExpire,
}: {
  index: number;
  budget: Budget;
  editMode?: boolean;
  selectMode?: boolean;
  selected?: Set<string>;
  handleSelect?: (id: string, action: "add" | "delete") => void;
  handleNavigate: (index: number, mode: "edit" | "details") => void;
  onExpire: (index: number) => void;
}) => {
  const expired = useMemo<boolean>(
    () => new Date().toISOString() > budget.end,
    [budget]
  );
  const picked = useMemo<boolean>(
    () => !!budget.id && !!selected && selected.has(budget.id),
    [selected]
  );
  const percent = useMemo(() => budget.current / budget.total, [budget]);
  const percentColor = useMemo(() => getPercentColor(percent), [percent]);

  const handlePress = () => {
    if (selectMode && handleSelect) {
      handleSelect(budget.id || "", picked ? "delete" : "add");
    } else {
      handleNavigate(index, editMode ? "edit" : "details");
    }
  };
  const handleLongPress = () => {
    if (editMode) {
      handleNavigate(index, "edit");
    } else if (handleSelect) {
      handleSelect(budget.id || "", "add");
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      className={` p-[20px] rounded-[20px] flex-col ${expired ? "bg-paper-light dark:bg-paper-dark" : `bg-${colorCycle[(index % 3) as keyof typeof colorCycle]}`} `}
    >
      <View className=" flex-row justify-between items-center ">
        <View>
          {!!selectMode && (
            <Image
              source={icons.checkbox[picked ? "checked" : "unchecked"]}
              className=" w-[20px] h-[20px] "
            />
          )}
        </View>
      </View>
      <View className=" flex-row gap-2 ">
        <View className=" relative flex-1 flex-col gap-2 justify-center items-start ">
          <ThemedText
            toggleOnDark={false}
            className={` capitalize font-urbanistMedium text-[1.3rem] ${expired ? "text-divider" : ""} `}
          >
            {budget.title}
          </ThemedText>
          <View>
            <ThemedText
              toggleOnDark={false}
              className={` font-urbanistBold text-[2rem] ${expired ? "text-divider" : ""} `}
            >
              {formatAmount(budget.total, 10000)}
            </ThemedText>
            {editMode && (
              <ThemedText
                toggleOnDark={false}
                className={`${percentColor.class}`}
              >
                <ThemedText
                  toggleOnDark={false}
                  className={` font-urbanistBold ${expired ? "text-divider" : percentColor.class} `}
                >
                  Total:{" "}
                </ThemedText>
                {formatAmount(budget.current, 10000)}
              </ThemedText>
            )}
          </View>
          <View>
            <ThemedText toggleOnDark={false} className=" text-divider ">
              {dayjs(new Date(budget.start)).format("DD MMM YYYY")} -{" "}
              {dayjs(new Date(budget.end)).format("DD MMM YYYY")}
            </ThemedText>
          </View>
        </View>
        <View className=" relative">
          {percent <= 1 ? (
            <ProgressChart
              data={{ data: [percent] }}
              width={100}
              height={100}
              strokeWidth={20}
              radius={40}
              hideLegend={true}
              chartConfig={{
                backgroundColor: "#FFFFFF",
                backgroundGradientFrom: "#FFFFFF",
                backgroundGradientTo: "#FFFFFF",
                backgroundGradientFromOpacity: 0,
                backgroundGradientToOpacity: 0,
                color: (opacity = 1) =>
                  `rgba(${expired ? "128,128,128" : percentColor.chart}, ${opacity * 1.5})`,
              }}
            />
          ) : (
            <View
              className={` w-[100px] h-[100px] rounded-[50%] ${expired ? "text-divider" : "bg-error"} `}
            ></View>
          )}
          <View className=" absolute h-[100%] w-[100%] flex-row justify-center items-center">
            <View
              className={`flex-col gap-1 items-center justify-center w-[60px] h-[60px] rounded-[50%] ${expired ? "bg-paper-light dark:bg-paper-dark" : `bg-${colorCycle[(index % 3) as keyof typeof colorCycle]}`} `}
            >
              <ThemedText
                toggleOnDark={false}
                className={`${percentColor.class}`}
              >
                {percent <= 1 ? (percent * 100).toFixed(1) : ">100"}%
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default BudgetCard;
