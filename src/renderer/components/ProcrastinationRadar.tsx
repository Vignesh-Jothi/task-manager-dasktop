import React, { useState, useEffect } from "react";
import { Task, ProcrastinationPattern, OrbitLevel } from "../../types";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";

interface ProcrastinationRadarProps {
  tasks: Task[];
}

interface RadarData {
  patterns: ProcrastinationPattern[];
  topProblems: Array<{ task: Task; score: number }>;
  insights: string[];
}

const ProcrastinationRadar: React.FC<ProcrastinationRadarProps> = ({
  tasks,
}) => {
  const [radarData, setRadarData] = useState<RadarData | null>(null);

  useEffect(() => {
    analyzePatterns();
  }, [tasks]);

  const analyzePatterns = () => {
    // Analyze by day of week
    const dayPatterns: {
      [key: number]: {
        snoozes: number[];
        reschedules: number[];
        orbit: OrbitLevel[];
      };
    } = {};

    for (let i = 0; i < 7; i++) {
      dayPatterns[i] = { snoozes: [], reschedules: [], orbit: [] };
    }

    tasks.forEach((task) => {
      if (task.createdAt) {
        const day = new Date(task.createdAt).getDay();
        if (task.snoozeCount) dayPatterns[day].snoozes.push(task.snoozeCount);
        if (task.rescheduleCount)
          dayPatterns[day].reschedules.push(task.rescheduleCount);
        if (task.orbit) dayPatterns[day].orbit.push(task.orbit.level);
      }
    });

    // Calculate patterns by day
    const patterns: ProcrastinationPattern[] = Object.entries(dayPatterns).map(
      ([day, data]) => {
        const avgSnooze =
          data.snoozes.length > 0
            ? data.snoozes.reduce((a, b) => a + b, 0) / data.snoozes.length
            : 0;
        const avgReschedule =
          data.reschedules.length > 0
            ? data.reschedules.reduce((a, b) => a + b, 0) /
              data.reschedules.length
            : 0;

        // Find most common orbit level for this day
        const orbitCounts: { [key in OrbitLevel]?: number } = {};
        data.orbit.forEach((o) => {
          orbitCounts[o] = (orbitCounts[o] || 0) + 1;
        });
        const mostCommonOrbit = Object.entries(orbitCounts).sort(
          (a, b) => b[1] - a[1]
        )[0]?.[0] as OrbitLevel | undefined;

        return {
          dayOfWeek: parseInt(day),
          orbitLevel: mostCommonOrbit || "mid-orbit",
          avgSnoozeCount: avgSnooze,
          avgRescheduleCount: avgReschedule,
          suggestion: generateSuggestion(
            parseInt(day),
            avgSnooze,
            avgReschedule,
            mostCommonOrbit
          ),
        };
      }
    );

    // Find top procrastinated tasks
    const topProblems = tasks
      .filter((t) => t.status !== "completed")
      .map((task) => {
        const snoozeScore = (task.snoozeCount || 0) * 2;
        const rescheduleScore = (task.rescheduleCount || 0) * 3;
        const abandonScore = (task.abandonCount || 0) * 5;
        const ageScore = Math.floor(
          (new Date().getTime() - new Date(task.createdAt).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return {
          task,
          score: snoozeScore + rescheduleScore + abandonScore + ageScore,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // Generate insights
    const insights = generateInsights(patterns, topProblems);

    setRadarData({ patterns, topProblems, insights });
  };

  const generateSuggestion = (
    day: number,
    avgSnooze: number,
    avgReschedule: number,
    orbitLevel?: OrbitLevel
  ): string | undefined => {
    if (avgSnooze < 0.5 && avgReschedule < 0.5) return undefined;

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = dayNames[day];

    if (avgSnooze > 2) {
      return `High snooze activity on ${dayName}s. Consider scheduling fewer tasks or blocking focus time.`;
    }
    if (avgReschedule > 2) {
      return `Frequent rescheduling on ${dayName}s. Tasks may be too ambitious or poorly scoped.`;
    }
    if (orbitLevel === "deep-space") {
      return `${dayName}s show deep-space task avoidance. Try tackling complex work earlier in the week.`;
    }

    return undefined;
  };

  const generateInsights = (
    patterns: ProcrastinationPattern[],
    topProblems: Array<{ task: Task; score: number }>
  ): string[] => {
    const insights: string[] = [];

    // Day-based insights
    const worstDay = patterns.reduce((prev, curr) =>
      curr.avgSnoozeCount + curr.avgRescheduleCount >
      prev.avgSnoozeCount + prev.avgRescheduleCount
        ? curr
        : prev
    );

    if (worstDay.avgSnoozeCount + worstDay.avgRescheduleCount > 1) {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      insights.push(
        `⚠️ ${
          dayNames[worstDay.dayOfWeek]
        } is your highest procrastination day. Consider lighter planning.`
      );
    }

    // Deep-space avoidance
    const deepSpaceTasks = topProblems.filter(
      (p) => p.task.orbit?.level === "deep-space"
    );
    if (deepSpaceTasks.length >= 3) {
      insights.push(
        `🌌 You tend to avoid deep-space tasks. Try breaking them into smaller mid-orbit chunks.`
      );
    }

    // Chronic reschedulers
    const chronicReschedulers = topProblems.filter(
      (p) => (p.task.rescheduleCount || 0) > 3
    );
    if (chronicReschedulers.length > 0) {
      insights.push(
        `📅 ${chronicReschedulers.length} task(s) rescheduled 3+ times. Consider if they're still relevant.`
      );
    }

    // Old pending tasks
    const oldTasks = topProblems.filter((p) => {
      const age = Math.floor(
        (new Date().getTime() - new Date(p.task.createdAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return age > 30;
    });
    if (oldTasks.length > 0) {
      insights.push(
        `⏰ ${oldTasks.length} task(s) over 30 days old. Time to complete or archive.`
      );
    }

    // Generic positive feedback
    if (insights.length === 0) {
      insights.push(
        `✅ Radar clear. No significant procrastination patterns detected.`
      );
    }

    return insights;
  };

  if (!radarData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-[var(--btn-primary)] border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      {/* Insights Banner */}
      <Card className="border-l-4 border-l-[var(--info)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📡</span>
            Procrastination Radar
          </CardTitle>
          <p className="text-sm text-[color:var(--text-muted)]">
            Detecting patterns in task avoidance and delays
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {radarData.insights.map((insight, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-[var(--bg-card)] border border-[color:var(--text-muted)]/20"
            >
              <p className="text-sm text-[color:var(--text-primary)]">
                {insight}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weekly Pattern Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Pattern Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {radarData.patterns.map((pattern) => {
              const totalActivity =
                pattern.avgSnoozeCount + pattern.avgRescheduleCount;
              const intensity = Math.min(totalActivity / 5, 1); // 0-1 scale

              return (
                <div key={pattern.dayOfWeek} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[color:var(--text-primary)] w-16">
                      {dayNames[pattern.dayOfWeek]}
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="relative h-6 bg-[var(--bg-app)] rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{
                            width: `${intensity * 100}%`,
                            backgroundColor:
                              intensity > 0.6
                                ? "var(--error)"
                                : intensity > 0.3
                                ? "var(--warning)"
                                : "var(--success)",
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-sm text-[color:var(--text-muted)] w-32 text-right">
                      {pattern.avgSnoozeCount.toFixed(1)} snoozes
                    </div>
                  </div>
                  {pattern.suggestion && (
                    <p className="text-xs text-[color:var(--text-secondary)] ml-20 italic">
                      💡 {pattern.suggestion}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Procrastinated Tasks */}
      {radarData.topProblems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Avoided Tasks</CardTitle>
            <p className="text-sm text-[color:var(--text-muted)]">
              Tasks with highest procrastination scores
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {radarData.topProblems.map((problem, idx) => {
                const task = problem.task;
                const age = Math.floor(
                  (new Date().getTime() - new Date(task.createdAt).getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  <div
                    key={task.id}
                    className="p-4 rounded-lg bg-[var(--bg-card)] border border-[color:var(--text-muted)]/20 hover:border-[var(--warning)]/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--warning)]/20 text-[var(--warning)] font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[color:var(--text-primary)]">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-[color:var(--text-muted)]">
                          {task.snoozeCount && task.snoozeCount > 0 && (
                            <span>⏰ {task.snoozeCount} snoozes</span>
                          )}
                          {task.rescheduleCount && task.rescheduleCount > 0 && (
                            <span>📅 {task.rescheduleCount} reschedules</span>
                          )}
                          <span>📆 {age} days old</span>
                        </div>
                        {task.orbit && (
                          <Badge className="mt-2 text-xs">
                            {task.orbit.level === "deep-space" && "🌌"}
                            {task.orbit.level === "mid-orbit" && "🛰️"}
                            {task.orbit.level === "low-orbit" && "🌍"}{" "}
                            {task.orbit.level
                              .split("-")
                              .map(
                                (w) => w.charAt(0).toUpperCase() + w.slice(1)
                              )
                              .join(" ")}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[var(--warning)]">
                          {problem.score}
                        </div>
                        <div className="text-xs text-[color:var(--text-muted)]">
                          avoidance
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProcrastinationRadar;
