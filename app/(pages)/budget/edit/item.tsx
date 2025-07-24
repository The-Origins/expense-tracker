import InputField from "@/components/edit/inputField";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { Budget, BudgetItem, Status } from "@/constants/common";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import { normalizeString } from "@/lib/appUtils";
import validateInput from "@/lib/validateInput";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

const EditBudgetItem = () => {
  const { mode, type } = useLocalSearchParams();
  const router = useRouter();
  const appProps = useAppProps();

  const { budgetIndex, budgets, categories, setBudgets, setCategories } =
    useMemo<{
      budgetIndex: number;
      budgets: Budget[] | null;
      setBudgets: React.Dispatch<React.SetStateAction<Budget[] | null>>;
      categories: Map<string, BudgetItem[]>;
      setCategories: React.Dispatch<
        React.SetStateAction<Map<string, BudgetItem[]>>
      >;
    }>(
      () => ({
        budgetIndex: appProps.budgetIndex,
        budgets: appProps.budgets,
        setBudgets: appProps.setBudgets,
        categories: appProps.categories,
        setCategories: appProps.setCategories,
      }),
      [appProps]
    );

  const budget = useMemo<Partial<Budget>>(
    () => (budgets && budgets[budgetIndex]) || {},
    [budgetIndex, budgets]
  );

  const item = useMemo<Partial<BudgetItem>>(
    () => (!!budget.id && categories.get(budget.id)) || {},
    [budget, categories]
  );

  const [form, setForm] = useState<{ total: string; category: string }>({
    total: "",
    category: "",
  });
  const [errors, setErrors] = useState({
    total: "required",
    category: "required",
  });
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [changes, setChanges] = useState<Map<string, string | number>>(
    new Map()
  );
  const [status, setStatus] = useState<Status>({
    open: false,
    type: "info",
    handleClose() {},
    action: {
      callback() {},
    },
  });

  useEffect(() => {
    setForm({
      total: item.total?.toString() || "",
      category: item.category || "",
    });
    setErrors({
      total: item.total ? "" : "required",
      category: item.category ? "" : "required",
    });
  }, [item]);

  const handleChange = (name: string, value: string) => {
    const formatedValue = normalizeString(value);

    setChanges((prev) => {
      const newMap = new Map(prev);
      if (formatedValue !== String(budget[name as keyof typeof budget])) {
        newMap.set(
          name,
          name === "total" ? Number(formatedValue) : formatedValue
        );
      } else {
        newMap.delete(name);
      }
      return newMap;
    });
    setErrors((prev) => ({
      ...prev,
      [name]: validateInput(
        name,
        value,
        form,
        true,
        undefined,
        name !== "total" ? 30 : undefined
      ),
    }));
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleBlur = (name: string) => {
    if (!touched.has(name)) {
      setTouched((prev) => {
        const newSet = new Set(prev);
        newSet.add(name);
        return newSet;
      });
    }
  };

  const handleSave = () => {};

  return (
    <>
      <View className=" flex-1 flex-col gap-[10px] ">
        <View className=" pt-[10px] pb-[5px] flex-row items-center justify-between ">
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
              {mode || "Add"}
            </ThemedText>
          </View>
          <Pressable
            onPress={handleSave}
            className=" p-[20px] pt-[10px] pb-[10px] bg-black rounded-[20px] dark:bg-white "
          >
            <ThemedText reverse>Save</ThemedText>
          </Pressable>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className=" pt-[20px] pb-[20px] flex-1 flex-col gap-[20px] ">
            <View className=" p-[20px] bg-paper-light rounded-[20px] flex-col gap-[20px] dark:bg-paper-dark ">
              <InputField
                name="category"
                placeholder="e.g Transport"
                handleBlur={handleBlur}
                handleChange={handleChange}
                error={errors.category}
                touched={touched.has("category")}
              />
              <InputField
                name="total"
                placeholder="e.g $50,000"
                handleBlur={handleBlur}
                handleChange={handleChange}
                error={errors.total}
                touched={touched.has("total")}
                keyboardType="numeric"
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default EditBudgetItem;
