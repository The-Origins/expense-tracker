import ExpenseCard from "@/components/expenses/expenseCard";
import ExpenseSectionHeader from "@/components/expenses/sectionHeader";
import SelectActions from "@/components/expenses/selectActions";
import ViewRecieptModal from "@/components/expenses/viewRecieptModal";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { tintColors } from "@/constants/colorSettings";
import { QueryParameters, ReceiptModal } from "@/constants/common";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import { useThemeContext } from "@/context/themeContext";
import { normalizeString } from "@/lib/appUtils";
import { groupExpenseSections } from "@/lib/expenseUtils";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, SectionList, TextInput, View } from "react-native";
import * as Progress from "react-native-progress";

const Collection = () => {
  const router = useRouter();
  const { theme } = useThemeContext();

  let {
    loading,
    expenses,
    collectionSelected,
    setCollectionSelected,
    queryParameters,
    setQueryParameters,
    setExpenseIndex,
  } = useAppProps();

  const collection = useMemo<string>(
    () => queryParameters?.collection || "",
    [queryParameters]
  );
  const [expenseIndicies, setExpenseIndicies] = useState<number[]>([]);
  const sections = useMemo<{ id: string; data: number[] }[]>(() => {
    const data = groupExpenseSections(expenses);
    setExpenseIndicies(data.indicies);
    return data.groups;
  }, [expenses]);

  const [selectedSections, setSelectedSections] = useState<
    Record<string, number>
  >({});

  const [selectMode, setSelectMode] = useState<boolean>(false);
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
      setQueryParameters((prev: QueryParameters | null) => {
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
    setSelectMode(false);
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
      } else {
        setCollectionSelected(new Set(expenseIndicies));
      }
    } else {
      setSelectMode(true);
    }
  };

  const handleSearchClear = () => {
    setSearch("");
    setQueryParameters((prev: QueryParameters) => ({ ...prev, search: "" }));
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const handleReceiptModalClose = () => {
    setReceiptModal({ open: false, receipt: "", image: "" });
  };

  const handleSelectItem = (index: number, action: "add" | "delete") => {
    if (!selectMode) {
      setSelectMode(true);
    }
    setCollectionSelected((prev: Set<number>) => {
      const newSet = new Set(prev);
      newSet[action](index);
      return newSet;
    });
  };

  const handleItemEdit = (index: number) => {
    setExpenseIndex(index);
    router.navigate({
      pathname: "/expenses/edit/expense",
      params: { mode: "edit" },
    });
  };

  const updateSelectedSections = (
    sectionId: string,
    decrement: boolean = false
  ) => {
    setSelectedSections((prev) => ({
      ...prev,
      [sectionId]: decrement
        ? (prev[sectionId] || 0) - 1
        : (prev[sectionId] || 0) + 1,
    }));
  };

  const handleSelectSection = (
    section: { id: string; data: number[] },
    action: "add" | "delete"
  ) => {
    if (!selectMode) {
      setSelectMode(true);
    }
    setCollectionSelected((prev: Set<number>) => {
      const newSet = new Set(prev);
      for (let index of section.data) {
        newSet[action](index);
      }
      return newSet;
    });
  };

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
                  className=" flex-1 "
                  placeholderTextColor={
                    theme === "dark" ? tintColors.light : undefined
                  }
                  style={{
                    color:
                      theme === "dark" ? tintColors.light : tintColors.dark,
                  }}
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
                    selected: collectionSelected,
                    selectMode,
                    setReceiptModal,
                    handleSelectItem,
                    updateSelectedSections,
                    handleEdit: handleItemEdit,
                  }}
                />
              ) : (
                <></>
              )
            }
            SectionSeparatorComponent={() => (
              <View className=" p-[10px] "></View>
            )}
            ItemSeparatorComponent={() => <View className=" p-[10px] "></View>}
            renderSectionHeader={({ section }) => (
              <ExpenseSectionHeader
                {...{
                  section,
                  selectMode,
                  selectedSections,
                  handleSelectSection,
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
