# 🚀 Tasktronaut

> Mission Control for Your Life — Navigate Tasks Like an Astronaut

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey.svg)

## 📖 Essentials

- Overview
- Key features summary
- Install & quick start
- Links to detailed docs in `docs/`

For full extended narrative and deep integration notes, see:
- `docs/mission-control.md`
- `docs/dev-guide.md`
- `docs/quick-start.md`

---

## Overview

Tasktronaut is a **local-first**, **privacy-focused** desktop application that transforms task management into mission control. Instead of boring checklists, you're piloting through cognitive space with orbit levels, mission briefings, focus modes, and intelligent pattern detection.

### Why Tasktronaut?

- **🔒 Privacy First**: All data stored locally on your machine
- **⚡ Offline Ready**: Works without internet connection
- **🎨 Highly Customizable**: 9 preset themes + unlimited custom themes
- **🔄 Smart Sync**: Optional GitHub backup and Jira integration
- **📧 Automated Reports**: Daily, weekly, and monthly email summaries
- **🚀 Performance Optimized**: Virtual scrolling for thousands of tasks
- **🎯 Mission Control**: Orbit levels, XP progression, focus modes, and more

---

## 🎯 Mission Control Snapshot
Daily Briefing • Orbit Levels • Mission Mode • Captain's Log • Procrastination Radar • XP/Streaks • Abort Emergency Mode • Gravity weighting • Projects.

Details & heuristics: see `docs/mission-control.md`.

---

## Key Features

### ✅ Task Management
- **Orbit Levels**: Low-orbit, Mid-orbit, Deep-space with visual indicators
- **Gravity System**: Dynamic priority weighting (0-100)
- **Task Types**: Daily, Weekly, Monthly organization
- **Status Tracking**: Pending, In Progress, Completed, Missed
- **Deadline Management**: Set deadlines with automatic notifications
- **Duration Tracking**: Time estimates for better planning
- **Search & Filter**: Advanced filtering by status, priority, date range
- **Virtual Scrolling**: Handle 1000+ tasks with smooth performance

### 🎨 Theming System
- **9 Preset Themes**:
  - Light & Dark (classic)
  - Blue (professional)
  - Ocean (calming)
  - Sunset (warm)
  - Forest (natural)
  - Midnight (deep blue)
  - Lavender (soft purple)
- **Custom Theme Builder**: Create unlimited custom themes
- **Auto Day/Night Switch**: Automatic theme switching at 7 AM/7 PM
- **Theme Persistence**: Themes saved across sessions
- **Live Preview**: See theme changes in real-time

### 📧 Email Summaries
- **Daily Reports**: Task summary sent every day at 7 AM
- **Weekly Reports**: Summary every Friday at 7 AM
- **Monthly Reports**: Summary on the 30th of each month at 7 AM
- **Detailed Metrics**:
  - Total tasks count
  - Completed vs pending breakdown
  - Top 5 priorities
  - Recently completed tasks
  - Upcoming deadlines
- **SMTP Configuration**: Use any email provider (Gmail, Outlook, etc.)

### 🔗 Integrations

#### GitHub Integration
- **Automatic Backup**: Daily backup at 2 AM
- **Task Data Export**: JSON format for portability
- **Log Archiving**: Activity logs backed up to repository
- **Manual Sync**: On-demand backup option
- **Token-Based Auth**: Secure OAuth token authentication

#### Jira Integration
- **Two-Way Sync**: Tasks ↔ Jira Issues
- **Project Mapping**: Link to specific Jira project
- **Status Sync**: Task status updates reflected in Jira
- **API Token Auth**: Secure Jira API authentication

### 🚩 Feature Flags
- **Granular Control**: Enable/disable features individually
- **Live Updates**: Changes apply immediately without restart
- **Persistent Storage**: Settings saved to local JSON file
- **Available Flags**:
  - Startup Splash Animation
  - Tooltips
  - Email Summaries
  - Deadline Notifications (always on)
  - Jira Sync (always on)
  - GitHub Backup (always on)
  - Virtual Scrolling (always on)
  - Animation Effects (always on)

### 🔔 Smart Notifications
- **Deadline Alerts**: Notifications at 24h, 12h, 6h, 1h before deadline
- **Missed Task Alerts**: Notifications for overdue tasks
- **Desktop Notifications**: Native OS notification integration
- **Notification Center**: In-app notification history

