import { tintColors } from "@/constants/colorSettings";
import icons from "@/constants/icons";
import { copyToClipboard } from "@/lib/clipboardUtils";
import { dowloadImage } from "@/lib/imageUtils";
import React from "react";
import { Image, Modal, Pressable, ScrollView, View } from "react-native";
import Toast from "react-native-root-toast";
import ThemedIcon from "../themedIcon";
import ThemedText from "../themedText";

const ViewRecieptModal = ({
  receipt,
  image,
  open,
  handleClose,
}: {
  receipt: string;
  image: string;
  open: boolean;
  handleClose: () => void;
}) => {
  const handleCopy = async () => {
    try {
      if (receipt) {
        await copyToClipboard(receipt);
        Toast.show(`Copied receipt to clipboard`, {
          duration: Toast.durations.SHORT,
        });
      } else {
        Toast.show(`No receipt`, {
          duration: Toast.durations.SHORT,
        });
      }
    } catch (error) {
      Toast.show(`There was an error copying receipt`, {
        duration: Toast.durations.SHORT,
      });
    }
  };

  const handleDownload = async () => {
    try {
      if (image) {
        await dowloadImage(image);
        Toast.show(`Image Downloaded`, {
          duration: Toast.durations.SHORT,
        });
      } else {
        Toast.show(`No Image`, {
          duration: Toast.durations.SHORT,
        });
      }
    } catch (error) {
      console.log(error);
      Toast.show(`There was an error downloading image`, {
        duration: Toast.durations.SHORT,
      });
    }
  };

  return (
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
          className=" w-[90vw] max-w-[600px] h-[75vh] max-h-[1000px] p-[20px] bg-white rounded-[20px] dark:bg-paper-dark "
        >
          <View className=" flex-row justify-between pb-[5px]  ">
            <ThemedText className=" font-urbanistMedium  text-[1.5rem]">
              Reciept
            </ThemedText>
            <Pressable onPress={handleClose}>
              <ThemedIcon
                source={icons.add}
                className=" w-[20px] h-[20px] rotate-45 "
              />
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Pressable className=" flex-1 flex-col gap-[20px] pt-[20px] pb-[20px] ">
              <View className=" p-[10px] rounded-[20px] border border-divider flex-row ">
                {receipt ? (
                  <>
                    <ThemedText className=" flex-1 capitalize ">
                      {receipt}
                    </ThemedText>
                    <Pressable onPress={handleCopy}>
                      <ThemedIcon
                        source={icons.copy}
                        className=" w-[20px] h-[20px] "
                      />
                    </Pressable>
                  </>
                ) : (
                  <View className=" flex-1 h-[100px] flex-col items-center justify-center ">
                    <Image
                      source={icons.receipt}
                      className=" w-[40px] h-[40px] "
                      tintColor={tintColors.divider}
                    />
                    <ThemedText>No Receipt</ThemedText>
                  </View>
                )}
              </View>
              <ThemedText className=" font-urbanistMedium text-[1.2rem] ">
                Image
              </ThemedText>
              <View className=" relative overflow-hidden rounded-[20px] flex-row aspect-square border border-divider ">
                {image ? (
                  <>
                    <Image src={image} className=" w-[100%] h-[100%] " />
                    <Pressable
                      onPress={handleDownload}
                      className=" absolute right-2 top-2 p-[5px] bg-black/60 rounded-[50%]"
                    >
                      <Image
                        source={icons.download}
                        className=" w-[20px] h-[20px] "
                        tintColor={"#FFFFFF"}
                      />
                    </Pressable>
                  </>
                ) : (
                  <View className=" flex-1 flex-col gap-2 justify-center items-center ">
                    <Image
                      source={icons.image}
                      className=" w-[40px] h-[40px] "
                      tintColor={tintColors.divider}
                    />
                    <ThemedText className=" text-divider ">No Image</ThemedText>
                  </View>
                )}
              </View>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default ViewRecieptModal;
