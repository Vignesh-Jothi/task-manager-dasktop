import * as fs from "fs";
import * as path from "path";
import { TaskLog } from "../../types";

export class LoggerService {
  private logsDir: string;

  constructor(logsDir: string) {
    this.logsDir = logsDir;
  }

  initialize(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  private getLogFilePath(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return path.join(this.logsDir, `${year}-${month}-${day}.log`);
  }

  log(taskLog: TaskLog): void {
    const logEntry = this.formatLogEntry(taskLog);
    const logFilePath = this.getLogFilePath();

    fs.appendFileSync(logFilePath, logEntry + "\n");
  }

  private formatLogEntry(taskLog: TaskLog): string {
    const { timestamp, taskId, action, previousValue, newValue } = taskLog;

    let entry = `[${timestamp}] Task: ${taskId} | Action: ${action.toUpperCase()}`;

    if (previousValue || newValue) {
      entry += "\n  Previous: " + JSON.stringify(previousValue || {});
      entry += "\n  New: " + JSON.stringify(newValue || {});
    }

    return entry;
  }

  getLogs(date: Date): string[] {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const logFilePath = path.join(this.logsDir, `${year}-${month}-${day}.log`);

    if (!fs.existsSync(logFilePath)) {
      return [];
    }

    const content = fs.readFileSync(logFilePath, "utf-8");
    return content.split("\n").filter((line) => line.trim());
  }

  getAllLogs(): string[] {
    if (!fs.existsSync(this.logsDir)) {
      return [];
    }

    return fs
      .readdirSync(this.logsDir)
      .filter((file) => file.endsWith(".log"))
      .sort()
      .reverse();
  }
}
