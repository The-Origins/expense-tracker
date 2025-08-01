import icons from "@/constants/icons";
import { Notification } from "@/types/common";
import dayjs from "dayjs";
import { Href, router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, View } from "react-native";
import ThemedIcon from "../themedIcon";
import ThemedText from "../themedText";

const NotificationItem = ({
  notification,
  selectMode,
  selected,
  handleItemSelect,
}: {
  notification: Notification;
  selectMode: boolean;
  selected: Set<string>;
  handleItemSelect: (id: string, action: "add" | "delete") => void;
}) => {
  const picked = useMemo<boolean>(
    () => selected.has(notification.id),
    [selected, notification]
  );

  const handlePress = () => {
    if (selectMode) {
      handleItemSelect(notification.id, picked ? "delete" : "add");
    } else {
      router.push(notification.path as Href);
    }
  };

  const handleLongPress = () => {
    if (!picked) {
      handleItemSelect(notification.id, "add");
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      className={` flex-col gap-2 p-[20px] rounded-[20px] bg-paper-light dark:bg-paper-dark `}
    >
      <View className=" flex-col gap-1 ">
        <View className=" flex-row justify-between items-center ">
          <View>
            {selectMode && (
              <ThemedIcon
                source={icons.checkbox[picked ? "checked" : "unchecked"]}
                className=" w-[15px] h-[15px] "
              />
            )}
          </View>
          {!!notification.unread && (
            <View
              className={` w-[10px] h-[10px] rounded-[50%] ${notification.type === "error" ? "bg-error" : "bg-info"} `}
            />
          )}
        </View>
        <ThemedText
          toggleOnDark={false}
          className={` ${notification.type === "error" ? "text-error" : "text-info"} capitalize font-urbanistBold text-[1.2rem]  `}
        >
          {notification.title}
        </ThemedText>
      </View>
      <ThemedText toggleOnDark={true} className=" text-[1.1rem] ">
        {notification.message}
      </ThemedText>
      <ThemedText toggleOnDark={false} className=" text-divider ">
        {dayjs(new Date(notification.date)).format("dd DD MMM YYYY, hh:MM A")}
      </ThemedText>
    </Pressable>
  );
};

export default NotificationItem;
