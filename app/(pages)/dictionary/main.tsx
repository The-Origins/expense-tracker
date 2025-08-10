import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import { getDictionaryCollections } from "@/lib/dictionaryUtils";
import { getPreferences, setPreferences } from "@/lib/preferenceUtils";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, View } from "react-native";

const Dictionary = () => {
  const { collections, setCollections, setQueryParams } = useAppProps() as {
    collections: {
      keywords: number;
      recipients: number;
    } | null;
    setCollections: React.Dispatch<
      React.SetStateAction<{
        keywords: number;
        recipients: number;
      } | null>
    >;
    setQueryParams: React.Dispatch<
      React.SetStateAction<{
        type: "keywords" | "recipients";
        search: string;
      } | null>
    >;
  };

  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      const preferences = await getPreferences("disableDictionaryInfo");
      if (!preferences.disableDictionaryInfo) {
        setShowInfo(true);
      }
    };
    fetchPreferences();
  }, []);

  useEffect(() => {
    if (!collections) {
      const fetchCollections = async () => {
        const data = await getDictionaryCollections();
        setCollections(data);
      };
      fetchCollections();
    }
  }, [collections]);

  const handleNavigate = (type: "keywords" | "recipients") => {
    setQueryParams({ type, search: "" });
    router.push("/dictionary/items");
  };

  const handleGotIt = async () => {
    setPreferences({ disableDictionaryInfo: "true" });
    setShowInfo(false);
  };

  return (
    <View className=" flex-1 ">
      <View className=" flex-row items-center ">
        <Pressable
          onPress={router.back}
          className=" w-[40px] h-[40px] flex-row items-center "
        >
          <ThemedIcon
            source={icons.arrow}
            className=" w-[20px] h-[20px] rotate-180 "
          />
        </Pressable>
        <ThemedText className=" font-urbanistBold text-[2rem] ">
          Dictionary
        </ThemedText>
      </View>
      <ScrollView>
        <View className=" flex-col pt-[20px] gap-[30px] ">
          {showInfo && (
            <View className=" p-[20px] bg-primary rounded-[20px] flex-col gap-4 items-start  ">
              <Image source={icons.info} className=" w-[20px] h-[20px] " />
              <View>
                <ThemedText className=" font-urbanistBold text-[1.2rem] ">
                  Keywords
                </ThemedText>
                <ThemedText toggleOnDark={false} className=" text-[1.1rem] ">
                  These are used to{" "}
                  <ThemedText className=" font-urbanistBold ">
                    automaticaly
                  </ThemedText>{" "}
                  assign{" "}
                  <ThemedText className=" font-urbanistBold ">
                    titles
                  </ThemedText>{" "}
                  or{" "}
                  <ThemedText className=" font-urbanistBold ">
                    categories
                  </ThemedText>{" "}
                  to an expense when the{" "}
                  <ThemedText className=" font-urbanistBold ">
                    recipient
                  </ThemedText>{" "}
                  contains a given{" "}
                  <ThemedText className=" font-urbanistBold ">
                    keyword
                  </ThemedText>
                  . (e.g. 'mart' {"->"} 'Quickmart Kilimani')
                </ThemedText>
              </View>
              <View>
                <ThemedText className=" font-urbanistBold text-[1.2rem] ">
                  Recipients
                </ThemedText>
                <ThemedText toggleOnDark={false} className=" text-[1.1rem]">
                  These are used to{" "}
                  <ThemedText className=" font-urbanistBold ">
                    automaticaly
                  </ThemedText>{" "}
                  assign{" "}
                  <ThemedText className=" font-urbanistBold ">
                    titles
                  </ThemedText>{" "}
                  or{" "}
                  <ThemedText className=" font-urbanistBold ">
                    categories
                  </ThemedText>{" "}
                  to an expense when the{" "}
                  <ThemedText className=" font-urbanistBold ">
                    recipient
                  </ThemedText>{" "}
                  is an{" "}
                  <ThemedText className=" font-urbanistBold ">
                    exact match
                  </ThemedText>
                  . (e.g. 'Quickmart Kilimani' {"->"} 'Quickmart Kilimani')
                </ThemedText>
              </View>
              <Pressable
                onPress={handleGotIt}
                className=" p-[20px] pt-[5px] pb-[5px] bg-black rounded-[20px] "
              >
                <ThemedText toggleOnDark={false} reverse>
                  Got it
                </ThemedText>
              </Pressable>
            </View>
          )}
          <Pressable
            onPress={() => handleNavigate("keywords")}
            className={` p-[20px] rounded-[20px] flex-col gap-2 ${showInfo ? "bg-secondary" : "bg-primary"} `}
          >
            <View className=" flex-row justify-between ">
              <Image source={icons.keyword} className=" w-[30px] h-[30px] " />
              <Image
                source={icons.arrow}
                className=" w-[15px] h-[15px] rotate-[-45deg] "
              />
            </View>
            <ThemedText className=" font-urbanistBold text-[2rem] ">
              Keywords
            </ThemedText>
            <ThemedText>{collections?.keywords || 0} items</ThemedText>
          </Pressable>
          <Pressable
            onPress={() => handleNavigate("recipients")}
            className={` p-[20px] rounded-[20px] flex-col gap-2 ${showInfo ? "bg-accent" : "bg-secondary"} `}
          >
            <View className=" flex-row justify-between ">
              <Image
                source={icons.dictionary}
                className=" w-[30px] h-[30px] "
              />
              <Image
                source={icons.arrow}
                className=" w-[15px] h-[15px] rotate-[-45deg] "
              />
            </View>
            <ThemedText className=" font-urbanistBold text-[2rem] ">
              Recipients
            </ThemedText>
            <ThemedText>{collections?.recipients || 0} items</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

export default Dictionary;
