import BudgetCard from "@/components/budget/budgetCard";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { tintColors } from "@/constants/colorSettings";
import { Budget } from "@/constants/common";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import { getBudgets } from "@/lib/budgetUtils";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, View } from "react-native";

const Budgets = () => {
  const router = useRouter();
  const appProps = useAppProps();

  const { budgets, setBudgets, setBudgetIndex } = useMemo<{
    budgets: Budget[] | null;
    setBudgets: React.Dispatch<React.SetStateAction<Budget[] | null>>;
    setBudgetIndex: React.Dispatch<React.SetStateAction<number>>;
  }>(
    () => ({
      budgets: appProps.budgets,
      setBudgets: appProps.setBudgets,
      setBudgetIndex: appProps.setBudgetIndex,
    }),
    [appProps]
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState<boolean>(false);

  const handleAdd = () => {};

  useEffect(() => {
    if (!budgets) {
      const fetchBudgets = async () => {
        const results = await getBudgets();
        setBudgets(results);
      };
      fetchBudgets();
    }
  }, [budgets]);

  const handleItemSelect = (id: string, action: "add" | "delete") => {
    if (!selectMode) {
      setSelectMode(true);
    }
    setSelected((prev) => {
      const newSet = new Set(prev);
      newSet[action](id);
      return newSet;
    });
  };
  const handleItemNavigate = (index: number, mode: "edit" | "details") => {
    if (mode === "edit") {
      router.navigate("/budget/edit/budget");
    } else {
      setBudgetIndex(index);
      router.navigate("/budget/display/details");
    }
  };

  return (
    <View className=" flex-1 ">
      <View className=" pt-[10px] pb-[10px] flex-row items-center justify-between ">
        <View className=" flex-row items-center ">
          <ThemedText className=" font-urbanistBold text-[2rem] ">
            Budget
          </ThemedText>
        </View>
        <Pressable onPress={handleAdd} className=" p-[10px]">
          <ThemedIcon source={icons.add} className=" w-[30px] h-[30px] " />
        </Pressable>
      </View>
      {budgets?.length ? (
        <View className=" flex-1 flex-col gap-2 items-center justify-center ">
          <Image
            source={icons.budget.filled}
            className=" w-[40px] h-[40px] "
            tintColor={tintColors.divider}
          />
          <ThemedText>No Budget</ThemedText>
        </View>
      ) : (
        <FlatList
          data={budgets}
          renderItem={({ item, index }) => (
            <BudgetCard
              {...{
                index,
                budget: item,
                selected,
                selectMode,
                setSelected,
                setSelectMode,
                handleSelect: handleItemSelect,
                handleNavigate: handleItemNavigate,
              }}
            />
          )}
        />
      )}
    </View>
  );
};

export default Budgets;