### 💾 Data Management
- **Cache Clearing**: Clear application cache
- **Task Deletion**:
  - Delete all tasks
  - Delete completed tasks only
- **GitHub Data Purge**: Remove all synced GitHub data
- **Settings Persistence**: All settings stored locally
- **Auto Restart**: App restarts automatically after data operations

---

## Installation

### Prerequisites

- **Node.js**: v18 or higher
- **npm**: v8 or higher
- **Git**: For version control and GitHub integration

### Quick Install

```bash
# Clone the repository
git clone https://github.com/Vignesh-Jothi/task-manager-dasktop.git
cd task-manager-dasktop

# Install dependencies
npm install

# Build the application
npm run build

# Run the app
npm run app
```

### Development Mode

```bash
# Run in development mode with hot-reload
npm run dev
```

This starts:
- Main process (Electron) with watch mode
- Renderer process (React) with Vite dev server

---

## Getting Started

### First Launch

1. **Application Startup**: On first launch, you'll see the startup splash animation (if enabled)
2. **Empty State**: Dashboard shows empty state with "Create Task" button
3. **Create Your First Task**: Click "Create Task" to open the task form
4. **Set Up Integrations** (Optional): Navigate to Settings to configure Jira/GitHub

### Creating a Task

1. Click "📝 Create Task" button
2. Fill in task details:
   - **Title**: Brief description (required)
   - **Description**: Detailed notes (optional)
   - **Priority**: Low, High, or Higher
   - **Type**: Daily, Weekly, or Monthly
   - **Deadline**: Due date (optional)
   - **Duration**: Estimated time in minutes (optional)
3. Click "Create Task"

### Managing Tasks

- **View Tasks**: Switch between Today, Week, Month, or Queue views
- **Update Status**: Click status badge to change (Pending → In Progress → Completed)
- **Edit Task**: Click edit icon to modify task details
- **Delete Task**: Click delete icon (shows confirmation dialog)
- **Search**: Use search bar to find tasks by title/description
- **Filter**: Filter by status, priority, or both

### Customizing Themes

1. Navigate to **Settings** (gear icon)
2. Select **Theme** section
3. Choose from preset themes or click "🎨 Custom Theme Builder"
4. For custom themes:
   - Enter theme name
   - Pick colors for each UI element
   - Click "Save Custom Theme"
   - Apply from theme dropdown

---

## Core Features

### Task Management

#### Task Structure

Every task includes:
```typescript
{
  id: string;              // Unique UUID
  title: string;           // Task title
  description: string;     // Detailed description
  priority: Priority;      // low | high | higher
  type: TaskType;          // daily | weekly | monthly
  status: TaskStatus;      // pending | in_progress | completed | missed
  createdAt: string;       // ISO timestamp
  updatedAt: string;       // ISO timestamp
  deadline?: string;       // Optional ISO timestamp
  durationMinutes?: number; // Optional duration estimate
  jiraIssueKey?: string;   // Optional Jira issue ID
}
```

#### Priority Levels

- **Low** (🟢): Routine tasks, no urgency
- **High** (🟡): Important tasks, moderate urgency
- **Higher** (🔴): Critical tasks, high urgency

#### Task Types

- **Daily**: Tasks for today or short-term goals
- **Weekly**: Tasks spanning the current week
- **Monthly**: Long-term tasks for the month

#### View Modes

- **Today**: Tasks created or due today
- **Week**: Tasks for current week
- **Month**: Tasks for current month
- **Queue**: All tasks ordered by priority and deadline

### Theming System

#### Theme Architecture

The theming system uses CSS custom properties for dynamic styling:

```css
:root {
  --bg-app: #ffffff;
  --bg-sidebar: #f8f9fa;
  --bg-card: #ffffff;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --text-muted: #999999;
  --btn-primary: #007bff;
  --btn-secondary: #6c757d;
  --btn-destructive: #dc3545;
  --accent: #007bff;
  --border: #dee2e6;
  /* ... */
}
```

#### Creating Custom Themes

1. Open **Theme Customizer** from Settings
2. Configure all color properties:
   - Background colors (app, sidebar, card)
   - Text colors (primary, secondary, muted)
   - Button colors (primary, secondary, destructive)
   - Accent and border colors
3. Click **Save Custom Theme**
4. Theme is stored in localStorage and persists across sessions

#### Auto Day/Night Switch

