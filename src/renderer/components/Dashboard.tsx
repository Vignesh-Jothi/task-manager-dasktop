import React, { useState, useEffect } from "react";
import { Task } from "../../types";
import TaskList from "./TaskList";
import VirtualizedTaskList from "./VirtualizedTaskList";
import "../styles/Dashboard.css";
import "../styles/theme.css";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Select } from "./ui/select";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface DashboardProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

type ViewMode = "today" | "week" | "month" | "queue";
type FilterStatus = "all" | "pending" | "in_progress" | "completed" | "missed";
type FilterPriority = "all" | "low" | "high" | "higher";

const Dashboard: React.FC<DashboardProps> = ({ tasks, onTaskUpdate }) => {
  const [viewMode, setViewMode] = useState<ViewMode>("today");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterPriority, setFilterPriority] = useState<FilterPriority>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  useEffect(() => {
    filterTasks();
  }, [tasks, viewMode, filterStatus, filterPriority, searchQuery]);

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

  return (
    <div className="dashboard space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-[var(--text-muted)]">
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
        <Card className="border-l-4 border-l-[var(--warning)]">
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
        <Card className="border-l-4 border-l-[var(--info)]">
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
        <Card className="border-l-4 border-l-[var(--success)]">
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
        <Card className="border-l-4 border-l-[var(--error)]">
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
          <div className="flex flex-col lg:flex-row gap-4">
            {/* View Mode Buttons */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={viewMode === "today" ? undefined : "outline"}
                onClick={() => setViewMode("today")}
                size="sm"
              >
                📅 Today
              </Button>
              <Button
                variant={viewMode === "week" ? undefined : "outline"}
                onClick={() => setViewMode("week")}
                size="sm"
              >
                📆 Week
              </Button>
              <Button
                variant={viewMode === "month" ? undefined : "outline"}
                onClick={() => setViewMode("month")}
                size="sm"
              >
                🗓️ Month
              </Button>
              <Button
                variant={viewMode === "queue" ? undefined : "outline"}
                onClick={() => setViewMode("queue")}
                size="sm"
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
        </CardContent>
      </Card>

      {/* Task List */}
      {filteredTasks.length > 100 ? (
        <VirtualizedTaskList
          tasks={filteredTasks}
          onTaskUpdate={onTaskUpdate}
        />
      ) : (
        <TaskList tasks={filteredTasks} onTaskUpdate={onTaskUpdate} />
      )}
    </div>
  );
};

export default Dashboard;
