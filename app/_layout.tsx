import { ThemeWrapper, useThemeContext } from "@/context/themeContext";
import {
  Urbanist_200ExtraLight,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_700Bold,
} from "@expo-google-fonts/urbanist";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar, useColorScheme } from "react-native";
import "./globals.css";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { theme } = useThemeContext();
  const [loaded] = useFonts({
    Urbanist_200ExtraLight,
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_700Bold,
  });

  if (!loaded) {
    return false;
  }

  console.log("theme", theme);

  return (
    <ThemeWrapper>
      <StatusBar
        translucent
        backgroundColor={"transparent"}
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <Stack>
        <Stack.Screen
          name="(pages)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </ThemeWrapper>
  );
}
