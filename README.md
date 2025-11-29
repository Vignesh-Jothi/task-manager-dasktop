# Task Manager - Local-First Task Management Application

A production-ready desktop application for personal task management with priority queue system, smart notifications, and optional Jira/GitHub integration. **Everything runs locally** - no cloud database, no tracking, complete privacy.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🎯 Features

### Core Features
- ✅ **Local-First Storage** - All data stored as human-readable Markdown files
- 📊 **Task Types** - Daily, Weekly, Monthly, and Deadline-based tasks
- 🚀 **Priority Queue System** - Automatic task reordering based on priority and deadlines
- 🔔 **Smart Notifications** - Desktop notifications for upcoming/missed deadlines
- 📝 **Complete Audit Logs** - Every action logged with timestamps
- 🔍 **Fast Search** - JSON index for instant task searching
- 📅 **Multiple Views** - Today, Week, Month, and Priority Queue views
- ⌨️ **Keyboard Shortcuts** - Productivity-focused interface

### Optional Integrations
- 🔗 **Jira Integration** - Sync tasks with Jira issues (encrypted tokens)
- 📦 **GitHub Backup** - Auto/manual backup to private repository
- 🔐 **Encrypted Credentials** - All tokens encrypted locally

### Privacy & Security
- 🚫 **No Cloud Database** - Everything stored locally
- 🔒 **Encrypted Tokens** - AES-256 encryption for API tokens
- 🏠 **Offline-First** - Works completely offline
- 🔐 **No Tracking** - Zero analytics or telemetry

## 📁 Project Structure

```
task-manager/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── main.ts             # Application entry point
│   │   ├── ipc/
│   │   │   └── handlers.ts     # IPC communication handlers
│   │   └── services/
│   │       ├── FileSystemService.ts    # MD file & JSON management
│   │       ├── TaskService.ts          # Task CRUD operations
│   │       ├── LoggerService.ts        # Audit logging
│   │       ├── SchedulerService.ts     # Cron jobs & reminders
│   │       ├── NotificationService.ts  # Desktop notifications
│   │       ├── JiraService.ts          # Jira API integration
│   │       ├── GitHubService.ts        # GitHub backup
│   │       └── EncryptionService.ts    # Token encryption
│   ├── preload/
│   │   └── preload.ts          # Context bridge for IPC
│   ├── renderer/               # React UI
│   │   ├── index.tsx
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── Settings.tsx
│   │   └── styles/
│   │       └── *.css
│   └── types/
│       └── index.ts            # TypeScript definitions
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 📦 Local Data Structure

All data is stored in your user data directory:

```
~/Library/Application Support/task-manager/ (macOS)
%APPDATA%/task-manager/ (Windows)
~/.config/task-manager/ (Linux)

├── data/                       # Markdown task files
│   └── YYYY/
│       └── MM/
│           └── DD.md          # Daily task file
├── logs/                       # Audit logs
│   └── YYYY-MM-DD.log
└── config/                     # Configuration
    ├── index.json             # Task index (for fast search)
    ├── jira.enc.json          # Encrypted Jira config
    └── github.enc.json        # Encrypted GitHub config
```

### Sample Task File (Markdown)

```markdown
# Tasks for 2024-01-15

## [550e8400-e29b-41d4-a716-446655440000] Complete Project Documentation

**Status:** completed  
**Priority:** higher  
**Type:** deadline  
**Deadline:** 2024-01-15T18:00:00.000Z  
**Created:** 2024-01-15T08:00:00.000Z  
**Completed:** 2024-01-15T16:30:00.000Z  
**Jira:** PROJ-123

### Description
Finalize all project documentation including API docs...
```

### Sample Log File

```
[2024-01-15T08:00:00.000Z] Task: 550e8400-... | Action: CREATED
  Previous: {}
  New: {"id":"550e8400-...","title":"Complete Project Documentation",...}
  
[2024-01-15T16:30:00.000Z] Task: 550e8400-... | Action: COMPLETED
  Previous: {"status":"pending"}
  New: {"status":"completed","completedAt":"2024-01-15T16:30:00.000Z"}
```

## 🚀 Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Git (for GitHub backup feature)

### Step 1: Clone & Install

```bash
cd task-manager
npm install
```

### Step 2: Development Mode

```bash
# Build and run in development
npm run build
npm start

# Or use dev mode with hot reload
npm run dev
```

### Step 3: Production Build

```bash
# Build for production
npm run build

