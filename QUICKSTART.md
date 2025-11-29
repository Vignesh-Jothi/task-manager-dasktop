# Task Manager - Quick Start Guide

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Build the Application**
   ```bash
   npm run build
   ```

3. **Run the Application**
   ```bash
   npm start
   ```

## First-Time Setup

### 1. Create Your First Task

1. Click "Create Task" in the navigation
2. Fill in the form:
   - **Title**: "Test Task"
   - **Description**: "My first task"
   - **Priority**: Higher
   - **Type**: Daily
   - **Deadline**: (optional) Tomorrow's date
3. Click "Create Task"

### 2. View Your Tasks

- Click "Dashboard" to see all tasks
- Use the view modes: Today, Week, Month, Priority Queue
- Use filters to search by status or priority

### 3. Complete a Task

1. Click on a task to expand it
2. Click "Complete" button
3. You'll see a notification for the next task in queue

## Optional Features

### Enable Jira Integration

1. Go to Settings → Jira Integration
2. Get API token from: https://id.atlassian.com/manage/api-tokens
3. Fill in your Jira details
4. Enable "Auto-Sync"
5. Test the connection

### Enable GitHub Backup

1. Go to Settings → GitHub Backup
2. Create a private GitHub repository
3. Generate token: https://github.com/settings/tokens (repo scope)
4. Fill in repository details (format: username/repo-name)
5. Choose sync mode (Daily or Manual)
6. Test the connection
7. Click "Sync Now" to backup immediately

## Data Location

Your data is stored locally at:

- **macOS**: `~/Library/Application Support/task-manager/`
- **Windows**: `%APPDATA%/task-manager/`
- **Linux**: `~/.config/task-manager/`

Inside you'll find:
- `data/` - Your task Markdown files
- `logs/` - Audit logs
- `config/` - Settings and task index

## Tips

- Use Priority Queue view to see tasks sorted by importance
- Set deadlines to get automatic notifications
- All your data is human-readable Markdown - open the files directly!
- Check logs to see complete history of all changes

## Notifications

The app will notify you:
- 1 day before deadline
- 1 hour before deadline
- 30 minutes before deadline
- When a deadline is missed
- When you complete a task (shows next task)

## Need Help?

Check the main README.md for:
- Detailed architecture
- Customization options
- Troubleshooting
- Development guide
