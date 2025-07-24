import { init } from "@/db/schema";
import { colorScheme } from "nativewind";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: "light", toggleTheme: () => {} });

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const userPreference = useColorScheme();
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    //init Database
    init();
  }, []);

  useEffect(() => {
    setTheme(userPreference ?? "light");
  }, [userPreference]);

  const toggleTheme = () => {
    colorScheme.set(theme === "dark" ? "light" : "dark");
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <>{children}</>
    </ThemeContext.Provider>
  );
};
