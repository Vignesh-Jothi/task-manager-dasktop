import React from "react";
import { Task } from "@types";
import TaskItem from "./TaskItem";
import "../../../styles/TaskList.css";
import "../../../styles/theme.css";

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskUpdate }) => {
  if (tasks.length === 0) {
    return (
      <div className="task-list-empty text-[color:var(--text-secondary)]">
        <p>No tasks found</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onTaskUpdate={onTaskUpdate} />
      ))}
    </div>
  );
};

export default TaskList;