# Package as desktop app
npm run package
```

The packaged app will be in the `release/` directory.

## ⚙️ Configuration

### Jira Integration (Optional)

1. Go to **Settings** → **Jira Integration**
2. Generate API token: https://id.atlassian.com/manage/api-tokens
3. Enter:
   - Jira Domain: `yourcompany.atlassian.net`
   - Email: Your Jira account email
   - API Token: Generated token
   - Project Key: e.g., `PROJ`
4. Enable "Auto-Sync" to automatically create/update Jira issues

**Features:**
- Creates Jira issues when tasks are created
- Transitions issues when tasks are completed
- Stores Jira issue keys in task metadata

### GitHub Backup (Optional)

1. Go to **Settings** → **GitHub Backup**
2. Generate Personal Access Token: https://github.com/settings/tokens
   - Required scope: `repo` (full repository access)
3. Enter:
   - Token: Generated token
   - Repository: `username/repo-name` (create private repo first)
4. Choose sync mode:
   - **Daily**: Auto-sync at 2 AM
   - **Manual**: Sync only when you click "Sync Now"

**What gets backed up:**
- All Markdown task files (`/data/`)
- All log files (`/logs/`)
- Task index (`/config/index.json`)

## 🎮 Usage

### Creating Tasks

1. Click **Create Task**
2. Fill in:
   - Title (required)
   - Description (required)
   - Priority: Low, High, Higher
   - Type: Daily, Weekly, Monthly, Deadline
   - Deadline (optional)
3. Click **Create Task**

### Priority Queue

The app automatically sorts pending tasks by:
1. **Priority** (Higher → High → Low)
2. **Deadline** (sooner deadlines first)
3. **Creation date** (older tasks first)

When you complete a task, the next task in queue is automatically shown via notification.

### Keyboard Shortcuts

- `Ctrl/Cmd + N` - Create new task
- `Ctrl/Cmd + S` - Save task
- `Esc` - Cancel/Close

### Notifications

The app sends desktop notifications for:
- **30 minutes before deadline**
- **1 hour before deadline**
- **1 day before deadline**
- **Missed deadlines**
- **Next task after completion**

## 🔧 Technical Architecture

### Technology Stack

- **Electron 28** - Desktop application framework
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Node.js Crypto** - Token encryption
- **node-cron** - Background scheduler
- **Octokit** - GitHub API
- **Axios** - Jira API

### Services Architecture

```
┌─────────────────────────────────────────┐
│       Electron Main Process             │
│  ┌────────────────────────────────────┐ │
│  │  FileSystemService                 │ │
│  │  - MD file operations              │ │
│  │  - JSON index management           │ │
│  ├────────────────────────────────────┤ │
│  │  TaskService                       │ │
│  │  - CRUD operations                 │ │
│  │  - Priority queue sorting          │ │
│  ├────────────────────────────────────┤ │
│  │  SchedulerService                  │ │
│  │  - Cron jobs (every 5 min)         │ │
│  │  - Deadline checking               │ │
│  │  - Daily GitHub sync (2 AM)        │ │
│  ├────────────────────────────────────┤ │
│  │  NotificationService               │ │
│  │  - Desktop notifications           │ │
│  │  - IPC to renderer                 │ │
│  ├────────────────────────────────────┤ │
│  │  JiraService (Optional)            │ │
│  │  - Create/transition issues        │ │
│  │  - Encrypted token storage         │ │
│  ├────────────────────────────────────┤ │
│  │  GitHubService (Optional)          │ │
│  │  - File uploads to repo            │ │
│  │  - Encrypted token storage         │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
              ↕ IPC
┌─────────────────────────────────────────┐
│       Electron Renderer Process         │
│  ┌────────────────────────────────────┐ │
│  │  React Components                  │ │
│  │  - Dashboard (views & filters)     │ │
│  │  - TaskForm (create/edit)          │ │
│  │  - Settings (Jira/GitHub)          │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Scheduler Details

The app runs background jobs:

1. **Deadline Check** (every 5 minutes)
   - Check for upcoming deadlines (30 min, 1 hour, 1 day)
   - Check for missed deadlines
   - Send notifications

2. **GitHub Sync** (daily at 2 AM, if enabled)
   - Collect all MD files, logs, and index
   - Upload to GitHub repository

## 🔐 Security & Privacy

### Data Encryption

- **Jira API Token**: Encrypted with AES-256-CBC
- **GitHub Token**: Encrypted with AES-256-CBC
- **Encryption Key**: Derived from environment variable or default (change in production)

### Local-Only Guarantee

**Never sent to external servers:**
- Task titles, descriptions, or metadata
- User activity logs
- Application usage data

**Only sent when explicitly enabled:**
- Jira: Task data to create/update issues
- GitHub: MD files and logs for backup

### Recommended Security Practices

1. Set custom encryption key:
   ```bash
   export ENCRYPTION_KEY="your-secure-random-key"
   ```

2. Use private GitHub repository for backups

3. Review Jira/GitHub permissions regularly

4. Keep your API tokens secure

## 🐛 Troubleshooting

### App won't start

```bash
# Clear app data and restart
rm -rf ~/Library/Application\ Support/task-manager/
npm start
```

### Notifications not working

Check system notification permissions:
- macOS: System Preferences → Notifications → Task Manager
- Windows: Settings → Notifications → Task Manager

### Jira connection fails

1. Verify domain (no `https://`, just `company.atlassian.net`)
2. Check API token is valid
3. Ensure project key exists
4. Click "Test Connection" to diagnose