When enabled (default):
- **Day Theme** (7 AM - 7 PM): Light theme
- **Night Theme** (7 PM - 7 AM): Dark theme
- Checks every 15 minutes for time changes
- Can be disabled in Settings

### Email Summaries

#### Configuration

1. Navigate to **Settings → Reports & Email**
2. Enable email summaries
3. Configure SMTP settings:
   ```
   SMTP Host: smtp.gmail.com (for Gmail)
   SMTP Port: 587 (TLS) or 465 (SSL)
   SMTP Secure: Enable for port 465
   Username: your-email@gmail.com
   Password: app-specific password
   ```
4. Set recipient email address
5. Enable daily/weekly/monthly reports
6. Click "Save Email Settings"

#### Gmail Setup

For Gmail, use App Password:
1. Enable 2FA in Google Account
2. Go to Security → App Passwords
3. Generate password for "Mail"
4. Use generated password in Tasktronaut

#### Summary Content

Each email includes:
- **Total Tasks**: Count of all tasks
- **Completed**: Number of completed tasks
- **Pending**: Number of pending/in-progress tasks
- **Top Priorities**: 5 highest priority pending tasks
- **Recently Completed**: Last 5 completed tasks
- **Upcoming Deadlines**: Next 5 tasks with deadlines

### Integrations

#### GitHub Integration

**Setup:**
1. Create GitHub Personal Access Token:
   - Go to GitHub Settings → Developer Settings → Personal Access Tokens
   - Generate token with `repo` scope
2. In Tasktronaut Settings → GitHub:
   - Paste token
   - Enter repository (format: `username/repo-name`)
   - Enable auto-sync if desired
3. Click "Save Settings"

**What Gets Backed Up:**
- `tasks.json`: All task data
- `logs/`: Application logs (daily files)
- Timestamp: Each backup includes timestamp in commit message

**Backup Schedule:**
- **Automatic**: Daily at 2 AM (if auto-sync enabled)
- **Manual**: Click "Sync to GitHub" in Settings

#### Jira Integration

**Setup:**
1. Get Jira API Token:
   - Go to Jira Account Settings → Security → API Tokens
   - Create API token
2. In Tasktronaut Settings → Jira:
   - Enter Jira domain (e.g., `yourcompany.atlassian.net`)
   - Enter email associated with Jira account
   - Paste API token
   - Enter project key (e.g., `TASK`)
   - Enable auto-sync if desired
3. Click "Save Settings"

**How Sync Works:**
- Creates Jira issues from Tasktronaut tasks
- Updates issue status when task status changes
- Links task to Jira issue via `jiraIssueKey`
- Maps Tasktronaut status to Jira workflow

**Manual Sync:**
Click "Sync to Jira" in Settings to sync immediately

### Feature Flags

Feature flags provide granular control over application features. Access via **Settings → Feature Flags**.

#### Available Features

| Feature | Description | Toggle |
|---------|-------------|--------|
| Startup Splash Animation | Animated loading screen on app start | ✅ |
| Tooltips | Helpful hints on hover | ✅ |
| Email Summaries | Automated email reports | ✅ |
| Deadline Notifications | Alerts for upcoming deadlines | 🔒 Always On |
| Jira Sync | Jira integration | 🔒 Always On |
| GitHub Backup | GitHub backup integration | 🔒 Always On |
| Virtual Scrolling | Performance optimization | 🔒 Always On |
| Animation Effects | UI transitions and effects | 🔒 Always On |

#### How to Use

1. Navigate to **Settings → Feature Flags**
2. Toggle features using the switch controls
3. Click **Save Feature Flags**
4. Changes apply immediately (no restart required)

#### Storage

