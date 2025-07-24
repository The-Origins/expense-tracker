import AutoComplete from "@/components/edit/autoComplete";
import InputField from "@/components/edit/inputField";
import StatusModal from "@/components/statusModal";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { Budget, BudgetForm, Status } from "@/constants/common";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import { normalizeString } from "@/lib/appUtils";
import { updateBudget } from "@/lib/budgetUtils";
import validateInput from "@/lib/validateInput";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";

const EditBudget = () => {
  const { mode } = useLocalSearchParams();
  const router = useRouter();
  const appProps = useAppProps();

  const { budgetIndex, budgets, setBudgets } = useMemo<{
    budgetIndex: number;
    budgets: Budget[] | null;
    setBudgets: React.Dispatch<React.SetStateAction<Budget[] | null>>;
  }>(
    () => ({
      budgetIndex: appProps.budgetIndex,
      budgets: appProps.budgets,
      setBudgets: appProps.setBudgets,
    }),
    [appProps]
  );

  const budget = useMemo<Partial<Budget>>(
    () => (budgets && budgets[budgetIndex]) || {},
    [budgetIndex, budgets]
  );

  const [form, setForm] = useState<BudgetForm>({
    total: "",
    title: "this year",
    end: new Date(
      new Date(new Date().getFullYear(), 11, 31).setHours(0, 0, 0, 0)
    ),
    start: new Date(
      new Date(new Date().getFullYear(), 0, 1).setHours(0, 0, 0, 0)
    ),
    repeat: true,
  });

  const [errors, setErrors] = useState({
    total: "required",
    title: "",
  });
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [changes, setChanges] = useState<
    Map<string, string | boolean | number>
  >(new Map());
  const [datePicker, setDatePicker] = useState<{
    open: boolean;
    type: "end" | "start";
  }>({ open: false, type: "end" });
  const [status, setStatus] = useState<Status>({
    open: false,
    type: "info",
    handleClose() {},
    action: {
      callback() {},
    },
  });

  useEffect(() => {
    setForm((prev) => ({
      total: budget.total?.toString() || prev.total,
      title: budget.title || prev.title,
      start: budget.start ? new Date(budget.start) : prev.start,
      end: budget.end ? new Date(budget.end) : prev.end,
      repeat: budget.repeat || prev.repeat,
    }));

    setErrors({
      title: budget.title ? "" : "required",
      total: budget.total ? "" : "required",
    });

    setChanges((prev) => {
      const newMap = new Map(prev);
      if (!budget.start) {
        newMap.set("start", form.start.toISOString());
      } else {
        newMap.delete("start");
      }
      if (!budget.end) {
        newMap.set("end", form.end.toISOString());
      } else {
        newMap.delete("end");
      }
      if (!budget.title) {
        newMap.set("title", "this year");
      } else {
        newMap.delete("title");
      }
      if (!budget.repeat) {
        newMap.set("repeat", true);
      } else {
        newMap.delete("repeat");
      }
      return newMap;
    });
  }, [budget]);

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
    if (name === "title") {
      handleTitleChange(formatedValue);
    }
  };
  const handleBlur = (name: string) => {
    setTouched((prev) => {
      const newSet = new Set(prev);
      newSet.add(name);
      return newSet;
    });
  };
  const handleDateChange = (event: DateTimePickerEvent, newDate?: Date) => {
    setDatePicker((prev) => ({ ...prev, open: Platform.OS === "ios" }));
    console.log("new date: ", newDate);
    if (newDate) {
      setChanges((prev) => {
        const newMap = new Map(prev);
        if (newDate !== form[datePicker.type]) {
          newMap.set(datePicker.type, newDate.toISOString());
        } else {
          newMap.delete(datePicker.type);
        }
        return newMap;
      });

      setForm((prev) => ({
        ...prev,
        [datePicker.type]: newDate,
      }));
    }
  };

  const handleTitleChange = (title: string) => {
    let startDate = form.start;
    let endDate = form.end;
    let now = new Date();
    switch (title) {
      case "this year":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case "this month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "this week":
        startDate = now;
        endDate = now;
        startDate.setDate(now.getDate() - now.getDay());
        endDate.setDate(startDate.getDate() + 6);

      default:
        break;
    }
    setForm((prev) => ({ ...prev, start: startDate, end: endDate }));
  };

  const openDatePicker = (type: "end" | "start") => {
    setDatePicker({ open: true, type });
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
    if (errors.title || errors.total) {
      setTouched(new Set(["title", "total"]));
    } else {
      if (changes.size) {
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
        if (changes.has("start") || changes.has("end")) {
          changes.set("start", form.start.toISOString());
          changes.set("end", form.end.toISOString());
        }
        const change: Partial<Budget> = Object.fromEntries(changes);

        if (mode === "edit" && budget) {
          await updateBudget({ ...change }, "update");
          setBudgets((prev) => {
            if (prev) {
              prev[budgetIndex] = { ...budget, ...change } as Budget;
            }
            return prev;
          });
        } else {
          const newBudget = await updateBudget({ ...change }, "add");
          if (budgets) {
            setBudgets([newBudget as Budget, ...budgets]);
          }
        }
        handleStatusClose();
        router.back();
      }
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
              {(mode || "Add") + " budget"}
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
                name="total"
                label="Amount"
                placeholder="e.g $50,000"
                handleBlur={handleBlur}
                handleChange={handleChange}
                error={errors.total}
                touched={touched.has("total")}
                changed={changes.has("total")}
                keyboardType="numeric"
              />
              <AutoComplete
                name="title"
                value={form.title}
                error={errors.title}
                touched={touched.has("title")}
                changed={changes.has("title")}
                onChange={handleChange}
                options={["this year", "this month", "this week"]}
              />
              <View className=" flex-row gap-[20px] ">
                <View className=" flex-1 flex-col gap-[10px] ">
                  <ThemedText className=" font-urbanistMedium text-[1.2rem] ">
                    Start
                  </ThemedText>
                  <Pressable
                    onPress={() => openDatePicker("start")}
                    className={` p-[10px] rounded-[10px] border ${changes.has("start") ? "border-info" : "border-black dark:border-white"}`}
                  >
                    <ThemedText>{form.start.toDateString()}</ThemedText>
                  </Pressable>
                </View>
                <View className=" flex-1 flex-col gap-[10px] ">
                  <ThemedText className=" font-urbanistMedium text-[1.2rem] ">
                    End
                  </ThemedText>
                  <Pressable
                    onPress={() => openDatePicker("end")}
                    className={` p-[10px] rounded-[10px] border ${changes.has("end") ? "border-info" : "border-black dark:border-white"}`}
                  >
                    <ThemedText>{form.start.toDateString()}</ThemedText>
                  </Pressable>
                </View>
              </View>
              <Pressable
                onPress={() =>
                  setForm((prev) => ({ ...prev, repeat: !prev.repeat }))
                }
                className=" flex-row items-center gap-2 "
              >
                <ThemedIcon
                  source={icons.checkbox[form.repeat ? "checked" : "unchecked"]}
                  className=" w-[20px] h-[20px] "
                />
                <ThemedText className=" font-urbanistMedium ">
                  Repeat
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
      <StatusModal status={status} />
      {datePicker.open ? (
        <DateTimePicker
          value={form[datePicker.type]}
          onChange={handleDateChange}
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default EditBudget;
