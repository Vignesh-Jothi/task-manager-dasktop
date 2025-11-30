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
## Deprecated Root Document

This advanced integration content now lives in `docs/dev-guide.md`.

File retained only as a legacy stub for backward references.

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
