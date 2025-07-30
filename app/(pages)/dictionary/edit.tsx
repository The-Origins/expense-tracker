import InputField from "@/components/inputField";
import StatusModal from "@/components/statusModal";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { BudgetItem, DictionaryItem, Status } from "@/constants/common";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import { normalizeString } from "@/lib/appUtils";
import { updateDictionaryItem } from "@/lib/dictionaryUtils";
import validateInput from "@/lib/validateInput";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

const EditDictionaryItem = () => {
  const { mode, type } = useLocalSearchParams();

  const { itemInfo, data, setData } = useAppProps() as {
    data: {
      recipients: DictionaryItem[];
      keywords: DictionaryItem[];
    };
    itemInfo: {
      index: number;
      type: "keywords" | "recipients";
    };
    setData: React.Dispatch<
      React.SetStateAction<{
        recipients: DictionaryItem[];
        keywords: DictionaryItem[];
      }>
    >;
  };

  const item = useMemo<Partial<DictionaryItem>>(
    () => (mode === "edit" && data[itemInfo.type][itemInfo.index]) || {},
    [data, itemInfo]
  );
  const formattedType = useMemo<"keyword" | "recipient">(
    () => (type === "keywords" ? "keyword" : "recipient"),
    [type]
  );

  const [form, setForm] = useState<Partial<DictionaryItem>>({});
  const [errors, setErrors] = useState({
    keyword: "",
    recipient: "",
    title: "",
    category: "",
  });
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [changes, setChanges] = useState<Map<string, string>>(new Map());
  const [status, setStatus] = useState<Status>({
    open: false,
    type: "info",
    handleClose() {},
    action: {
      callback() {},
    },
  });

  useEffect(() => {
    setForm(item);
    setErrors((prev) => ({
      ...prev,
      keyword: item.keyword ? "" : "required",
      recipient: item.recipient ? "" : "required",
    }));
  }, [item]);

  const handleChange = (name: string, value: string) => {
    const formatedValue = normalizeString(value);
    setChanges((prev) => {
      const newMap = new Map(prev);
      if (formatedValue !== String(item[name as keyof typeof item])) {
        newMap.set(name, formatedValue);
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
        name !== "title" && name !== "category",
        undefined,
        30
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
    if (
      (formattedType === "keyword" && errors.keyword) ||
      (formattedType === "recipient" && errors.recipient) ||
      errors.category ||
      errors.title
    ) {
      setTouched(new Set(["keyword", "recipient", "category", "title"]));
    } else if (!form.title && !form.category) {
    } else {
      try {
        if (changes.size) {
          setStatus({
            open: true,
            type: "loading",
            title: mode === "edit" ? "Updating" : "Adding",
            message: `${mode === "edit" ? "updating" : "adding"} ${formattedType}`,
            handleClose: handleStatusClose,
            action: {
              callback() {},
            },
          });
          const change: Partial<BudgetItem> = Object.fromEntries(changes);
          change.id = item.id;
          const newItem = await updateDictionaryItem(
            change,
            formattedType,
            mode === "edit" ? "update" : "add"
          );
          setData((prev) => {
            if (mode === "edit") {
              prev[itemInfo.type][itemInfo.index] = {
                ...item,
                ...newItem,
              } as DictionaryItem;
            } else {
              prev[itemInfo.type] = [
                newItem as DictionaryItem,
                ...prev[itemInfo.type],
              ];
            }
            return prev;
          });
          handleStatusClose();
        }
        router.back();
      } catch (error) {
        console.error(error);
        setStatus({
          open: true,
          type: "error",
          message: "There was an error while updating dictionary item",
          handleClose: handleStatusClose,
          action: { callback: handleStatusClose },
        });
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
                name={formattedType}
                value={form[formattedType]}
                placeholder={
                  type === "keywords" ? "e.g 'mart'" : "e.g Quickmart Kilimani"
                }
                handleBlur={handleBlur}
                handleChange={handleChange}
                error={errors[formattedType]}
                touched={touched.has(formattedType)}
                changed={changes.has(formattedType)}
              />
              <InputField
                name="category"
                value={form.category}
                placeholder={"e.g Groceries"}
                handleBlur={handleBlur}
                handleChange={handleChange}
                error={errors.category}
                touched={touched.has("category")}
                changed={changes.has("category")}
              />
              <InputField
                name="title"
                value={form.title}
                label={`Title ${type === "keywords" ? "(optional)" : ""}`}
                placeholder={type === "keywords" ? "optional" : "e.g Quickmart"}
                handleBlur={handleBlur}
                handleChange={handleChange}
                error={errors.title}
                touched={touched.has("title")}
                changed={changes.has("title")}
              />
            </View>
          </View>
        </ScrollView>
      </View>
      <StatusModal status={status} />
    </>
  );
};

export default EditDictionaryItem;
