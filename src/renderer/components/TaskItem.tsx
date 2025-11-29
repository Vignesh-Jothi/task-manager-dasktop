import React, { useState } from "react";
import { Task, TaskStatus } from "../../types";
import "../styles/TaskItem.css";

interface TaskItemProps {
  task: Task;
  onTaskUpdate: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onTaskUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsUpdating(true);
    try {
      if (newStatus === "completed") {
        await window.api.completeTask(task.id);
      } else {
        await window.api.updateTask(task.id, { status: newStatus });
      }
      onTaskUpdate();
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getPriorityClass = (priority: string) => {
    return `priority-${priority}`;
  };

  const getStatusClass = (status: string) => {
    return `status-${status.replace("_", "-")}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  const isOverdue =
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== "completed";

  return (
    <div
      className={`task-item ${getStatusClass(task.status)} ${
        isOverdue ? "overdue" : ""
      }`}
    >
      <div className="task-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="task-title-section">
          <h3>{task.title}</h3>
          <div className="task-badges">
            <span
              className={`badge priority ${getPriorityClass(task.priority)}`}
            >
              {task.priority.toUpperCase()}
            </span>
            <span className={`badge status ${getStatusClass(task.status)}`}>
              {task.status.replace("_", " ").toUpperCase()}
            </span>
            <span className="badge type">{task.type}</span>
            {task.jiraIssueKey && (
              <span className="badge jira">{task.jiraIssueKey}</span>
            )}
          </div>
        </div>
        <div className="task-quick-info">
          {task.deadline && (
            <span className={`deadline ${isOverdue ? "overdue-text" : ""}`}>
              📅 {formatDate(task.deadline)}
            </span>
          )}
          <span className="expand-icon">{isExpanded ? "▼" : "▶"}</span>
        </div>
      </div>

      {isExpanded && (
        <div className="task-details">
          <div className="task-description">
            <h4>Description</h4>
            <p>{task.description}</p>
          </div>

          <div className="task-metadata">
            <div className="metadata-item">
              <strong>Created:</strong> {formatDate(task.createdAt)}
            </div>
            {task.completedAt && (
              <div className="metadata-item">
                <strong>Completed:</strong> {formatDate(task.completedAt)}
              </div>
            )}
            {task.updatedAt && (
              <div className="metadata-item">
                <strong>Updated:</strong> {formatDate(task.updatedAt)}
              </div>
            )}
          </div>

          <div className="task-actions">
            <h4>Change Status</h4>
            <div className="status-buttons">
              <button
                onClick={() => handleStatusChange("pending")}
                disabled={isUpdating || task.status === "pending"}
                className="status-btn pending"
              >
                Pending
              </button>
              <button
                onClick={() => handleStatusChange("in_progress")}
                disabled={isUpdating || task.status === "in_progress"}
                className="status-btn in-progress"
              >
                In Progress
              </button>
              <button
                onClick={() => handleStatusChange("completed")}
                disabled={isUpdating || task.status === "completed"}
                className="status-btn completed"
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
