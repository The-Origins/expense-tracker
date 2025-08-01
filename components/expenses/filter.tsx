import ThemedText from "@/components/themedText";
import { ExpensesFilter } from "@/types/common";
import React, { useMemo } from "react";
import { Pressable, View } from "react-native";

const EditExpensesFilter = ({
  type,
  filter,
  count,
  setFilter,
}: {
  type: ExpensesFilter;
  filter: ExpensesFilter;
  count?: number;
  setFilter: React.Dispatch<React.SetStateAction<ExpensesFilter>>;
}) => {
  const active = useMemo<boolean>(() => type === filter, [filter, type]);

  const handlePress = () => {
    setFilter(type);
  };

  return (
    <Pressable
      onPress={handlePress}
      className={` flex-1 pt-[5px] pb-[5px] border border-black rounded-[20px] flex-row justify-center items-center gap-1 dark:border-white ${active ? "bg-black dark:bg-white" : ""} `}
    >
      <ThemedText reverse={active}>{type}</ThemedText>
      <View
        className={` flex-row items-center justify-center w-[15px] h-[15px] rounded-[50%] ${type === "Errors" ? "bg-error" : "bg-divider"} `}
      >
        <ThemedText toggleOnDark={false} className=" text-white text-[0.9rem] ">
          {count}
        </ThemedText>
      </View>
    </Pressable>
  );
};

export default EditExpensesFilter;
