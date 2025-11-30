import React, { useState, useEffect } from "react";
import { Task, DailyBriefing, OrbitLevel } from "@types";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";

interface DailyMissionBriefingProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDismiss: () => void;
}

const MOTIVATIONAL_QUOTES = [
  "One small step at a time, astronaut.",
  "Mission control confirms: You've got this.",
  "Launch sequence initiated. Stay focused.",
  "Navigate the chaos. Trust your instruments.",
  "Today's mission: Progress over perfection.",
  "Fuel check complete. Systems nominal.",
  "Chart your course. The stars are waiting.",
  "Steady hands. Clear mind. Successful mission.",
];

const DailyMissionBriefing: React.FC<DailyMissionBriefingProps> = ({
  tasks,
  onTaskClick,
  onDismiss,
}) => {
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    generateBriefing();
  }, [tasks]);

  const generateBriefing = () => {
    const today = new Date().toISOString().split("T")[0];
    const overdue = tasks.filter(
      (t) =>
        t.deadline &&
        t.deadline < today &&
        t.status !== "completed" &&
        t.status !== "missed"
    );
    const todaysTasks = tasks.filter(
      (t) =>
        (t.deadline?.startsWith(today) ||
          t.createdAt.startsWith(today) ||
          t.orbit?.level === "deep-space") &&
        t.status !== "completed"
    );
    const prioritized = [...todaysTasks].sort((a: Task, b: Task) => {
      const gravityA = a.gravity || 0;
      const gravityB = b.gravity || 0;
      if (gravityA !== gravityB) return gravityB - gravityA;
      const orbitWeight: { [K in OrbitLevel]: number } = {
        "deep-space": 3,
        "mid-orbit": 2,
        "low-orbit": 1,
      };
      const orbitA = a.orbit ? orbitWeight[a.orbit.level as OrbitLevel] : 0;
      const orbitB = b.orbit ? orbitWeight[b.orbit.level as OrbitLevel] : 0;
      return orbitB - orbitA;
    });
    const topPriorities = prioritized.slice(0, 3);
    const optional = tasks
      .filter(
        (t) =>
          t.status === "pending" &&
          t.orbit?.level === "low-orbit" &&
          (t.gravity || 0) < 30
      )
      .slice(0, 5);
    const totalLoad = topPriorities.reduce(
      (sum, t) => sum + (t.durationMinutes || 30),
      0
    );
    const weatherForecast: "smooth" | "turbulent" | "critical" =
      overdue.length > 5 || totalLoad > 480
        ? "critical"
        : overdue.length > 2 || totalLoad > 240
        ? "turbulent"
        : "smooth";
    const randomQuote =
      MOTIVATIONAL_QUOTES[
        Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
      ];
    setBriefing({
      date: today,
      topPriorities,
      overdueTasks: overdue,
      optionalQuests: optional,
      motivationalQuote: randomQuote,
      weatherForecast,
    });
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 300);
  };
  if (!briefing || !isVisible) return null;

  const weatherEmoji = { smooth: "☀️", turbulent: "⛈️", critical: "🌪️" };
  const weatherColor = {
    smooth: "var(--success)",
    turbulent: "var(--warning)",
    critical: "var(--error)",
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl border-2 border-[var(--btn-primary)]">
        <CardHeader className="border-b border-[color:var(--text-muted)]/20 bg-gradient-to-r from-[var(--btn-primary)]/10 to-transparent">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-[color:var(--text-primary)] flex items-center gap-3">
                <span className="text-3xl">📡</span>
                Daily Mission Briefing
              </CardTitle>
              <p className="text-sm text-[color:var(--text-muted)] mt-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] transition-colors"
            >
              ✕
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div
            className="flex items-center gap-4 p-4 rounded-lg bg-[var(--bg-card)] border-2"
            style={{
              borderColor: weatherColor[briefing.weatherForecast || "smooth"],
            }}
          >
            <span className="text-4xl">
              {weatherEmoji[briefing.weatherForecast || "smooth"]}
            </span>
            <div className="flex-1">
              <h3 className="font-semibold text-[color:var(--text-primary)]">
                Mission Conditions:{" "}
                <span
                  style={{
                    color: weatherColor[briefing.weatherForecast || "smooth"],
                  }}
                >
                  {(briefing.weatherForecast || "smooth")
                    .charAt(0)
                    .toUpperCase() +
                    (briefing.weatherForecast || "smooth").slice(1)}
                </span>
              </h3>
              <p className="text-sm text-[color:var(--text-secondary)] mt-1">
                {briefing.weatherForecast === "smooth" &&
                  "Clear skies ahead. Standard operations expected."}
                {briefing.weatherForecast === "turbulent" &&
                  "Moderate workload detected. Stay focused."}
                {briefing.weatherForecast === "critical" &&
                  "High-intensity mission day. Prioritize ruthlessly."}
              </p>
            </div>
          </div>
          {briefing.overdueTasks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[color:var(--error)] flex items-center gap-2">
                <span>⚠️</span>Distress Signals ({briefing.overdueTasks.length})
              </h3>
              <div className="space-y-2">
                {briefing.overdueTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="p-3 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/30 cursor-pointer hover:bg-[var(--error)]/20 transition-colors"
                  >
                    <p className="font-medium text-[color:var(--text-primary)]">
                      {task.title}
                    </p>
                    <p className="text-xs text-[color:var(--text-muted)] mt-1">
                      Overdue by{" "}
                      {Math.floor(
                        (new Date().getTime() -
                          new Date(task.deadline!).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      days
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[color:var(--text-primary)] flex items-center gap-2">
              <span>🎯</span>Priority Objectives
            </h3>
            {briefing.topPriorities.length > 0 ? (
              <div className="space-y-3">
                {briefing.topPriorities.map((task, idx) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="p-4 rounded-lg bg-gradient-to-r from-[var(--btn-primary)]/5 to-transparent border-l-4 border-[var(--btn-primary)] cursor-pointer hover:from-[var(--btn-primary)]/10 transition-all duration-200 hover:scale-[1.01]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--btn-primary)] text-white font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-[color:var(--text-primary)]">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-sm text-[color:var(--text-secondary)] mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {task.orbit && (
                            <Badge className="text-xs">
                              {getOrbitIcon(task.orbit.level)}{" "}
                              {getOrbitLabel(task.orbit.level)}
                            </Badge>
                          )}
                          {task.durationMinutes && (
                            <Badge className="text-xs">
                              ⏱️ {task.durationMinutes}m
                            </Badge>
                          )}
                          {task.gravity && task.gravity > 50 && (
                            <Badge variant="danger" className="text-xs">
                              🔴 High Gravity
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[color:var(--text-muted)] italic">
                No priority objectives for today. You're in free flight!
              </p>
            )}
          </div>
          {briefing.optionalQuests.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[color:var(--text-primary)] flex items-center gap-2">
                <span>📋</span>Optional Side Quests
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {briefing.optionalQuests.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="p-2 rounded-lg bg-[var(--bg-card)] border border-[color:var(--text-muted)]/20 cursor-pointer hover:border-[var(--btn-primary)]/50 transition-colors"
                  >
                    <p className="text-sm font-medium text-[color:var(--text-primary)]">
                      {task.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {briefing.motivationalQuote && (
            <div className="p-4 rounded-lg bg-gradient-to-br from-[var(--btn-primary)]/10 to-[var(--info)]/10 border border-[var(--btn-primary)]/20">
              <p className="text-center text-[color:var(--text-primary)] font-medium italic">
                "{briefing.motivationalQuote}"
              </p>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleClose} className="flex-1">
              🚀 Begin Mission
            </Button>
            <Button onClick={handleClose} variant="outline" className="px-6">
              Dismiss
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function getOrbitIcon(level: OrbitLevel): string {
  switch (level) {
    case "low-orbit":
      return "🌍";
    case "mid-orbit":
      return "🛰️";
    case "deep-space":
      return "🌌";
  }
  return "";
}
function getOrbitLabel(level: OrbitLevel): string {
  switch (level) {
    case "low-orbit":
      return "Low Orbit";
    case "mid-orbit":
      return "Mid Orbit";
    case "deep-space":
      return "Deep Space";
  }
  return "";
}

export default DailyMissionBriefing;
