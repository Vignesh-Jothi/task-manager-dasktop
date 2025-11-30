export type Priority = "low" | "high" | "higher";
export type TaskStatus = "pending" | "in_progress" | "completed" | "missed";
export type TaskType = "daily" | "deadline";

// Mission Control: Orbit Levels (replaces simple priorities)
export type OrbitLevel = "low-orbit" | "mid-orbit" | "deep-space";

export interface OrbitMetadata {
  level: OrbitLevel;
  decayRate: number; // how fast it "drifts toward the sun" (deadline pressure)
  visualDistance: number; // for UI positioning/animation
}

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

  // Mission Control features
  orbit?: OrbitMetadata; // orbit level and decay info
  snoozeCount?: number; // for procrastination radar
  rescheduleCount?: number; // for procrastination radar
  abandonCount?: number; // times moved to backlog
  gravity?: number; // weight/urgency score (0-100)
  xpValue?: number; // XP awarded on completion
  isBlueprint?: boolean; // template task
  blueprintId?: string; // if spawned from template
  missionMode?: boolean; // currently in focus mode
  abortProtected?: boolean; // survives "Abort Mission" mode
  projectId?: string; // associated project (optional)
}

export interface TaskLog {
  timestamp: string;
  taskId: string; // synthetic IDs allowed for system events e.g. 'summary'
  action:
    | "created"
    | "updated"
    | "completed"
    | "missed"
    | "deleted"
    | "email_sent"
    | "email_error";
  previousValue?: Partial<Task> | Record<string, any>;
  newValue?: Partial<Task> | Record<string, any>;
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
  missionControl?: {
    enableDailyBriefing: boolean;
    enableMissionMode: boolean;
    enableCaptainsLog: boolean;
    enableProcrastinationRadar: boolean;
    enableXPSystem: boolean;
    enableAbortMode: boolean;
    enableAICopilot: boolean;
    missionModeBreakInterval?: number; // minutes
  };
}

// Mission Analytics
export interface ProcrastinationPattern {
  dayOfWeek: number; // 0-6
  orbitLevel: OrbitLevel;
  avgSnoozeCount: number;
  avgRescheduleCount: number;
  suggestion?: string;
}

export interface MissionStats {
  totalXP: number;
  currentStreak: number;
  longestStreak: number;
  weeklyStability: number; // 0-100 score
  missionSuccessRate: number; // completion %
  lastMissionDate?: string;
}

// Daily Mission Briefing
export interface DailyBriefing {
  date: string;
  topPriorities: Task[]; // max 3
  overdueTasks: Task[];
  optionalQuests: Task[]; // low-priority side tasks
  motivationalQuote?: string;
  weatherForecast?: "smooth" | "turbulent" | "critical"; // day difficulty
}

// Task Blueprint (templates)
export interface TaskBlueprint {
  id: string;
  name: string;
  description: string;
  orbit: OrbitLevel;
  durationMinutes?: number;
  schedule?: {
    frequency: "daily" | "weekly" | "monthly";
    dayOfWeek?: number; // for weekly
    dayOfMonth?: number; // for monthly
    time?: string; // HH:mm
  };
  template: Partial<Task>;
}

// AI Copilot suggestion
export interface CopilotSuggestion {
  id: string;
  type: "break-task" | "overload-warning" | "deadline-risk" | "pattern-insight";
  taskId?: string;
  message: string;
  severity: "info" | "warning" | "critical";
  timestamp: string;
  dismissed?: boolean;
}

export interface TaskIndex {
  tasks: { [id: string]: Task };
  lastUpdated: string;
}

// Projects
export interface Project {
  id: string;
  name: string;
  color?: string; // optional accent color
  createdAt: string;
  archived?: boolean;
}

export interface ProjectIndex {
  projects: { [id: string]: Project };
  lastUpdated: string;
}
