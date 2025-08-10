import { AppPropsProvider } from "@/context/propContext";
import { getDictionaryItems } from "@/lib/dictionaryUtils";
import { DictionaryItem } from "@/types/common";
import { Slot } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

const DictionaryLayout = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<DictionaryItem[]>([]);
  const [collections, setCollections] = useState<{
    keywords: number;
    recipients: number;
  } | null>(null);
  const [queryParams, setQueryParams] = useState<{
    type: "keywords" | "recipients";
    search: string;
  } | null>(null);
  const [itemIndex, setItemIndex] = useState<number>(0);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    if (queryParams) {
      const fetchData = async () => {
        setLoading(true);
        const items = await getDictionaryItems(
          queryParams.type,
          queryParams.search,
          1,
          10
        );
        setData(items);
        setLoading(false);
      };
      fetchData();
    }
  }, [queryParams]);

  const nextPage = async () => {
    if (!queryParams) return;
    setLoading(true);
    const newPage = await getDictionaryItems(
      queryParams.type,
      queryParams.search,
      page + 1,
      10
    );
    setData((prev) => prev.concat(newPage));
    setPage((prev) => prev + 1);
    setLoading(false);
  };

  return (
    <AppPropsProvider
      value={{
        data,
        setData,
        collections,
        setCollections,
        itemIndex,
        setItemIndex,
        page,
        setPage,
        queryParams,
        setQueryParams,
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
