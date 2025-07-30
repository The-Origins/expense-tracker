import SelectAction from "@/components/expenses/selectAction";
import NotificationItem from "@/components/notifications/item";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { tintColors } from "@/constants/colorSettings";
import { Notification } from "@/constants/common";
import icons from "@/constants/icons";
import {
  clearUnread,
  deleteNofications,
  getNotifications,
} from "@/lib/notificationUtils";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Image, Pressable, View } from "react-native";
import * as Progress from "react-native-progress";

const Notifications = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ids = useMemo<string[]>(
    () => notifications.map((notification) => notification.id),
    [notifications]
  );
  const allSelected = useMemo<boolean>(
    () => selected.size === ids.length,
    [ids, selected]
  );

  const reset = () => {
    setSelected(new Set());
    setSelectMode(false);
  };

  const handleTitleBtnClick = () => {
    if (selectMode) {
      reset();
    } else {
      router.back();
    }
  };

  const handleSelectAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(ids));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteNofications(selected);
      setNotifications((prev) => prev.filter((item) => !selected.has(item.id)));
      reset();
    } catch (error) {
      console.log(error);
    }
  };

  const handleItemSelect = (id: string, action: "add" | "delete") => {
    if (!selectMode) {
      setSelectMode(true);
    }
    setSelected((prev) => {
      const newSet = new Set(prev);
      newSet[action](id);
      return newSet;
    });
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
      setLoading(false);
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (ids.length) {
      clearUnread(ids);
    }
  }, [ids]);

  return (
    <View className=" flex-1 pr-[10px] pl-[10px] ">
      <View className=" pt-[10px] pb-[10px] flex-col gap-2 ">
        <View className=" flex-row justify-between items-center gap-1">
          <View className=" flex-row items-center ">
            <Pressable
              onPress={handleTitleBtnClick}
              className=" w-[40px] h-[40px] flex-row items-center "
            >
              <ThemedIcon
                source={icons[selectMode ? "add" : "arrow"]}
                className={` w-[20px] h-[20px] ${selectMode ? "rotate-45" : "rotate-180"}`}
              />
            </Pressable>
            <ThemedText className=" font-urbanistBold text-[2rem]">
              {selectMode ? `${selected.size} Selected` : "Notifications"}
            </ThemedText>
          </View>
          {selectMode && (
            <Pressable onPress={handleSelectAll}>
              <ThemedIcon
                source={icons.checkbox[allSelected ? "checked" : "unchecked"]}
                className=" w-[20px] h-[20px] "
              />
            </Pressable>
          )}
        </View>
        {selectMode && (
          <View className=" flex-row ">
            <SelectAction
              type="delete"
              disabled={!selected.size}
              handlePress={handleDelete}
            />
          </View>
        )}
      </View>
      {!!notifications.length ? (
        <FlatList
          data={notifications}
          ListHeaderComponent={() => <View className=" p-[10px] "></View>}
          ItemSeparatorComponent={() => <View className=" p-[10px] "></View>}
          ListFooterComponent={() => <View className=" p-[10px] "></View>}
          renderItem={({ item }) => (
            <NotificationItem
              {...{
                notification: item,
                selectMode,
                selected,
                handleItemSelect,
              }}
            />
          )}
        />
      ) : (
        <View className=" flex-1 flex-col gap-2 justify-center items-center ">
          {loading ? (
            <Progress.CircleSnail color={["#3b82f6", "#10b981"]} />
          ) : (
            <>
              <Image
                source={icons.notification}
                className=" w-[40px] h-[40px] "
                tintColor={tintColors.divider}
              />
              <ThemedText>No Notifications</ThemedText>
            </>
          )}
        </View>
      )}
    </View>
  );
};

export default Notifications;
