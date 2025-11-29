import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import TaskForm from "./components/TaskForm";
import Settings from "./components/Settings";
import { Task } from "../types";
import "./styles/App.css";
import "./styles/theme.css";
import { ThemeProvider, useTheme } from "./components/ThemeProvider";
import { ThemeCustomizer } from "./components/ThemeCustomizer";
import { Card, CardContent } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Tooltip } from "./components/ui/tooltip";

type View = "dashboard" | "create" | "settings" | "themes";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    loadTasks();

    // Request notification permissions
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
        if (permission === "granted") {
          new Notification("🎉 Notifications Enabled!", {
            body: "You will now receive task reminders and updates.",
            icon: "/assets/icon.svg",
          });
        }
      });
    }

    // Listen for notifications
    if (window.api) {
      window.api.onNotification((notification) => {
        // Notifications are handled by the system
        console.log("Notification:", notification);
      });
    }

    // Set title and favicon
    document.title = "Task Manager";
    const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (link) {
      link.href = "/assets/icon.svg";
      link.type = "image/svg+xml";
    }
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const allTasks = await window.api.getAllTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = () => {
    loadTasks();
    setCurrentView("dashboard");
  };

  const handleTaskUpdate = () => {
    loadTasks();
  };

  const navItems = [
    { id: "dashboard" as View, label: "Dashboard", icon: "📊" },
    { id: "create" as View, label: "Create Task", icon: "➕" },
    { id: "themes" as View, label: "Themes", icon: "🎨" },
    { id: "settings" as View, label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-app)] overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? "w-16" : "w-64"
        } bg-[var(--bg-sidebar)] border-r border-[color:var(--text-muted)]/20 flex flex-col transition-all duration-300`}
      >
        <div className="p-4 border-b border-[color:var(--text-muted)]/20">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-[color:var(--text-primary)] flex items-center gap-2">
                <span>📋</span>
                <span>Task Manager</span>
              </h1>
            )}
            {sidebarCollapsed && <span className="text-2xl mx-auto">📋</span>}
            <Tooltip
              content={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:scale-110 transition-all duration-200 ml-auto"
              >
                {sidebarCollapsed ? "→" : "←"}
              </button>
            </Tooltip>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => (
            <Tooltip key={item.id} content={item.label}>
              <button
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02] ${
                  currentView === item.id
                    ? "bg-[var(--btn-primary)] text-white shadow-md"
                    : "text-[color:var(--text-primary)] hover:bg-[var(--bg-card)] hover:shadow-sm"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            </Tooltip>
          ))}
        </nav>

        <div className="p-2 border-t border-[color:var(--text-muted)]/20">
          <QuickStats tasks={tasks} collapsed={sidebarCollapsed} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <ThemeToolbar />

        <div className="flex-1 overflow-auto p-6">
          {loading && currentView === "dashboard" ? (
            <div className="flex items-center justify-center h-full animate-fade-in">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin h-6 w-6 border-2 border-[var(--btn-primary)] border-t-transparent rounded-full"></div>
                    <span className="text-[color:var(--text-primary)]">
                      Loading tasks...
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="animate-fade-in">
              {currentView === "dashboard" && (
                <Dashboard tasks={tasks} onTaskUpdate={handleTaskUpdate} />
              )}
              {currentView === "create" && (
                <TaskForm onTaskCreated={handleTaskCreated} />
              )}
              {currentView === "themes" && <ThemeCustomizer />}
              {currentView === "settings" && <Settings />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const QuickStats: React.FC<{ tasks: Task[]; collapsed: boolean }> = ({
  tasks,
  collapsed,
}) => {
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
  };

  if (collapsed) {
    return (
      <div className="text-center space-y-2">
        <div className="text-xs text-[color:var(--text-muted)]">Total</div>
        <div className="text-lg font-bold text-[color:var(--text-primary)]">
          {stats.total}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-[color:var(--text-muted)] uppercase">
        Quick Stats
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-xs text-[color:var(--text-muted)]">Total</div>
          <div className="text-sm font-bold text-[color:var(--text-primary)]">
            {stats.total}
          </div>
        </div>
        <div>
          <div className="text-xs text-[color:var(--text-muted)]">Pending</div>
          <div className="text-sm font-bold text-[color:var(--warning)]">
            {stats.pending}
          </div>
        </div>
        <div>
          <div className="text-xs text-[color:var(--text-muted)]">Active</div>
          <div className="text-sm font-bold text-[color:var(--info)]">
            {stats.inProgress}
          </div>
        </div>
      </div>
    </div>
  );
};

const ThemeToolbar: React.FC = () => {
  const { theme, setTheme, autoSwitch, setAutoSwitch, activeCustomTheme } =
    useTheme();

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
    <div className="bg-[var(--bg-card)] border-b border-[color:var(--text-muted)]/20 px-6 py-3">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm font-medium text-[color:var(--text-secondary)]">
          Theme:
        </span>
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
        <label className="ml-auto flex items-center gap-2 text-sm text-[color:var(--text-secondary)]">
          <input
            type="checkbox"
            checked={autoSwitch}
            onChange={(e) => setAutoSwitch(e.target.checked)}
            className="rounded"
          />
          Auto-switch (day/night)
        </label>
      </div>
    </div>
  );
};

const RootApp: React.FC = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default RootApp;
