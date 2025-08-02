import { colorCycle, tintColors } from "@/constants/colorSettings";
import icons from "@/constants/icons";
import { formatAmount } from "@/lib/appUtils";
import { Expense, ReceiptModal } from "@/types/common";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { Image, Pressable, View } from "react-native";
import ThemedIcon from "../themedIcon";
import ThemedText from "../themedText";

const ExpenseCard = React.memo(
  ({
    index,
    editMode = false,
    expense,
    selected,
    selectMode,
    sectionId,
    handleSelectItem,
    setReceiptModal,
    handleItemEdit,
  }: {
    index: number;
    editMode?: boolean;
    expense: Partial<Expense>;
    selected: Set<number> | undefined;
    selectMode: boolean;
    sectionId?: string;
    handleSelectItem: (
      index: number,
      action: "add" | "delete",
      sectionId?: string
    ) => void;
    handleItemEdit: (index: number) => void;
    setReceiptModal: React.Dispatch<React.SetStateAction<ReceiptModal>>;
  }) => {
    const picked = useMemo(() => !!selected?.has(index), [selected]);
    const [expand, setExpand] = useState<boolean>(false);
    const error = useMemo<boolean>(
      () => expense.collection === "failed",
      [expense]
    );

    const handleLongPress = () => {
      if (!picked) {
        handleSelectItem(index, "add", sectionId);
      }
    };

    const handlePress = () => {
      if (selectMode) {
        handleSelectItem(index, picked ? "delete" : "add", sectionId);
      } else {
        if (editMode) {
          onEdit();
        } else {
          setExpand((prev) => !prev);
        }
      }
    };

    const onEdit = () => {
      handleItemEdit(index);
    };

    const handleViewReceipt = () => {
      setReceiptModal({
        open: true,
        receipt: expense.receipt || "",
        image: expense.image || "",
      });
    };

    return (
      <Pressable
        onLongPress={handleLongPress}
        onPress={handlePress}
        className={` flex-col p-[20px] rounded-[20px] gap-3 bg-${colorCycle[index % 3]} `}
      >
        <View className=" flex-row justify-between items-start">
          <View className=" flex-row items-center gap-2 flex-1 ">
            {selectMode && (
              <ThemedIcon
                toggleOnDark={false}
                source={icons.checkbox[picked ? "checked" : "unchecked"]}
                className=" w-[15px] h-[15px] "
              />
            )}
            {!editMode && (
              <ThemedText
                toggleOnDark={false}
                className={` capitalize ${expand ? " text-divider " : " font-urbanistMedium text-[1.2rem]"} `}
              >
                {expense[expand ? "ref" : "title"]}
              </ThemedText>
            )}
          </View>
          {editMode ? (
            error && (
              <Image
                source={icons.error}
                className=" w-[15px] h-[15px] "
                tintColor={tintColors.error}
              />
            )
          ) : expand ? (
            <Pressable onPress={onEdit} className=" pr-[10px] pl-[10px] ">
              <ThemedIcon
                toggleOnDark={false}
                source={icons.edit}
                className=" w-[15px] h-[15px] "
              />
            </Pressable>
          ) : (
            <View className=" flex-1 flex-row justify-end ">
              <ThemedText
                toggleOnDark={false}
                className=" text-right font-urbanistBold text-[1.2rem] "
              >
                -{expense.currency + " "}
                {expense.amount
                  ? formatAmount(expense.amount, 10000)
                  : "amount: missing"}
              </ThemedText>
            </View>
          )}
        </View>
        <View className=" flex-row justify-between gap-2 items-start">
          <ThemedText
            toggleOnDark={false}
            className={` capitalize flex-1 flex-row items-center ${editMode ? ` text-[1.2rem] ${!expense.title ? "text-error" : ""}` : expand ? " font-urbanistMedium text-[1.5rem]" : "text-divider"} `}
          >
            {editMode && (
              <ThemedText
                toggleOnDark={false}
                className=" font-urbanistBold text-[0.9rem] "
              >
                Title:{" "}
              </ThemedText>
            )}
            {expense[expand || editMode ? "title" : "category"] || "missing"}
          </ThemedText>
          <View className=" flex-1 flex-row items-center gap-1 justify-end ">
            {editMode && (
              <ThemedText
                toggleOnDark={false}
                className=" font-urbanistBold text-[0.9rem] "
              >
                Category:
              </ThemedText>
            )}
            <ThemedText
              toggleOnDark={false}
              className={` capitalize text-right ${editMode ? ` text-[1.2rem] ${!expense.category ? "text-error" : ""}` : expand ? " font-urbanistMedium text-[1.5rem]" : "text-divider"} `}
            >
              {expense[expand || editMode ? "category" : "recipient"] ||
                "missing"}
            </ThemedText>
          </View>
        </View>
        {(expand || editMode) && (
          <>
            <View className=" flex-row justify-between gap-2 items-start">
              <ThemedText
                toggleOnDark={false}
                className={`flex-1 flex-row gap-1 items-center capitalize ${editMode ? ` text-[1.2rem] ${!expense.receipt ? "text-error" : ""}` : "text-divider"}  `}
              >
                {editMode && (
                  <ThemedText
                    toggleOnDark={false}
                    className=" font-urbanistBold text-[0.9rem] "
                  >
                    Recipient:{" "}
                  </ThemedText>
                )}
                {expense.recipient || "missing"}
              </ThemedText>
              <View className=" flex-1 flex-row gap-1 items-center justify-end ">
                {editMode && (
                  <ThemedText
                    toggleOnDark={false}
                    className=" font-urbanistBold text-[0.9rem] "
                  >
                    Amount:
                  </ThemedText>
                )}
                <ThemedText
                  toggleOnDark={false}
                  className={` text-right capitalize ${editMode ? ` text-[1.2rem] ${!expense.amount ? "text-error" : ""}` : "text-divider"} `}
                >
                  {editMode
                    ? expense.amount
                      ? `${expense.currency} ` +
                        formatAmount(expense.amount, 10000)
                      : "missing"
                    : expense.date
                      ? dayjs(new Date(expense.date)).format(
                          "dd DD MMM YYYY, hh:MM A"
                        )
                      : ""}
                </ThemedText>
              </View>
            </View>
            {editMode && (
              <View className=" flex-row justify-between items-start gap-2 ">
                <ThemedText
                  toggleOnDark={false}
                  className={` capitalize flex-1 text-[1.2rem] ${!expense.date ? "text-error" : ""} `}
                >
                  <ThemedText
                    toggleOnDark={false}
                    className=" font-urbanistBold text-[0.9rem] "
                  >
                    Date:
                  </ThemedText>{" "}
                  {expense.date
                    ? dayjs(new Date(expense.date)).format("ddd DD MMM YYYY")
                    : "missing"}
                </ThemedText>
                <View className=" flex-row gap-1 justify-end items-center flex-1 ">
                  <ThemedText
                    toggleOnDark={false}
                    className={` font-urbanistBold text-[0.9rem] ${!expense.date ? "text-error" : ""} `}
                  >
                    Time:
                  </ThemedText>
                  <ThemedText
                    toggleOnDark={false}
                    className={` capitalize text-[1.2rem] ${!expense.date ? "text-error" : ""} `}
                  >
                    {expense.date
                      ? dayjs(new Date(expense.date)).format("hh:mm A")
                      : "missing"}
                  </ThemedText>
                </View>
              </View>
            )}
            <View className=" flex-row justify-between items-center">
              <ThemedText
                toggleOnDark={false}
                className={`  capitalize flex-1 flex-row gap-1 ${editMode ? ` text-[1.2rem] ` : "text-[1.5rem] font-urbanistBold"} `}
              >
                {editMode && (
                  <ThemedText
                    toggleOnDark={false}
                    className=" font-urbanistBold text-[0.9rem] "
                  >
                    Ref:{" "}
                  </ThemedText>
                )}
                {editMode
                  ? expense.ref
                  : expense.amount
                    ? `${expense.currency} ` +
                      formatAmount(expense.amount, 10000)
                    : ""}
              </ThemedText>
              <Pressable
                onPress={handleViewReceipt}
                className=" pt-[5px] pb-[5px] pr-[10px] pl-[10px] rounded-[10px] bg-black "
              >
                <ThemedText toggleOnDark={false} className=" text-white ">
                  View Reciept
                </ThemedText>
              </Pressable>
            </View>
          </>
        )}
      </Pressable>
    );
  }
);

export default ExpenseCard;
