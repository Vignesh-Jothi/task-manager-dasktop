import * as fs from "fs/promises";
import * as path from "path";
import { app } from "electron";
import { Task } from "../../types";

export class MissionLogService {
  private logsDir: string;

  constructor() {
    const userDataPath = app.getPath("userData");
    this.logsDir = path.join(userDataPath, "mission-logs");
  }

  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.logsDir, { recursive: true });
    } catch (error) {
      console.error("Failed to initialize mission logs directory:", error);
    }
  }

  /**
   * Writes a Captain's Log entry for a completed task
   */
  async logTaskCompletion(task: Task): Promise<void> {
    try {
      const today = new Date();
      const dayNumber = this.getDayNumber(today);
      const logPath = this.getLogPath(today);

      // Calculate mission stats
      const duration = task.startedAt
        ? Math.floor(
            (new Date(task.completedAt!).getTime() -
              new Date(task.startedAt).getTime()) /
              (1000 * 60)
          )
        : task.durationMinutes || 0;

      const wasOnTime = task.deadline
        ? new Date(task.completedAt!) <= new Date(task.deadline)
        : true;

      // Build log entry
      const entry = this.buildLogEntry(task, dayNumber, duration, wasOnTime);

      // Append to today's log
      await this.appendToLog(logPath, entry);
    } catch (error) {
      console.error("Failed to write mission log:", error);
    }
  }

  /**
   * Writes a daily summary entry
   */
  async logDailySummary(
    tasksCompleted: number,
    xpEarned: number,
    overallMood: "high" | "medium" | "low"
  ): Promise<void> {
    try {
      const today = new Date();
      const dayNumber = this.getDayNumber(today);
      const logPath = this.getLogPath(today);

      const moodEmoji = {
        high: "🟢",
        medium: "🟡",
        low: "🔴",
      };

      const entry = `
---

### End of Day Summary
**Day ${dayNumber}** | ${today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}

- **Missions Completed:** ${tasksCompleted}
- **XP Earned:** ${xpEarned}
- **Mission Stability:** ${moodEmoji[overallMood]} ${
        overallMood.charAt(0).toUpperCase() + overallMood.slice(1)
      }

*"Another day navigating the void. Systems holding steady."*

---
`;

      await this.appendToLog(logPath, entry);
    } catch (error) {
      console.error("Failed to write daily summary:", error);
    }
  }

  /**
   * Reads the log for a specific date
   */
  async getLogForDate(date: Date): Promise<string | null> {
    try {
      const logPath = this.getLogPath(date);
      const content = await fs.readFile(logPath, "utf-8");
      return content;
    } catch (error) {
      return null;
    }
  }

  /**
   * Lists all available log dates
   */
  async getAvailableLogDates(): Promise<Date[]> {
    try {
      const files = await fs.readdir(this.logsDir);
      const dates = files
        .filter((f) => f.endsWith(".md"))
        .map((f) => {
          const match = f.match(/(\d{4})-(\d{2})-(\d{2})\.md/);
          if (match) {
            return new Date(
              parseInt(match[1]),
              parseInt(match[2]) - 1,
              parseInt(match[3])
            );
          }
          return null;
        })
        .filter((d): d is Date => d !== null)
        .sort((a, b) => b.getTime() - a.getTime());

      return dates;
    } catch (error) {
      return [];
    }
  }

  /**
   * Gets the last N days of logs as a single string
   */
  async getRecentLogs(days: number = 7): Promise<string> {
    try {
      const dates = await this.getAvailableLogDates();
      const recentDates = dates.slice(0, days);

      const logs = await Promise.all(
        recentDates.map(async (date) => {
          const log = await this.getLogForDate(date);
          return log || "";
        })
      );

      return logs.join("\n\n");
    } catch (error) {
      console.error("Failed to get recent logs:", error);
      return "";
    }
  }

  /**
   * Searches logs for a specific term
   */
  async searchLogs(
    searchTerm: string
  ): Promise<Array<{ date: Date; excerpt: string }>> {
    try {
      const dates = await this.getAvailableLogDates();
      const results: Array<{ date: Date; excerpt: string }> = [];

      for (const date of dates) {
        const log = await this.getLogForDate(date);
        if (log && log.toLowerCase().includes(searchTerm.toLowerCase())) {
          // Find excerpt around search term
          const index = log.toLowerCase().indexOf(searchTerm.toLowerCase());
          const start = Math.max(0, index - 100);
          const end = Math.min(log.length, index + 100);
          const excerpt = "..." + log.slice(start, end) + "...";
          results.push({ date, excerpt });
        }
      }

      return results;
    } catch (error) {
      console.error("Failed to search logs:", error);
      return [];
    }
  }

  /**
   * Private helper methods
   */

  private getLogPath(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return path.join(this.logsDir, `${year}-${month}-${day}.md`);
  }

  private getDayNumber(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - startOfYear.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  }

  private buildLogEntry(
    task: Task,
    dayNumber: number,
    duration: number,
    wasOnTime: boolean
  ): string {
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const orbitEmoji = task.orbit
      ? {
          "low-orbit": "🌍",
          "mid-orbit": "🛰️",
          "deep-space": "🌌",
        }[task.orbit.level]
      : "📋";

    const statusEmoji = wasOnTime ? "✅" : "⚠️";

    let moodLine = this.generateMoodLine(task, wasOnTime);

    return `
**${timestamp}** | **Day ${dayNumber}** ${orbitEmoji}

${statusEmoji} Completed: **${task.title}**
${task.description ? `> ${task.description}` : ""}

- Duration: ${duration} minutes
- Orbit Level: ${task.orbit?.level || "standard"}
${task.gravity ? `- Gravity: ${task.gravity}` : ""}
${task.xpValue ? `- XP Earned: +${task.xpValue}` : ""}
${wasOnTime ? "" : "- Status: Completed past deadline"}

*${moodLine}*

---
`;
  }

  private generateMoodLine(task: Task, wasOnTime: boolean): string {
    const moods = wasOnTime
      ? [
          "Mission accomplished. Systems nominal.",
          "Another objective cleared. Fuel levels good.",
          "Hull integrity maintained. Moving forward.",
          "Task secured. Continuing trajectory.",
          "Objective achieved. Morale stable.",
          "Mission complete. No incidents to report.",
          "Smooth flight. All systems operational.",
        ]
      : [
          "Completed, but later than planned. Adjusting course.",
          "Behind schedule, but still moving. Course correcting.",
          "Delayed completion. Need to optimize navigation.",
          "Off timeline, but operational. Recalibrating.",
        ];

    if (task.orbit?.level === "deep-space") {
      return wasOnTime
        ? "Deep-space objective conquered. Significant progress."
        : "Deep-space task completed late. Complex missions require buffer time.";
    }

    return moods[Math.floor(Math.random() * moods.length)];
  }

  private async appendToLog(logPath: string, content: string): Promise<void> {
    try {
      // Check if file exists
      let existing = "";
      try {
        existing = await fs.readFile(logPath, "utf-8");
      } catch {
        // File doesn't exist, create header
        const date = new Date(path.basename(logPath, ".md"));
        existing = `# Captain's Log - ${date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}

*Mission day tracking for Tasktronaut command.*

---
`;
      }

      await fs.writeFile(logPath, existing + content, "utf-8");
    } catch (error) {
      console.error("Failed to append to log:", error);
      throw error;
    }
  }
}

export default MissionLogService;
