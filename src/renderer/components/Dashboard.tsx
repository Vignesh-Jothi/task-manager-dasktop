import React, { useState, useEffect } from "react";
import { Task } from "../../types";
import TaskList from "./TaskList";
import "../styles/Dashboard.css";

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
    <div className="dashboard">
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number pending">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <p className="stat-number in-progress">{stats.inProgress}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p className="stat-number completed">{stats.completed}</p>
        </div>
        <div className="stat-card">
          <h3>Missed</h3>
          <p className="stat-number missed">{stats.missed}</p>
        </div>
      </div>

      <div className="dashboard-controls">
        <div className="view-modes">
          <button
            className={viewMode === "today" ? "active" : ""}
            onClick={() => setViewMode("today")}
          >
            Today
          </button>
          <button
            className={viewMode === "week" ? "active" : ""}
            onClick={() => setViewMode("week")}
          >
            Week
          </button>
          <button
            className={viewMode === "month" ? "active" : ""}
            onClick={() => setViewMode("month")}
          >
            Month
          </button>
          <button
            className={viewMode === "queue" ? "active" : ""}
            onClick={() => setViewMode("queue")}
          >
            Priority Queue
          </button>
        </div>

        <div className="filters">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) =>
              setFilterPriority(e.target.value as FilterPriority)
            }
          >
            <option value="all">All Priorities</option>
            <option value="higher">Higher</option>
            <option value="high">High</option>
            <option value="low">Low</option>
          </select>

          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <TaskList tasks={filteredTasks} onTaskUpdate={onTaskUpdate} />
    </div>
  );
};

export default Dashboard;
