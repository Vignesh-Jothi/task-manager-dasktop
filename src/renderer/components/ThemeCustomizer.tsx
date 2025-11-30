import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { useTheme, CustomTheme } from "./ThemeProvider";

export const ThemeCustomizer: React.FC = () => {
  const {
    theme,
    setTheme,
    customThemes,
    saveCustomTheme,
    deleteCustomTheme,
    applyCustomTheme,
    activeCustomTheme,
    autoSwitch,
    setAutoSwitch,
  } = useTheme();
  const [isCreating, setIsCreating] = useState(false);
  const [themeName, setThemeName] = useState("");
  const [themeColors, setThemeColors] = useState<CustomTheme>({
    name: "",
    bgApp: "#F8FAFC",
    bgCard: "#FFFFFF",
    bgSidebar: "#F1F5F9",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#94A3B8",
    btnPrimary: "#2563EB",
    btnPrimaryHover: "#1D4ED8",
    ring: "#93C5FD",
    success: "#16A34A",
    warning: "#D97706",
    error: "#DC2626",
    info: "#0284C7",
  });

  const handleColorChange = (
    key: keyof Omit<CustomTheme, "name">,
    value: string
  ) => {
    setThemeColors((prev: CustomTheme) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!themeName.trim()) {
      alert("Please enter a theme name");
      return;
    }
    saveCustomTheme({ ...themeColors, name: themeName });
    setThemeName("");
    setIsCreating(false);
  };

  const colorFields: Array<{
    key: keyof Omit<CustomTheme, "name">;
    label: string;
  }> = [
    { key: "bgApp", label: "Background" },
    { key: "bgCard", label: "Card Background" },
    { key: "bgSidebar", label: "Sidebar Background" },
    { key: "textPrimary", label: "Primary Text" },
    { key: "textSecondary", label: "Secondary Text" },
    { key: "textMuted", label: "Muted Text" },
    { key: "btnPrimary", label: "Primary Button" },
    { key: "btnPrimaryHover", label: "Primary Button Hover" },
    { key: "ring", label: "Focus Ring" },
    { key: "success", label: "Success Color" },
    { key: "warning", label: "Warning Color" },
    { key: "error", label: "Error Color" },
    { key: "info", label: "Info Color" },
  ];

  const presetThemes = [
    { value: "calm", label: "Calm Focus", color: "#2563EB" },
    { value: "dark", label: "Modern Dark", color: "#3B82F6" },
    { value: "warm", label: "Warm", color: "#EA580C" },
    { value: "mono", label: "Monochrome", color: "#0EA5E9" },
    { value: "ocean", label: "Ocean", color: "#0284C7" },
    { value: "sunset", label: "Sunset", color: "#F97316" },
    { value: "forest", label: "Forest", color: "#10B981" },
    { value: "midnight", label: "Midnight", color: "#6366F1" },
    { value: "lavender", label: "Lavender", color: "#9333EA" },
  ];

  return (
    <div className="space-y-6">
      {/* Preset Themes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Preset Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {presetThemes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value as any)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    theme === t.value && !activeCustomTheme
                      ? "bg-[var(--btn-primary)] text-white shadow-md"
                      : "bg-[var(--bg-sidebar)] text-[color:var(--text-primary)] hover:bg-[var(--bg-app)]"
                  }`}
                  style={
                    theme === t.value && !activeCustomTheme
                      ? { backgroundColor: t.color }
                      : {}
                  }
                >
                  {t.label}
                </button>
              ))}
              {activeCustomTheme && theme === "custom" && (
                <button className="px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--btn-primary)] text-white shadow-md">
                  {activeCustomTheme.name}
                </button>
              )}
            </div>

            {/* Auto-switch toggle */}
            <div className="flex items-center justify-between p-4 bg-[var(--bg-sidebar)] rounded-lg hover:bg-[var(--bg-app)] transition-colors">
              <div className="flex-1">
                <div className="font-medium text-[color:var(--text-primary)]">
                  Auto-switch (day/night)
                </div>
                <div className="text-sm text-[color:var(--text-muted)] mt-1">
                  Automatically switch between light and dark themes at 7 AM and
                  7 PM
                </div>
              </div>
              <Switch checked={autoSwitch} onCheckedChange={setAutoSwitch} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Themes Section */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[color:var(--text-primary)]">
          Custom Themes
        </h3>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? "Cancel" : "+ Create Theme"}
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create Custom Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[color:var(--text-primary)] mb-2 block">
                  Theme Name
                </label>
                <Input
                  value={themeName}
                  onChange={(e) => setThemeName(e.target.value)}
                  placeholder="My Awesome Theme"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {colorFields.map(({ key, label }) => (
                  <div key={String(key)}>
                    <label className="text-xs text-[color:var(--text-secondary)] mb-1 block">
                      {label}
                    </label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={themeColors[key]}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="h-9 w-12 rounded cursor-pointer border border-[color:var(--text-muted)]"
                      />
                      <Input
                        value={themeColors[key]}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="flex-1 font-mono text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button onClick={handleSave} className="w-full">
                Save Custom Theme
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {customThemes.map((theme: CustomTheme) => (
          <Card key={theme.name} className="relative">
            <CardContent className="pt-4">
              <h4 className="font-semibold text-[color:var(--text-primary)] mb-3">
                {theme.name}
              </h4>
              <div className="flex gap-1 mb-3 flex-wrap">
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: theme.bgApp }}
                  title="Background"
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: theme.bgCard }}
                  title="Card"
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: theme.btnPrimary }}
                  title="Primary"
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: theme.success }}
                  title="Success"
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{ backgroundColor: theme.error }}
                  title="Error"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => applyCustomTheme(theme)}
                  className="flex-1"
                >
                  Apply
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteCustomTheme(theme.name)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {customThemes.length === 0 && !isCreating && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-[color:var(--text-muted)]">
              No custom themes yet. Create your first one!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
