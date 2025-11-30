import React, { useState } from "react";
import { Task, TaskStatus, Priority, TaskType } from "@types";
import "../../../styles/TaskItem.css";
import "../../../styles/theme.css";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Badge } from "@ui/badge";
import { Dialog } from "@ui/dialog";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Textarea } from "@ui/textarea";
import { Select } from "@ui/select";

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

  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editPriority, setEditPriority] = useState<Priority>(task.priority);
  const [editType, setEditType] = useState<TaskType>(task.type);
  const [editDeadline, setEditDeadline] = useState(
    task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ""
  );
  const [editDuration, setEditDuration] = useState<string>(
    task.durationMinutes ? String(task.durationMinutes) : ""
  );

  const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleString() : "N/A";

  const isOverdue =
    !!task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== "completed";

  const canModifyCompleted = () => {
    if (task.status !== "completed") return true;
    if (!task.completedAt) return true;
    const completedAtMs = new Date(task.completedAt).getTime();
    return completedAtMs > Date.now() - 24 * 60 * 60 * 1000;
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsUpdating(true);
    try {
      if (newStatus === "completed") {
        await window.api.completeTask(task.id);
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

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditPriority(task.priority);
    setEditType(task.type);
    setEditDeadline(
      task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : ""
    );
    setEditDuration(task.durationMinutes ? String(task.durationMinutes) : "");
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
        durationMinutes:
          editDuration.trim() && parseInt(editDuration, 10) > 0
            ? parseInt(editDuration, 10)
            : undefined,
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

  const getPriorityClass = (priority: string) => `priority-${priority}`;
  const getStatusClass = (status: string) =>
    `status-${status.replace("_", "-")}`;

  return (
    <Card
      className={`task-item ${getStatusClass(task.status)} ${
        isOverdue ? "overdue" : ""
      }`}
    >
      <CardHeader onClick={() => !isEditing && setIsExpanded(!isExpanded)}>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{task.title}</CardTitle>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className={getPriorityClass(task.priority)}>
                {task.priority.toUpperCase()}
              </Badge>
              <Badge>{task.status.replace("_", " ").toUpperCase()}</Badge>
              <Badge>{task.type}</Badge>
              {task.jiraIssueKey && <Badge>{task.jiraIssueKey}</Badge>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {task.deadline && (
              <span
                className={`text-sm ${
                  isOverdue ? "text-red-600" : "text-gray-600"
                }`}
              >
                📅 {formatDate(task.deadline)}
              </span>
            )}
            {canModifyCompleted() ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                    setIsExpanded(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                >
                  Delete
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange("completed");
                  }}
                  variant="outline"
                  disabled={task.status === "completed"}
                >
                  Complete
                </Button>
              </div>
            ) : (
              <Badge variant="success">Completed</Badge>
            )}
            <span className="text-sm">{isExpanded ? "▼" : "▶"}</span>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <h4 className="text-base font-semibold">Edit Task</h4>
              <div className="space-y-2">
                <label className="text-sm">Title *</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter task title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Description *</label>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Enter task description"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm">Priority</label>
                  <Select
                    value={editPriority}
                    onChange={(e) =>
                      setEditPriority(e.target.value as Priority)
                    }
                  >
                    <option value="low">Low</option>
                    <option value="high">High</option>
                    <option value="higher">Higher</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm">Type</label>
                  <Select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as TaskType)}
                  >
                    <option value="daily">Daily</option>
                    <option value="deadline">Deadline-based</option>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm">Deadline (Optional)</label>
                <Input
                  type="datetime-local"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm">
                  Timely finish duration (minutes, optional)
                </label>
                <Input
                  type="number"
                  min={1}
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  placeholder="e.g. 25"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleSaveEdit} disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h4 className="text-base font-semibold">Description</h4>
                <p className="text-sm text-gray-700">{task.description}</p>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <strong>Created:</strong> {formatDate(task.createdAt)}
                </div>
                {task.completedAt && (
                  <div>
                    <strong>Completed:</strong> {formatDate(task.completedAt)}
                  </div>
                )}
                {task.updatedAt && (
                  <div>
                    <strong>Updated:</strong> {formatDate(task.updatedAt)}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <h4 className="text-base font-semibold">Change Status</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleStatusChange("pending")}
                    disabled={isUpdating || task.status === "pending"}
                  >
                    Pending
                  </Button>
                  <Button
                    onClick={async () => {
                      setIsUpdating(true);
                      try {
                        await window.api.startTask(task.id);
                        onTaskUpdate();
                      } catch (e) {
                        console.error(e);
                      } finally {
                        setIsUpdating(false);
                      }
                    }}
                    disabled={isUpdating || task.status === "in_progress"}
                  >
                    Start
                  </Button>
                  <Button
                    onClick={() => handleStatusChange("completed")}
                    disabled={isUpdating || task.status === "completed"}
                  >
                    Complete
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}

      <Dialog
        open={showDeleteConfirm}
        onOpenChange={(open) => setShowDeleteConfirm(open)}
        title="Delete Task?"
        description="This action cannot be undone."
      >
        <p>Are you sure you want to delete "{task.title}"?</p>
        <div className="mt-4 flex items-center gap-2">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isUpdating}
          >
            {isUpdating ? "Deleting..." : "Delete"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowDeleteConfirm(false)}
            disabled={isUpdating}
          >
            Cancel
          </Button>
        </div>
      </Dialog>

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
    </Card>
  );
};

export default TaskItem;
