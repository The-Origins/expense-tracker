import { colorCycle, getPercentColor } from "@/constants/colorSettings";
import icons from "@/constants/icons";
import { BudgetItem } from "@/types/common";
import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
import { ProgressChart } from "react-native-chart-kit";
import ThemedIcon from "../themedIcon";
import ThemedText from "../themedText";

const BudgetItemCard = ({
  index,
  item,
  expired,
  selectMode,
  selected,
  handleSelect,
  handleNavigate,
}: {
  index: number;
  item: BudgetItem;
  expired?: boolean;
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

  const percentColor = useMemo(() => getPercentColor(percent), [percent]);

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
  console.log(percentColor);
  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      className={` flex-col p-[20px] rounded-[20px] ${expired ? "bg-paper-light dark:bg-paper-dark" : `bg-${colorCycle[(index % 3) as keyof typeof colorCycle]}`} `}
    >
      {selectMode && (
        <ThemedIcon
          toggleOnDark={false}
          source={icons.checkbox[picked ? "checked" : "unchecked"]}
          className=" w-[15px] h-[15px] "
        />
      )}
      <View className=" flex-row gap-1 items-center ">
        <View className=" flex-1 flex-col gap-1 ">
          <ThemedText
            toggleOnDark={false}
            className={` font-urbanistMedium text-[1.3rem] capitalize ${expired ? "text-divider" : ""} `}
          >
            {item.category}
          </ThemedText>
          <ThemedText
            toggleOnDark={false}
            className={` font-urbanistBold text-[1.5rem] ${expired ? "text-divider" : ""} `}
          >
            {item.total}
          </ThemedText>
          <ThemedText
            toggleOnDark={false}
            className={percentColor.class || "text-divider"}
          >
            <ThemedText
              toggleOnDark={false}
              className={` ${percentColor.class || "text-divider"} font-urbanistBold `}
            >
              Total:{" "}
            </ThemedText>
            {item.current}
          </ThemedText>
        </View>
        <View className=" relative w-[60px] h-[60px] ">
          {percent <= 1 ? (
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
                  `rgba(${expired ? "128,128,128" : percentColor.chart}, ${opacity * 1.5})`,
              }}
            />
          ) : (
            <View
              className={` w-[60px] h-[60px] rounded-[50%] ${expired ? "text-divider" : "bg-error"} `}
            />
          )}
          <View className=" absolute h-[100%] w-[100%]  flex-row justify-center items-center">
            <View
              className={` flex-col justify-center items-center w-[40px] h-[40px] rounded-[50%] ${expired ? "bg-paper-light dark:bg-paper-dark" : `bg-${colorCycle[(index % 3) as keyof typeof colorCycle]}`} `}
            >
              <ThemedText
                toggleOnDark={false}
                className={`${expired ? "text-divider" : percentColor.class}`}
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

export default BudgetItemCard;
