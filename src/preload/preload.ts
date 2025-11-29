import { contextBridge, ipcRenderer } from "electron";

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  // Task operations
  createTask: (
    title: string,
    description: string,
    priority: string,
    type: string,
    deadline?: string
  ) =>
    ipcRenderer.invoke(
      "task:create",
      title,
      description,
      priority,
      type,
      deadline
    ),

  updateTask: (taskId: string, updates: any) =>
    ipcRenderer.invoke("task:update", taskId, updates),

  completeTask: (taskId: string) => ipcRenderer.invoke("task:complete", taskId),
  startTask: (taskId: string) => ipcRenderer.invoke("task:start", taskId),

  getTask: (taskId: string) => ipcRenderer.invoke("task:get", taskId),

  getAllTasks: () => ipcRenderer.invoke("task:getAll"),

  getTasksPage: (
    offset: number,
    limit: number,
    filters?: { status?: string; priority?: string; query?: string }
  ) => ipcRenderer.invoke("task:getPage", offset, limit, filters),

  getTasksByStatus: (status: string) =>
    ipcRenderer.invoke("task:getByStatus", status),

  getTasksByPriority: (priority: string) =>
    ipcRenderer.invoke("task:getByPriority", priority),

  getTasksByDateRange: (startDate: string, endDate: string) =>
    ipcRenderer.invoke("task:getByDateRange", startDate, endDate),

  getPriorityQueue: () => ipcRenderer.invoke("task:getPriorityQueue"),

  getNextTask: () => ipcRenderer.invoke("task:getNextTask"),

  searchTasks: (query: string) => ipcRenderer.invoke("task:search", query),
  deleteTask: (taskId: string) => ipcRenderer.invoke("task:delete", taskId),

  // Logger operations
  getLogs: (date: string) => ipcRenderer.invoke("logger:getLogs", date),

  getAllLogs: () => ipcRenderer.invoke("logger:getAllLogs"),

  // Jira operations
  saveJiraSettings: (settings: any) =>
    ipcRenderer.invoke("jira:saveSettings", settings),

  getJiraSettings: () => ipcRenderer.invoke("jira:getSettings"),

  testJiraConnection: () => ipcRenderer.invoke("jira:testConnection"),

  // GitHub operations
  saveGitHubSettings: (settings: any) =>
    ipcRenderer.invoke("github:saveSettings", settings),

  getGitHubSettings: () => ipcRenderer.invoke("github:getSettings"),

  syncToGitHub: () => ipcRenderer.invoke("github:sync"),

  testGitHubConnection: () => ipcRenderer.invoke("github:testConnection"),

  // Notification listener
  onNotification: (
    callback: (notification: { title: string; body: string }) => void
  ) => {
    ipcRenderer.on("notification", (_, notification) => callback(notification));
  },
});
