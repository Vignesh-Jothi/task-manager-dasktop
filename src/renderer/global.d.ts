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
      startTask: (taskId: string) => Promise<any>;
      getTask: (taskId: string) => Promise<any>;
      getAllTasks: () => Promise<any[]>;
      getTasksByStatus: (status: string) => Promise<any[]>;
      getTasksByPriority: (priority: string) => Promise<any[]>;
      getTasksByDateRange: (
        startDate: string,
        endDate: string
      ) => Promise<any[]>;
      getPriorityQueue: () => Promise<any[]>;
      getTasksPage: (
        offset: number,
        limit: number,
        filters?: { status?: string; priority?: string; query?: string }
      ) => Promise<{ items: any[]; total: number }>;
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

      // App operations
      relaunchApp: () => Promise<void>;

      // Email summary operations
      getEmailConfig: () => Promise<any>;
      saveEmailConfig: (config: any) => Promise<{ success: boolean }>;
      sendSummaryEmail: (
        type: "daily" | "weekly" | "monthly"
      ) => Promise<{ success: boolean }>;
      generateSummary: (
        type: "daily" | "weekly" | "monthly"
      ) => Promise<{ plain: string; metrics: any }>;

      // Feature flags
      getFeatureFlags: () => Promise<{
        enableSplash: boolean;
        enableTooltips: boolean;
        enableEmailSummaries: boolean;
      }>;
      saveFeatureFlags: (flags: {
        enableSplash: boolean;
        enableTooltips: boolean;
        enableEmailSummaries: boolean;
      }) => Promise<{ success: boolean }>;

      // Notification listener
      onNotification: (
        callback: (notification: { title: string; body: string }) => void
      ) => void;
    };
  }
}
