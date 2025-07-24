import BudgetCard from "@/components/budget/budgetCard";
import BudgetItemCard from "@/components/budget/budgetItemCard";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { Budget, BudgetItem } from "@/constants/common";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import { getCategories } from "@/lib/budgetUtils";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";

const BudgetDetails = () => {
  const router = useRouter();

  const appProps = useAppProps();

  const { budgets, budgetIndex, categories, setCategories, setCategoryIndex } =
    useMemo<{
      budgets: Budget[];
      budgetIndex: number;
      categories: Map<string, BudgetItem[]>;
      setCategories: React.Dispatch<
        React.SetStateAction<Map<string, BudgetItem[]>>
      >;
      setCategoryIndex: React.Dispatch<React.SetStateAction<number>>;
    }>(
      () => ({
        budgets: appProps.budgets,
        budgetIndex: appProps.budgetIndex,
        categories: appProps.categories,
        setCategories: appProps.setCategories,
        setCategoryIndex: appProps.setCategoryIndex,
      }),
      [appProps]
    );

  const budget = useMemo(() => budgets[budgetIndex], [budgets, budgetIndex]);
  const [data, setData] = useState<BudgetItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState<boolean>(false);

  const handleItemNavigate = (index: number) => {
    setCategoryIndex(index);
    router.navigate({
      pathname: "/budget/edit/item",
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
    if (budget.id && !data) {
      if (categories.has(budget.id)) {
        setData(categories.get(budget.id) || []);
      } else {
        const fetchCategories = async () => {
          const results = await getCategories(budget.id || "");
          setCategories((prev) => {
            const newMap = new Map(prev);
            newMap.set(budget.id || "", results);
            return newMap;
          });
          setData(results);
        };
        fetchCategories();
      }
    }
  }, [categories, budget]);

  const handleAdd = () => {};

  const handleBudgetNavigate = () => {};

  return (
    <View className=" flex-1  ">
      <View className=" flex-row items-center ">
        <Pressable
          onPress={router.back}
          className=" w-[40px] h-[40px] flex-row items-center "
        >
          <ThemedIcon
            source={icons.arrow}
            className=" w-[20px] h-[20px] rotate-180 "
          />
        </Pressable>
        <ThemedText className=" font-urbanistBold text-[2rem] capitalize ">
          Details
        </ThemedText>
      </View>
      <FlatList
        data={data}
        ListHeaderComponent={() => (
          <View className=" flex-col gap-[20px] pt-[10px] pb-[20px] ">
            <BudgetCard
              index={1}
              budget={budget}
              editMode
              handleNavigate={handleBudgetNavigate}
            />
            <View className=" flex-row justify-between items-center ">
              <ThemedText>Categories</ThemedText>
              <Pressable></Pressable>
            </View>
          </View>
        )}
        renderItem={({ item, index }) => (
          <BudgetItemCard
            key={index}
            {...{
              index: index + 1,
              item,
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
