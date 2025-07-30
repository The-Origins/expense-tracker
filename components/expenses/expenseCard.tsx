import { colorCycle, tintColors } from "@/constants/colorSettings";
import { Expense, ReceiptModal } from "@/constants/common";
import icons from "@/constants/icons";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, View } from "react-native";
import ThemedIcon from "../themedIcon";
import ThemedText from "../themedText";

const ExpenseCard = ({
  index,
  editMode = false,
  expense,
  selected,
  selectMode,
  sectionId,
  handleSelectItem,
  updateSelectedSections,
  setReceiptModal,
  handleEdit,
}: {
  index: number;
  editMode?: boolean;
  expense: Partial<Expense>;
  selected: Set<number>;
  selectMode: boolean;
  sectionId?: string;
  handleSelectItem: (index: number, action: "add" | "delete") => void;
  updateSelectedSections?: (sectionId: string, decrement: boolean) => void;
  setReceiptModal: React.Dispatch<React.SetStateAction<ReceiptModal>>;
  handleEdit: (index: number) => void;
}) => {
  const [picked, setPicked] = useState<boolean>(false);
  const [expand, setExpand] = useState<boolean>(false);
  const isPaper = useMemo(() => index % 4 === 3, [index]);
  const error = useMemo<boolean>(
    () => expense.collection === "failed",
    [expense]
  );

  useEffect(() => {
    const newSelected = selected.has(index);
    if (newSelected !== picked) {
      if (sectionId && updateSelectedSections) {
        updateSelectedSections(sectionId, picked === true);
      }
      setPicked(newSelected);
    }
  }, [selected, index, sectionId, updateSelectedSections]);

  const handleLongPress = () => {
    if (!picked) {
      handleSelectItem(index, "add");
    }
  };

  const handlePress = () => {
    if (selectMode) {
      handleSelectItem(index, picked ? "delete" : "add");
    } else {
      if (editMode) {
        onEdit();
      } else {
        setExpand((prev) => !prev);
      }
    }
  };

  const onEdit = () => {
    handleEdit(index);
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
      className={` flex-col p-[20px] rounded-[20px] gap-3 bg-${colorCycle[(index % 4) as keyof typeof colorCycle]} ${isPaper ? "dark:bg-paper-dark" : ""} `}
    >
      <View className=" flex-row justify-between items-start">
        <View className=" flex-row items-center gap-2 flex-1 ">
          {selectMode && (
            <ThemedIcon
              toggleOnDark={isPaper}
              source={icons.checkbox[picked ? "checked" : "unchecked"]}
              className=" w-[15px] h-[15px] "
            />
          )}
          {!editMode && (
            <ThemedText
              toggleOnDark={isPaper}
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
              toggleOnDark={isPaper}
              source={icons.edit}
              className=" w-[15px] h-[15px] "
            />
          </Pressable>
        ) : (
          <View className=" flex-1 flex-row justify-end ">
            <ThemedText
              toggleOnDark={isPaper}
              className=" text-right font-urbanistBold text-[1.2rem] "
            >
              -${expense.amount}
            </ThemedText>
          </View>
        )}
      </View>
      <View className=" flex-row justify-between gap-2 items-start">
        <ThemedText
          toggleOnDark={isPaper}
          className={` capitalize flex-1 flex-row items-center ${editMode ? " text-[1.2rem]" : expand ? " font-urbanistMedium text-[1.5rem]" : "text-divider"} `}
        >
          {editMode && (
            <ThemedText
              toggleOnDark={isPaper}
              className=" font-urbanistBold text-[0.9rem] "
            >
              Title:{" "}
            </ThemedText>
          )}
          {expense[expand || editMode ? "title" : "category"] || "N/A"}
        </ThemedText>
        <View className=" flex-1 flex-row items-center gap-1 justify-end ">
          {editMode && (
            <ThemedText
              toggleOnDark={isPaper}
              className=" font-urbanistBold text-[0.9rem] "
            >
              Category:
            </ThemedText>
          )}
          <ThemedText
            toggleOnDark={isPaper}
            className={` capitalize text-right ${editMode ? "text-[1.2rem]" : expand ? " font-urbanistMedium text-[1.5rem]" : "text-divider"} `}
          >
            {expense[expand || editMode ? "category" : "recipient"] || "N/A"}
          </ThemedText>
        </View>
      </View>
      {(expand || editMode) && (
        <>
          <View className=" flex-row justify-between gap-2 items-start">
            <ThemedText
              toggleOnDark={editMode && isPaper}
              className={`flex-1 flex-row gap-1 items-center capitalize ${editMode ? " text-[1.2rem] " : "text-divider"}  `}
            >
              {editMode && (
                <ThemedText
                  toggleOnDark={isPaper}
                  className=" font-urbanistBold text-[0.9rem] "
                >
                  Recipient:{" "}
                </ThemedText>
              )}
              {expense.recipient || "N/A"}
            </ThemedText>
            <View className=" flex-1 flex-row gap-1 items-center justify-end ">
              {editMode && (
                <ThemedText
                  toggleOnDark={isPaper}
                  className=" font-urbanistBold text-[0.9rem] "
                >
                  Amount:
                </ThemedText>
              )}
              <ThemedText
                toggleOnDark={editMode && isPaper}
                className={` text-right capitalize ${editMode ? " text-[1.2rem] " : "text-divider"} `}
              >
                {editMode
                  ? expense.amount || "N/A"
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
                toggleOnDark={isPaper}
                className=" capitalize flex-1 text-[1.2rem] "
              >
                <ThemedText
                  toggleOnDark={isPaper}
                  className=" font-urbanistBold text-[0.9rem] "
                >
                  Date:
                </ThemedText>{" "}
                {expense.date
                  ? dayjs(new Date(expense.date)).format("ddd DD MMM YYYY")
                  : "N/A"}
              </ThemedText>
              <View className=" flex-row gap-1 justify-end items-center flex-1 ">
                <ThemedText
                  toggleOnDark={isPaper}
                  className=" font-urbanistBold text-[0.9rem] "
                >
                  Time:
                </ThemedText>
                <ThemedText
                  toggleOnDark={isPaper}
                  className=" capitalize text-right text-[1.2rem] "
                >
                  {expense.date
                    ? dayjs(new Date(expense.date)).format("hh:mm A")
                    : "N/A"}
                </ThemedText>
              </View>
            </View>
          )}
          <View className=" flex-row justify-between items-center">
            <ThemedText
              toggleOnDark={isPaper}
              className={`  capitalize flex-1 flex-row gap-1 ${editMode ? " text-[1.2rem] " : "text-[1.5rem] font-urbanistBold"} `}
            >
              {editMode && (
                <ThemedText
                  toggleOnDark={isPaper}
                  className=" font-urbanistBold text-[0.9rem] "
                >
                  Ref:{" "}
                </ThemedText>
              )}
              {expense[editMode ? "ref" : "amount"] || "N/A"}
            </ThemedText>
            <Pressable
              onPress={handleViewReceipt}
              className=" pt-[5px] pb-[5px] pr-[10px] pl-[10px] rounded-[10px] bg-black "
            >
              <ThemedText toggleOnDark={isPaper} className=" text-white ">
                View Reciept
              </ThemedText>
            </Pressable>
          </View>
        </>
      )}
    </Pressable>
  );
};

export default ExpenseCard;
