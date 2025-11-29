# Task Manager - Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TASK MANAGER APPLICATION                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      ELECTRON MAIN PROCESS (Node.js)                 │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ main.ts - Application Lifecycle & Window Management           ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                                       │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │                    SERVICES LAYER                             │   │
│ │                                                               │   │
│ │  ┌────────────────────┐  ┌────────────────────┐             │   │
│ │  │ FileSystemService  │  │   TaskService      │             │   │
│ │  │ • MD file I/O      │  │ • CRUD operations  │             │   │
│ │  │ • JSON indexing    │  │ • Priority queue   │             │   │
│ │  │ • Directory mgmt   │  │ • Search & filter  │             │   │
│ │  └────────────────────┘  └────────────────────┘             │   │
│ │                                                               │   │
│ │  ┌────────────────────┐  ┌────────────────────┐             │   │
│ │  │  LoggerService     │  │ SchedulerService   │             │   │
│ │  │ • Audit logging    │  │ • Cron jobs        │             │   │
│ │  │ • Log rotation     │  │ • Deadline checks  │             │   │
│ │  └────────────────────┘  │ • Auto sync        │             │   │
│ │                          └────────────────────┘             │   │
│ │  ┌────────────────────┐  ┌────────────────────┐             │   │
│ │  │NotificationService │  │EncryptionService   │             │   │
│ │  │ • Desktop alerts   │  │ • AES-256 crypto   │             │   │
│ │  │ • IPC messaging    │  │ • Token security   │             │   │
│ │  └────────────────────┘  └────────────────────┘             │   │
│ │                                                               │   │
│ │  ┌────────────────────┐  ┌────────────────────┐             │   │
│ │  │   JiraService      │  │  GitHubService     │             │   │
│ │  │ • API integration  │  │ • Backup to repo   │             │   │
│ │  │ • Issue mgmt       │  │ • File sync        │             │   │
│ │  │ (Optional)         │  │ (Optional)         │             │   │
│ │  └────────────────────┘  └────────────────────┘             │   │
│ └───────────────────────────────────────────────────────────────┘   │
│                                                                       │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │                    IPC HANDLERS (handlers.ts)                 │   │
│ │  • task:create, task:update, task:complete                   │   │
│ │  • task:getAll, task:search, task:getPriorityQueue           │   │
│ │  • jira:saveSettings, jira:testConnection                    │   │
│ │  • github:sync, github:testConnection                        │   │
│ └───────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                  ↕
                            IPC BRIDGE
                       (preload.ts - Context Bridge)
                                  ↕
┌─────────────────────────────────────────────────────────────────────┐
│                   ELECTRON RENDERER PROCESS (React)                  │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ App.tsx - Main Application Component                          ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│                                                                       │
│ ┌───────────────────────────────────────────────────────────────┐   │
│ │                    REACT COMPONENTS                           │   │
│ │                                                               │   │
│ │  ┌──────────────────────────────────────────────────────┐    │   │
│ │  │ Dashboard.tsx                                        │    │   │
│ │  │ • Today/Week/Month/Queue views                      │    │   │
│ │  │ • Statistics cards                                  │    │   │
│ │  │ • Filters (status, priority, search)                │    │   │
│ │  └──────────────────────────────────────────────────────┘    │   │
│ │                                                               │   │
│ │  ┌──────────────────┐  ┌──────────────────┐                 │   │
│ │  │  TaskList.tsx    │  │  TaskItem.tsx    │                 │   │
│ │  │ • Task grid      │  │ • Task details   │                 │   │
│ │  │ • Empty states   │  │ • Status update  │                 │   │
│ │  └──────────────────┘  └──────────────────┘                 │   │
│ │                                                               │   │
│ │  ┌──────────────────┐  ┌──────────────────┐                 │   │
│ │  │  TaskForm.tsx    │  │  Settings.tsx    │                 │   │
│ │  │ • Create tasks   │  │ • Jira config    │                 │   │
│ │  │ • Form validation│  │ • GitHub config  │                 │   │
│ │  └──────────────────┘  └──────────────────┘                 │   │
│ └───────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        LOCAL FILE SYSTEM                             │
│                                                                       │
│  ~/Library/Application Support/task-manager/ (macOS)                 │
│  %APPDATA%/task-manager/ (Windows)                                   │
│  ~/.config/task-manager/ (Linux)                                     │
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   data/         │  │    logs/        │  │   config/       │     │
│  │  └── YYYY/      │  │  └── YYYY-MM-   │  │  ├── index.json │     │
│  │      └── MM/    │  │      DD.log     │  │  ├── jira.enc   │     │
│  │          └── DD │  │                 │  │  └── github.enc │     │
│  │              .md│  │                 │  │                 │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL INTEGRATIONS (Optional)                 │
│                                                                       │
│  ┌──────────────────────┐          ┌──────────────────────┐         │
│  │  Jira Cloud API      │          │  GitHub REST API     │         │
│  │  • Create issues     │          │  • Upload files      │         │
│  │  • Transition issues │          │  • Backup data       │         │
│  └──────────────────────┘          └──────────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Creating a Task

