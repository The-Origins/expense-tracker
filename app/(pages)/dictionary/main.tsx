import DictionaryItemComponent from "@/components/dictionary/item";
import DictionarySectionHeader from "@/components/dictionary/sectionHeader";
import SelectAction from "@/components/expenses/selectAction";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { tintColors } from "@/constants/colorSettings";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import { normalizeString } from "@/lib/appUtils";
import { deleteDictionaryItems, parseData } from "@/lib/dictionaryUtils";
import { getPreferences, setPreferences } from "@/lib/preferenceUtils";
import { DictionaryItem } from "@/types/common";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Pressable,
  SectionList,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Progress from "react-native-progress";

const Dictionary = () => {
  const { loading, data, page, setPage, setItemInfo, setSearch, setData } =
    useAppProps() as {
      loading: boolean;
      data: {
        recipients: DictionaryItem[];
        keywords: DictionaryItem[];
      };
      setSearch: React.Dispatch<React.SetStateAction<string>>;
      page: {
        keywords: number;
        recipients: number;
      };
      setItemInfo: React.Dispatch<
        React.SetStateAction<{
          index: number;
          type: "keywords" | "recipients";
        }>
      >;
      setPage: React.Dispatch<
        React.SetStateAction<{
          keywords: number;
          recipients: number;
        }>
      >;
      setData: React.Dispatch<
        React.SetStateAction<{
          recipients: DictionaryItem[];
          keywords: DictionaryItem[];
        }>
      >;
    };
  const [show, setShow] = useState<boolean>(false);
  const [ids, setIds] = useState<{ keywords: string[]; recipients: string[] }>({
    keywords: [],
    recipients: [],
  });
  const [collapsed, setCollapsed] = useState<{
    keywords: boolean;
    recipients: boolean;
  }>({ keywords: true, recipients: true });

  const filteredData = useMemo<
    {
      type: "keywords" | "recipients";
      data: number[];
    }[]
  >(() => {
    let parsed = parseData(data, collapsed);
    setIds(parsed.ids);
    return parsed.filtered;
  }, [data, collapsed]);

  const [searchValue, setSearchValue] = useState<string>("");
  const [selected, setSelected] = useState<{
    keywords: Set<string>;
    recipients: Set<string>;
  }>({ keywords: new Set(), recipients: new Set() });

  const allSelected = useMemo<boolean>(
    () =>
      selected.keywords.size === ids.keywords.length &&
      selected.recipients.size === ids.recipients.length,
    [ids, selected]
  );

  const [selectMode, setSelectMode] = useState<boolean>(false);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      const normalized = normalizeString(searchValue);
      setSearch((prev) => {
        return prev === normalized ? prev : normalized;
      });
    }, 500);
    return () => clearTimeout(searchTimeout);
  }, [searchValue]);

  useEffect(() => {
    const fetchPreferences = async () => {
      const preferences = await getPreferences("disableDictionaryWarning");
      if (!preferences["disableDictionaryWarning"]) {
        setShow(true);
      }
    };
    fetchPreferences();
  }, []);

  const handleGotIt = async () => {
    await setPreferences({ disableDictionaryWarning: "true" });
    setShow(false);
  };

  const handleExpand = (type: "keywords" | "recipients") => {
    setPage((prev) => ({ ...prev, [type]: prev[type] === 1 ? 2 : 1 }));
  };

  const resetSelected = () => {
    setSelected({ keywords: new Set(), recipients: new Set() });
    setSelectMode(false);
  };

  const handleSelectAll = () => {
    if (selectMode) {
      if (allSelected) {
        setSelected({ keywords: new Set(), recipients: new Set() });
      } else {
        setSelected({
          keywords: new Set(ids.keywords),
          recipients: new Set(ids.recipients),
        });
      }
    } else {
      setSelectMode(true);
    }
  };

  const handleItemSelect = (
    id: string,
    action: "add" | "delete",
    type: "keywords" | "recipients"
  ) => {
    if (!selectMode) {
      setSelectMode(true);
    }
    setSelected((prev) => {
      prev[type] = new Set(prev[type]);
      prev[type][action](id);
      return { ...prev };
    });
  };

  const handleItemEdit = (index: number, type: "keywords" | "recipients") => {
    setItemInfo({ index, type });
    router.push({
      pathname: "/dictionary/edit",
      params: { mode: "edit", type },
    });
  };

  const handleSelectSection = (
    type: "keywords" | "recipients",
    allSelected: boolean
  ) => {
    setSelected((prev) => ({
      ...prev,
      [type]: allSelected ? new Set() : new Set(ids[type]),
    }));
  };

  const handleSectionNavigation = (type: "keywords" | "recipients") => {
    setItemInfo({ index: 0, type });
    router.push({ pathname: "/dictionary/edit", params: { type } });
  };

  const handleDelete = async () => {
    try {
      await deleteDictionaryItems(selected.keywords, selected.recipients);
      setData((prev) => {
        if (selected.keywords.size) {
          prev.keywords = prev.keywords.filter(
            (item) => !selected.keywords.has(item.id)
          );
        }
        if (selected.recipients.size) {
          prev.recipients = prev.recipients.filter(
            (item) => !selected.recipients.has(item.id)
          );
        }
        return { ...prev };
      });
    } catch (error) {
      console.error(error);
    }
    resetSelected();
  };

  const handleSearchClear = () => {
    setSearchValue("");
    setSearch("");
  };

  const handleTitleBtnClick = () => {
    if (selectMode) {
      resetSelected();
    } else {
      router.back();
    }
  };

  return (
    <View className=" flex-1 pr-[10px] pl-[10px] ">
      <View className=" pt-[10px] pb-[10px] flex-col gap-[20px] ">
        <View className=" flex-row justify-between items-center  gap-1 ">
          <View className=" flex-row items-center">
            <Pressable
              onPress={handleTitleBtnClick}
              className=" w-[40px] h-[40px] flex-row items-center   "
            >
              <ThemedIcon
                source={icons[selectMode ? "add" : "arrow"]}
                className={` w-[20px] h-[20px] ${selectMode ? "rotate-45" : "rotate-180"}`}
              />
            </Pressable>
            <ThemedText className=" font-urbanistBold text-[2rem] capitalize">
              {selectMode
                ? `${selected.keywords.size + selected.recipients.size} Selected`
                : "Dictionary"}
            </ThemedText>
          </View>
          <Pressable onPress={handleSelectAll} className=" mt-[4px]">
            <ThemedIcon
              source={
                selectMode
                  ? icons.checkbox[allSelected ? "checked" : "unchecked"]
                  : icons.select
              }
              className=" w-[25px] h-[25px] "
            />
          </Pressable>
        </View>
        <View>
          {selectMode ? (
            <View className=" p-[5px] ">
              <SelectAction
                type="delete"
                disabled={!selected.keywords.size && !selected.recipients.size}
                handlePress={handleDelete}
              />
            </View>
          ) : (
            <View className=" flex-row items-center pl-[10px] pr-[10px] bg-paper-light rounded-[20px] dark:bg-paper-dark ">
              <Image
                source={icons.search}
                className=" w-[15px] h-[15px] "
                tintColor={tintColors.divider}
              />
              <TextInput
                onChangeText={(text) => setSearchValue(text)}
                value={searchValue}
                placeholder="Search"
                className=" flex-1 dark:color-white "
                placeholderTextColor={tintColors.divider}
              />
              {searchValue.length ? (
                <Pressable onPress={handleSearchClear}>
                  <ThemedIcon
                    source={icons.add}
                    className=" w-[15px] h-[15px] rotate-45 "
                  />
                </Pressable>
              ) : (
                <></>
              )}
            </View>
          )}
        </View>
      </View>
      <SectionList
        showsVerticalScrollIndicator={false}
        sections={filteredData}
        renderItem={({ item, index, section }) => (
          <DictionaryItemComponent
            {...{
              index,
              item: data[section.type][item],
              type: section.type,
              selected: selected[section.type],
              selectMode,
              handleItemSelect,
              handleItemEdit,
            }}
          />
        )}
        ItemSeparatorComponent={() => <View className=" p-[10px] "></View>}
        renderSectionHeader={({ section }) => (
          <DictionarySectionHeader
            {...{
              type: section.type,
              empty: !ids[section.type].length,
              allSelected:
                selected[section.type].size === ids[section.type].length,
              selectMode,
              handleSelectSection,
              handleSectionNavigation,
            }}
          />
        )}
        renderSectionFooter={({ section }) => (
          <View className=" pt-[10px] pb-[10px] ">
            {!!data[section.type].length ? (
              <>
                {data[section.type].length >= 5 && (
                  <Pressable
                    onPress={() => handleExpand(section.type)}
                    className=" mt-[5px] mb-[10px] pt-[10px] pb-[10px] flex-row justify-center "
                  >
                    <ThemedText className=" font-urbanistMedium text-[1.2rem]">
                      View {collapsed[section.type] ? "More" : "Less"}
                    </ThemedText>
                  </Pressable>
                )}
              </>
            ) : (
              <View className=" h-[200px] flex-col justify-center items-center ">
                {loading ? (
                  <Progress.CircleSnail color={["#3b82f6", "#10b981"]} />
                ) : (
                  <>
                    <Image
                      source={
                        icons[
                          section.type === "keywords" ? "keyword" : "dictionary"
                        ]
                      }
                      className=" w-[20px] h-[20px] "
                      tintColor={tintColors.divider}
                    />
                    <ThemedText>No {section.type}</ThemedText>
                  </>
                )}
              </View>
            )}
          </View>
        )}
        keyExtractor={(item, index) => `${index}`}
        ListHeaderComponent={
          <View className=" pt-[20px] ">
            {show ? (
              <View className=" flex-col items-start mb-[30px] p-[20px] gap-[20px] bg-primary rounded-[20px] ">
                <View className=" flex-row justify-between items-center ">
                  <Image source={icons.info} className=" w-[20px] h-[20px] " />
                </View>
                <View>
                  <ThemedText
                    toggleOnDark={false}
                    className=" font-urbanistBold text-[1.1rem] "
                  >
                    Keywords
                  </ThemedText>
                  <ThemedText toggleOnDark={false}>
                    Are used to{" "}
                    <ThemedText
                      toggleOnDark={false}
                      className=" font-urbanistBold "
                    >
                      {" "}
                      automaticaly{" "}
                    </ThemedText>
                    set the titles and/or the categories of expenses where the
                    <ThemedText
                      toggleOnDark={false}
                      className=" font-urbanistBold "
                    >
                      {" "}
                      recipient{" "}
                    </ThemedText>{" "}
                    contains the given{" "}
                    <ThemedText
                      toggleOnDark={false}
                      className=" font-urbanistBold"
                    >
                      keyword
                    </ThemedText>
                  </ThemedText>
                </View>
                <View>
                  <ThemedText
                    toggleOnDark={false}
                    className=" font-urbanistBold text-[1.1rem] "
                  >
                    Recipients
                  </ThemedText>
                  <ThemedText toggleOnDark={false}>
                    Are used to
                    <ThemedText
                      toggleOnDark={false}
                      className=" font-urbanistBold "
                    >
                      {" "}
                      automaticaly{" "}
                    </ThemedText>
                    set the titles and/or the categories of expenses where the
                    <ThemedText
                      toggleOnDark={false}
                      className=" font-urbanistBold "
                    >
                      {" "}
                      recipient{" "}
                    </ThemedText>
                    <ThemedText
                      toggleOnDark={false}
                      className=" font-urbanistBold "
                    >
                      is an exact match
                    </ThemedText>
                  </ThemedText>
                </View>
                <Pressable
                  onPress={handleGotIt}
                  className="p-[20px] pt-[5px] pb-[5px] bg-black rounded-[20px] "
                >
                  <Text className=" text-white ">Got it</Text>
                </Pressable>
              </View>
            ) : (
              <></>
            )}
          </View>
        }
      />
    </View>
  );
};

export default Dictionary;