Feature flags are stored in `feature-flags.json` in the app's user data directory:
- **macOS**: `~/Library/Application Support/task-manager/`
- **Windows**: `%APPDATA%\task-manager\`
- **Linux**: `~/.config/task-manager/`

---

## Architecture

### Technology Stack

**Frontend:**
- React 18.2
- TypeScript 5.3
- Tailwind CSS 3.4
- Lucide React (icons)
- React Window (virtualization)

**Backend (Electron Main):**
- Electron 39.2
- Node.js
- TypeScript
- node-cron (scheduling)
- nodemailer (email)

**Build Tools:**
- Vite 6.4 (renderer bundler)
- TypeScript Compiler (main process)
- electron-builder (packaging)

### Project Structure

```
task-manager/
├── src/
│   ├── main/                  # Electron main process
│   │   ├── main.ts           # Application entry point
│   │   ├── ipc/              # IPC handlers
│   │   │   └── handlers.ts   # All IPC communication
│   │   └── services/         # Backend services
│   │       ├── TaskService.ts
│   │       ├── SchedulerService.ts
│   │       ├── EmailService.ts
│   │       ├── SummaryService.ts
│   │       ├── FeatureFlagService.ts
│   │       ├── JiraService.ts
│   │       ├── GitHubService.ts
│   │       ├── NotificationService.ts
│   │       ├── LoggerService.ts
│   │       ├── FileSystemService.ts
│   │       └── EncryptionService.ts
│   ├── preload/              # Preload scripts
│   │   └── preload.ts        # IPC API exposure
│   ├── renderer/             # React frontend
│   │   ├── App.tsx           # Root component
│   │   ├── index.tsx         # React entry point
│   │   ├── components/       # React components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskItem.tsx
│   │   │   ├── VirtualizedTaskList.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── ThemeCustomizer.tsx
│   │   │   ├── LoadingSplash.tsx
│   │   │   └── ui/           # Reusable UI components
│   │   │       ├── card.tsx
│   │   │       ├── button.tsx
│   │   │       ├── input.tsx
│   │   │       ├── select.tsx
│   │   │       ├── switch.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── tooltip.tsx
│   │   │       └── dialog.tsx
│   │   ├── styles/           # CSS files
│   │   │   ├── theme.css     # Theme definitions
│   │   │   ├── Dashboard.css
│   │   │   └── Settings.css
│   │   └── global.d.ts       # TypeScript declarations
│   └── types/                # Shared TypeScript types
│       └── index.ts          # Type definitions
├── assets/                   # Static assets
│   └── icon.svg             # App icon source
├── icons/                    # Generated icons
│   ├── icon.icns            # macOS icon
│   ├── icon.ico             # Windows icon
│   └── icon.png             # Linux icon
├── dist/                     # Build output
│   ├── main/                # Compiled main process
│   └── renderer/            # Built React app
├── release/                  # Packaged applications
├── scripts/                  # Build scripts
│   └── generate-icons.js    # Icon generation
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript config (base)
├── tsconfig.main.json       # TypeScript config (main)
├── tsconfig.renderer.json   # TypeScript config (renderer)
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
└── README.md                # This file
```

### Services Overview

#### TaskService
- CRUD operations for tasks
- File-based storage (tasks.json)
- Task validation and sanitization
- Priority queue management

#### SchedulerService
- Deadline monitoring (every 5 minutes)
- Daily GitHub backup (2 AM)
- Email summaries (7 AM daily/weekly/monthly)
- Missed task detection

#### EmailService
- SMTP email sending via nodemailer
- Configuration persistence
- HTML email templates
- Error handling and retry logic

#### SummaryService
- Task aggregation and metrics
- Daily/weekly/monthly report generation
- Top priority identification
- Upcoming deadline tracking

#### FeatureFlagService
- Feature flag storage and retrieval
- JSON-based persistence
- Default flag values
- Live update broadcasts

#### JiraService
- Jira API integration
- Issue creation and updates
- Status synchronization
- Authentication handling

#### GitHubService
- GitHub API integration (Octokit)
- Repository file uploads
- Commit creation
- Token-based authentication

#### NotificationService
- Desktop notification delivery
- Notification scheduling
- System tray integration
- Notification history

#### LoggerService
- Daily log file creation
- Structured logging (info, warn, error)
- Log rotation
- Log archiving

#### FileSystemService
- User data directory management
- File I/O operations
- Directory creation
- Path resolution

#### EncryptionService
- Sensitive data encryption (AES-256)
- Token/password storage
- Decryption utilities
- Key management

### IPC Communication

All renderer ↔ main communication happens via IPC (Inter-Process Communication):

**Available APIs** (exposed via `window.api`):

```typescript
// Tasks
createTask(task: Partial<Task>): Promise<Task>
getTasks(): Promise<Task[]>
updateTask(id: string, updates: Partial<Task>): Promise<void>
deleteTask(id: string): Promise<void>
deleteAllTasks(): Promise<void>
deleteCompletedTasks(): Promise<void>

