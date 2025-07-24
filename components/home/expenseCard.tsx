import { Expense } from "@/constants/common";
import dayjs from "dayjs";
import { Link } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";
import ThemedText from "../themedText";

const HomeExpenseCard = ({ expense }: { expense: Partial<Expense> }) => {
  return (
    <Link
      href={{
        pathname: "/expenses/edit/expense",
        params: { ids: expense.id, mode: "edit" },
      }}
      asChild
    >
      <Pressable className=" flex-col gap-2 p-[20px] rounded-[20px] bg-paper-light dark:bg-paper-dark">
        <View className="flex-row justify-between">
          <ThemedText
            className={` flex-1 capitalize font-urbanistBold text-[1.2rem] ${!expense.title ? "text-error" : ""}`}
          >
            {expense.title || "title: missing"}
          </ThemedText>
          <View className=" flex-1 flex-row justify-end ">
            <ThemedText
              className={` text-right font-urbanistBold text-[1.2rem] ${!expense.amount ? "text-error" : ""}`}
            >
              {expense.amount || "amount: missing"}
            </ThemedText>
          </View>
        </View>
        <View className="flex-row justify-between">
          <ThemedText
            toggleOnDark={false}
            className={` flex-1 capitalize ${!expense.category ? "text-error" : "text-divider"}`}
          >
            {expense.category || "category: missing"}
          </ThemedText>
          <View className=" flex-1 flex-row justify-end ">
            <ThemedText
              toggleOnDark={false}
              className={` text-right  ${!expense.date ? "text-error" : "text-divider"}`}
            >
              {expense.date
                ? dayjs(new Date(expense.date)).format("dd DD MMM YYYY")
                : "date: missing"}
            </ThemedText>
          </View>
        </View>
      </Pressable>
    </Link>
  );
};

export default HomeExpenseCard;
