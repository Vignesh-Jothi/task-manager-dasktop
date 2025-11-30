# Developer Guide

Concise technical integration notes for Tasktronaut mission-control + core modules.

## Directory Layout (Proposed)
```
src/
  main/
    services/ (core: Task, FileSystem, Logger, Scheduler, Email, Summary, FeatureFlag, Jira, GitHub, Encryption, Notification, Project)
    ipc/
    main.ts
  preload/
  renderer/
    components/
      core/ (Dashboard, TaskForm, TaskList, TaskItem, Settings, ProjectsSettingsPanel)
      mission/ (DailyMissionBriefing, MissionMode, ProcrastinationRadar, MissionStatsDisplay, AbortMissionMode)
      ui/ (button, card, input, select, switch, badge, tooltip, dialog)
    styles/
    global.d.ts
  types/
```

## Key Services
- TaskService: CRUD, priority queue, markdown persistence.
- ProjectService: CRUD for project metadata.
- MissionLogService (if added): append daily markdown entries.

## IPC Handlers Additions (Project + Mission)
```ts
// project:create(name, color?) -> Project
// project:getAll() -> Project[]
// project:update(id, partial) -> Project
// project:delete(id) -> boolean
// task:create(..., projectId?) -> Task
```

## Renderer API (preload)
```ts
window.api.createTask(title, description, priority, type, deadline?, projectId?)
window.api.getAllProjects()
```

## Task Markdown Block
```
## [id] Title
Status: pending
Priority: higher
Type: daily
Deadline: 2025-12-01T10:00:00.000Z
Project: <projectId>
Created: ...
Completed: ...
Jira: <key?>

### Description
<text>
```

## Project Migration Strategy
On startup:
1. Load tasks index.
2. If any task lacks projectId: assign default project's id (lookup by name "General"; create if missing). Persist index.

## Suggested Utility Functions
```ts
function ensureDefaultProject(projectService: ProjectService): Project
function migrateTasksAssignDefault(taskService: TaskService, defaultProjectId: string)
```

## XP & Gravity Derivation (Do Not Persist Unless Needed)
Call calculators during dashboard render to avoid stale values; persist only xpValue assigned at creation for historical logs.

## Performance Considerations
- VirtualizedTaskList for >100 tasks.
- Avoid recomputation of filtered arrays: memoize by dependency (viewMode, filters, projectFilter).

## Testing Notes
- Unit test gravity and XP calculators with boundary cases (deadline 1h, deep-space large duration, multiple snoozes).
- IPC handler smoke tests: ensure all return expected shapes.

## Logging Conventions
- LoggerService.log({ timestamp, taskId, action, previousValue?, newValue? })
- Avoid logging sensitive tokens.

## Feature Flags Extension Pattern
Add flag in FeatureFlagService defaults; expose via IPC; update Settings panel switches.

## Deployment
Use `npm run build` followed by `npm run package` (electron-builder). Ensure icon generation done once via `npm run gen:icons`.

---
Keep this guide lean; expand only with code-level API changes.
