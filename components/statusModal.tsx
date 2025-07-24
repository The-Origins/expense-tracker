import { tintColors } from "@/constants/colorSettings";
import { Status } from "@/constants/common";
import icons from "@/constants/icons";
import React from "react";
import { Image, Modal, Pressable, View } from "react-native";
import * as Progress from "react-native-progress";
import ThemedIcon from "./themedIcon";
import ThemedText from "./themedText";

const StatusModal = ({ status }: { status: Status }) => {
  const handleCancel = () => {
    if (
      status.type === "info" ||
      status.type === "warning" ||
      status.type === "confirm"
    ) {
      status.handleClose();
    } else if (status.type === "loading") {
    } else {
      status.action.callback();
    }
  };
  return (
    <Modal
      animationType="fade"
      visible={status.open}
      transparent={true}
      onRequestClose={handleCancel}
    >
      <Pressable
        onPress={handleCancel}
        className=" flex-1 bg-black/50 flex-row justify-center items-center "
      >
        <Pressable
          onPress={() => {}}
          className=" flex-col w-[90vw] max-w-[600px] min-h-[200px] p-[20px] rounded-[20px] bg-background-light dark:bg-paper-dark "
        >
          <View className=" flex-row items-center justify-between pb-[5px]  ">
            <View className=" flex-row items-center gap-2 ">
              {status.type === "confirm" || status.type === "loading" ? (
                <></>
              ) : (
                <Image
                  source={icons[status.type]}
                  className=" w-[20px] h-[20px] "
                  tintColor={tintColors[status.type]}
                />
              )}
              <ThemedText className=" font-urbanistBold text-[1.5rem] capitalize ">
                {status.type === "loading" && status.title
                  ? status.title
                  : status.type}
              </ThemedText>
            </View>
            {status.type === "loading" ? (
              <></>
            ) : (
              <Pressable onPress={handleCancel}>
                <ThemedIcon
                  source={icons.add}
                  className=" w-[20px] h-[20px] rotate-45 "
                />
              </Pressable>
            )}
          </View>
          <View
            className={` flex-1 flex-col gap-1 pt-[20px] pb-[20px] ${status.type === "loading" ? " items-center justify-center" : " items-start justify-start"} `}
          >
            {status.type === "loading" ? (
              <Progress.CircleSnail color={["#3b82f6", "#10b981"]} />
            ) : (
              <ThemedText className=" font-urbanistBold text-[1.5rem] ">
                {status.title}
              </ThemedText>
            )}
            <ThemedText>{status.message}</ThemedText>
          </View>
          <View className={" flex-row justify-between gap-1 pt-[5px] "}>
            {status.type === "info" ||
            status.type === "warning" ||
            status.type === "confirm" ? (
              <Pressable
                onPress={status.handleClose}
                className=" p-[10px] pt-[5px] pb-[5px] border border-black rounded-[20px] dark:border-white "
              >
                <ThemedText>Cancel</ThemedText>
              </Pressable>
            ) : (
              <View></View>
            )}
            {status.type === "loading" ? (
              <></>
            ) : (
              <Pressable
                onPress={status.action.callback}
                className={` p-[20px] pt-[5px] pb-[5px] rounded-[20px] bg-black dark:bg-white `}
              >
                <ThemedText reverse className=" text-white ">
                  {status.action.title || "OK"}
                </ThemedText>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default StatusModal;
