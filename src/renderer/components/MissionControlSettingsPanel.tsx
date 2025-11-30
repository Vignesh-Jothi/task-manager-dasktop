import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface MissionControlSettings {
  enableDailyBriefing: boolean;
  enableMissionMode: boolean;
  enableCaptainsLog: boolean;
  enableProcrastinationRadar: boolean;
  enableXPSystem: boolean;
  enableAbortMode: boolean;
  enableAICopilot: boolean;
  missionModeBreakInterval?: number;
}

const MissionControlSettingsPanel: React.FC = () => {
  const [settings, setSettings] = useState<MissionControlSettings>({
    enableDailyBriefing: true,
    enableMissionMode: true,
    enableCaptainsLog: true,
    enableProcrastinationRadar: true,
    enableXPSystem: true,
    enableAbortMode: true,
    enableAICopilot: false, // Future feature
    missionModeBreakInterval: 25,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // TODO: Implement getSettings API call
      // const appSettings = await window.api.getSettings();
      // if (appSettings.missionControl) {
      //   setSettings(appSettings.missionControl);
      // }

      // For now, load from localStorage
      const saved = localStorage.getItem("missionControlSettings");
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load mission control settings:", error);
    }
  };

  const handleToggle = (key: keyof MissionControlSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleIntervalChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      setSettings((prev) => ({
        ...prev,
        missionModeBreakInterval: num,
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement updateSettings API call
      // await window.api.updateSettings({
      //   missionControl: settings,
      // });

      // For now, save to localStorage
      localStorage.setItem("missionControlSettings", JSON.stringify(settings));

      // Show browser notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Settings Saved", {
          body: "Mission Control settings updated successfully",
        });
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      enableDailyBriefing: true,
      enableMissionMode: true,
      enableCaptainsLog: true,
      enableProcrastinationRadar: true,
      enableXPSystem: true,
      enableAbortMode: true,
      enableAICopilot: false,
      missionModeBreakInterval: 25,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-[var(--btn-primary)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-3xl">🚀</span>
            Mission Control Settings
          </CardTitle>
          <p className="text-sm text-[color:var(--text-muted)]">
            Configure your mission-control experience
          </p>
        </CardHeader>
      </Card>

      {/* Core Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Core Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingRow
            icon="📡"
            title="Daily Mission Briefing"
            description="Show mission briefing when app opens each day"
            enabled={settings.enableDailyBriefing}
            onToggle={() => handleToggle("enableDailyBriefing")}
          />

          <SettingRow
            icon="🎯"
            title="Mission Mode"
            description="Enable full-screen focus mode for individual tasks"
            enabled={settings.enableMissionMode}
            onToggle={() => handleToggle("enableMissionMode")}
          />

          <SettingRow
            icon="📖"
            title="Captain's Log"
            description="Auto-generate daily markdown logs of completed missions"
            enabled={settings.enableCaptainsLog}
            onToggle={() => handleToggle("enableCaptainsLog")}
          />
        </CardContent>
      </Card>

      {/* Analytics & Progression */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Analytics & Progression</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingRow
            icon="📡"
            title="Procrastination Radar"
            description="Track patterns in task avoidance and delays"
            enabled={settings.enableProcrastinationRadar}
            onToggle={() => handleToggle("enableProcrastinationRadar")}
          />

          <SettingRow
            icon="⭐"
            title="XP & Progression System"
            description="Earn XP, level up ranks, and track streaks"
            enabled={settings.enableXPSystem}
            onToggle={() => handleToggle("enableXPSystem")}
          />
        </CardContent>
      </Card>

      {/* Emergency & Advanced */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Emergency & Advanced</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SettingRow
            icon="🚨"
            title="Abort Mission Mode"
            description="Enable emergency mode to hide non-critical tasks"
            enabled={settings.enableAbortMode}
            onToggle={() => handleToggle("enableAbortMode")}
          />

          <SettingRow
            icon="🤖"
            title="Silent AI Co-pilot"
            description="Subtle AI suggestions for task optimization (Coming Soon)"
            enabled={settings.enableAICopilot}
            onToggle={() => handleToggle("enableAICopilot")}
            disabled={true}
          />
        </CardContent>
      </Card>

      {/* Mission Mode Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mission Mode Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-[color:var(--text-primary)]">
                Break Interval
              </p>
              <p className="text-sm text-[color:var(--text-muted)]">
                Default duration for mission mode sessions (minutes)
              </p>
            </div>
            <Input
              type="number"
              value={settings.missionModeBreakInterval || 25}
              onChange={(e) => handleIntervalChange(e.target.value)}
              className="w-24 text-center"
              min="5"
              max="120"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={isSaving} className="flex-1">
          {isSaving ? (
            <>
              <span className="animate-spin mr-2">⚙️</span>
              Saving...
            </>
          ) : (
            <>💾 Save Settings</>
          )}
        </Button>
        <Button onClick={handleReset} variant="outline" className="px-6">
          🔄 Reset to Defaults
        </Button>
      </div>

      {/* Info Box */}
      <Card className="border border-[var(--info)]/30 bg-[var(--info)]/5">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1 text-sm text-[color:var(--text-secondary)]">
              <p className="font-semibold text-[color:var(--text-primary)] mb-1">
                Customize Your Experience
              </p>
              <p>
                These settings control the mission-control features of
                Tasktronaut. You can enable or disable features based on your
                workflow preferences. All changes are saved locally and won't
                affect your existing tasks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component for setting rows
const SettingRow: React.FC<{
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}> = ({ icon, title, description, enabled, onToggle, disabled }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-card)] border border-[color:var(--text-muted)]/20">
      <div className="flex items-start gap-3 flex-1">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1">
          <p className="font-medium text-[color:var(--text-primary)]">
            {title}
            {disabled && (
              <span className="ml-2 text-xs text-[color:var(--text-muted)] font-normal">
                (Coming Soon)
              </span>
            )}
          </p>
          <p className="text-sm text-[color:var(--text-muted)] mt-1">
            {description}
          </p>
        </div>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={onToggle}
        disabled={disabled}
      />
    </div>
  );
};

export default MissionControlSettingsPanel;
