import React from "react";
import { Text, TextProps } from "react-native";

const ThemedText = ({
  toggleOnDark = true,
  reverse = false,
  ...props
}: TextProps & { toggleOnDark?: boolean; reverse?: boolean }) => {
  return (
    <Text
      {...props}
      className={` font-regular font-urbanist ${reverse ? "text-white" : "text-black"} ${toggleOnDark ? (reverse ? "dark:text-black" : "dark:text-white") : ""} ${props.className}`}
    />
  );
};

export default ThemedText;
