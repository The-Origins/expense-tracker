import BudgetCard from "@/components/budget/budgetCard";
import SelectAction from "@/components/expenses/selectAction";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { tintColors } from "@/constants/colorSettings";
import { Budget } from "@/constants/common";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import {
  deleteBudgets,
  getBudgets,
  updateExpiredBudget,
} from "@/lib/budgetUtils";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, View } from "react-native";
import * as Progress from "react-native-progress";

const AllBudgets = () => {
  const router = useRouter();

  const { triggerFetch, budgets, setBudgets, setBudgetIndex, setTriggerFetch } =
    useAppProps() as {
      triggerFetch: boolean;
      budgets: Budget[];
      setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
      setBudgetIndex: React.Dispatch<React.SetStateAction<number>>;
      setTriggerFetch: React.Dispatch<React.SetStateAction<boolean>>;
    };

  const allIds = useMemo<string[]>(
    () => budgets?.map((budget) => budget.id) || [],
    [budgets]
  );
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const handleAdd = () => {
    router.push("/(pages)/budget/edit/main");
  };

  useEffect(() => {
    if (triggerFetch) {
      setLoading(true);
      setTriggerFetch(false);
      const fetchBudgets = async () => {
        const results = await getBudgets();
        setBudgets(results);
        setLoading(false);
      };
      fetchBudgets();
    }else{
      setLoading(false);
    }
    
  }, [budgets, triggerFetch]);

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
      router.push({
        pathname: "/(pages)/budget/edit/main",
        params: { mode: "edit" },
      });
    } else {
      setBudgetIndex(index);
      router.push("/(pages)/budget/display/details");
    }
  };

  const handleItemExpire = async (index: number) => {
    console.log("called")
    setLoading(true);
    const updatedBudgets = await updateExpiredBudget(index, budgets);
    setBudgets([...updatedBudgets]);
    setLoading(false);
  };

  const handleReset = () => {
    setSelected(new Set());
    setSelectMode(false);
  };

  const handleAction = () => {
    if (selectMode) {
      handleSelectAll();
    } else {
      handleAdd();
    }
  };

  const handleSelectAll = () => {
    if (selected.size !== allIds.length) {
      setSelected(new Set(allIds));
    } else {
      setSelected(new Set());
    }
  };

  const handleDelete = async () => {
    deleteBudgets(selected);
    setBudgets((prev) =>
      prev ? prev.filter((budget) => !selected.has(budget.id)) : prev
    );
    setSelected(new Set());
    setSelectMode(false);
  };

  return (
    <View className=" flex-1 ">
      <View className=" pt-[10px] pb-[10px] flex-col gap-4 ">
        <View className=" flex-row justify-between items-center ">
          <View className=" flex-row items-center ">
            {selectMode && (
              <Pressable
                onPress={handleReset}
                className=" w-[40px] h-[40px] flex-row items-center "
              >
                <ThemedIcon
                  source={icons.add}
                  className={` w-[20px] h-[20px] rotate-45 `}
                />
              </Pressable>
            )}
            <ThemedText className=" font-urbanistBold text-[2rem] ">
              {selectMode ? `${selected.size} Selected` : "Budget"}
            </ThemedText>
          </View>
          <Pressable onPress={handleAction}>
            <ThemedIcon
              source={
                selectMode
                  ? icons.checkbox[
                      selected.size === allIds.length ? "checked" : "unchecked"
                    ]
                  : icons.add
              }
              className=" w-[20px] h-[20px] "
            />
          </Pressable>
        </View>
        {selectMode && (
          <SelectAction
            type="delete"
            disabled={!selected.size}
            handlePress={handleDelete}
          />
        )}
      </View>
      {!!budgets.length ? (
        <FlatList
          data={budgets}
          ListHeaderComponent={() => <View className=" p-[20px] "></View>}
          ListFooterComponent={() => <View className=" p-[20px] "></View>}
          ItemSeparatorComponent={() => <View className=" p-[10px]"></View>}
          keyExtractor={(_item, index) => `${index}`}
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
                onExpire: handleItemExpire,
              }}
            />
          )}
        />
      ) : (
        <View className=" flex-1 flex-col gap-2 items-center justify-center ">
          {loading ? (
            <Progress.CircleSnail color={["#3b82f6", "#10b981"]} />
          ) : (
            <>
              <Image
                source={icons.budget.filled}
                className=" w-[40px] h-[40px] "
                tintColor={tintColors.divider}
              />
              <ThemedText>No Budget</ThemedText>
              <Pressable
                onPress={handleAdd}
                className=" mt-[30px] mb-[20px] flex-row gap-2 items-center p-[20px] pt-[10px] pb-[10px] rounded-[20px] bg-black dark:bg-white "
              >
                <ThemedIcon
                  reverse
                  source={icons.add}
                  className=" w-[10px] h-[10px] "
                />
                <ThemedText reverse className=" text-white ">
                  Add Budget
                </ThemedText>
              </Pressable>
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default AllBudgets;
