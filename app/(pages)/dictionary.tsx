import DictionaryEntry from "@/components/dictionary/entry";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { DictionaryEntryType } from "@/constants/common";
import icons from "@/constants/icons";
import { Link, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Image, Pressable, SectionList, Text, View } from "react-native";

const data: {
  title: "keywords" | "recipients";
  data: DictionaryEntryType[];
}[] = [
  {
    title: "keywords",
    data: [
      { keyword: "mart", category: "groceries" },
      { keyword: "mart", category: "groceries" },
      { keyword: "shell", category: "fuel", title: "shell" },
      { keyword: "mart", category: "groceries" },
      { keyword: "mart", category: "groceries" },
    ],
  },
  {
    title: "recipients",
    data: [
      {
        recipient: "wallmart.com",
        category: "groceries",
        title: "wallmart",
      },
      {
        recipient: "wallmart.com",
        category: "groceries",
        title: "wallmart",
      },
      {
        recipient: "wallmart.com",
        category: "groceries",
        title: "wallmart",
      },
      {
        recipient: "wallmart.com",
        category: "groceries",
        title: "wallmart",
      },
    ],
  },
];

const Dictionary = () => {
  const router = useRouter();
  const [show, setShow] = useState<boolean>(true);
  const [limit, setLimit] = useState<{
    keyword: number | undefined;
    recipient: number | undefined;
  }>({ keyword: 4, recipient: 4 });

  const data = useMemo<
    { type: "keyword" | "recipient"; data: DictionaryEntryType[] }[]
  >(
    () => [
      {
        type: "keyword",
        data: [
          { keyword: "mart", category: "groceries" },
          { keyword: "mart", category: "groceries" },
          { keyword: "shell", category: "fuel", title: "shell" },
          { keyword: "mart", category: "groceries" },
          { keyword: "mart", category: "groceries" },
        ].slice(0, limit.keyword),
      },
      {
        type: "recipient",
        data: [
          {
            recipient: "wallmart.com",
            category: "groceries",
            title: "wallmart",
          },
          {
            recipient: "wallmart.com",
            category: "groceries",
            title: "wallmart",
          },
          {
            recipient: "wallmart.com",
            category: "groceries",
            title: "wallmart",
          },
          {
            recipient: "wallmart.com",
            category: "groceries",
            title: "wallmart",
          },
        ].slice(0, limit.recipient),
      },
    ],
    [limit]
  );

  const handleCollapse = (type: "keyword" | "recipient") => {
    setLimit((prev) => ({ ...prev, [type]: prev[type] === 0 ? 4 : 0 }));
  };

  const handleExpand = (type: "keyword" | "recipient") => {
    setLimit((prev) => ({ ...prev, [type]: prev[type] === 4 ? undefined : 4 }));
  };

  return (
    <View className=" flex-1 pr-[10px] pl-[10px] ">
      <View className=" pt-[5px] pb-[5px] flex-row items-center justify-between ">
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
          <ThemedText className=" font-urbanistBold text-[2rem] ">
            My Dictionary
          </ThemedText>
        </View>
      </View>
      <SectionList
        showsVerticalScrollIndicator={false}
        sections={data}
        renderItem={({ item, index, section }) => (
          <DictionaryEntry entry={item} index={index} type={section.type} />
        )}
        renderSectionHeader={({ section }) => (
          <View className=" flex-row justify-between items-center pt-[5px] pb-[5px] mb-[10px] ">
            <Pressable
              onPress={() => handleCollapse(section.type)}
              className=" flex-row gap-2 items-center "
            >
              <ThemedIcon
                source={icons.chevron}
                className={` w-[15px] h-[15px] ${limit[section.type] === 0 ? "rotate-180" : "rotate-0"} `}
              />
              <ThemedText className=" capitalize font-urbanistBold text-[1.5rem] ">
                {section.type}s
              </ThemedText>
            </Pressable>
            <Link
              href={{
                pathname: "/edit/dictionary/entry",
                params: { entry: " ", type: section.type },
              }}
              asChild
            >
              <Pressable className=" p-[20px] pt-[5px] pb-[5px] rounded-[20px] bg-black flex-row items-center gap-1 dark:bg-white ">
                <ThemedIcon
                  reverse
                  source={icons.add}
                  className=" w-[10px] h-[10px] "
                />
                <ThemedText reverse>Add</ThemedText>
              </Pressable>
            </Link>
          </View>
        )}
        renderSectionFooter={({ section }) => (
          <>
            {limit[section.type] !== 0 ? (
              <Pressable
                onPress={() => handleExpand(section.type)}
                className=" mt-[5px] mb-[20px] pt-[5px] pb-[5px] flex-row justify-center "
              >
                <ThemedText className=" font-urbanistMedium text-[1.2rem]">
                  View {limit[section.type] ? "More" : "Less"}
                </ThemedText>
              </Pressable>
            ) : (
              <></>
            )}
          </>
        )}
        keyExtractor={(item, index) => `${index}`}
        ListHeaderComponent={
          <>
            {show ? (
              <View className=" flex-col items-start mt-[20px] mb-[30px] p-[20px] gap-[20px] bg-primary rounded-[20px] ">
                <View className=" flex-row justify-between items-center ">
                  <Image source={icons.info} className=" w-[20px] h-[20px] " />
                </View>
                <View>
                  <Text className=" font-urbanistBold text-[1.1rem] ">
                    Keywords
                  </Text>
                  <Text className=" text-wrap flex-wrap ">
                    Are used to{" "}
                    <Text className=" font-urbanistBold "> automaticaly </Text>
                    set the titles and/or the categories of expenses where the
                    <Text className=" font-urbanistBold ">
                      {" "}
                      recipient{" "}
                    </Text>{" "}
                    contains the given{" "}
                    <Text className=" font-urbanistBold">keyword</Text>
                  </Text>
                </View>
                <View>
                  <Text className=" font-urbanistBold text-[1.1rem] ">
                    Recipients
                  </Text>
                  <Text className=" text-wrap flex-wrap ">
                    Are used to
                    <Text className=" font-urbanistBold "> automaticaly </Text>
                    set the titles and/or the categories of expenses where the
                    <Text className=" font-urbanistBold "> recipient </Text>
                    <Text className=" font-urbanistBold ">
                      is an exact match
                    </Text>
                  </Text>
                </View>
                <Pressable
                  onPress={() => setShow(false)}
                  className="p-[20px] pt-[5px] pb-[5px] bg-black rounded-[20px] "
                >
                  <Text className=" text-white ">Got it</Text>
                </Pressable>
              </View>
            ) : (
              <></>
            )}
          </>
        }
      />
    </View>
  );
};

export default Dictionary;
