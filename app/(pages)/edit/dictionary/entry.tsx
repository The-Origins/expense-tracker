import InputField from "@/components/edit/inputField";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { DictionaryEntryType } from "@/constants/common";
import icons from "@/constants/icons";
import validateInput from "@/lib/validateInput";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

const EditDictionaryEntry = () => {
  const { mode, type } = useLocalSearchParams();
  const router = useRouter();

  const [form, setForm] = useState<DictionaryEntryType>({
    keyword: "",
    recipient: "",
    title: "",
    category: "",
  });

  const [errors, setErrors] = useState({
    keyword: "required",
    recipient: "required",
    title: "",
    category: "",
  });
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const handleChange = (name: string, value: string) => {
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
    setTouched((prev) => {
      const newSet = new Set(prev);
      newSet.add(name);
      return newSet;
    });
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
                name={type as string}
                placeholder={
                  type === "keyword" ? "e.g 'mart'" : "e.g Quickmart Kilimani"
                }
                handleBlur={handleBlur}
                handleChange={handleChange}
                error={errors[type as "keyword" | "recipient"]}
                touched={touched.has(type as string)}
              />
              <InputField
                name="category"
                placeholder={"e.g Groceries"}
                handleBlur={handleBlur}
                handleChange={handleChange}
                error={errors.category}
                touched={touched.has("category")}
              />
              <InputField
                name="title"
                label={`Title ${type === "keyword" ? "(optional)" : ""}`}
                placeholder={type === "keyword" ? "optional" : "e.g Quickmart"}
                handleBlur={handleBlur}
                handleChange={handleChange}
                error={errors.title}
                touched={touched.has("title")}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default EditDictionaryEntry;
