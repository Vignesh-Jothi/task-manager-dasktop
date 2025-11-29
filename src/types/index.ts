export type Priority = "low" | "high" | "higher";
export type TaskStatus = "pending" | "in_progress" | "completed" | "missed";
export type TaskType = "daily" | "deadline";

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  type: TaskType;
  deadline?: string; // ISO date string
  createdAt: string;
  completedAt?: string;
  updatedAt?: string;
  jiraIssueKey?: string;
  // Timely finish feature
  durationMinutes?: number; // optional duration for task session
  startedAt?: string; // when user starts the task (in_progress)
}

export interface TaskLog {
  timestamp: string;
  taskId: string;
  action: "created" | "updated" | "completed" | "missed" | "deleted";
  previousValue?: Partial<Task>;
  newValue?: Partial<Task>;
}

export interface AppSettings {
  jira?: {
    enabled: boolean;
    domain: string;
    email: string;
    apiToken: string;
    projectKey: string;
    autoSync: boolean;
  };
  github?: {
    enabled: boolean;
    token: string;
    repo: string;
    autoSync: boolean;
    syncInterval: "daily" | "manual";
  };
  notifications?: {
    enabled: boolean;
    intervals: number[]; // minutes before deadline
  };
}

export interface TaskIndex {
  tasks: { [id: string]: Task };
  lastUpdated: string;
}
