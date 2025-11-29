export {};

declare global {
  interface Window {
    api: {
      // Task operations
      createTask: (
        title: string,
        description: string,
        priority: string,
        type: string,
        deadline?: string
      ) => Promise<any>;
      updateTask: (taskId: string, updates: any) => Promise<any>;
      completeTask: (taskId: string) => Promise<any>;
      getTask: (taskId: string) => Promise<any>;
      getAllTasks: () => Promise<any[]>;
      getTasksByStatus: (status: string) => Promise<any[]>;
      getTasksByPriority: (priority: string) => Promise<any[]>;
      getTasksByDateRange: (
        startDate: string,
        endDate: string
      ) => Promise<any[]>;
      getPriorityQueue: () => Promise<any[]>;
      getNextTask: () => Promise<any>;
      searchTasks: (query: string) => Promise<any[]>;
      deleteTask: (taskId: string) => Promise<boolean>;

      // Logger operations
      getLogs: (date: string) => Promise<string[]>;
      getAllLogs: () => Promise<string[]>;

      // Jira operations
      saveJiraSettings: (settings: any) => Promise<{ success: boolean }>;
      getJiraSettings: () => Promise<any>;
      testJiraConnection: () => Promise<boolean>;

      // GitHub operations
      saveGitHubSettings: (settings: any) => Promise<{ success: boolean }>;
      getGitHubSettings: () => Promise<any>;
      syncToGitHub: () => Promise<{ success: boolean; message: string }>;
      testGitHubConnection: () => Promise<boolean>;

      // Notification listener
      onNotification: (
        callback: (notification: { title: string; body: string }) => void
      ) => void;
    };
  }
}
