import InputField from "@/components/inputField";
import StatusModal from "@/components/statusModal";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { Budget, BudgetItem, Status } from "@/constants/common";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import { normalizeString } from "@/lib/appUtils";
import { updateBudgetItem } from "@/lib/budgetUtils";
import validateInput from "@/lib/validateInput";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

const EditItem = () => {
  const { mode } = useLocalSearchParams();
  const router = useRouter();

  const {
    budgetIndex,
    categoryIndex,
    budgets,
    categories,
    setCategories,
    setBudgets,
  } = useAppProps() as {
    budgetIndex: number;
    categoryIndex: number;
    budgets: Budget[] | null;
    categories: Map<string, BudgetItem[]>;
    setCategories: React.Dispatch<
      React.SetStateAction<Map<string, BudgetItem[]>>
    >;
    setBudgets: React.Dispatch<React.SetStateAction<Budget[] | null>>;
  };

  const budget = useMemo<Budget | undefined>(
    () => (budgets && budgets[budgetIndex]) || undefined,
    [budgetIndex, budgets]
  );

  const item = useMemo<Partial<BudgetItem>>(
    () =>
      (mode === "edit" &&
        budget &&
        !!budget.id &&
        categories.get(budget.id)?.[categoryIndex]) ||
      {},
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
      if (formatedValue !== String(item[name as keyof typeof item])) {
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
        name === "total" ? "amount" : name,
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

  const handleStatusClose = () => {
    setStatus({
      open: false,
      type: "info",
      handleClose() {},
      action: {
        callback() {},
      },
    });
  };

  const handleSave = async () => {
    try {
      if (errors.total || errors.category) {
        setTouched(new Set(["total", "category"]));
      } else {
        setStatus({
          open: true,
          type: "loading",
          title: mode === "edit" ? "Updating" : "Adding",
          message: `${mode === "edit" ? "updating" : "adding"} budget`,
          handleClose: handleStatusClose,
          action: {
            callback() {},
          },
        });

        if (changes.size && budget) {
          const change: Partial<BudgetItem> = Object.fromEntries(changes);
          let updates: {
            item: Partial<BudgetItem>;
            budget: Partial<Budget>;
          };
          if (mode === "edit") {
            change.id = item.id;
            updates = await updateBudgetItem(budget, change, "update", item);
            if (budget && item) {
              setCategories((prev) => {
                const newMap = new Map(prev);
                const prevCategories = newMap.get(budget.id);
                if (prevCategories) {
                  prevCategories[categoryIndex] = {
                    ...item,
                    ...change,
                  } as BudgetItem;
                  newMap.set(budget.id, prevCategories);
                }
                return newMap;
              });
            }
          } else {
            updates = await updateBudgetItem(budget, change, "add");
            if (categories.has(budget.id)) {
              setCategories((prev) => {
                const newMap = new Map(prev);
                newMap.set(budget.id, [
                  updates.item as BudgetItem,
                  ...(newMap.get(budget.id) || []),
                ]);
                return newMap;
              });
            }
          }
          setBudgets((prev) => {
            if (prev) {
              const newArray = Array.from(prev);
              newArray[budgetIndex] = updates.budget as Budget;
              return newArray;
            }
            return prev;
          });
        }
        handleStatusClose();
        router.back();
      }
    } catch (error) {
      setStatus({
        open: true,
        type: "error",
        message: "There was an error while updating budget item",
        handleClose: handleStatusClose,
        action: { callback: handleStatusClose },
      });
      console.error(error);
    }
  };

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
              {(mode || "Add") + " Item"}
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
                value={form.category}
                placeholder="e.g Transport"
                handleBlur={handleBlur}
                handleChange={handleChange}
                error={errors.category}
                touched={touched.has("category")}
                changed={changes.has("category")}
              />
              <InputField
                name="total"
                value={form.total}
                placeholder="e.g $50,000"
                handleBlur={handleBlur}
                handleChange={handleChange}
                error={errors.total}
                touched={touched.has("total")}
                changed={changes.has("total")}
                keyboardType="numeric"
              />
            </View>
          </View>
        </ScrollView>
      </View>
      <StatusModal status={status} />
    </>
  );
};

export default EditItem;
