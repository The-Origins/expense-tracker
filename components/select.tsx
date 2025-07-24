import icons from "@/constants/icons";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import ThemedIcon from "./themedIcon";
import ThemedText from "./themedText";

const Select = ({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (option: string) => void;
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handlePress = (option: string) => {
    onChange(option);
    handleClose();
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        className=" flex-row justify-between relative p-[10px] rounded-[10px] border border-black dark:border-white "
      >
        <ThemedText className=" capitalize ">{value}</ThemedText>
        <ThemedIcon source={icons.chevron} className={`w-[15px] h-[15px]`} />
      </Pressable>
      <Modal
        animationType="fade"
        transparent={true}
        visible={open}
        onRequestClose={handleClose}
      >
        <Pressable
          onPress={handleClose}
          className=" flex-1 bg-black/50 flex-row justify-center items-center "
        >
          <Pressable
            onPress={() => {}}
            className=" w-[90vw] max-w-[600px] h-[fit-content] max-h-[70vh] p-[20px] bg-white rounded-[20px] dark:bg-paper-dark "
          >
            <View className=" flex-row justify-between pb-[5px]  ">
              <ThemedText className=" font-urbanistMedium  text-[1.5rem]">
                Choose option
              </ThemedText>
              <Pressable onPress={handleClose}>
                <ThemedIcon
                  source={icons.add}
                  className=" w-[20px] h-[20px] rotate-45 "
                />
              </Pressable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className=" flex-col gap-[20px] pt-[20px] pb-[20px] ">
                {options.map((option, index) => (
                  <Pressable
                    onPress={() => handlePress(option)}
                    key={index}
                    className={` p-[20px] pt-[10px] pb-[10px] rounded-[20px] flex-row gap-2 ${value === option ? "border dark:border-white" : " border border-divider"} `}
                  >
                    <ThemedIcon
                      source={
                        icons.radio[value === option ? "checked" : "unchecked"]
                      }
                      className=" w-[20px] h-[20px] "
                    />
                    <ThemedText className=" capitalize font-urbanistMedium text-[1.2rem] ">
                      {option}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default Select;