// Jira
saveJiraSettings(settings: JiraSettings): Promise<void>
getJiraSettings(): Promise<JiraSettings>
syncToJira(): Promise<void>

// GitHub
saveGitHubSettings(settings: GitHubSettings): Promise<void>
getGitHubSettings(): Promise<GitHubSettings>
syncToGitHub(): Promise<void>
deleteGitHubData(): Promise<void>

// Email
saveEmailConfig(config: EmailConfig): Promise<void>
getEmailConfig(): Promise<EmailConfig>
sendTestEmail(): Promise<void>

// Feature Flags
getFeatureFlags(): Promise<FeatureFlags>
saveFeatureFlags(flags: FeatureFlags): Promise<void>
onFeatureFlagsUpdated(callback: (flags: FeatureFlags) => void): void

// App Control
clearCache(): Promise<void>
relaunch(): void
getAppVersion(): Promise<string>

// Logs
getLogs(date?: string): Promise<string>
```

---

## Development

### Setup Development Environment

```bash
# Install dependencies
npm install

# Start development mode
npm run dev
```

This runs:
1. `tsc -p tsconfig.main.json -w` - Compiles main process with watch mode
2. `vite` - Starts Vite dev server for renderer process

The app auto-reloads when you make changes to renderer code. For main process changes, restart the dev command.

### Development Scripts

```bash
# Build main process only
npm run build:main

# Build renderer process only
npm run build:renderer

# Build both
npm run build

# Run built app
npm run app

# Generate app icons
npm run gen:icons

# Package for distribution
npm run package
```

### Adding a New Feature

1. **Update Types** (`src/types/index.ts`):
   ```typescript
   export interface NewFeature {
     id: string;
     name: string;
   }
   ```

2. **Create Service** (`src/main/services/NewFeatureService.ts`):
   ```typescript
   export class NewFeatureService {
     async doSomething(): Promise<void> {
       // Implementation
     }
   }
   ```

3. **Add IPC Handler** (`src/main/ipc/handlers.ts`):
   ```typescript
   ipcMain.handle('newFeature:doSomething', async () => {
     return newFeatureService.doSomething();
   });
   ```

4. **Expose in Preload** (`src/preload/preload.ts`):
   ```typescript
   api: {
     doNewFeatureThing: () => ipcRenderer.invoke('newFeature:doSomething')
   }
   ```

5. **Add TypeScript Types** (`src/renderer/global.d.ts`):
   ```typescript
   interface Window {
     api: {
       doNewFeatureThing: () => Promise<void>
     }
   }
   ```

6. **Use in Renderer** (`src/renderer/components/YourComponent.tsx`):
   ```typescript
   const handleClick = async () => {
     await window.api.doNewFeatureThing();
   };
   ```

### Code Style

- **TypeScript**: Strict mode enabled
- **React**: Functional components with hooks
- **CSS**: Tailwind utility classes + CSS variables for theming
- **File Naming**: PascalCase for components, camelCase for utilities
- **Imports**: Absolute imports from `src/`

### Debugging

**Main Process:**
```bash
# Add to main.ts
console.log('Debug info:', data);
```
Check terminal output where you ran `npm run dev`

**Renderer Process:**
```bash
# Add to React components
console.log('Debug info:', data);
```
Check DevTools (open automatically in dev mode)

**Enable DevTools in Production:**
In `src/main/main.ts`, uncomment:
```typescript
mainWindow.webContents.openDevTools();
```

---

## Configuration

### Application Data Location

**macOS**: `~/Library/Application Support/task-manager/`
**Windows**: `%APPDATA%\task-manager\`
**Linux**: `~/.config/task-manager/`

Contains:
- `tasks.json` - Task database
- `jira-settings.json` - Jira configuration (encrypted)
- `github-settings.json` - GitHub configuration (encrypted)
- `email-config.json` - Email settings (encrypted)
- `feature-flags.json` - Feature flag states
- `logs/` - Daily log files

### Environment Variables

None required. All configuration is done through the Settings UI.

### SMTP Configuration Examples

**Gmail:**
```
Host: smtp.gmail.com
Port: 587
Secure: No
User: your-email@gmail.com
Password: [App Password]
```

**Outlook:**
```
Host: smtp-mail.outlook.com
Port: 587
Secure: No
User: your-email@outlook.com
Password: [Your Password]
```

**Custom SMTP:**
```
Host: mail.your-domain.com
Port: 465
Secure: Yes
User: username
Password: password
```

---

## Building & Distribution

### Building for Production

```bash
# Full production build
npm run build

