# Mission Control Integration Examples

This document shows how to integrate mission-control features into existing components.

## Adding Mission Mode to Task Items

### In TaskItem.tsx (or TaskList.tsx)

```typescript
import { useState } from "react";
import MissionMode from "./MissionMode";

// Add state for mission mode
const [missionModeTask, setMissionModeTask] = useState<Task | null>(null);

// Add button to task item
<Button
  onClick={() => setMissionModeTask(task)}
  size="sm"
  variant="outline"
  className="gap-2"
>
  🎯 Mission Mode
</Button>

// Add modal overlay
{missionModeTask && (
  <MissionMode
    task={missionModeTask}
    onComplete={() => {
      setMissionModeTask(null);
      onTaskUpdate();
    }}
    onExit={() => setMissionModeTask(null)}
  />
)}
```

## Updating TaskService for Orbit Levels

### In TaskService.ts

```typescript
async createTask(taskData: Partial<Task>): Promise<Task> {
  const task: Task = {
    id: crypto.randomUUID(),
    ...taskData,
    createdAt: new Date().toISOString(),
    
    // Calculate orbit level based on priority
    orbit: this.calculateOrbitLevel(taskData),
    
    // Calculate initial gravity
    gravity: this.calculateGravity(taskData),
    
    // Set XP value based on orbit and duration
    xpValue: this.calculateXP(taskData),
    
    // Initialize procrastination tracking
    snoozeCount: 0,
    rescheduleCount: 0,
    abandonCount: 0,
  };
  
  // Save task...
  return task;
}

private calculateOrbitLevel(taskData: Partial<Task>): OrbitMetadata {
  const duration = taskData.durationMinutes || 30;
  
  if (duration > 120 || taskData.priority === "higher") {
    return {
      level: "deep-space",
      decayRate: 0.8,
      visualDistance: 100,
    };
  } else if (duration > 60 || taskData.priority === "high") {
    return {
      level: "mid-orbit",
      decayRate: 0.5,
      visualDistance: 50,
    };
  } else {
    return {
      level: "low-orbit",
      decayRate: 0.2,
      visualDistance: 20,
    };
  }
}

private calculateGravity(taskData: Partial<Task>): number {
  let gravity = 30; // base
  
  // Increase gravity based on deadline proximity
  if (taskData.deadline) {
    const daysUntil = Math.floor(
      (new Date(taskData.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntil <= 1) gravity += 40;
    else if (daysUntil <= 3) gravity += 25;
    else if (daysUntil <= 7) gravity += 15;
  }
  
  // Increase based on orbit level
  if (taskData.priority === "higher") gravity += 20;
  else if (taskData.priority === "high") gravity += 10;
  
  return Math.min(gravity, 100);
}

private calculateXP(taskData: Partial<Task>): number {
  const baseLow = 10;
  const baseMid = 20;
  const baseDeep = 40;
  
  const duration = taskData.durationMinutes || 30;
  const durationBonus = Math.floor(duration / 30) * 5;
  
  if (taskData.priority === "higher") return baseDeep + durationBonus;
  if (taskData.priority === "high") return baseMid + durationBonus;
  return baseLow + durationBonus;
}
```

## Adding Mission Log Integration

### In IPC handlers.ts

```typescript
import MissionLogService from '../services/MissionLogService';

const missionLogService = new MissionLogService();
await missionLogService.initialize();

// When task is completed
ipcMain.handle("update-task", async (event, taskId: string, updates: Partial<Task>) => {
  const task = await taskService.updateTask(taskId, updates);
  
  // If task was just completed, write to mission log
  if (updates.status === "completed" && updates.completedAt) {
    await missionLogService.logTaskCompletion(task);
  }
  
  return task;
});

// Expose mission log functions to renderer
ipcMain.handle("get-mission-log", async (event, date: string) => {
  return await missionLogService.getLogForDate(new Date(date));
});

ipcMain.handle("search-mission-logs", async (event, searchTerm: string) => {
  return await missionLogService.searchLogs(searchTerm);
});
```

### In preload.ts

```typescript
contextBridge.exposeInMainWorld("api", {
  // ... existing methods
  
  getMissionLog: (date: string) => ipcRenderer.invoke("get-mission-log", date),
  searchMissionLogs: (searchTerm: string) => ipcRenderer.invoke("search-mission-logs", searchTerm),
});
```

## Integrating Daily Briefing with App Lifecycle

### In App.tsx

```typescript
import DailyMissionBriefing from "./components/DailyMissionBriefing";

const [showDailyBriefing, setShowDailyBriefing] = useState(false);

useEffect(() => {
  // Check if briefing was shown today
  const lastShown = localStorage.getItem("lastBriefingDate");
  const today = new Date().toISOString().split("T")[0];
  
  if (lastShown !== today && tasks.length > 0) {
    setShowDailyBriefing(true);
    localStorage.setItem("lastBriefingDate", today);
  }
}, [tasks]);

// In render
{showDailyBriefing && (
  <DailyMissionBriefing
    tasks={tasks}
    onTaskClick={(task) => {
      // Navigate to task or enter mission mode
      setShowDailyBriefing(false);
    }}
    onDismiss={() => setShowDailyBriefing(false)}
  />
)}
```

