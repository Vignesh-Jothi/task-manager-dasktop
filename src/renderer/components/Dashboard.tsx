import React, { useState, useEffect } from "react";
import { Task, MissionStats } from "../../types";
import TaskList from "./TaskList";
import VirtualizedTaskList from "./VirtualizedTaskList";
import DailyMissionBriefing from "./DailyMissionBriefing";
import MissionMode from "./MissionMode";
import ProcrastinationRadar from "./ProcrastinationRadar";
import MissionStatsDisplay from "./MissionStatsDisplay";
import "../styles/Dashboard.css";
import "../styles/theme.css";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface DashboardProps {
  tasks: Task[];
  loading: boolean;
  onTaskUpdate: () => void;
  onCreateTask?: () => void; // optional callback to switch view
}

type ViewMode = "today" | "week" | "month" | "queue";
type FilterStatus = "all" | "pending" | "in_progress" | "completed" | "missed";
type FilterPriority = "all" | "low" | "high" | "higher";

const Dashboard: React.FC<DashboardProps> = ({
  tasks,
  loading,
  onTaskUpdate,
  onCreateTask,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("today");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [showDailyBriefing, setShowDailyBriefing] = useState(false);
  const [missionModeTask, setMissionModeTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "radar" | "stats">(
    "tasks"
  );
  const [missionStats, setMissionStats] = useState<MissionStats>({
    totalXP: 0,
    currentStreak: 0,
    longestStreak: 0,
    weeklyStability: 75,
    missionSuccessRate: 0,
  });

  useEffect(() => {
    filterTasks();
    calculateMissionStats();
    checkDailyBriefing();
  }, [tasks, viewMode, filterStatus, filterPriority, searchQuery]);

  const checkDailyBriefing = () => {
    const lastShown = localStorage.getItem("lastBriefingDate");
    const today = new Date().toISOString().split("T")[0];
    if (lastShown !== today && tasks.length > 0) {
      setShowDailyBriefing(true);
      localStorage.setItem("lastBriefingDate", today);
    }
  };

  const calculateMissionStats = () => {
    const completedTasks = tasks.filter((t) => t.status === "completed");
    const totalXP = completedTasks.reduce(
      (sum, t) => sum + (t.xpValue || 10),
      0
    );

    // Calculate streak
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];
      const hasTaskOnDate = completedTasks.some((t) =>
        t.completedAt?.startsWith(dateStr)
      );

      if (hasTaskOnDate) {
        tempStreak++;
        if (i === 0 || currentStreak > 0) currentStreak++;
      } else {
        if (tempStreak > longestStreak) longestStreak = tempStreak;
        if (i === 0) currentStreak = 0;
        tempStreak = 0;
      }
    }

    // Success rate
    const totalTasks = tasks.length;
    const successRate =
      totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

    setMissionStats({
      totalXP,
      currentStreak,
      longestStreak: Math.max(longestStreak, tempStreak),
      weeklyStability: 75, // Could calculate based on consistency
      missionSuccessRate: successRate,
    });
  };

  const filterTasks = async () => {
    let filtered = [...tasks];

    // View mode filter
    if (viewMode === "today") {
      const today = new Date().toISOString().split("T")[0];
      filtered = filtered.filter(
        (task) =>
          task.createdAt.startsWith(today) ||
          (task.deadline && task.deadline.startsWith(today))
      );
    } else if (viewMode === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((task) => new Date(task.createdAt) >= weekAgo);
    } else if (viewMode === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(
        (task) => new Date(task.createdAt) >= monthAgo
      );
    } else if (viewMode === "queue") {
      const queue = await window.api.getPriorityQueue();
      filtered = queue;
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((task) => task.status === filterStatus);
    }

    // Priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter((task) => task.priority === filterPriority);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query)
      );
    }

    setFilteredTasks(filtered);
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    missed: tasks.filter((t) => t.status === "missed").length,
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in" aria-busy="true">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-lg bg-[var(--bg-card)] relative overflow-hidden skeleton"
            >
              <div className="absolute inset-0 shimmer" />
            </div>
          ))}
        </div>
        <div className="h-24 rounded-lg bg-[var(--bg-card)] relative overflow-hidden skeleton">
          <div className="absolute inset-0 shimmer" />
        </div>
        <div className="h-64 rounded-lg bg-[var(--bg-card)] relative overflow-hidden skeleton">
          <div className="absolute inset-0 shimmer" />
        </div>
      </div>
    );
  }

  if (!loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-16 text-center animate-fade-in">
        <div className="w-40 h-40 rounded-full bg-[var(--bg-card)] flex items-center justify-center shadow-inner mb-8 relative overflow-hidden">
          <div className="absolute inset-0 shimmer" />
          <span className="text-5xl">📝</span>
        </div>
        <h2 className="text-2xl font-semibold text-[color:var(--text-primary)] mb-3">
          No tasks yet
        </h2>
        <p className="text-[color:var(--text-secondary)] max-w-md mb-6">
          Start by creating your first task. Organize your day, set priorities,
          and track progress effortlessly.
        </p>
        {onCreateTask && (
          <Button onClick={onCreateTask} className="px-6 py-3">
            ➕ Create Task
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard space-y-6">
      {/* Daily Mission Briefing Modal */}
      {showDailyBriefing && (
        <DailyMissionBriefing
          tasks={tasks}
          onTaskClick={(task) => {
            setShowDailyBriefing(false);
            // Could navigate to task or start mission mode
          }}
          onDismiss={() => setShowDailyBriefing(false)}
        />
      )}

      {/* Mission Mode Overlay */}
      {missionModeTask && (
        <MissionMode
          task={missionModeTask}
          onComplete={() => {
            setMissionModeTask(null);
            onTaskUpdate();
          }}
          onExit={() => setMissionModeTask(null)}
        />
      )}

      {/* Header with Mission Control Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[color:var(--text-primary)] flex items-center gap-3">
          <span className="text-4xl">🚀</span>
          Mission Control
        </h1>
        <Button
          onClick={() => setShowDailyBriefing(true)}
          variant="outline"
          className="px-4"
        >
          📡 Daily Briefing
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-[var(--text-muted)] hover:shadow-lg transition-all duration-300 animate-fade-in">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[color:var(--text-muted)] uppercase">
                  Total
                </p>
                <p className="text-3xl font-bold text-[color:var(--text-primary)] mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="text-3xl opacity-20">📊</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[var(--warning)] hover:shadow-lg transition-all duration-200 animate-fade-in">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[color:var(--text-muted)] uppercase">
                  Pending
                </p>
                <p className="text-3xl font-bold text-[color:var(--warning)] mt-1">
                  {stats.pending}
                </p>
              </div>
              <div className="text-3xl opacity-20">⏳</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[var(--info)] hover:shadow-lg transition-all duration-200 animate-fade-in">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[color:var(--text-muted)] uppercase">
                  In Progress
                </p>
                <p className="text-3xl font-bold text-[color:var(--info)] mt-1">
                  {stats.inProgress}
                </p>
              </div>
              <div className="text-3xl opacity-20">🚀</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[var(--success)] hover:shadow-lg transition-all duration-200 animate-fade-in">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[color:var(--text-muted)] uppercase">
                  Completed
                </p>
                <p className="text-3xl font-bold text-[color:var(--success)] mt-1">
                  {stats.completed}
                </p>
              </div>
              <div className="text-3xl opacity-20">✅</div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-[var(--error)] hover:shadow-lg transition-all duration-200 animate-fade-in">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-[color:var(--text-muted)] uppercase">
                  Missed
                </p>
                <p className="text-3xl font-bold text-[color:var(--error)] mt-1">
                  {stats.missed}
                </p>
              </div>
              <div className="text-3xl opacity-20">❌</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & View Controls */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-[color:var(--text-muted)]/20 pb-2">
              <Button
                variant={activeTab === "tasks" ? undefined : "outline"}
                onClick={() => setActiveTab("tasks")}
                size="sm"
              >
                📋 Tasks
              </Button>
              <Button
                variant={activeTab === "radar" ? undefined : "outline"}
                onClick={() => setActiveTab("radar")}
                size="sm"
              >
                📡 Radar
              </Button>
              <Button
                variant={activeTab === "stats" ? undefined : "outline"}
                onClick={() => setActiveTab("stats")}
                size="sm"
              >
                📊 Stats
              </Button>
            </div>

            {/* Only show filters on tasks tab */}
            {activeTab === "tasks" && (
              <div className="flex flex-col lg:flex-row gap-4">
                {/* View Mode Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={viewMode === "today" ? undefined : "outline"}
                    onClick={() => setViewMode("today")}
                    size="sm"
                    className="transition-all duration-200 hover:scale-105"
                  >
                    📅 Today
                  </Button>
                  <Button
                    variant={viewMode === "week" ? undefined : "outline"}
                    onClick={() => setViewMode("week")}
                    size="sm"
                    className="transition-all duration-200 hover:scale-105"
                  >
                    📆 Week
                  </Button>
                  <Button
                    variant={viewMode === "month" ? undefined : "outline"}
                    onClick={() => setViewMode("month")}
                    size="sm"
                    className="transition-all duration-200 hover:scale-105"
                  >
                    🗓️ Month
                  </Button>
                  <Button
                    variant={viewMode === "queue" ? undefined : "outline"}
                    onClick={() => setViewMode("queue")}
                    size="sm"
                    className="transition-all duration-200 hover:scale-105"
                  >
                    🎯 Priority Queue
                  </Button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 flex-wrap lg:ml-auto">
                  <Select
                    value={filterStatus}
                    onChange={(e) =>
                      setFilterStatus(e.target.value as FilterStatus)
                    }
                    className="text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="missed">Missed</option>
                  </Select>
                  <Select
                    value={filterPriority}
                    onChange={(e) =>
                      setFilterPriority(e.target.value as FilterPriority)
                    }
                    className="text-sm"
                  >
                    <option value="all">All Priorities</option>
                    <option value="higher">Higher</option>
                    <option value="high">High</option>
                    <option value="low">Low</option>
                  </Select>
                  <Input
                    placeholder="🔍 Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full lg:w-64"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === "tasks" && (
        <>
          {/* Task List */}
          {filteredTasks.length > 100 ? (
            <VirtualizedTaskList
              tasks={filteredTasks}
              onTaskUpdate={onTaskUpdate}
            />
          ) : (
            <TaskList tasks={filteredTasks} onTaskUpdate={onTaskUpdate} />
          )}
        </>
      )}

      {activeTab === "radar" && <ProcrastinationRadar tasks={tasks} />}

      {activeTab === "stats" && <MissionStatsDisplay stats={missionStats} />}
    </div>
  );
};

export default Dashboard;
