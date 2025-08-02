import { ThemeWrapper } from "@/context/themeContext";
import {
  Urbanist_200ExtraLight,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_700Bold,
} from "@expo-google-fonts/urbanist";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import "./globals.css";

export default function RootLayout() {
  const [loaded] = useFonts({
    Urbanist_200ExtraLight,
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_700Bold,
  });

  if (!loaded) {
    return false;
  }
  return (
    <ThemeWrapper>
      <Stack>
        <Stack.Screen
          name="(pages)"
          options={{
            headerShown: false,
            statusBarStyle: "auto",
            navigationBarColor: "transparent",
          }}
        />
      </Stack>
    </ThemeWrapper>
  );
}
