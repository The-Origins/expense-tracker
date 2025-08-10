import DictionaryItemComponent from "@/components/dictionary/item";
import SelectAction from "@/components/expenses/selectAction";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { tintColors } from "@/constants/colorSettings";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import { normalizeString } from "@/lib/appUtils";
import { deleteDictionaryItems } from "@/lib/dictionaryUtils";
import { DictionaryItem } from "@/types/common";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, TextInput, View } from "react-native";
import * as Progress from "react-native-progress";

const DictionaryItems = () => {
  const {
    data,
    page,
    loading,
    queryParams,
    setData,
    setItemIndex,
    setQueryParams,
    nextPage,
  } = useAppProps() as {
    data: DictionaryItem[];
    page: number;
    loading: boolean;
    queryParams: {
      type: "keywords" | "recipients";
      search: string;
    } | null;
    setData: React.Dispatch<React.SetStateAction<DictionaryItem[]>>;
    setItemIndex: React.Dispatch<React.SetStateAction<number>>;
    setQueryParams: React.Dispatch<
      React.SetStateAction<{
        type: "keywords" | "recipients";
        search: string;
      } | null>
    >;
    nextPage: () => Promise<void>;
  };

  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState<boolean>(false);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [canGoNext, setCanGoNext] = useState<boolean>(false);

  const ids = useMemo<string[]>(() => data.map((item) => item.id), [data]);
  const allSelected = useMemo<boolean>(
    () => selected.size === ids.length,
    [ids, selected]
  );

  useEffect(() => {
    const searchDebounce = setTimeout(() => {
      setQueryParams((prev) => {
        if (prev) {
          const normalized = normalizeString(search);
          if (normalized !== prev.search) {
            return { ...prev, search: normalized };
          }
        }
        return prev;
      });
    }, 500);
    return () => clearTimeout(searchDebounce);
  }, [search]);

  useEffect(() => {
    if (selectAll) {
      setSelected(new Set(ids));
    }
  }, [selectAll, ids]);

  const resetSelected = () => {
    setSelected(new Set());
    setSelectMode(false);
  };

  const handleTitleBtnClick = () => {
    if (selectMode) {
      resetSelected();
    } else {
      router.back();
    }
  };

  const handleAction = () => {
    if (selectMode) {
      handleSelectAll();
    } else {
      handleAdd();
    }
  };

  const handleAdd = () => {
    router.push({
      pathname: "/dictionary/edit",
      params: { type: queryParams?.type },
    });
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
      setSelectAll(false);
    } else {
      setSelectAll(true);
    }
  };

  const handleItemSelect = (id: string, action: "add" | "delete") => {
    if (!selectMode) {
      setSelectMode(true);
    }
    setSelected((prev) => {
      prev[action](id);
      return prev;
    });
  };

  const handleItemEdit = (index: number) => {
    setItemIndex(index);
    router.push({
      pathname: "/dictionary/edit",
      params: { mode: "edit", type: queryParams?.type },
    });
  };

  const handleDelete = () => {
    try {
      deleteDictionaryItems(selected, queryParams?.type || "keywords");
      setData((prev) => prev.filter((item) => !selected.has(item.id)));
      resetSelected();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchClear = () => {
    setSearch("");
    setQueryParams((prev) => (prev ? { ...prev, search: "" } : prev));
  };

  const handleHasReachedEnd = () => {
    if (!loading && canGoNext && data.length >= page * 10) {
      console.log("has reached end");
      nextPage();
      setCanGoNext(false);
    }
  };

  return (
    <View className=" flex-1 ">
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
              {selectMode ? `${selected.size} Selected` : queryParams?.type}
            </ThemedText>
          </View>
          <Pressable onPress={handleAction} className="">
            {selectMode ? (
              <ThemedIcon
                source={icons.checkbox[allSelected ? "checked" : "unchecked"]}
                className=" w-[25px] h-[25px] "
              />
            ) : (
              <View className=" p-[10px] rounded-[50%] bg-black dark:bg-white ">
                <ThemedIcon
                  reverse
                  source={icons.add}
                  className=" w-[15px] h-[15px] "
                />
              </View>
            )}
          </Pressable>
        </View>
        <View>
          {selectMode ? (
            <View className=" p-[5px] ">
              <SelectAction
                type="delete"
                disabled={!selected.size}
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
                onChangeText={(text) => setSearch(text)}
                value={search}
                placeholder="Search"
                className=" flex-1 dark:color-white "
                placeholderTextColor={tintColors.divider}
              />
              {!!search.length && (
                <Pressable onPress={handleSearchClear}>
                  <ThemedIcon
                    source={icons.add}
                    className=" w-[15px] h-[15px] rotate-45 "
                  />
                </Pressable>
              )}
            </View>
          )}
        </View>
      </View>
      {!!data.length ? (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={data}
          renderItem={({ item, index }) => (
            <DictionaryItemComponent
              {...{
                index,
                item,
                selectMode,
                type: queryParams?.type || "keywords",
                selected: selected.has(item.id),
                handleItemEdit,
                handleItemSelect,
              }}
            />
          )}
          ListHeaderComponent={() => <View className=" p-[10px] "></View>}
          ItemSeparatorComponent={() => <View className=" p-[10px] "></View>}
          ListFooterComponent={() => (
            <View className=" p-[10px] flex-row items-center justify-center ">
              {loading && (
                <Progress.CircleSnail color={["#3b82f6", "#10b981"]} />
              )}
            </View>
          )}
          onEndReached={handleHasReachedEnd}
          onMomentumScrollBegin={() => setCanGoNext(true)}
        />
      ) : (
        <View className=" flex-1 flex-col justify-center items-center gap-2 ">
          <Image
            source={
              icons[
                queryParams && queryParams.type === "keywords"
                  ? "keyword"
                  : "dictionary"
              ]
            }
            className=" w-[40px] h-[40px] "
            tintColor={tintColors.divider}
          />
          <ThemedText>No {queryParams && queryParams.type}</ThemedText>
        </View>
      )}
    </View>
  );
};

export default DictionaryItems;