# Generate icons (required before packaging)
npm run gen:icons

# Package application
npm run package
```

### Platform-Specific Builds

The app uses `electron-builder` for packaging. Output goes to `release/` directory.

**macOS (.dmg, .app):**
```bash
npm run package
# Output: release/Tasktronaut-1.0.0.dmg
```

**Windows (.exe):**
```bash
npm run package
# Output: release/Tasktronaut Setup 1.0.0.exe
```

**Linux (.AppImage):**
```bash
npm run package
# Output: release/Tasktronaut-1.0.0.AppImage
```

### Icon Generation

Icons are auto-generated from `assets/icon.svg`:

```bash
npm run gen:icons
```

Generates:
- `icons/icon.icns` (macOS)
- `icons/icon.ico` (Windows)
- `icons/icon.png` (Linux)

### Build Configuration

Edit `package.json` → `build` section:

```json
{
  "build": {
    "appId": "com.taskmanager.app",
    "productName": "Tasktronaut",
    "mac": {
      "category": "public.app-category.productivity"
    },
    "win": {
      "target": "nsis"
    },
    "linux": {
      "target": "AppImage"
    }
  }
}
```

---

## Troubleshooting

### App Won't Start

**Issue**: Application doesn't launch after building

**Solution**:
1. Check if build completed successfully:
   ```bash
   npm run build
   ```
2. Verify dist/ folder exists with compiled files
3. Try running in dev mode:
   ```bash
   npm run dev
   ```

### Tasks Not Saving

**Issue**: Tasks disappear after closing app

**Solution**:
1. Check write permissions for app data directory
2. View logs in Settings → Data → View Logs
3. Verify `tasks.json` exists in data directory
4. Check if file system is read-only

### Email Not Sending

**Issue**: Email summaries not received

**Solution**:
1. Verify SMTP settings in Settings → Reports & Email
2. Use "Send Test Email" button to diagnose
3. For Gmail:
   - Enable 2FA
   - Generate App Password
   - Use App Password instead of account password
4. Check feature flags - ensure "Email Summaries" is enabled
5. View logs for email errors

### GitHub Sync Failing

**Issue**: GitHub backup not working

**Solution**:
1. Verify GitHub token has `repo` scope
2. Check repository exists and token has access
3. Ensure repository format is `username/repo-name`
4. Check internet connection
5. View logs for GitHub API errors

### Jira Sync Failing

**Issue**: Jira integration not syncing

**Solution**:
1. Verify API token is valid
2. Check project key exists in Jira
3. Ensure email matches Jira account
4. Verify domain format (e.g., `company.atlassian.net`)
5. Check Jira API permissions

### Theme Not Applying

**Issue**: Custom theme not showing

**Solution**:
1. Clear browser cache (Settings → Data → Clear Cache)
2. Restart application
3. Check if theme saved in localStorage:
   - Open DevTools → Application → Local Storage
   - Look for `customThemes` key
4. Try creating new custom theme

### High CPU Usage

**Issue**: App using too much CPU

**Solution**:
1. Check if virtual scrolling is enabled (should be by default)
2. Reduce animation effects (disable in Feature Flags)
3. Close unused views
4. Clear old tasks (Settings → Data → Delete Completed Tasks)

### Notifications Not Showing

**Issue**: No deadline notifications

**Solution**:
1. Check system notification permissions
2. Verify tasks have deadlines set
3. Ensure app is running (notifications only work when app is open)
4. Check notification settings in OS

---

## Contributing

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/task-manager-dasktop.git
   ```
3. Create a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. Make your changes
5. Commit with descriptive messages:
   ```bash
   git commit -m "Add amazing feature"
   ```
6. Push to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```
7. Open a Pull Request

### Code Guidelines

- Write clean, readable TypeScript
- Use functional React components
- Follow existing code style
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation if needed

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📝 Documentation improvements
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations
- 🌍 Internationalization (i18n)
- 🧪 Testing infrastructure

## Support

For issues, questions, or feature requests:
- **GitHub Issues**: [Create an issue](https://github.com/Vignesh-Jothi/task-manager-dasktop/issues)
- **Email**: Contact the development team

---

**Built with ❤️ using Electron, React, and TypeScript**
