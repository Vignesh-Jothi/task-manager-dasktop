import React, { useState } from "react";
import { Task, TaskStatus, Priority, TaskType } from "../../types";
import "../styles/TaskItem.css";

interface TaskItemProps {
  task: Task;
  onTaskUpdate: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onTaskUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Edit form state
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editType, setEditType] = useState<TaskType>(task.type);
  const [editDeadline, setEditDeadline] = useState(
    task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ""
  );

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsUpdating(true);
    try {
      if (newStatus === "completed") {
        await window.api.completeTask(task.id);
        // Show celebration animation
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
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

  const handleEdit = () => {
    setIsEditing(true);
    setIsExpanded(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority);
    setEditType(task.type);
    setEditDeadline(
      task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ""
    );
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim() || !editDescription.trim()) {
      alert("Title and description are required");
      return;
    }

    setIsUpdating(true);
    try {
      await window.api.updateTask(task.id, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        type: editType,
        deadline: editDeadline || undefined,
      });
      setIsEditing(false);
      onTaskUpdate();
    } catch (error) {
      console.error("Failed to update task:", error);
      alert("Failed to update task");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsUpdating(true);
    try {
      const success = await window.api.deleteTask(task.id);
      if (success) {
        onTaskUpdate();
      } else {
        alert("Failed to delete task");
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task");
    } finally {
      setIsUpdating(false);
      setShowDeleteConfirm(false);
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
      <div
        className="task-header"
        onClick={() => !isEditing && setIsExpanded(!isExpanded)}
      >
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
          <div className="task-header-actions">
            {task.status !== "completed" && (
              <>
                <button
                  className="icon-btn edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit();
                  }}
                  title="Edit task"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  className="icon-btn delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  title="Delete task"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </>
            )}
            {task.status === "completed" && (
              <span className="completed-badge" title="Task completed">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </span>
            )}
            <span className="expand-icon">{isExpanded ? "▼" : "▶"}</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="task-details">
          {isEditing ? (
            <div className="task-edit-form">
              <h4>Edit Task</h4>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter task title"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Enter task description"
                  rows={4}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) =>
                      setEditPriority(e.target.value as Priority)
                    }
                  >
                    <option value="low">Low</option>
                    <option value="high">High</option>
                    <option value="higher">Higher</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as TaskType)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Deadline (Optional)</label>
                <input
                  type="datetime-local"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                />
              </div>

              <div className="edit-actions">
                <button
                  onClick={handleSaveEdit}
                  disabled={isUpdating}
                  className="btn-save"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="delete-confirm-overlay">
          <div className="delete-confirm-modal">
            <h3>Delete Task?</h3>
            <p>Are you sure you want to delete "{task.title}"?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="confirm-actions">
              <button
                onClick={handleDelete}
                disabled={isUpdating}
                className="btn-delete-confirm"
              >
                {isUpdating ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isUpdating}
                className="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-animation">
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="confetti"></div>
            <div className="success-icon">
              <svg
                width="80"
                height="80"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4caf50"
                strokeWidth="2"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2>🎉 Task Completed!</h2>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
