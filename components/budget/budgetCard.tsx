import { colorCycle } from "@/constants/colorSettings";
import { Budget } from "@/constants/common";
import icons from "@/constants/icons";
import React, { useMemo } from "react";
import { Image, Pressable, View } from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import ThemedText from "../themedText";

const BudgetCard = ({
  index,
  budget,
  editMode = false,
  selectMode,
  selected,
  handleSelect,
  handleNavigate,
}: {
  index: number;
  budget: Budget;
  editMode?: boolean;
  selectMode?: boolean;
  selected?: Set<string>;
  handleSelect?: (id: string, action: "add" | "delete") => void;
  handleNavigate: (index: number, mode: "edit" | "details") => void;
}) => {
  const expired = useMemo(
    () => new Date().toISOString() > budget.end,
    [budget.end]
  );
  const picked = useMemo<boolean>(
    () => !!budget.id && !!selected && selected.has(budget.id),
    [selected]
  );

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
      className={` relative p-[20px] pt-[30px] pb-[30px] rounded-[20px] flex-row ${expired ? "bg-paper-light dark:bg-paper-dark" : `bg-${colorCycle[(index % 3) as keyof typeof colorCycle]}`} `}
    >
      <View className=" flex-row justify-between items-center ">
        <View>
          {selectMode && (
            <Image
              source={icons.checkbox[picked ? "checked" : "unchecked"]}
              className=" w-[20px] h-[20px] "
            />
          )}
        </View>
        {budget.repeat && (
          <Image
            style={{ zIndex: 2 }}
            source={icons.history}
            className=" absolute right-5 top-3 w-[15px] h-[15px] "
          />
        )}
      </View>
      <View className=" flex-row gap-1 ">
        <View className=" relative flex-1 flex-col gap-2 justify-center items-start ">
          <ThemedText
            toggleOnDark={false}
            className=" font-urbanistMedium text-[1.2rem] "
          >
            {budget.title}
          </ThemedText>
          <ThemedText
            toggleOnDark={false}
            className=" font-urbanistBold text-[2rem] "
          >
            {budget.total}
          </ThemedText>
          <View>
            <ThemedText toggleOnDark={false} className=" text-divider ">
              {budget.start} - {budget.end}
            </ThemedText>
          </View>
        </View>
        <View className=" relative">
          <ProgressChart
            data={{ data: [0.7] }}
            width={110}
            height={110}
            strokeWidth={20}
            radius={45}
            hideLegend={true}
            chartConfig={{
              backgroundColor: "#FFFFFF",
              backgroundGradientFrom: "#FFFFFF",
              backgroundGradientTo: "#FFFFFF",
              backgroundGradientFromOpacity: 0,
              backgroundGradientToOpacity: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity * 1.5})`,
            }}
          />
          <View className=" absolute h-[100%] w-[100%] flex-row justify-center items-center">
            <ThemedText toggleOnDark={false}>70%</ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default BudgetCard;
