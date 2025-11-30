import React, { useState, useEffect } from "react";
import { Project } from "../../../../types";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Switch } from "@ui/switch";
import { Button } from "@ui/button";
import { Input } from "@ui/input";

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
    enableAICopilot: false,
    missionModeBreakInterval: 25,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("#4f46e5");
  const [isProjectSaving, setIsProjectSaving] = useState(false);

  useEffect(() => {
    loadSettings();
    loadProjects();
  }, []);

  const loadSettings = async () => {
    try {
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
      localStorage.setItem("missionControlSettings", JSON.stringify(settings));
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

  const loadProjects = async () => {
    try {
      const items = await (window as any).api.getAllProjects();
      setProjects(items);
    } catch (err) {
      console.error("Failed to load projects", err);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setIsProjectSaving(true);
    try {
      await (window as any).api.createProject(
        newProjectName.trim(),
        newProjectColor
      );
      setNewProjectName("");
      await loadProjects();
    } catch (err) {
      console.error("Failed to create project", err);
    } finally {
      setIsProjectSaving(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Delete this project? Tasks will retain reference.")) return;
    try {
      await (window as any).api.deleteProject(id);
      await loadProjects();
    } catch (err) {
      console.error("Failed to delete project", err);
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">New Project Name</label>
              <Input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g. Marketing Launch"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Color</label>
              <Input
                type="color"
                value={newProjectColor}
                onChange={(e) => setNewProjectColor(e.target.value)}
                className="h-10 w-16 p-1"
              />
            </div>
            <Button onClick={handleCreateProject} disabled={isProjectSaving}>
              {isProjectSaving ? "Saving..." : "Add"}
            </Button>
          </div>
          <div className="space-y-2">
            {projects.length === 0 && (
              <p className="text-sm text-[color:var(--text-muted)]">
                No projects yet.
              </p>
            )}
            {projects.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-3 py-2 rounded border border-[color:var(--text-muted)]/20"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block h-4 w-4 rounded"
                    style={{ background: p.color || "#4f46e5" }}
                  />
                  <span className="text-sm">
                    {p.name}
                    {p.archived && (
                      <span className="ml-2 text-xs text-[color:var(--text-muted)]">
                        (Archived)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDeleteProject(p.id)}
                    className="text-xs px-2 py-1"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

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
