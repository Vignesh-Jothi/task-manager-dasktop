import React from "react";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { Task } from "../../types";
import TaskItem from "./TaskItem";
import "../styles/TaskList.css";
import "../styles/theme.css";

interface VirtualizedTaskListProps {
  tasks: Task[];
  onTaskUpdate: () => void;
  itemHeight?: number;
}

const Row: React.FC<{
  data: { tasks: Task[]; onTaskUpdate: () => void };
  index: number;
  style: React.CSSProperties;
}> = ({ data, index, style }) => {
  const task = data.tasks[index];
  return (
    <div style={style}>
      <TaskItem task={task} onTaskUpdate={data.onTaskUpdate} />
    </div>
  );
};

const VirtualizedTaskList: React.FC<VirtualizedTaskListProps> = ({
  tasks,
  onTaskUpdate,
  itemHeight = 120,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="task-list-empty text-[color:var(--text-secondary)]">
        <p>No tasks found</p>
      </div>
    );
  }

  return (
    <div className="task-list" style={{ height: "70vh" }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            itemCount={tasks.length}
            itemSize={itemHeight}
            itemData={{ tasks, onTaskUpdate }}
          >
            {({ index, style, data }: ListChildComponentProps) => (
              <Row index={index} style={style} data={data as any} />
            )}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};

export default VirtualizedTaskList;
