import { tintColors } from "@/constants/colorSettings";
import { useThemeContext } from "@/context/themeContext";
import React from "react";
import { Image, ImageProps } from "react-native";

const ThemedIcon = ({
  toggleOnDark = true,
  reverse = false,
  ...props
}: ImageProps & { toggleOnDark?: boolean; reverse?: boolean }) => {
  const { theme } = useThemeContext();
  return (
    <Image
      tintColor={
        theme === "dark" && toggleOnDark
          ? tintColors[reverse ? theme : "light"]
          : tintColors[reverse ? theme : "dark"]
      }
      {...props}
    />
  );
};

export default ThemedIcon;
