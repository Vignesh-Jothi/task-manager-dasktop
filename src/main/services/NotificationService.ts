import { BrowserWindow, Notification } from "electron";
import { Task } from "../../types";

export class NotificationService {
  private window: BrowserWindow | null;

  constructor(window: BrowserWindow | null) {
    this.window = window;
  }

  setWindow(window: BrowserWindow | null): void {
    this.window = window;
  }

  showNotification(title: string, body: string): void {
    if (Notification.isSupported()) {
      const notification = new Notification({
        title,
        body,
      });
      notification.show();
    }

    // Also send to renderer process if window exists
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send("notification", { title, body });
    }
  }

  notifyUpcomingDeadline(task: Task, minutesUntil: number): void {
    const title = `Deadline Approaching: ${task.title}`;
    const body = `Task "${task.title}" is due in ${minutesUntil} minutes!`;
    this.showNotification(title, body);
  }

  notifyMissedDeadline(task: Task): void {
    const title = `Missed Deadline: ${task.title}`;
    const body = `Task "${task.title}" has passed its deadline.`;
    this.showNotification(title, body);
  }

  notifyNextTask(task: Task): void {
    const title = `Next Task: ${task.title}`;
    const body = `Priority: ${task.priority.toUpperCase()}${
      task.deadline
        ? ` | Deadline: ${new Date(task.deadline).toLocaleString()}`
        : ""
    }`;
    this.showNotification(title, body);
  }

  notifyTaskCompleted(task: Task): void {
    const title = `Task Completed: ${task.title}`;
    const body = `Great job! Task marked as completed.`;
    this.showNotification(title, body);
  }
}
