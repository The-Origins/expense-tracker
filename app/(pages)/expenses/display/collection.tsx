import ExpenseCard from "@/components/expenses/expenseCard";
import ExpenseSectionHeader from "@/components/expenses/sectionHeader";
import SelectActions from "@/components/expenses/selectActions";
import ViewRecieptModal from "@/components/expenses/viewRecieptModal";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { tintColors } from "@/constants/colorSettings";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import { normalizeString } from "@/lib/appUtils";
import { groupExpenseSections } from "@/lib/expenseUtils";
import { Expense, QueryParameters, ReceiptModal } from "@/types/common";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Image, Pressable, SectionList, TextInput, View } from "react-native";
import * as Progress from "react-native-progress";

const Collection = () => {
  const {
    page,
    loading,
    expenses,
    collectionSelected,
    setCollectionSelected,
    queryParameters,
    setQueryParameters,
    setExpenseIndex,
    nextPage,
  } = useAppProps() as {
    page: number;
    loading: boolean;
    expenses: (Partial<Expense> | undefined)[];
    collectionSelected: Set<number>;
    setCollectionSelected: React.Dispatch<React.SetStateAction<Set<number>>>;
    queryParameters: QueryParameters | null;
    setQueryParameters: React.Dispatch<
      React.SetStateAction<QueryParameters | null>
    >;
    setExpenseIndex: React.Dispatch<React.SetStateAction<number>>;
    nextPage: () => Promise<void>;
  };

  const collection = useMemo<string>(
    () => queryParameters?.collection || "",
    [queryParameters]
  );

  const [expenseIndicies, setExpenseIndicies] = useState<number[]>([]);
  const sections = useMemo<{ id: string; data: number[] }[]>(() => {
    const data = groupExpenseSections(expenses);
    setExpenseIndicies(data.indices);
    return data.groups;
  }, [expenses]);

  const [selectedSections, setSelectedSections] = useState<Map<string, number>>(
    new Map()
  );

  const [selectMode, setSelectMode] = useState<boolean>(false);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [canGoNext, setCanGoNext] = useState<boolean>(false);

  const allSelected = useMemo<boolean>(
    () => collectionSelected.size === expenseIndicies.length,
    [collectionSelected, expenseIndicies]
  );

  const [search, setSearch] = useState<string>("");

  const [receiptModal, setReceiptModal] = useState<ReceiptModal>({
    open: false,
    receipt: "",
    image: "",
  });

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      const normalized = normalizeString(search);
      setQueryParameters((prev) => {
        if (prev && prev.search !== normalized) {
          return {
            ...prev,
            search: normalized,
          };
        }
        return prev;
      });
    }, 500);
    return () => clearTimeout(searchTimeout);
  }, [search]);

  useEffect(() => {
    setCollectionSelected(new Set());
  }, []);

  useEffect(() => {
    if (selectAll) {
      setCollectionSelected(new Set(expenseIndicies));
      setSelectedSections(
        new Map(sections.map(({ id, data }) => [id, data.length]))
      );
    }
  }, [expenseIndicies, selectAll]);

  const handleHasReachedEnd = () => {
    console.log(expenses.length, page);
    if (!loading && canGoNext && expenses.length >= page * 10) {
      console.log("has reached end");
      setCanGoNext(false);
      nextPage();
    }
  };

  const resetSelected = () => {
    setCollectionSelected(new Set());
    setSelectedSections(new Map());
    setSelectAll(false);
  };

  const handleTitleBtnClick = () => {
    if (selectMode) {
      resetSelected();
      setSelectMode(false);
    } else {
      router.back();
    }
  };

  const handleSelectAll = () => {
    if (selectMode) {
      if (allSelected) {
        resetSelected();
      } else {
        setSelectAll(true);
      }
    } else {
      setSelectMode(true);
    }
  };

  const handleSearchClear = () => {
    setSearch("");
    setQueryParameters((prev) => ({ ...prev, search: "" }));
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleReceiptModalClose = () => {
    setReceiptModal({ open: false, receipt: "", image: "" });
  };

  const handleSectionSelect = useCallback(
    (section: { id: string; data: number[] }, selectAll: boolean) => {
      if (!selectMode) {
        setSelectMode(true);
      }
      setSelectedSections((prev) => {
        const newMap = new Map(prev);
        newMap.set(section.id, selectAll ? section.data.length : 0);
        return newMap;
      });
      setCollectionSelected((prev) => {
        const newSet = new Set(prev);
        for (let item of section.data) {
          if (selectAll) {
            newSet.add(item);
          } else {
            newSet.delete(item);
          }
        }
        return newSet;
      });
    },
    [selectMode]
  );

  const handleSelectItem = useCallback(
    (index: number, action: "add" | "delete", sectionId?: string) => {
      if (sectionId) {
        if (!selectMode) {
          setSelectMode(true);
        }
        setSelectedSections((prev) => {
          const newMap = new Map(prev);
          let count = newMap.get(sectionId) || 0;
          if (action === "delete") {
            count -= 1;
          } else {
            count += 1;
          }
          newMap.set(sectionId, count);
          return newMap;
        });
        setCollectionSelected((prev) => {
          const newSet = new Set(prev);
          newSet[action](index);
          return newSet;
        });
      }
    },
    [selectMode]
  );

  const handleItemEdit = useCallback((index: number) => {
    setExpenseIndex(index);
    router.push({
      pathname: "/expenses/edit/expense",
      params: { mode: "edit" },
    });
  }, []);

  return (
    <>
      <View className=" flex-1 ">
        <View className=" pt-[10px] pb-[20px] flex-col gap-[20px] ">
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
                  ? `${collectionSelected.size} Selected`
                  : collection}
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
              <SelectActions
                {...{
                  collection: collection as string,
                  selected: collectionSelected,
                  setSelectMode,
                  resetSelected,
                }}
              />
            ) : (
              <View className=" flex-row items-center pl-[10px] pr-[10px] bg-paper-light rounded-[20px] dark:bg-paper-dark ">
                <Image
                  source={icons.search}
                  className=" w-[15px] h-[15px] "
                  tintColor={"#808080"}
                />
                <TextInput
                  onChangeText={handleSearchChange}
                  value={search}
                  placeholder="Search"
                  className=" flex-1 dark:color-white "
                  placeholderTextColor={tintColors.divider}
                />
                {search.length ? (
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
        {sections.length ? (
          <SectionList
            sections={sections}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, section }) =>
              !!expenses[item] ? (
                <ExpenseCard
                  {...{
                    index: item,
                    editMode: collection === "failed",
                    sectionId: section.id,
                    expense: expenses[item],
                    selected: collectionSelected.has(item),
                    selectMode,
                    setReceiptModal,
                    handleSelectItem,
                    handleItemEdit,
                  }}
                />
              ) : (
                <></>
              )
            }
            keyExtractor={(item, index) => `${item}-${index}`}
            SectionSeparatorComponent={() => (
              <View className=" p-[10px] "></View>
            )}
            ItemSeparatorComponent={() => <View className=" p-[10px] "></View>}
            renderSectionHeader={({ section }) => (
              <ExpenseSectionHeader
                {...{
                  section,
                  selectMode,
                  selected:
                    selectedSections.get(section.id) === section.data.length,
                  handleSectionSelect,
                }}
              />
            )}
            renderSectionFooter={({ section }) => (
              <View className=" p-[20px] " />
            )}
            ListFooterComponent={() => (
              <View className=" flex-row items-center justify-center ">
                {loading && (
                  <Progress.CircleSnail color={["#3b82f6", "#10b981"]} />
                )}
              </View>
            )}
            onEndReached={handleHasReachedEnd}
            onMomentumScrollBegin={() => setCanGoNext(true)}
          />
        ) : (
          <View className=" flex-1 flex-col gap-[10px] justify-center items-center ">
            {loading ? (
              <Progress.CircleSnail color={["#3b82f6", "#10b981"]} />
            ) : (
              <>
                <Image
                  source={icons.money}
                  className=" w-[50px] h-[50px] "
                  tintColor={tintColors.divider}
                />
                <ThemedText className=" text-[1.5rem] ">No Expenses</ThemedText>
              </>
            )}
          </View>
        )}
      </View>
      <ViewRecieptModal
        {...receiptModal}
        handleClose={handleReceiptModalClose}
      />
    </>
  );
};

export default Collection;
