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
    loading,
    expenses,
    collectionSelected,
    setCollectionSelected,
    queryParameters,
    setQueryParameters,
    setExpenseIndex,
  } = useAppProps() as {
    loading: boolean;
    expenses: (Partial<Expense> | undefined)[];
    collectionSelected: Set<number>;
    setCollectionSelected: React.Dispatch<React.SetStateAction<Set<number>>>;
    queryParameters: QueryParameters | null;
    setQueryParameters: React.Dispatch<
      React.SetStateAction<QueryParameters | null>
    >;
    setExpenseIndex: React.Dispatch<React.SetStateAction<number>>;
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

  const [selected, setSelected] = useState<Map<string, Set<number>>>(new Map());

  const [selectMode, setSelectMode] = useState<boolean>(false);
  const [selectAll, setSelectAll] = useState<boolean | null>(null);

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

  const resetSelected = () => {
    setCollectionSelected(new Set());
    setSelected(new Map());
    setSelectMode(false);
    setSelectAll(null);
  };

  const handleTitleBtnClick = () => {
    if (selectMode) {
      resetSelected();
    } else {
      router.back();
    }
  };

  const handleSelectAll = () => {
    if (selectMode) {
      if (allSelected) {
        setCollectionSelected(new Set());
        setSelectAll(false);
      } else {
        setCollectionSelected(new Set(expenseIndicies));
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
      setSelected((prev) => {
        prev.set(section.id, new Set(selectAll ? section.data : undefined));
        return prev;
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
        setSelected((prev) => {
          const newSet = new Set(prev.get(sectionId));
          newSet[action](index);
          prev.set(sectionId, newSet);
          return prev;
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
        {loading ? (
          <View className=" flex-1 flex-row justify-center items-center ">
            <Progress.CircleSnail color={["#3b82f6", "#10b981"]} />
          </View>
        ) : sections.length ? (
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
                    selected: selected.get(section.id),
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
                  selectAll,
                  selected: selected.get(section.id),
                  handleSectionSelect,
                }}
              />
            )}
            renderSectionFooter={({ section }) => (
              <View className=" p-[20px] " />
            )}
          />
        ) : (
          <View className=" flex-1 flex-col gap-[10px] justify-center items-center ">
            <Image
              source={icons.money}
              className=" w-[50px] h-[50px] "
              tintColor={tintColors.divider}
            />
            <ThemedText className=" text-[1.5rem] ">No Expenses</ThemedText>
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
