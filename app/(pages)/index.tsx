import HomeBudgetWidget from "@/components/home/budgetWidget";
import HomeChart from "@/components/home/chart";
import HomeExpenseWidget from "@/components/home/expenseWidget";
import ScopeChip from "@/components/home/scopeChip";
import BottomTabs from "@/components/layout/bottomTabs";
import Categories from "@/components/statistics/categories";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { Scope } from "@/constants/common";
import icons from "@/constants/icons";
import user from "@/data/user.json";
import { Link } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

export default function Index() {
  const [scope, setScope] = useState<Scope>("today");
  const [total, setTotal] = useState<number>(0)
  const timeString = useMemo<string>(() => {
    let date = new Date();

    switch (scope) {
      case "this year":
        return `${date.getFullYear()}`;
      case "this month":
        return `${date.getFullYear()}/${date.getMonth()}`;
      case "today":
        return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}`;
      default:
        return "all";
    }
  }, [scope]);

  return (
    <>
      <View className=" flex-1 pl-[10px] pr-[10px] ">
        <View className="  flex-row justify-between items-center  gap-1 pt-[10px] pb-[10px]">
          <Link href={"/profile"} asChild>
            <Pressable className=" flex-row items-center gap-2">
              <View className=" h-[30px] w-[30px] bg-paper-light rounded-[15px] flex-row justify-center items-center dark:bg-paper-dark">
                <ThemedIcon
                  source={icons.avatar}
                  className="w-[20px] h-[20px]"
                />
              </View>
              <ThemedText className=" font-urbanistBold text-[1.6rem]">
                {user.name.first} {user.name.last}
              </ThemedText>
            </Pressable>
          </Link>
          <Link href={"/notifications"} asChild>
            <Pressable>
              <ThemedIcon
                source={icons.notification}
                className="w-[20px] h-[20px]"
              />
            </Pressable>
          </Link>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className=" flex-1 flex-col gap-8 pb-[30px]">
            <View className=" w-[100%] flex-row gap-1 pt-6">
              <ScopeChip scope={scope} value="today" setScope={setScope} />
              <ScopeChip scope={scope} value="this month" setScope={setScope} />
              <ScopeChip scope={scope} value="this year" setScope={setScope} />
              <ScopeChip scope={scope} value="all" setScope={setScope} />
            </View>
            <HomeChart timeString={timeString} scope={scope} setTotal={setTotal} />
            <HomeBudgetWidget />
            <Categories timePath={timeString} total={total} indexOffset={2} limit={6} />
            <HomeExpenseWidget />
          </View>
        </ScrollView>
      </View>
      <BottomTabs />
    </>
  );
}
