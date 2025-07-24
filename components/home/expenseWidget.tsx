import { tintColors } from "@/constants/colorSettings";
import { Expense } from "@/constants/common";
import icons from "@/constants/icons";
import { getExpenses } from "@/lib/expenseUtils";
import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, View } from "react-native";
import ThemedText from "../themedText";
import HomeExpenseCard from "./expenseCard";

const HomeExpenseWidget = () => {
  const [expenses, setExpenses] = useState<Partial<Expense>[]>([]);

  useEffect(() => {
    const fetchExpenses = async () => {
      const data = await getExpenses({ limit: 5, page: 1 });
      setExpenses(data as Partial<Expense>[]);
    };
    fetchExpenses();
  }, []);

  return (
    <View>
      <ThemedText className=" mb-[20px] font-urbanistBold text-[1.5rem]">
        Expenses
      </ThemedText>
      {expenses.length ? (
        <>
          <View className=" flex-col gap-[20px]">
            {expenses.map((expense, index) => (
              <HomeExpenseCard key={index} expense={expense} />
            ))}
          </View>
          <Link href={"/expenses/display/collections"} asChild>
            <Pressable className=" w-[100%] flex-row justify-center p-[20px]">
              <ThemedText>View More</ThemedText>
            </Pressable>
          </Link>
        </>
      ) : (
        <View className=" h-[200px] flex-col gap-2 justify-center items-center ">
          <Image
            source={icons.money}
            className=" w-[40px] h-[40px] "
            tintColor={tintColors.divider}
          />
          <ThemedText>No Expenses</ThemedText>
        </View>
      )}
    </View>
  );
};

export default HomeExpenseWidget;
