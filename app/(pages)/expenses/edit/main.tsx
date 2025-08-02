import ExpenseCard from "@/components/expenses/expenseCard";
import EditExpensesFilter from "@/components/expenses/filter";
import SelectAction from "@/components/expenses/selectAction";
import ViewRecieptModal from "@/components/expenses/viewRecieptModal";
import StatusModal from "@/components/statusModal";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { tintColors } from "@/constants/colorSettings";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import { Expense, ExpensesFilter, ReceiptModal, Status } from "@/types/common";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, View } from "react-native";

const EditExpenses = () => {
  const {
    edited,
    collectionSelected,
    editSelected,
    setEditSelected,
    expenses,
    setExpenseIndex,
    handleDelete,
  } = useAppProps() as {
    edited: Set<number>;
    collectionSelected: Set<number>;
    editSelected: Set<number>;
    setEditSelected: React.Dispatch<React.SetStateAction<Set<number>>>;
    expenses: (Partial<Expense> | undefined)[];
    setExpenseIndex: React.Dispatch<React.SetStateAction<number>>;
    handleDelete: (mode: "collection" | "edited") => Promise<void>;
  };

  const [status, setStatus] = useState<Status>({
    open: false,
    type: "info",
    handleClose() {},
    action: { callback() {} },
  });

  const [receiptModal, setReceiptModal] = useState<ReceiptModal>({
    open: false,
    receipt: "",
    image: "",
  });

  const [selectMode, setSelectMode] = useState<boolean>(false);
  const [filter, setFilter] = useState<ExpensesFilter>("All");
  const allIndices = useMemo<number[]>(
    () => [...collectionSelected],
    [collectionSelected]
  );
  const uneditedIndices = useMemo<number[]>(() => {
    let data: number[] = [];
    for (let index of allIndices) {
      if (!edited.has(index)) {
        data.push(index);
      }
    }
    return data;
  }, [allIndices, edited]);

  const failedIndices = useMemo<number[]>(() => {
    let data: number[] = [];
    for (let index of allIndices) {
      if (expenses[index] && expenses[index].collection === "failed") {
        data.push(index);
      }
    }
    return data;
  }, [allIndices]);

  const filteredIndices = useMemo<number[]>(() => {
    switch (filter) {
      case "Errors":
        return failedIndices;
      case "un-edited":
        return uneditedIndices;
      default:
        return allIndices;
    }
  }, [filter, allIndices, uneditedIndices, failedIndices]);

  useEffect(() => {
    setEditSelected(new Set());
  }, []);

  const handleSelectItem = (index: number, action: "add" | "delete") => {
    if (!selectMode) {
      setSelectMode(true);
    }
    setEditSelected((prev: Set<number>) => {
      const newSet = new Set(prev);
      newSet[action](index);
      return newSet;
    });
  };

  const onDelete = () => {
    setStatus({
      open: true,
      type: "warning",
      title: "Delete selected expenses?",
      message: "Deleted expenses can be found in trash",
      handleClose: handleStatusClose,
      action: {
        title: "Delete",
        async callback() {
          setStatus({
            open: true,
            type: "loading",
            title: "Deleting",
            message: "Deleting selected expenses",
            handleClose: handleStatusClose,
            action: {
              callback() {},
            },
          });
          try {
            await handleDelete("edited");
            handleStatusClose();
            setSelectMode(false);
          } catch (error) {
            console.log(error);
            setStatus({
              open: true,
              type: "error",
              title: "Error",
              message: "An Error Occured while deleting expenses",
              handleClose: handleStatusClose,
              action: {
                callback: handleStatusClose,
              },
            });
          }
        },
      },
    });
  };

  const handleStatusClose = () => {
    setStatus({
      open: false,
      type: "info",
      handleClose() {},
      action: { callback() {} },
    });
  };

  const handleReceiptModalClose = () => {
    setReceiptModal({ open: false, receipt: "", image: "" });
  };

  const handleItemEdit = (index: number) => {
    setExpenseIndex(index);
    router.push({
      pathname: "/expenses/edit/expense",
      params: { mode: "edit" },
    });
  };

  const handleTitleBtnClick = () => {
    if (selectMode) {
      setEditSelected(new Set());
      setSelectMode(false);
    } else {
      router.back();
    }
  };

  const handleDone = () => {
    if (selectMode) {
      if (editSelected.size === filteredIndices.length) {
        setEditSelected(new Set());
      } else {
        setEditSelected(new Set(allIndices));
      }
    } else {
      router.back();
    }
  };

  return (
    <>
      <View className=" flex-1 flex-col ">
        <View className=" flex-col gap-[10px] pt-[10px] pb-[10px] ">
          <View className=" flex-row items-center justify-between ">
            <View className=" flex-row items-center ">
              <Pressable
                onPress={handleTitleBtnClick}
                className=" w-[40px] h-[40px] flex-row items-center "
              >
                <ThemedIcon
                  source={icons[selectMode ? "add" : "arrow"]}
                  className={` w-[20px] h-[20px] ${selectMode ? "rotate-45" : "rotate-180"} `}
                />
              </Pressable>
              <ThemedText className=" font-urbanistBold text-[2rem] ">
                {selectMode ? `${editSelected.size} Selected` : "Edit"}
              </ThemedText>
            </View>
            <Pressable
              onPress={handleDone}
              className={
                selectMode
                  ? ""
                  : " p-[20px] pt-[10px] pb-[10px] bg-black rounded-[20px] dark:bg-white "
              }
            >
              {selectMode ? (
                <ThemedIcon
                  source={
                    icons.checkbox[
                      editSelected.size === filteredIndices.length
                        ? "checked"
                        : "unchecked"
                    ]
                  }
                  className=" w-[25px] h-[25px]"
                />
              ) : (
                <ThemedText reverse>Done</ThemedText>
              )}
            </Pressable>
          </View>
          {selectMode ? (
            <View className=" flex-row ">
              <SelectAction
                type="delete"
                handlePress={onDelete}
                disabled={!editSelected.size}
              />
            </View>
          ) : (
            <View className=" flex-row items-center gap-2 ">
              {(!!failedIndices.length ||
                uneditedIndices.length !== allIndices.length) && (
                <EditExpensesFilter
                  type="All"
                  filter={filter}
                  count={allIndices.length}
                  setFilter={setFilter}
                />
              )}
              {uneditedIndices.length !== allIndices.length && (
                <EditExpensesFilter
                  type="un-edited"
                  filter={filter}
                  count={uneditedIndices.length}
                  setFilter={setFilter}
                />
              )}
              {!!failedIndices.length && (
                <EditExpensesFilter
                  type="Errors"
                  filter={filter}
                  count={failedIndices.length}
                  setFilter={setFilter}
                />
              )}
            </View>
          )}
        </View>
        {filteredIndices.length ? (
          <FlatList
            data={filteredIndices}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              return !!expenses[item] ? (
                <ExpenseCard
                  {...{
                    index: item,
                    expense: expenses[item],
                    editMode: true,
                    selected: editSelected,
                    selectMode,
                    handleSelectItem,
                    setReceiptModal,
                    handleItemEdit,
                  }}
                />
              ) : (
                <></>
              );
            }}
            ItemSeparatorComponent={() => <View className=" p-[10px] "></View>}
            ListHeaderComponent={() => <View className=" p-[10px] "></View>}
            ListFooterComponent={() => <View className=" p-[10px] "></View>}
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
      <StatusModal status={status} />
      <ViewRecieptModal
        {...receiptModal}
        handleClose={handleReceiptModalClose}
      />
    </>
  );
};

export default EditExpenses;
