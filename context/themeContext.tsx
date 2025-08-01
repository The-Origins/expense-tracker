import { init } from "@/db/schema";
import { registerForeground, startForeground } from "@/lib/foregroundUtils";
import { requestSMSPermission } from "@/lib/permissionUtils";
import { getPreferences, setPreferences } from "@/lib/preferenceUtils";
import { colorScheme } from "nativewind";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DeviceEventEmitter, useColorScheme } from "react-native";

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
  const [permitted, setPermitted] = useState<boolean>(false);

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

      //register foreground service
      registerForeground();

      //start foreground service
      startForeground();

      //request sms listening permission
      requestSMSPermission();
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (permitted) {
      console.log("permitted");
      //subscribe to sms listener
      const sub = DeviceEventEmitter.addListener(
        "SMS_RECEIVED",
        (data: string) => {
          const [sender, message] = data.split("|");
          console.log("SMS from", sender, "→", message);
          // TODO: Parse & add to DB
        }
      );
      return () => sub.remove();
    }
  }, [permitted]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setPreferences({ theme: newTheme });
    colorScheme.set(newTheme);
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      <>{children}</>
    </ThemeContext.Provider>
  );
};
