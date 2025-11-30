import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ThemeName =
  | "calm"
  | "dark"
  | "warm"
  | "mono"
  | "ocean"
  | "sunset"
  | "forest"
  | "midnight"
  | "lavender"
  | "custom";

export interface CustomTheme {
  name: string;
  bgApp: string;
  bgCard: string;
  bgSidebar: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  btnPrimary: string;
  btnPrimaryHover: string;
  ring: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

interface ThemeContextValue {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  autoSwitch: boolean;
  setAutoSwitch: (v: boolean) => void;
  customThemes: CustomTheme[];
  saveCustomTheme: (theme: CustomTheme) => void;
  deleteCustomTheme: (name: string) => void;
  applyCustomTheme: (theme: CustomTheme) => void;
  activeCustomTheme: CustomTheme | null;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<ThemeName>(
    () => (localStorage.getItem("app:theme") as ThemeName) || "calm"
  );
  const [autoSwitch, setAutoSwitch] = useState<boolean>(
    () => localStorage.getItem("app:autoTheme") === "1"
  );
  const [customThemes, setCustomThemes] = useState<CustomTheme[]>(() =>
    JSON.parse(localStorage.getItem("app:customThemes") || "[]")
  );
  const [activeCustomTheme, setActiveCustomTheme] =
    useState<CustomTheme | null>(null);

  const applyThemeColors = (customTheme: CustomTheme) => {
    const root = document.documentElement;
    root.style.setProperty("--bg-app", customTheme.bgApp);
    root.style.setProperty("--bg-card", customTheme.bgCard);
    root.style.setProperty("--bg-sidebar", customTheme.bgSidebar);
    root.style.setProperty("--text-primary", customTheme.textPrimary);
    root.style.setProperty("--text-secondary", customTheme.textSecondary);
    root.style.setProperty("--text-muted", customTheme.textMuted);
    root.style.setProperty("--btn-primary", customTheme.btnPrimary);
    root.style.setProperty("--btn-primary-hover", customTheme.btnPrimaryHover);
    root.style.setProperty("--ring", customTheme.ring);
    root.style.setProperty("--success", customTheme.success);
    root.style.setProperty("--warning", customTheme.warning);
    root.style.setProperty("--error", customTheme.error);
    root.style.setProperty("--info", customTheme.info);
  };

  const saveCustomTheme = (newTheme: CustomTheme) => {
    const updated = [
      ...customThemes.filter((t) => t.name !== newTheme.name),
      newTheme,
    ];
    setCustomThemes(updated);
    localStorage.setItem("app:customThemes", JSON.stringify(updated));
  };

  const deleteCustomTheme = (name: string) => {
    const updated = customThemes.filter((t) => t.name !== name);
    setCustomThemes(updated);
    localStorage.setItem("app:customThemes", JSON.stringify(updated));
    if (activeCustomTheme?.name === name) {
      setActiveCustomTheme(null);
      setTheme("calm");
    }
  };

  const applyCustomTheme = (customTheme: CustomTheme) => {
    setActiveCustomTheme(customTheme);
    setTheme("custom");
    applyThemeColors(customTheme);
    localStorage.setItem("app:activeCustomTheme", JSON.stringify(customTheme));
  };

  useEffect(() => {
    if (theme === "custom" && activeCustomTheme) {
      applyThemeColors(activeCustomTheme);
    } else {
      localStorage.setItem("app:theme", theme);
      document.body.setAttribute("data-theme", theme);
    }
  }, [theme, activeCustomTheme]);

  useEffect(() => {
    localStorage.setItem("app:autoTheme", autoSwitch ? "1" : "0");
  }, [autoSwitch]);

  useEffect(() => {
    if (!autoSwitch || theme === "custom") return;
    const applyByTime = () => {
      const hour = new Date().getHours();
      const night = hour >= 19 || hour < 7;
      document.body.setAttribute("data-theme", night ? "midnight" : theme);
    };
    applyByTime();
    const id = setInterval(applyByTime, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, [autoSwitch, theme]);

  useEffect(() => {
    const saved = localStorage.getItem("app:activeCustomTheme");
    if (saved && theme === "custom") {
      const parsed = JSON.parse(saved);
      setActiveCustomTheme(parsed);
      applyThemeColors(parsed);
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      autoSwitch,
      setAutoSwitch,
      customThemes,
      saveCustomTheme,
      deleteCustomTheme,
      applyCustomTheme,
      activeCustomTheme,
    }),
    [theme, autoSwitch, customThemes, activeCustomTheme]
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