## Adding Abort Mission Mode Toggle

### In Dashboard.tsx

```typescript
import AbortMissionMode from "./AbortMissionMode";

const [abortModeActive, setAbortModeActive] = useState(false);
const [displayTasks, setDisplayTasks] = useState<Task[]>(tasks);

// Add toggle button
<Button
  onClick={() => setAbortModeActive(!abortModeActive)}
  variant={abortModeActive ? "destructive" : "outline"}
  className="gap-2"
>
  {abortModeActive ? "🟢 Exit Emergency" : "🚨 Abort Mission"}
</Button>

// Conditional rendering
{abortModeActive ? (
  <AbortMissionMode
    tasks={tasks}
    onExit={() => setAbortModeActive(false)}
    onTasksFiltered={(filtered) => setDisplayTasks(filtered)}
  />
) : (
  <TaskList tasks={displayTasks} onTaskUpdate={onTaskUpdate} />
)}
```

## Global Type Declarations

### In global.d.ts

```typescript
interface Window {
  api: {
    // ... existing methods
    
    // Mission Control
    getMissionLog: (date: string) => Promise<string | null>;
    searchMissionLogs: (searchTerm: string) => Promise<Array<{ date: Date; excerpt: string }>>;
    getMissionStats: () => Promise<MissionStats>;
    updateMissionStats: (stats: Partial<MissionStats>) => Promise<void>;
  };
}
```

## Mission Stats Calculation Service

### In main/services/MissionStatsService.ts

```typescript
export class MissionStatsService {
  async calculateStats(tasks: Task[]): Promise<MissionStats> {
    const completedTasks = tasks.filter((t) => t.status === "completed");
    const totalXP = completedTasks.reduce((sum, t) => sum + (t.xpValue || 10), 0);
    
    // Calculate current streak
    const currentStreak = this.calculateStreak(completedTasks);
    const longestStreak = this.calculateLongestStreak(completedTasks);
    
    // Calculate success rate
    const totalTasks = tasks.length;
    const successRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    
    // Calculate weekly stability (based on consistency)
    const weeklyStability = this.calculateWeeklyStability(completedTasks);
    
    return {
      totalXP,
      currentStreak,
      longestStreak,
      weeklyStability,
      missionSuccessRate: successRate,
      lastMissionDate: completedTasks[completedTasks.length - 1]?.completedAt,
    };
  }
  
  private calculateStreak(tasks: Task[]): number {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];
      
      const hasTaskOnDate = tasks.some((t) => t.completedAt?.startsWith(dateStr));
      
      if (hasTaskOnDate) {
        streak++;
      } else if (i > 0) {
        break; // Streak broken
      }
    }
    
    return streak;
  }
  
  private calculateLongestStreak(tasks: Task[]): number {
    let longestStreak = 0;
    let currentStreak = 0;
    
    // Sort by completion date
    const sorted = [...tasks].sort((a, b) => 
      (a.completedAt || "").localeCompare(b.completedAt || "")
    );
    
    let lastDate: string | null = null;
    
    for (const task of sorted) {
      if (!task.completedAt) continue;
      
      const currentDate = task.completedAt.split("T")[0];
      
      if (lastDate) {
        const dayDiff = Math.floor(
          (new Date(currentDate).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        if (dayDiff === 1) {
          currentStreak++;
        } else if (dayDiff > 1) {
          longestStreak = Math.max(longestStreak, currentStreak);
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
      
      lastDate = currentDate;
    }
    
    return Math.max(longestStreak, currentStreak);
  }
  
  private calculateWeeklyStability(tasks: Task[]): number {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const thisWeekTasks = tasks.filter(
      (t) => t.completedAt && new Date(t.completedAt) >= weekAgo
    );
    
    if (thisWeekTasks.length === 0) return 0;
    
    // Count days with at least one task
    const daysWithTasks = new Set(
      thisWeekTasks.map((t) => t.completedAt!.split("T")[0])
    ).size;
    
    // Stability = (days with tasks / 7) * 100
    return Math.round((daysWithTasks / 7) * 100);
  }
}
```

## Usage Examples

### Starting Mission Mode from TaskItem

```typescript
<div className="task-actions">
  <Button onClick={() => onEnterMissionMode(task)}>
    🎯 Focus
  </Button>
</div>
```

### Displaying Mission Stats in Sidebar

```typescript
const [stats, setStats] = useState<MissionStats | null>(null);

useEffect(() => {
  loadMissionStats();
}, []);

const loadMissionStats = async () => {
  const missionStats = await window.api.getMissionStats();
  setStats(missionStats);
};

// In render
{stats && (
  <div className="mission-stats-mini">
    <div>Level {calculateLevel(stats.totalXP)}</div>
    <div>🔥 {stats.currentStreak} day streak</div>
    <div>⭐ {stats.totalXP} XP</div>
  </div>
)}
```

---

These integration examples show how to wire up all the mission-control features into the existing Tasktronaut application. The components are designed to be modular and can be integrated incrementally.
