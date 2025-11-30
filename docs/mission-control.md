# Mission Control Guide

This guide covers the mission-control feature set: Daily Briefing, Orbit Levels, Mission Mode, Captain's Log, Procrastination Radar, XP Progression, Gravity, Abort Mission Mode, and future AI Co‑pilot design philosophy.

Refer to the original extended description in version 2.0 if you need the narrative version. This document keeps implementation lean and actionable.

## Features Overview
- Daily Briefing: Morning summary with top priorities, overdue tasks, side quests, motivational quote.
- Orbit Levels: low-orbit | mid-orbit | deep-space (derived from duration + priority).
- Mission Mode: Full-screen single task focus with timer and completion animation.
- Captain's Log: Markdown journal of completed tasks (auto appended per completion).
- Procrastination Radar: Aggregates snooze/reschedule/abandon counts, emits pattern insights.
- XP Progression: Accrues XP from task completion; ranks computed from total XP; streak + stability metrics.
- Gravity Engine: Score (0-100) based on deadline proximity, orbit, avoidance, manual weight.
- Abort Mission Mode: Emergency view limiting visible tasks to urgent/high-gravity/overdue/protected.

## Data Model Extensions
```ts
interface OrbitMetadata { level: OrbitLevel; decayRate: number; visualDistance: number; }
interface Task {
  orbit?: OrbitMetadata;
  gravity?: number;
  xpValue?: number;
  snoozeCount?: number;
  rescheduleCount?: number;
  abandonCount?: number;
  missionMode?: boolean;
  abortProtected?: boolean;
}
```

## XP Calculation (Baseline)
```
base: low=10 mid=20 deep=40
+ duration bonus: floor(durationMinutes / 30) * 5
+ early completion bonus: +10 if completed 20% ahead of duration estimate
cap tasks with extremely long duration bonus at +30
```

## Gravity Calculation (Sample Heuristic)
```
start = 25
+ deadline proximity: <=1d +40 | <=3d +25 | <=7d +15 | else +0
+ orbit: deep +20 | mid +10 | low +0
+ avoidance: snoozeCount*2 + rescheduleCount*3 + abandonCount*5
clamp 0..100
```

## Streak & Stability
- Current streak: consecutive days with ≥1 completed task.
- Weekly stability: days (in last 7) with completion / 7 * 100.

## Abort Mission Selection Logic
Include task if:
```
overdue OR
(deadline within 48h) OR
(gravity >= 70) OR
(orbit.level === 'deep-space' && deadline within 3d) OR
abortProtected === true
```

## Suggested IPC Surface (Renderer)
```
getMissionStats()
getMissionLog(date)
searchMissionLogs(term)
enterMissionMode(taskId)
exitMissionMode(taskId)
```

## Minimal Styling Hooks
- .orbit-low / .orbit-mid / .orbit-deep classes
- data-gravity attribute for intensity gradients

## Performance Notes
- Prefer derived calculations at render to avoid stale persisted gravity.
- Log file writes are append-only; rotate monthly if size > threshold.

## Future: AI Co‑pilot (Placeholder)
Quiet heuristics (deadline risk, overload warning, break-task suggestion). Non-blocking banner API.

---
This condensed guide supersedes the prior narrative document for day-to-day engineering use.
