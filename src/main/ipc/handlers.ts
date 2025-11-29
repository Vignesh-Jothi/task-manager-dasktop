import { ipcMain, IpcMainInvokeEvent } from "electron";
import { TaskService } from "../services/TaskService";
import { LoggerService } from "../services/LoggerService";
import { JiraService } from "../services/JiraService";
import { GitHubService } from "../services/GitHubService";
import { SchedulerService } from "../services/SchedulerService";
import { NotificationService } from "../services/NotificationService";
import { Priority, TaskType, TaskStatus, Task } from "../../types";

interface Services {
  taskService: TaskService;
  loggerService: LoggerService;
  jiraService: JiraService;
  githubService: GitHubService;
  schedulerService: SchedulerService;
  notificationService: NotificationService;
}

export function setupIpcHandlers(services: Services): void {
  const {
    taskService,
    loggerService,
    jiraService,
    githubService,
    schedulerService,
    notificationService,
  } = services;

  // Task operations
  ipcMain.handle(
    "task:create",
    async (
      _event: IpcMainInvokeEvent,
      title: string,
      description: string,
      priority: Priority,
      type: TaskType,
      deadline?: string
    ) => {
      const task = taskService.createTask(
        title,
        description,
        priority,
        type,
        deadline
      );

      // Create Jira issue if enabled
      const jiraSettings = jiraService.getSettings();
      if (jiraSettings?.enabled && jiraSettings?.autoSync) {
        const jiraKey = await jiraService.createJiraIssue(task);
        if (jiraKey) {
          taskService.updateTask(task.id, { jiraIssueKey: jiraKey });
        }
      }

      return task;
    }
  );

  ipcMain.handle(
    "task:update",
    async (
      _event: IpcMainInvokeEvent,
      taskId: string,
      updates: Partial<Task>
    ) => {
      return taskService.updateTask(taskId, updates);
    }
  );

  ipcMain.handle(
    "task:start",
    async (_event: IpcMainInvokeEvent, taskId: string) => {
      const task = taskService.startTask(taskId);
      if (task) {
        notificationService.scheduleTimelyFinish(task);
      }
      return task;
    }
  );

  ipcMain.handle(
    "task:complete",
    async (_event: IpcMainInvokeEvent, taskId: string) => {
      const task = taskService.completeTask(taskId);

      if (task) {
        // Transition Jira issue if enabled
        const jiraSettings = jiraService.getSettings();
        if (
          jiraSettings?.enabled &&
          jiraSettings?.autoSync &&
          task.jiraIssueKey
        ) {
          await jiraService.transitionJiraIssue(task.jiraIssueKey);
        }

        // Notify about completion
        notificationService.notifyTaskCompleted(task);

        // Notify about next task
        await schedulerService.notifyNextTask();
      }

      return task;
    }
  );

  ipcMain.handle(
    "task:get",
    async (_event: IpcMainInvokeEvent, taskId: string) => {
      return taskService.getTask(taskId);
    }
  );

  ipcMain.handle("task:getAll", async () => {
    return taskService.getAllTasks();
  });

  ipcMain.handle(
    "task:getPage",
    async (
      _event: IpcMainInvokeEvent,
      offset: number,
      limit: number,
      filters?: {
        status?: TaskStatus | "all";
        priority?: Priority | "all";
        query?: string;
      }
    ) => {
      return taskService.getTasksPage(offset, limit, filters);
    }
  );

  ipcMain.handle(
    "task:getByStatus",
    async (_event: IpcMainInvokeEvent, status: TaskStatus) => {
      return taskService.getTasksByStatus(status);
    }
  );

  ipcMain.handle(
    "task:getByPriority",
    async (_event: IpcMainInvokeEvent, priority: Priority) => {
      return taskService.getTasksByPriority(priority);
    }
  );

  ipcMain.handle(
    "task:getByDateRange",
    async (_event: IpcMainInvokeEvent, startDate: string, endDate: string) => {
      return taskService.getTasksByDateRange(startDate, endDate);
    }
  );

  ipcMain.handle("task:getPriorityQueue", async () => {
    return taskService.getPriorityQueue();
  });

  ipcMain.handle("task:getNextTask", async () => {
    return taskService.getNextTask();
  });

  ipcMain.handle(
    "task:search",
    async (_event: IpcMainInvokeEvent, query: string) => {
      return taskService.searchTasks(query);
    }
  );

  ipcMain.handle(
    "task:delete",
    async (_event: IpcMainInvokeEvent, taskId: string) => {
      return taskService.deleteTask(taskId);
    }
  );

  // Logger operations
  ipcMain.handle(
    "logger:getLogs",
    async (_event: IpcMainInvokeEvent, date: string) => {
      return loggerService.getLogs(new Date(date));
    }
  );

  ipcMain.handle("logger:getAllLogs", async () => {
    return loggerService.getAllLogs();
  });

  // Jira operations
  ipcMain.handle(
    "jira:saveSettings",
    async (_event: IpcMainInvokeEvent, settings: any) => {
      await jiraService.saveSettings(settings);
      return { success: true };
    }
  );

  ipcMain.handle("jira:getSettings", async () => {
    return jiraService.getSettings();
  });

  ipcMain.handle("jira:testConnection", async () => {
    return await jiraService.testConnection();
  });

  // GitHub operations
  ipcMain.handle(
    "github:saveSettings",
    async (_event: IpcMainInvokeEvent, settings: any) => {
      await githubService.saveSettings(settings);
      return { success: true };
    }
  );

  ipcMain.handle("github:getSettings", async () => {
    return githubService.getSettings();
  });

  ipcMain.handle("github:sync", async () => {
    return await githubService.syncToGitHub();
  });

  ipcMain.handle("github:testConnection", async () => {
    return await githubService.testConnection();
  });
}
