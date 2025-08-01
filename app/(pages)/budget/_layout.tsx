import { AppPropsProvider } from "@/context/propContext";
import { Budget, BudgetItem } from "@/types/common";
import { Slot } from "expo-router";
import React, { useState } from "react";

const BudgetLayout = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Map<string, BudgetItem[]>>(
    new Map()
  );
  const [budgetIndex, setBudgetIndex] = useState<number>(0);
  const [categoryIndex, setCategoryIndex] = useState<number>(0);
  const [triggerFetch, setTriggerFetch] = useState<boolean>(true);

  return (
    <AppPropsProvider
      value={{
        budgets,
        setBudgets,
        categories,
        setCategories,
        budgetIndex,
        setBudgetIndex,
        categoryIndex,
        setCategoryIndex,
        triggerFetch,
        setTriggerFetch,
      }}
    >
      <Slot />
    </AppPropsProvider>
  );
};

export default BudgetLayout;
