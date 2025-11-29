import React, { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import TaskForm from "./components/TaskForm";
import Settings from "./components/Settings";
import { Task } from "../types";
import "./styles/App.css";

type View = "dashboard" | "create" | "settings";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();

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

  return (
    <div className="app">
      <header className="app-header">
        <h1>📋 Task Manager</h1>
        <nav>
          <button
            className={currentView === "dashboard" ? "active" : ""}
            onClick={() => setCurrentView("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={currentView === "create" ? "active" : ""}
            onClick={() => setCurrentView("create")}
          >
            Create Task
          </button>
          <button
            className={currentView === "settings" ? "active" : ""}
            onClick={() => setCurrentView("settings")}
          >
            Settings
          </button>
        </nav>
      </header>

      <main className="app-main">
        {loading && currentView === "dashboard" ? (
          <div className="loading">Loading tasks...</div>
        ) : (
          <>
            {currentView === "dashboard" && (
              <Dashboard tasks={tasks} onTaskUpdate={handleTaskUpdate} />
            )}
            {currentView === "create" && (
              <TaskForm onTaskCreated={handleTaskCreated} />
            )}
            {currentView === "settings" && <Settings />}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
