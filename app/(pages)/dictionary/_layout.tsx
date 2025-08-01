import { AppPropsProvider } from "@/context/propContext";
import {
  getDictionaryKeywords,
  getDictionaryRecipients,
} from "@/lib/dictionaryUtils";
import { DictionaryItem } from "@/types/common";
import { Slot } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

const DictionaryLayout = () => {
  const [data, setData] = useState<{
    recipients: DictionaryItem[];
    keywords: DictionaryItem[];
  }>({
    recipients: [],
    keywords: [],
  });
  const [search, setSearch] = useState<string>("");
  const [itemInfo, setItemInfo] = useState<{
    index: number;
    type: "keywords" | "recipients";
  }>({ index: 0, type: "keywords" });
  const [page, setPage] = useState<{ keywords: number; recipients: number }>({
    keywords: 1,
    recipients: 1,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setPage({
      keywords: 1,
      recipients: 1,
    });
    const fetchData = async () => {
      try {
        setLoading(true);
        const keywords = await getDictionaryKeywords(search, 1);
        const recipients = await getDictionaryRecipients(search, 1);

        setData({ keywords, recipients });
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [search]);

  const nextPage = async (type: "keywords" | "recipients") => {
    let newPage: DictionaryItem[] = [];
    if (type === "keywords") {
      newPage = await getDictionaryKeywords(search, page.keywords + 1);
    } else if (type === "recipients") {
      newPage = await getDictionaryRecipients(search, page.recipients + 1);
    }

    setData((prev) => ({ ...prev, [type]: [...prev[type], ...newPage] }));
    setPage((prev) => ({ ...prev, [type]: prev[type] + 1 }));
  };

  return (
    <AppPropsProvider
      value={{
        data,
        setData,
        search,
        setSearch,
        itemInfo,
        setItemInfo,
        page,
        setPage,
        loading,
        setLoading,
        nextPage,
      }}
    >
      <View className={` flex-1 pr-[10px] pl-[10px] `}>
        <Slot />
      </View>
    </AppPropsProvider>
  );
};

export default DictionaryLayout;
