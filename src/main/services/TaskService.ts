import { Task, TaskStatus, Priority, TaskType, TaskLog } from "../../types";
import { FileSystemService } from "./FileSystemService";
import { LoggerService } from "./LoggerService";
import { v4 as uuidv4 } from "uuid";

export class TaskService {
  private fileSystemService: FileSystemService;
  private loggerService: LoggerService;

  constructor(
    fileSystemService: FileSystemService,
    loggerService: LoggerService
  ) {
    this.fileSystemService = fileSystemService;
    this.loggerService = loggerService;
  }

  createTask(
    title: string,
    description: string,
    priority: Priority,
    type: TaskType,
    deadline?: string,
    projectId?: string
  ): Task {
    const task: Task = {
      id: uuidv4(),
      title,
      description,
      priority,
      status: "pending",
      type,
      deadline,
      projectId,
      createdAt: new Date().toISOString(),
    };

    // Save to markdown
    this.fileSystemService.saveTaskToMarkdown(task);

    // Update index
    const index = this.fileSystemService.loadIndex();
    index.tasks[task.id] = task;
    this.fileSystemService.saveIndex(index);

    // Log the action
    this.loggerService.log({
      timestamp: new Date().toISOString(),
      taskId: task.id,
      action: "created",
      newValue: task,
    });

    return task;
  }

  updateTask(taskId: string, updates: Partial<Task>): Task | null {
    const index = this.fileSystemService.loadIndex();
    const task = index.tasks[taskId];

    if (!task) {
      return null;
    }

    // Restrict edits for completed tasks older than 24h
    if (task.status === "completed" && task.completedAt) {
      const completedAt = new Date(task.completedAt).getTime();
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
      if (completedAt < twentyFourHoursAgo) {
        return null;
      }
    }

    const previousValue = { ...task };
    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Update in index
    index.tasks[taskId] = updatedTask;
    this.fileSystemService.saveIndex(index);

    // Update in markdown
    this.fileSystemService.updateTaskInMarkdown(updatedTask);

    // Log the action
    this.loggerService.log({
      timestamp: new Date().toISOString(),
      taskId,
      action: "updated",
      previousValue,
      newValue: updatedTask,
    });

    return updatedTask;
  }

  completeTask(taskId: string): Task | null {
    const task = this.updateTask(taskId, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });

    if (task) {
      this.loggerService.log({
        timestamp: new Date().toISOString(),
        taskId,
        action: "completed",
        newValue: task,
      });
    }

    return task;
  }

  markAsMissed(taskId: string): Task | null {
    const task = this.updateTask(taskId, {
      status: "missed",
    });

    if (task) {
      this.loggerService.log({
        timestamp: new Date().toISOString(),
        taskId,
        action: "missed",
        newValue: task,
      });
    }

    return task;
  }

  getTask(taskId: string): Task | null {
    const index = this.fileSystemService.loadIndex();
    return index.tasks[taskId] || null;
  }

  getAllTasks(): Task[] {
    const index = this.fileSystemService.loadIndex();
    return Object.values(index.tasks);
  }

  getTasksPage(
    offset: number,
    limit: number,
    filters?: {
      status?: TaskStatus | "all";
      priority?: Priority | "all";
      query?: string;
    }
  ): { items: Task[]; total: number } {
    const all = this.getAllTasks();
    let filtered = all;

    if (filters?.status && filters.status !== "all") {
      filtered = filtered.filter((t) => t.status === filters.status);
    }
    if (filters?.priority && filters.priority !== "all") {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }
    if (filters?.query && filters.query.trim()) {
      const q = filters.query.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    const total = filtered.length;
    const items = filtered.slice(offset, offset + limit);
    return { items, total };
  }

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.getAllTasks().filter((task) => task.status === status);
  }

  getTasksByPriority(priority: Priority): Task[] {
    return this.getAllTasks().filter((task) => task.priority === priority);
  }

  getTasksByDateRange(startDate: string, endDate: string): Task[] {
    return this.getAllTasks().filter((task) => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= new Date(startDate) && taskDate <= new Date(endDate);
    });
  }

  getPriorityQueue(): Task[] {
    const tasks = this.getTasksByStatus("pending").concat(
      this.getTasksByStatus("in_progress")
    );

    // Sort by priority and deadline
    const priorityWeight = { higher: 3, high: 2, low: 1 };

    return tasks.sort((a, b) => {
      // First by priority
      const priorityDiff =
        priorityWeight[b.priority] - priorityWeight[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by deadline (if exists)
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      if (a.deadline) return -1;
      if (b.deadline) return 1;

      // Finally by creation date
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }

  getNextTask(): Task | null {
    const queue = this.getPriorityQueue();
    return queue.length > 0 ? queue[0] : null;
  }

  searchTasks(query: string): Task[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllTasks().filter(
      (task) =>
        task.title.toLowerCase().includes(lowerQuery) ||
        task.description.toLowerCase().includes(lowerQuery)
    );
  }

  getUpcomingDeadlines(hoursAhead: number): Task[] {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

    return this.getAllTasks().filter((task) => {
      if (!task.deadline || task.status === "completed") return false;

      const deadline = new Date(task.deadline);
      return deadline > now && deadline <= futureTime;
    });
  }

  getMissedDeadlines(): Task[] {
    const now = new Date();

    return this.getAllTasks().filter((task) => {
      if (!task.deadline || task.status === "completed") return false;

      const deadline = new Date(task.deadline);
      return deadline < now;
    });
  }

  deleteTask(taskId: string): boolean {
    const index = this.fileSystemService.loadIndex();
    const task = index.tasks[taskId];

    if (!task) {
      return false;
    }

    // Restrict deletes for completed tasks older than 24h
    if (task.status === "completed" && task.completedAt) {
      const completedAt = new Date(task.completedAt).getTime();
      const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
      if (completedAt < twentyFourHoursAgo) {
        return false;
      }
    }

    // Remove from index
    delete index.tasks[taskId];
    this.fileSystemService.saveIndex(index);

    // Log the action
    this.loggerService.log({
      timestamp: new Date().toISOString(),
      taskId,
      action: "deleted",
      previousValue: task,
    });

    return true;
  }

  startTask(taskId: string): Task | null {
    const index = this.fileSystemService.loadIndex();
    const task = index.tasks[taskId];
    if (!task) return null;

    const previousValue = { ...task };
    const updatedTask: Task = {
      ...task,
      status: "in_progress",
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    index.tasks[taskId] = updatedTask;
    this.fileSystemService.saveIndex(index);
    this.fileSystemService.updateTaskInMarkdown(updatedTask);
    this.loggerService.log({
      timestamp: new Date().toISOString(),
      taskId,
      action: "updated",
      previousValue,
      newValue: updatedTask,
    });
    return updatedTask;
  }
}