```
User Input (React Form)
         ↓
   window.api.createTask()
         ↓
   IPC → Main Process
         ↓
   TaskService.createTask()
         ├─→ FileSystemService.saveTaskToMarkdown()
         │                      ↓
         │              data/YYYY/MM/DD.md
         ├─→ FileSystemService.updateIndex()
         │                      ↓
         │              config/index.json
         ├─→ LoggerService.log()
         │                      ↓
         │              logs/YYYY-MM-DD.log
         └─→ JiraService.createJiraIssue() [if enabled]
                        ↓
               Jira Cloud API
         ↓
   Return Task Object
         ↓
   React Component Updates
```

### 2. Scheduler Flow (Every 5 Minutes)

```
node-cron triggers
         ↓
SchedulerService.checkUpcomingDeadlines()
         ├─→ TaskService.getUpcomingDeadlines(30min)
         ├─→ TaskService.getUpcomingDeadlines(1hour)
         └─→ TaskService.getUpcomingDeadlines(1day)
                        ↓
         NotificationService.notifyUpcomingDeadline()
                        ↓
              Desktop Notification
                        +
           Renderer Process (IPC event)
```

### 3. Priority Queue Calculation

```
TaskService.getPriorityQueue()
         ↓
   Get tasks: status = 'pending' | 'in_progress'
         ↓
   Sort by:
     1. Priority weight (higher=3, high=2, low=1)
     2. Deadline (sooner first)
     3. Created date (older first)
         ↓
   Return sorted array
```

## Service Responsibilities

### FileSystemService
- **Purpose**: Manage local file I/O for tasks
- **Responsibilities**:
  - Create/update Markdown files
  - Maintain JSON index for fast queries
  - Manage directory structure (YYYY/MM/DD)
  - Provide config file access

### TaskService
- **Purpose**: Business logic for task management
- **Responsibilities**:
  - CRUD operations on tasks
  - Priority queue calculation
  - Search and filtering
  - Status transitions
  - Deadline tracking

### LoggerService
- **Purpose**: Audit trail for all actions
- **Responsibilities**:
  - Log task creation/updates/completion
  - Store previous/new values
  - Daily log file rotation
  - Queryable log history

### SchedulerService
- **Purpose**: Background task automation
- **Responsibilities**:
  - Run cron jobs (every 5 minutes)
  - Check upcoming deadlines
  - Mark missed deadlines
  - Trigger daily GitHub sync
  - Coordinate notifications

### NotificationService
- **Purpose**: User notifications
- **Responsibilities**:
  - Show desktop notifications
  - Send IPC events to renderer
  - Format notification messages
  - Handle notification clicks

### EncryptionService
- **Purpose**: Secure token storage
- **Responsibilities**:
  - Encrypt API tokens (AES-256-CBC)
  - Decrypt stored tokens
  - Key derivation (scrypt)

### JiraService (Optional)
- **Purpose**: Jira integration
- **Responsibilities**:
  - Create Jira issues from tasks
  - Transition issues on completion
  - Manage encrypted Jira config
  - Test connectivity

### GitHubService (Optional)
- **Purpose**: Backup to GitHub
- **Responsibilities**:
  - Sync all MD files and logs
  - Use GitHub API (Octokit)
  - Manage encrypted GitHub token
  - Handle file uploads/updates

## Security Architecture

### Token Encryption

```
User enters token
        ↓
EncryptionService.encrypt(token)
        ↓
AES-256-CBC encryption
   Key: derived from ENCRYPTION_KEY env var
   IV: random 16 bytes
        ↓
Save: iv:encryptedData
        ↓
Store in *.enc.json file
```

### Data Privacy Guarantees

1. **No Cloud Database**: All data in local filesystem
2. **No Analytics**: Zero telemetry or tracking
3. **Optional External**: Jira/GitHub only when enabled
4. **Encrypted Tokens**: Never stored in plaintext
5. **Human-Readable**: Markdown for transparency

## Performance Optimizations

1. **JSON Index**: Fast task queries without parsing all MD files
2. **Lazy Loading**: Only load visible tasks in UI
3. **Debounced Search**: Search input debounced to reduce queries
4. **IPC Batching**: Batch updates when possible
5. **Vite HMR**: Hot module replacement in dev mode

## Offline-First Design

The application is designed to work completely offline:

- **No network required** for core functionality
- **Background sync** for Jira/GitHub when online
- **Graceful degradation** if external services unavailable
- **Local state management** with React hooks
- **File-based persistence** instead of database

## Future Extension Points

Easy to add:
- GitLab integration (similar to GitHub)
- Notion integration
- Todoist sync
- Custom plugins system
- Themes/customization
- Export to PDF/CSV
- Mobile companion app (shared file sync)
