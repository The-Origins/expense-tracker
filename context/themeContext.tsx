import { init } from "@/db/schema";
import { getPreferences, setPreferences } from "@/lib/preferenceUtils";
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
  const scheme = useColorScheme();
  const theme = useMemo<Theme>(() => scheme ?? "light", [scheme]);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    try {
      //init Database
      init();

      //fetch theme
      const fetchTheme = async () => {
        const preferences = await getPreferences("theme");
        if (preferences.theme) {
          colorScheme.set(preferences.theme as Theme);
        }
        setMounted(true);
      };
      fetchTheme();
    } catch (error) {
      console.error(error);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setPreferences({ theme: newTheme });
    colorScheme.set(newTheme);
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  if (!mounted) {
    return false;
  }

  return (
    <ThemeContext.Provider value={value}>
      <>{children}</>
    </ThemeContext.Provider>
  );
};
