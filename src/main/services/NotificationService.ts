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
    const urgencyMessages = [
      `⏰ Heads up!`,
      `⚠️ Time's ticking!`,
      `🔔 Don't forget!`,
      `⏳ Reminder!`,
      `📢 Attention needed!`,
    ];
    const randomTitle =
      urgencyMessages[Math.floor(Math.random() * urgencyMessages.length)];
    const title = `${randomTitle} ${task.title}`;
    const body = `Due in ${minutesUntil} minutes! Priority: ${task.priority.toUpperCase()}`;
    this.showNotification(title, body);
  }

  notifyMissedDeadline(task: Task): void {
    const title = `❌ Missed Deadline: ${task.title}`;
    const body = `This task has passed its deadline. Please review and take action.`;
    this.showNotification(title, body);
  }

  notifyNextTask(task: Task): void {
    const nextTaskMessages = [
      `🎯 Up next`,
      `👉 Next in queue`,
      `📋 Ready to tackle`,
      `🚀 Let's do this`,
      `💪 Time for`,
    ];
    const randomPrefix =
      nextTaskMessages[Math.floor(Math.random() * nextTaskMessages.length)];
    const title = `${randomPrefix}: ${task.title}`;
    const body = `Priority: ${task.priority.toUpperCase()}${
      task.deadline
        ? ` | Deadline: ${new Date(task.deadline).toLocaleString()}`
        : ""
    }`;
    this.showNotification(title, body);
  }

  notifyTaskCompleted(task: Task): void {
    const congratulations = [
      "🎉 Awesome! You crushed it!",
      "⭐ Fantastic work! Keep it up!",
      "🚀 You're on fire! Great job!",
      "💪 Incredible! Another one down!",
      "🌟 Superb! You're making progress!",
      "🎊 Outstanding work! Well done!",
      "✨ Brilliant! You did it!",
      "🏆 Champion! Task conquered!",
      "🎯 Perfect! Target achieved!",
      "💎 Excellent! You're unstoppable!",
      "🌈 Magnificent! Keep going!",
      "⚡ Lightning fast! Amazing!",
      "🔥 Hot streak! Keep it burning!",
      "🎪 Spectacular! Round of applause!",
      "🦸 Hero mode activated!",
    ];

    const randomMessage =
      congratulations[Math.floor(Math.random() * congratulations.length)];

    this.showNotification(randomMessage, `Completed: ${task.title}`);
  }
}
