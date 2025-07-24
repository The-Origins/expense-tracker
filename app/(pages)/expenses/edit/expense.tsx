import InputField from "@/components/edit/inputField";
import StatusModal from "@/components/statusModal";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { tintColors } from "@/constants/colorSettings";
import {
  Expense,
  ExpenseForm,
  ExpenseFormErrors,
  Status,
} from "@/constants/common";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import { updateExpense } from "@/lib/expenseUtils";
import validateInput from "@/lib/validateInput";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Image, Platform, Pressable, ScrollView, View } from "react-native";
import * as Progress from "react-native-progress";

const EditExpense = () => {
  const router = useRouter();
  const { ids, mode } = useLocalSearchParams();
  const scrollViewRef = useRef<any>(null);

  const {
    loading,
    setExpenses,
    setEdited,
    expenseIndex,
    expenses,
    setCollections,
    setCollectionNames,
    setQueryParameters,
  } = useAppProps();

  const expense = useMemo<Partial<Expense>>(
    () => (mode === "edit" ? expenses[expenseIndex] || {} : {}),
    [expenseIndex, expenses]
  );

  const [status, setStatus] = useState<Status>({
    open: false,
    type: "info",
    handleClose() {},
    action: {
      callback() {},
    },
  });
  const [form, setForm] = useState<Partial<ExpenseForm> & { date: Date }>({
    date: new Date(),
  });
  const [errors, setErrors] = useState<ExpenseFormErrors>({
    title: "",
    category: "",
    amount: "",
    recipient: "",
    ref: "",
    receipt: "",
  });
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [changes, setChanges] = useState<Map<string, string>>(new Map());

  const [datePicker, setDatePicker] = useState<{
    open: boolean;
    type: "date" | "time";
  }>({ open: false, type: "date" });

  useEffect(() => {
    const defaultDate = new Date();
    setForm({
      ...expense,
      date: expense.date ? new Date(expense.date) : defaultDate,
      amount: expense.amount ? String(expense.amount) : undefined,
    });
    setErrors({
      title: expense.title ? "" : "required",
      category: expense.category ? "" : "required",
      amount: expense.amount ? "" : "required",
      recipient: expense.recipient ? "" : "required",
      ref: "",
      receipt: "",
    });
    if (!expense.date) {
      setChanges((prev) => {
        const newMap = new Map(prev);
        newMap.set("date", defaultDate.toISOString());
        return newMap;
      });
    } else {
      setChanges(new Map());
    }
  }, [expense]);

  useEffect(() => {
    if (ids && ids.length && typeof ids === "string") {
      setQueryParameters({ ids: ids.split(",") });
    }
  }, [ids]);

  const handleChange = (name: string, value: string) => {
    const formatedValue = value.replace(/\s+/g, " ").trim().toLowerCase();

    setChanges((prev) => {
      const newMap = new Map(prev);
      if (formatedValue !== String(expense[name as keyof typeof expense])) {
        newMap.set(name, formatedValue as string);
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
        name !== "ref" && name !== "receipt",
        undefined,
        name !== "amount" ? (name === "receipt" ? 200 : 30) : undefined
      ),
    }));
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => {
      const newSet = new Set(prev);
      newSet.add(name);
      return newSet;
    });
  };

  const handleReceiptPaste = () => {};

  const handleDateChange = (event: DateTimePickerEvent, newDate?: Date) => {
    setDatePicker((prev) => ({ ...prev, open: Platform.OS === "ios" }));
    if (newDate) {
      if (newDate.toISOString())
        setForm((prev) => ({ ...prev, date: newDate }));
    }
  };

  const openDatePicker = (type: "date" | "time") => {
    setDatePicker({ open: true, type });
  };

  const handleBlockedInput = () => {
    scrollViewRef.current?.scrollTo({ y: 500, animated: true });
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
    if (
      errors.title ||
      errors.category ||
      errors.amount ||
      errors.recipient ||
      errors.ref ||
      errors.receipt
    ) {
      setTouched(
        new Set(["title", "category", "amount", "recipient", "ref", "receipt"])
      );
    } else {
      if (changes.size) {
        setStatus({
          open: true,
          type: "loading",
          title: mode === "edit" ? "Updating" : "Adding",
          message: `${mode === "edit" ? "updating" : "adding"} expense`,
          handleClose: handleStatusClose,
          action: {
            callback() {},
          },
        });
        try {
          let change: Partial<Expense> = Object.fromEntries(changes);
          change.id = expense.id;
          if (mode === "edit") {
            await updateExpense(change, "update", expense);
            if (expenses[expenseIndex]) {
              setExpenses((prev: Partial<Expense>[]) => {
                prev[expenseIndex] = { ...prev[expenseIndex], ...change };
                return prev;
              });
              setEdited((prev: Set<string>) => {
                const newSet = new Set(prev);
                newSet.add(expense.id || "");
                return newSet;
              });
            }
          } else {
            change.collection = change.category;
            await updateExpense(change, "add");
            setCollections((prev: Map<string, number> | null) => {
              if (prev) {
                const newMap = new Map(prev);
                const existingCount = newMap.get(change.collection || "");
                newMap.set(change.collection || "", (existingCount || 0) + 1);
                newMap.set("expenses", (newMap.get("expenses") || 0) + 1);
                if (!existingCount) {
                  setCollectionNames((prev: string[]) => [
                    change.collection,
                    ...prev,
                  ]);
                }
                return newMap;
              }
              return prev;
            });
          }
        } catch (error) {
          console.error(error);
          setStatus({
            open: true,
            type: "error",
            title: "Error updating expense",
            message: "There was an error when updating expense",
            handleClose: handleStatusClose,
            action: {
              callback() {},
            },
          });
        }
      }
      router.back();
    }
  };

  const handleReceiptsImport = () => {
    router.replace("/expenses/edit/receipts");
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
        {!!loading ? (
          <View className=" flex-1 flex-col items-center justify-center ">
            <Progress.CircleSnail color={["#3b82f6", "#10b981"]} />
          </View>
        ) : (
          <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
            <View className=" flex-1 pt-[20px]  flex-col gap-[20px] ">
              <View className=" flex-col gap-[10px] p-[20px] rounded-[20px] bg-paper-light dark:bg-paper-dark ">
                <InputField
                  name="title"
                  placeholder="e.g Uber"
                  required
                  value={form.title}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  error={errors.title}
                  touched={touched.has("title")}
                  changed={changes.has("title")}
                />
                <InputField
                  name="category"
                  placeholder="e.g Transport"
                  required
                  value={form.category}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  error={errors.category}
                  touched={touched.has("category")}
                  changed={changes.has("category")}
                />
              </View>
              <View className=" flex-col gap-[10px] p-[20px] rounded-[20px] bg-paper-light dark:bg-paper-dark ">
                <InputField
                  name="recipient"
                  placeholder="e.g Mr John"
                  required
                  value={form.recipient}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  error={errors.recipient}
                  touched={touched.has("recipient")}
                  changed={changes.has("recipient")}
                />
                <InputField
                  name="amount"
                  placeholder="e.g $500"
                  required
                  value={form.amount}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  error={errors.amount}
                  touched={touched.has("amount")}
                  changed={changes.has("amount")}
                  keyboardType="numeric"
                />
              </View>
              <View className=" flex-col gap-[10px] p-[20px] rounded-[20px] bg-paper-light dark:bg-paper-dark ">
                <View className=" flex-col gap-[10px] ">
                  <ThemedText className=" font-urbanistMedium text-[1.2rem] ">
                    Date
                  </ThemedText>
                  <Pressable
                    onPress={() => openDatePicker("date")}
                    className={` p-[10px] rounded-[10px] border ${changes.has("date") ? "border-info" : " border-black dark:border-white"} `}
                  >
                    <ThemedText>{form.date.toDateString()}</ThemedText>
                  </Pressable>
                </View>
                <View className=" flex-col gap-[10px] ">
                  <ThemedText className=" font-urbanistMedium text-[1.2rem] ">
                    Time
                  </ThemedText>
                  <Pressable
                    onPress={() => openDatePicker("time")}
                    className={` p-[10px] rounded-[10px] border ${changes.has("date") ? "border-info" : " border-black dark:border-white"} `}
                  >
                    <ThemedText>{form.date.toTimeString()}</ThemedText>
                  </Pressable>
                </View>
              </View>
              <View className=" flex-col gap-[10px] p-[20px] rounded-[20px] bg-paper-light dark:bg-paper-dark ">
                <InputField
                  name="ref"
                  label="Reference ID"
                  placeholder="e.g HMDLX123"
                  value={form.ref}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  error={errors.ref}
                  touched={touched.has("ref")}
                  changed={changes.has("ref")}
                  onPress={handleBlockedInput}
                />
                <View className=" relative ">
                  <InputField
                    name="receipt"
                    value={form.receipt}
                    placeholder="Enter or paste receipt..."
                    className=" p-[0px] border-none "
                    style={{ height: 100 }}
                    multiline={true}
                    numberOfLines={4}
                    textAlignVertical="top"
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    onPress={handleBlockedInput}
                    error={errors.receipt}
                    touched={touched.has("receipt")}
                    changed={changes.has("receipt")}
                  />
                  {!form.receipt ? (
                    <Pressable
                      onPress={handleReceiptPaste}
                      className=" absolute top-[38] right-[10]  p-[10px] pt-[3px] pb-[3px] bg-black rounded-[20px] dark:bg-white "
                    >
                      <ThemedText reverse>Paste</ThemedText>
                    </Pressable>
                  ) : (
                    <></>
                  )}
                </View>
              </View>
              <View className=" flex-col gap-[10px] mb-[20px] p-[20px] rounded-[20px] bg-paper-light dark:bg-paper-dark ">
                <ThemedText className=" font-urbanistMedium text-[1.2rem] ">
                  Image
                </ThemedText>
                <View className=" relative overflow-hidden rounded-[20px] flex-row aspect-square border border-divider ">
                  {form.image ? (
                    <Image src={form.image} className=" w-[100%] h-[100%] " />
                  ) : (
                    <View className=" flex-1 flex-col gap-2 justify-center items-center ">
                      <Image
                        source={icons.image}
                        className=" w-[40px] h-[40px] "
                        tintColor={tintColors.divider}
                      />
                      <ThemedText className=" text-divider ">
                        No Image
                      </ThemedText>
                      <View className=" p-[20px] pt-[5px] pb-[5px] bg-black rounded-[20px] dark:bg-white ">
                        <ThemedText reverse> Add</ThemedText>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </ScrollView>
        )}
        {mode !== "edit" ? (
          <View className="flex-row gap-[10px] ">
            <Pressable className=" border border-black pt-[10px] pb-[10px] rounded-[20px] flex-1  flex-row justify-center items-center dark:border-white">
              <ThemedText className="">Import from Excel</ThemedText>
            </Pressable>
            <Pressable
              onPress={handleReceiptsImport}
              className=" flex-1 pt-[10px] pb-[10px] bg-black rounded-[20px] flex-row gap-2 justify-center items-center dark:bg-white "
            >
              <ThemedText reverse className=" font-urbanistMedium">
                Import From Receipts
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <></>
        )}
      </View>
      {datePicker.open ? (
        <DateTimePicker
          value={form.date}
          onChange={handleDateChange}
          mode={datePicker.type}
        />
      ) : (
        <></>
      )}
      <StatusModal status={status} />
    </>
  );
};

export default EditExpense;
