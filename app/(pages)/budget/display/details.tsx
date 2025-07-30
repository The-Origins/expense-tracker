import BudgetCard from "@/components/budget/budgetCard";
import BudgetItemCard from "@/components/budget/budgetItemCard";
import SelectAction from "@/components/expenses/selectAction";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { tintColors } from "@/constants/colorSettings";
import { Budget, BudgetItem } from "@/constants/common";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import {
  deleteBudgetItems,
  getBudget,
  getCategories,
  updateExpiredBudget,
} from "@/lib/budgetUtils";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, View } from "react-native";
import * as Progress from "react-native-progress";

const BudgetDetails = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const {
    budgets,
    budgetIndex,
    categories,
    setCategories,
    setCategoryIndex,
    setBudgets,
    setBudgetIndex,
    setTriggerFetch,
  } = useAppProps() as {
    budgets: Budget[];
    budgetIndex: number;
    categories: Map<string, BudgetItem[]>;
    setCategories: React.Dispatch<
      React.SetStateAction<Map<string, BudgetItem[]>>
    >;
    setCategoryIndex: React.Dispatch<React.SetStateAction<number>>;
    setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
    setBudgetIndex: React.Dispatch<React.SetStateAction<number>>;
    setTriggerFetch: React.Dispatch<React.SetStateAction<boolean>>;
  };

  const budget = useMemo<Budget | undefined>(
    () => budgets[budgetIndex],
    [budgets, budgetIndex]
  );
  const expired = useMemo<boolean>(
    () => !!budget && new Date().toISOString() > budget.end,
    [budget]
  );
  const [data, setData] = useState<BudgetItem[]>([]);
  const allIds = useMemo<string[]>(() => data.map((item) => item.id), [data]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id && typeof id === "string") {
      const fetchBudget = async () => {
        setLoading(true);
        const result = await getBudget(id);
        if (result) {
          setBudgets((prev) => [result, ...prev]);
          setBudgetIndex(0);
          setTriggerFetch(true);
        }
        setLoading(false);
      };
      fetchBudget();
    }
  }, [id]);

  const handleItemNavigate = (index: number) => {
    setCategoryIndex(index);
    router.push({
      pathname: "/(pages)/budget/edit/item",
      params: { mode: "edit" },
    });
  };

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

  useEffect(() => {
    if (budget && budget.id) {
      setLoading(true);
      if (categories.has(budget.id)) {
        setData(categories.get(budget.id) || []);
        setLoading(false);
      } else {
        const fetchCategories = async () => {
          const results = await getCategories(budget.id || "");
          setCategories((prev) => {
            const newMap = new Map(prev);
            newMap.set(budget.id || "", results);
            return newMap;
          });
          setData(results);
          setLoading(false);
        };
        fetchCategories();
      }
    }
  }, [categories, budget]);

  const handleTitleBtnClick = () => {
    if (selectMode) {
      setSelected(new Set());
      setSelectMode(false);
    } else {
      router.back();
    }
  };

  const handleAdd = () => {
    router.push("/budget/edit/item");
  };

  const handleSelectAll = () => {
    if (selected.size !== data.length) {
      setSelected(new Set(allIds));
    } else {
      setSelected(new Set());
    }
  };

  const handleBudgetNavigate = () => {
    router.push({
      pathname: "/budget/edit/main",
      params: { mode: "edit" },
    });
  };

  const handleBudgetExpire = async (index: number) => {
    if (budgets) {
      const updatedBudgets = await updateExpiredBudget(index, budgets);
      setBudgets(updatedBudgets);
    }
  };

  const handleDelete = async () => {
    if (budget) {
      deleteBudgetItems(selected);
      setCategories((prev) => {
        const newMap = new Map(prev);
        const items = newMap.get(budget.id);
        if (items) {
          newMap.set(
            budget.id,
            items.filter((item) => !selected.has(item.id))
          );
        }
        return newMap;
      });
    }
    setSelected(new Set());
    setSelectMode(false);
  };

  return (
    <View className=" flex-1  ">
      <View className=" flex-col gap-2 pt-[10px] pb-[10px] ">
        <View className=" flex-row items-center justify-between ">
          <View className=" flex-row items-center">
            <Pressable
              onPress={handleTitleBtnClick}
              className=" w-[40px] h-[40px] flex-row items-center "
            >
              <ThemedIcon
                source={icons[selectMode ? "add" : "arrow"]}
                className={` w-[20px] h-[20px] ${selectMode ? "rotate-45" : "rotate-180"} `}
              />
            </Pressable>
            <ThemedText className=" font-urbanistBold text-[2rem] capitalize ">
              {selectMode ? `${selected.size} Selected` : "Details"}
            </ThemedText>
          </View>
          {selectMode && (
            <Pressable onPress={handleSelectAll}>
              <ThemedIcon
                source={
                  icons.checkbox[
                    selected.size >= data.length ? "checked" : "unchecked"
                  ]
                }
                className=" w-[20px] h-[20px] "
              />
            </Pressable>
          )}
        </View>
        {selectMode && (
          <View className=" p-[10px] ">
            <SelectAction
              type="delete"
              disabled={!selected.size}
              handlePress={handleDelete}
            />
          </View>
        )}
      </View>
      <FlatList
        data={data}
        ListHeaderComponent={() => (
          <View className=" flex-col gap-[30px] pt-[10px] pb-[20px] ">
            {budget && (
              <BudgetCard
                index={budgetIndex}
                budget={budget}
                editMode
                handleNavigate={handleBudgetNavigate}
                onExpire={handleBudgetExpire}
              />
            )}
            <View className=" flex-row justify-between items-center ">
              <ThemedText className=" text-[1.5rem] font-urbanistMedium ">
                Categories
              </ThemedText>
              <Pressable
                onPress={handleAdd}
                className=" flex-row gap-2 items-center p-[20px] pt-[10px] pb-[10px] bg-black rounded-[20px] dark:bg-white "
              >
                <ThemedIcon
                  reverse
                  source={icons.add}
                  className=" w-[10px] h-[10px] "
                />
                <ThemedText reverse>Add</ThemedText>
              </Pressable>
            </View>
            {!data.length && (
              <View className=" h-[40vh] flex-col items-center justify-center gap-2 ">
                {loading ? (
                  <Progress.CircleSnail color={["#3b82f6", "#10b981"]} />
                ) : (
                  <>
                    <Image
                      source={icons.money}
                      className=" w-[40px] h-[40px] "
                      tintColor={tintColors.divider}
                    />
                    <ThemedText>No Categories</ThemedText>
                  </>
                )}
              </View>
            )}
          </View>
        )}
        ItemSeparatorComponent={() => <View className=" p-[10px] "></View>}
        renderItem={({ item, index }) => (
          <BudgetItemCard
            key={index}
            {...{
              index: index + 1,
              item,
              expired,
              selected,
              selectMode,
              handleNavigate: handleItemNavigate,
              handleSelect: handleItemSelect,
            }}
          />
        )}
      />
    </View>
  );
};

export default BudgetDetails;
