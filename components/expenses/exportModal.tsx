import icons from "@/constants/icons";
import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import ThemedIcon from "../themedIcon";
import ThemedText from "../themedText";

const options = [
  "Titles",
  "Categories",
  "Recipients",
  "Amounts",
  "Reference IDs",
  "Receipts",
  "Images",
];

const ExportModal = ({
  open,
  handleClose,
  handleSubmit,
}: {
  open: boolean;
  handleClose: () => void;
  handleSubmit: (properties: Set<string>, format: string) => void;
}) => {
  const [format, setFormat] = useState<string>("csv");
  const [selection, setSelection] = useState<Set<string>>(new Set(options));
  const allSelected = useMemo(
    () => selection.size === options.length,
    [selection, options]
  );

  const handleSelect = (option: string) => {
    setSelection((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(option)) {
        newSet.delete(option);
      } else {
        newSet.add(option);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelection(new Set());
    } else {
      setSelection(new Set(options));
    }
  };

  const onSubmit = () => {
    handleSubmit(selection, format);
    handleClose();
  };

  return (
    <Modal
      animationType="fade"
      visible={open}
      transparent={true}
      onRequestClose={handleClose}
    >
      <Pressable
        onPress={handleClose}
        className=" flex-1 bg-black/50 flex-row justify-center items-center "
      >
        <Pressable
          onPress={() => {}}
          className=" w-[90vw] max-w-[600px] h-[60vh] max-h-[1000px] p-[20px] bg-white rounded-[20px] dark:bg-paper-dark "
        >
          <View className=" flex-row items-center justify-between pb-[5px]  ">
            <ThemedText className=" font-urbanistMedium text-[1.5rem] ">
              Choose What To Export
            </ThemedText>
            <Pressable onPress={handleClose}>
              <ThemedIcon
                source={icons.add}
                className=" w-[20px] h-[20px] rotate-45 "
              />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className=" flex-1 flex-col gap-[20px] pt-[10px] pb-[20px] ">
              <View className={" flex-col"}>
                <Pressable
                  onPress={handleSelectAll}
                  className={" pt-[5px] pb-[5px] flex-row items-center gap-2 "}
                >
                  <ThemedIcon
                    source={
                      icons.checkbox[allSelected ? "checked" : "unchecked"]
                    }
                    className=" w-[20px] h-[20px] "
                  />
                  <ThemedText className=" font-urbanistMedium text-[1.2rem] ">
                    All
                  </ThemedText>
                </Pressable>
                {options.map((option, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleSelect(option)}
                    className={
                      " ml-[25px] pt-[5px] pb-[5px] flex-row items-center gap-2 "
                    }
                  >
                    <ThemedIcon
                      source={
                        icons.checkbox[
                          selection.has(option) ? "checked" : "unchecked"
                        ]
                      }
                      className=" w-[20px] h-[20px] "
                    />
                    <ThemedText className=" capitalize text-[1.1rem] ">
                      {option}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>

              <ThemedText className=" text-[1.2rem] font-urbanistMedium ">
                Format
              </ThemedText>
              <View className={" flex-row gap-[20px] "}>
                <Pressable
                  onPress={() => setFormat("csv")}
                  className={" flex-row items-center gap-2 "}
                >
                  <ThemedIcon
                    source={
                      icons.checkbox[format === "csv" ? "checked" : "unchecked"]
                    }
                    className=" w-[20px] h-[20px] "
                  />
                  <ThemedText className=" font-urbanistMedium ">CSV</ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => setFormat("excel")}
                  className={" flex-row items-center gap-2 "}
                >
                  <ThemedIcon
                    source={
                      icons.checkbox[
                        format === "excel" ? "checked" : "unchecked"
                      ]
                    }
                    className=" w-[20px] h-[20px] "
                  />
                  <ThemedText className=" font-urbanistMedium ">EXCEL</ThemedText>
                </Pressable>
              </View>
            </View>
          </ScrollView>
          <View className={" flex-row justify-between gap-1 pt-[5px] "}>
            <Pressable
              onPress={handleClose}
              className=" p-[10px] pt-[5px] pb-[5px] border border-black rounded-[20px] dark:border-white "
            >
              <ThemedText>Cancel</ThemedText>
            </Pressable>
            <Pressable
              disabled={!selection.size}
              onPress={onSubmit}
              className={` p-[20px] pt-[5px] pb-[5px] rounded-[20px] ${selection.size ? "bg-black dark:bg-white" : "bg-divider"} `}
            >
              <ThemedText reverse className=" text-white ">
                Export
              </ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ExportModal;
