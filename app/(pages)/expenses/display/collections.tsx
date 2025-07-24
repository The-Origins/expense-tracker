import AddCollectionModal from "@/components/expenses/addCollectionModal";
import CollectionCard from "@/components/expenses/collectionCard";
import SelectAction from "@/components/expenses/selectAction";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { QueryParameters } from "@/constants/common";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import { createCollection, deleteCollections } from "@/lib/collectionsUtils";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";

const Collections = () => {
  const router = useRouter();

  const appProps = useAppProps();

  const [expand, setExpand] = useState<boolean>(false);
  const [addMode, setAddMode] = useState<boolean>(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState<boolean>(false);
  const {
    collections,
    collectionNames,
    setCollectionNames,
    setCollections,
    setLoading,
    setQueryParameters,
    getCollections,
  } = useMemo<{
    collections: Map<string, number> | null;
    collectionNames: string[];
    setCollections: React.Dispatch<
      React.SetStateAction<Map<string, number> | null>
    >;
    setCollectionNames: React.Dispatch<React.SetStateAction<string[]>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setQueryParameters: React.Dispatch<
      React.SetStateAction<QueryParameters | null>
    >;
    getCollections: () => Promise<void>;
  }>(
    () => ({
      collections: appProps.collections,
      collectionNames: appProps.collectionNames,
      setCollections: appProps.setCollections,
      setCollectionNames: appProps.setCollectionNames,
      setLoading: appProps.setLoading,
      setQueryParameters: appProps.setQueryParameters,
      getCollections: appProps.getCollections,
    }),
    [appProps]
  );
  const allSelected = useMemo<boolean>(
    () => selected.size === collectionNames.length,
    [selected, collectionNames]
  );

  useEffect(() => {
    if (!collections) {
      getCollections();
    }
  }, [collections]);

  const reset = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const handleSelectAll = () => {
    if (collections) {
      if (allSelected) {
        setSelected(new Set());
      } else {
        setSelected(new Set(collectionNames));
      }
    }
  };

  const handleAdd = async (collection: string) => {
    setCollections((prev) => {
      const newMap = new Map(prev);
      newMap.set(collection, 0);
      return newMap;
    });
    setCollectionNames((prev) => [collection, ...prev]);
    await createCollection(collection);
  };

  const handleNavigate = (collection: string) => {
    setLoading(true);
    setQueryParameters({ collection, search: "" });
    router.navigate("/expenses/display/collection");
  };

  const handleCollectionPress = (name: string) => {
    if (selectMode) {
      setSelected((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(name)) {
          newSet.delete(name);
        } else {
          newSet.add(name);
        }
        return newSet;
      });
    } else {
      handleNavigate(name);
    }
  };

  const handleCollectionLongPress = (name: string) => {
    if (!selectMode) {
      setSelectMode(true);
    }
    if (!selected.has(name)) {
      setSelected((prev) => {
        const newSet = new Set(prev);
        newSet.add(name);
        return newSet;
      });
    }
  };

  const handleDelete = async () => {
    const result = await deleteCollections(
      selected,
      collections || new Map(),
      collectionNames
    );

    setCollections(result.collections);
    setCollectionNames(result.collectionNames);
    setSelectMode(false);
    setSelected(new Set());
  };

  return (
    <>
      <View className=" flex-1 ">
        <View className=" pt-[10px] pb-[10px] flex-col gap-2 ">
          <View className=" flex-row justify-between gap-1">
            <View className=" flex-row items-center ">
              {selectMode && (
                <Pressable
                  onPress={reset}
                  className=" w-[40px] h-[40px] flex-row items-center "
                >
                  <ThemedIcon
                    source={icons.add}
                    className=" w-[20px] h-[20px] rotate-45 "
                  />
                </Pressable>
              )}
              <ThemedText className=" font-urbanistBold text-[2rem]">
                {selectMode ? `${selected.size} Selected` : "Collections"}
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
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className=" flex-1 flex-col gap-[30px] pt-[10px] pb-[20px] ">
            <View>
              <ScrollView
                horizontal={!expand}
                showsHorizontalScrollIndicator={false}
              >
                <View
                  className={` flex-row gap-[10px] ${expand ? "flex-wrap" : ""} `}
                >
                  <CollectionCard
                    selected={selected}
                    selectMode={selectMode}
                    onPress={() => setAddMode(true)}
                    onLongPress={() => setAddMode(true)}
                    name="add"
                  />
                  {collectionNames.map((name, index) => (
                    <CollectionCard
                      key={index}
                      name={name}
                      count={collections?.get(name)}
                      selectMode={selectMode}
                      selected={selected}
                      onPress={handleCollectionPress}
                      onLongPress={handleCollectionLongPress}
                    />
                  ))}
                </View>
              </ScrollView>
              {collectionNames.length > 2 && (
                <Pressable
                  onPress={() => setExpand((prev) => !prev)}
                  className=" pt-[10px] pb-[10px] flex-row items-center justify-center gap-2 "
                >
                  <ThemedIcon
                    source={icons.chevron}
                    className={` w-[15px] h-[15px] ${expand ? "rotate-180" : "rotate-0"} `}
                  />
                  <ThemedText>{expand ? "Collapse" : "Expand"}</ThemedText>
                </Pressable>
              )}
            </View>
            <Pressable onPress={() => handleNavigate("expenses")} className=" h-[200px] p-[20px] gap-[20px] bg-primary rounded-[20px] flex-col justify-center ">
              <View className=" flex-row justify-between ">
                <Image source={icons.money} className=" w-[40px]  h-[40px]" />
                <Image
                  source={icons["arrow"]}
                  className=" w-[20px] h-[20px] rotate-[-45deg]"
                />
              </View>
              <ThemedText
                toggleOnDark={false}
                className=" font-urbanistBold text-[2rem] "
              >
                Expenses
              </ThemedText>
              <ThemedText toggleOnDark={false}>
                {`${collections?.get("expenses")} item${collections?.get("expenses") === 1 ? "" : "s"}`}
              </ThemedText>
            </Pressable>
            <Pressable onPress={() => handleNavigate("failed")} className=" p-[20px] flex-row items-center rounded-[20px] gap-5 bg-secondary ">
              <Image source={icons.warning} className=" w-[30px] h-[30px] " />
              <View className=" flex-col flex-1 ">
                <ThemedText
                  toggleOnDark={false}
                  className=" font-urbanistMedium text-[1.3rem] "
                >
                  Failed
                </ThemedText>
                <ThemedText
                  toggleOnDark={false}
                >{`${collections?.get("failed")} item${collections?.get("failed") === 1 ? "" : "s"}`}</ThemedText>
              </View>
              <Image
                source={icons.chevron}
                className=" w-[20px] h-[20px]  rotate-[-90deg] "
              />
            </Pressable>
            <Pressable onPress={() => handleNavigate("trash")} className=" p-[20px] flex-row items-center rounded-[20px] gap-5 bg-accent ">
              <Image source={icons.delete} className=" w-[30px] h-[30px] " />
              <View className=" flex-col flex-1 ">
                <ThemedText
                  toggleOnDark={false}
                  className=" font-urbanistMedium text-[1.3rem] "
                >
                  Deleted
                </ThemedText>
                <ThemedText
                  toggleOnDark={false}
                >{`${collections?.get("trash")} item${collections?.get("trash") === 1 ? "" : "s"}`}</ThemedText>
              </View>
              <Image
                source={icons.chevron}
                className=" w-[20px] h-[20px]  rotate-[-90deg] "
              />
            </Pressable>
          </View>
        </ScrollView>
      </View>
      <AddCollectionModal
        open={addMode}
        collections={collections || new Map()}
        handleClose={() => setAddMode(false)}
        handleSubmit={handleAdd}
      />
    </>
  );
};

export default Collections;
