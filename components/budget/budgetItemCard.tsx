import { colorCycle } from "@/constants/colorSettings";
import { BudgetItem } from "@/constants/common";
import icons from "@/constants/icons";
import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import ThemedIcon from "../themedIcon";
import ThemedText from "../themedText";

const BudgetItemCard = ({
  index,
  item,
  selectMode,
  selected,
  handleSelect,
  handleNavigate,
}: {
  index: number;
  item: BudgetItem;
  selectMode: boolean;
  selected: Set<string>;
  handleSelect: (id: string, action: "add" | "delete") => void;
  handleNavigate: (index: number) => void;
}) => {
  const picked = useMemo<boolean>(
    () => !!item.id && selected.has(item.id),
    [item.id, selected]
  );
  const percent = useMemo<number>(
    () => item.current / item.total,
    [item.current, item.total]
  );

  const isPaper = useMemo(() => index % 4 === 3, [index]);

  const handlePress = () => {
    if (selectMode) {
      handleSelect(item.id, picked ? "delete" : "add");
    } else {
      handleNavigate(index - 1);
    }
  };

  const handleLongPress = () => {
    if (!picked) {
      handleSelect(item.id, "add");
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      className={` flex-col p-[20px] rounded-[20px] bg-${colorCycle[(index % 4) as keyof typeof colorCycle]} ${isPaper ? "dark:bg-paper-dark" : ""} `}
    >
      {selectMode && (
        <ThemedIcon
          toggleOnDark={isPaper}
          source={icons.checkbox[picked ? "checked" : "unchecked"]}
          className=" w-[15px] h-[15px] "
        />
      )}
      <View className=" flex-row gap-1 items-center ">
        <View className=" flex-1 flex-col gap-2 ">
          <ThemedText
            toggleOnDark={isPaper}
            className=" font-urbanistMedium text-[1.2rem] capitalize "
          >
            {item.category}
          </ThemedText>
          <ThemedText
            toggleOnDark={isPaper}
            className=" font-urbanistBold text-[1.5rem] "
          >
            {item.total}
          </ThemedText>
          <ThemedText toggleOnDark={false} className=" text-divider ">
            {item.current}
          </ThemedText>
        </View>
        <View className=" relative">
          <ProgressChart
            data={{ data: [percent] }}
            width={60}
            height={60}
            strokeWidth={10}
            radius={25}
            hideLegend={true}
            chartConfig={{
              backgroundColor: "#FFFFFF",
              backgroundGradientFrom: "#FFFFFF",
              backgroundGradientTo: "#FFFFFF",
              backgroundGradientFromOpacity: 0,
              backgroundGradientToOpacity: 0,
              color: (opacity = 1) =>
                `rgba(${isPaper ? "255,255,255" : "0, 0, 0"}, ${opacity * 1.5})`,
            }}
            style={{ backgroundColor: "transparent" }}
          />
          <View className=" absolute h-[100%] w-[100%] flex-row justify-center items-center">
            <ThemedText toggleOnDark={isPaper}>{percent * 100}%</ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default BudgetItemCard;