### GitHub sync fails

1. Verify token has `repo` scope
2. Ensure repository exists and is accessible
3. Check repository format: `username/repo-name`
4. Click "Test Connection" to diagnose

## 📊 Task Status Flow

```
pending → in_progress → completed
   ↓
missed (if deadline passed)
```

## 🎨 Customization

### Modify Notification Intervals

Edit `src/main/services/SchedulerService.ts`:

```typescript
const intervals = [30, 60, 1440]; // minutes: 30min, 1hour, 1day
```

### Change Scheduler Frequency

Edit `src/main/services/SchedulerService.ts`:

```typescript
// Check every 5 minutes (change cron expression)
const deadlineCheck = cron.schedule('*/5 * * * *', () => {
```

### Customize Priority Weights

Edit `src/main/services/TaskService.ts`:

```typescript
const priorityWeight = { higher: 3, high: 2, low: 1 };
```

## 📝 Development

### Project Commands

```bash
npm run dev          # Development with hot reload
npm run build        # Build main + renderer
npm run build:main   # Build main process only
npm run build:renderer  # Build renderer only
npm start            # Start Electron app
npm run package      # Package as desktop app
npm run gen:icons    # Regenerate platform icons from SVG
npm run dist         # Alias: build + gen:icons + package
npm run app          # Build then run locally (production build)

## 🚢 Release Process

The release workflow produces signed (or unsigned if no identity) platform bundles using `electron-builder`.

### 1. Prepare Icons

All platform icons are generated from the single source SVG at `assets/icon.svg`:

```bash
npm run gen:icons
```

This creates:
- `icons/icon.icns` (macOS)
- `icons/icon.ico` (Windows)
- `icons/icon.png` (Linux 512x512)
- Size variants for Windows / macOS packaging

Icons are automatically regenerated during `npm run package`, but you can run the script manually after changing the SVG.

### 2. Build & Package

```bash
npm run package
```

Equivalent alias:

```bash
npm run dist
```

This runs:
1. `npm run build` (TypeScript → dist, Vite production bundle)
2. `npm run gen:icons` (regenerate platform icons)
3. `electron-builder` (creates distributables in `release/`)

### 3. Output Artifacts

After a successful run, check `release/`:
- macOS: `TaskManager-<version>-arm64.dmg`, `TaskManager-<version>-arm64-mac.zip`, `TaskManager.app`
- Windows (after building on Windows): NSIS installer `.exe`
- Linux: AppImage (after building on Linux or via CI cross-build)

### 4. Code Signing (Optional / Recommended)

macOS & Windows builds currently skip signing if no certificate is detected.

To enable signing:
- macOS: Install a Developer ID Application certificate (Xcode / Keychain) and set environment variables:
   ```bash
   export CSC_IDENTITY_AUTO_DISCOVERY=true
   # Or specify:
   export CSC_NAME="Developer ID Application: Your Name (TEAMID)"
   ```
- Windows: Provide a code signing certificate (`.pfx`) and set:
   ```bash
   export CSC_LINK="/path/to/cert.pfx"
   export CSC_KEY_PASSWORD="your_password"
   ```

### 5. Versioning

Increment the version in `package.json` before packaging:
```bash
npm version patch   # or minor / major
```
Then re-run `npm run package`.

### 6. Updating Icon or Branding

1. Edit `assets/icon.svg`
2. Run `npm run gen:icons`
3. Commit updated `icons/` artifacts (optional — they can be generated in CI)
4. Package again.

### 7. Cross-Platform Notes

- You must build on each target OS (mac → mac DMG, win → exe, linux → AppImage) unless using advanced cross-build setups.
- For CI automation, run matrix builds and archive artifacts.

### 8. Fast Local Smoke Test of Production Build

```bash
npm run build
npm run app
```

This uses the production code without packaging overhead.

### 9. Cleanup

Remove previous build artifacts:
```bash
rm -rf dist release
```

### 10. Environment Variables

Set a custom encryption key before packaging for stronger security:
```bash
export ENCRYPTION_KEY="your-long-random-secret"
npm run package
```

### 11. Publishing (Manual)

Upload artifacts in `release/` to your distribution channel (GitHub Releases, internal storage, etc.).

---

For future enhancements (auto-updates, delta patches), integrate `electron-updater` and configure a release server or GitHub provider.

```

### Adding New Features

1. **Backend**: Add service in `src/main/services/`
2. **IPC**: Add handler in `src/main/ipc/handlers.ts`
3. **Preload**: Expose API in `src/preload/preload.ts`
4. **Frontend**: Add React component in `src/renderer/components/`

## 🤝 Contributing

This is a local-first, privacy-focused application. Contributions welcome for:
- Bug fixes
- Performance improvements
- Additional integrations (GitLab, Notion, etc.)
- UI/UX enhancements

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with:
- Electron
- React
- TypeScript
- Vite
- node-cron
- Octokit

---

**Remember**: Your data stays on your machine. No cloud, no tracking, complete control. 🔒
