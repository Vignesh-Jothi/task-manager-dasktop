# Quick Start

1. Create first task (Task Form).
2. Assign project via dropdown (defaults to General).
3. Open Dashboard → use filters (status, priority, project, search).
4. Optional: Enter Mission Mode for deep-space task.
5. Check Stats tab for XP / streaks.
6. Manage projects in Settings → Projects.

## Common Commands
```bash
npm install
npm run dev      # start in development
npm run build    # production build
npm run package  # create distributables
```

## Project Concepts
- Orbit Levels: conceptual priority abstraction.
- Gravity: urgency heuristic used in queue ordering.
- XP: completion reward; streak influences motivation.
- Abort Mode: emergency focus on critical tasks.

## Troubleshooting
- Build error: run `npm run build` and inspect TypeScript output.
- Missing project dropdown: ensure preload exposes project IPC; rebuild.
- Tasks lack project: run migration script (planned).

## Next Steps
Configure email summaries & integrations via Settings when required.
