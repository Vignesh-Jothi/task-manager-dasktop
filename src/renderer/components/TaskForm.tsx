import React, { useState, useEffect } from "react";
import { Priority, TaskType, Project } from "../../types";
import { Button } from "./ui/button";
import { Clock } from "lucide-react";
import "../styles/TaskForm.css";

interface TaskFormProps {
  onTaskCreated: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("low");
  const [type, setType] = useState<TaskType>("daily");
  const [deadline, setDeadline] = useState("");
  const [durationMinutes, setDurationMinutes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string>("");

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const items = await (window as any).api.getAllProjects();
        setProjects(items);
        // Auto-select first or General
        const general = items.find(
          (p: Project) => p.name.toLowerCase() === "general"
        );
        if (general) setProjectId(general.id);
        else if (items.length) setProjectId(items[0].id);
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };
    loadProjects();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const task = await (window as any).api.createTask(
        title,
        description,
        priority,
        type,
        deadline || undefined,
        projectId || undefined
      );

      // Optionally set durationMinutes if provided
      if (durationMinutes.trim()) {
        const mins = parseInt(durationMinutes, 10);
        if (!isNaN(mins) && mins > 0) {
          await window.api.updateTask(task.id, { durationMinutes: mins });
        }
      }

      // Reset form
      setTitle("");
      setDescription("");
      setPriority("low");
      setType("daily");
      setDeadline("");
      setDurationMinutes("");
      // keep project selection

      onTaskCreated();
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="task-form-container">
      <h2>Create New Task</h2>
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="project">Project</label>
          <select
            id="project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={!projects.length}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.archived ? " (Archived)" : ""}
              </option>
            ))}
            {!projects.length && <option value="">No projects</option>}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description"
            rows={5}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="low">Low</option>
              <option value="high">High</option>
              <option value="higher">Higher</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as TaskType)}
            >
              <option value="daily">Daily</option>
              <option value="deadline">Deadline-based</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="deadline">Deadline (optional)</label>
          <input
            type="datetime-local"
            id="deadline"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="duration" className="flex items-center gap-2">
            <Clock size={16} /> Timely finish duration (minutes, optional)
          </label>
          <input
            type="number"
            id="duration"
            min={1}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            placeholder="e.g. 25 for a focus session"
            className="border rounded-md px-3 py-2"
          />
        </div>

        <div className="form-actions">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>

      <div className="keyboard-shortcuts">
        <h3>Keyboard Shortcuts</h3>
        <ul>
          <li>
            <kbd>Ctrl/Cmd + N</kbd> - Create new task
          </li>
          <li>
            <kbd>Ctrl/Cmd + S</kbd> - Save task
          </li>
          <li>
            <kbd>Esc</kbd> - Cancel
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TaskForm;
