import InputField from "@/components/inputField";
import StatusModal from "@/components/statusModal";
import ThemedIcon from "@/components/themedIcon";
import ThemedText from "@/components/themedText";
import { Expense, Status } from "@/constants/common";
import icons from "@/constants/icons";
import { useAppProps } from "@/context/propContext";
import { parseReceipts } from "@/lib/expenseUtils";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";

const Receipt = () => {
  const router = useRouter();
  const [receipt, setReceipt] = useState<string>("");
  const [status, setStatus] = useState<Status>({
    open: false,
    type: "info",
    handleClose() {},
    action: { callback() {} },
  });

  const appProps = useAppProps();

  const { setExpenses, setCollectionSelected, setCollections } = useMemo<{
    setExpenses: React.Dispatch<
      React.SetStateAction<(Partial<Expense> | undefined)[]>
    >;
    setCollectionSelected: React.Dispatch<React.SetStateAction<Set<number>>>;
    setCollections: React.Dispatch<
      React.SetStateAction<Map<string, number> | null>
    >;
  }>(
    () => ({
      setExpenses: appProps.setExpenses,
      setCollectionSelected: appProps.setCollectionSelected,
      setCollections: appProps.setCollections,
    }),
    [appProps]
  );

  const handleChange = (name: string, value: string) => {
    setReceipt(value);
  };

  const handlePaste = () => {};

  const handleStatusClose = () => {
    setStatus({
      open: false,
      type: "info",
      handleClose() {},
      action: { callback() {} },
    });
  };

  const handleDone = async () => {
    setStatus({
      open: true,
      type: "loading",
      title: "Parsing...",
      message: "Extracting Information",
      handleClose: handleStatusClose,
      action: { callback() {} },
    });
    try {
      const expenses = await parseReceipts(" " + receipt);
      setCollections(null);
      setExpenses(expenses);
      setCollectionSelected(
        new Set(Array.from({ length: expenses.length }, (_, i) => i))
      );

      router.replace("/expenses/edit/main");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <View className=" flex-1 flex-col gap-[10px] pr-[10px] pl-[10px] ">
        <View className=" pt-[10px] pb-[5px] flex-row items-center justify-between ">
          <View className=" flex-row items-center ">
            <ThemedText className=" font-urbanistBold text-[2rem] ">
              Receipts
            </ThemedText>
          </View>
          <Pressable
            onPress={handleDone}
            className=" p-[20px] pt-[10px] pb-[10px] bg-black rounded-[20px] dark:bg-white "
          >
            <ThemedText reverse className=" text-white ">
              Done
            </ThemedText>
          </Pressable>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className=" pt-[20px] pb-[20px]">
            <View className=" relative ">
              <InputField
                name="receipt"
                showLabel={false}
                placeholder="Paste one or more receipts..."
                handleChange={handleChange}
                handleBlur={() => {}}
                className=" min-h-[300px] "
                multiline
                textAlignVertical="top"
              />
              {!receipt.length ? (
                <Pressable
                  onPress={handlePaste}
                  className=" absolute top-[10] right-[10] p-[20px] pt-[5px] pb-[5px] rounded-[20px] bg-black flex-row items-center gap-2 dark:bg-white "
                >
                  <ThemedIcon
                    reverse
                    source={icons.copy}
                    className=" w-[15px] h-[15px] "
                  />
                  <ThemedText reverse>PASTE</ThemedText>
                </Pressable>
              ) : (
                <></>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
      <StatusModal status={status} />
    </>
  );
};

export default Receipt;
