import * as fs from "fs";
import * as path from "path";
import { Task, TaskIndex } from "../../types";

export class FileSystemService {
  private dataDir: string;
  private configDir: string;
  private indexPath: string;

  constructor(dataDir: string, configDir: string) {
    this.dataDir = dataDir;
    this.configDir = configDir;
    this.indexPath = path.join(configDir, "index.json");
  }

  initialize(): void {
    // Create necessary directories
    this.ensureDir(this.dataDir);
    this.ensureDir(this.configDir);

    // Initialize index if not exists
    if (!fs.existsSync(this.indexPath)) {
      const emptyIndex: TaskIndex = {
        tasks: {},
        lastUpdated: new Date().toISOString(),
      };
      this.saveIndex(emptyIndex);
    }
  }

  private ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  getTaskFilePath(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const dirPath = path.join(this.dataDir, String(year), month);
    this.ensureDir(dirPath);

    return path.join(dirPath, `${day}.md`);
  }

  saveTaskToMarkdown(task: Task): void {
    const date = new Date(task.createdAt);
    const filePath = this.getTaskFilePath(date);

    const markdown = this.taskToMarkdown(task);

    // Append to file
    if (fs.existsSync(filePath)) {
      fs.appendFileSync(filePath, "\n\n" + markdown);
    } else {
      const header = `# Tasks for ${date.toISOString().split("T")[0]}\n\n`;
      fs.writeFileSync(filePath, header + markdown);
    }
  }

  updateTaskInMarkdown(task: Task): void {
    // For updates, we need to find and replace in the markdown file
    const date = new Date(task.createdAt);
    const filePath = this.getTaskFilePath(date);

    if (!fs.existsSync(filePath)) {
      return;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    const taskRegex = new RegExp(
      `## \\[${task.id}\\][\\s\\S]*?(?=\\n## \\[|$)`,
      "g"
    );
    const newMarkdown = this.taskToMarkdown(task);

    const updatedContent = content.replace(taskRegex, newMarkdown);
    fs.writeFileSync(filePath, updatedContent);
  }

  private taskToMarkdown(task: Task): string {
    return `## [${task.id}] ${task.title}

**Status:** ${task.status}  
**Priority:** ${task.priority}  
**Type:** ${task.type}  
**Deadline:** ${task.deadline || "None"}  
**Created:** ${task.createdAt}  
**Completed:** ${task.completedAt || "Not completed"}  
${task.jiraIssueKey ? `**Jira:** ${task.jiraIssueKey}` : ""}
${task.projectId ? `**Project:** ${task.projectId}` : ""}

### Description
${task.description}`;
  }

  loadIndex(): TaskIndex {
    if (!fs.existsSync(this.indexPath)) {
      return { tasks: {}, lastUpdated: new Date().toISOString() };
    }

    const data = fs.readFileSync(this.indexPath, "utf-8");
    return JSON.parse(data);
  }

  saveIndex(index: TaskIndex): void {
    index.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.indexPath, JSON.stringify(index, null, 2));
  }

  getConfigPath(filename: string): string {
    return path.join(this.configDir, filename);
  }

  saveConfig(filename: string, data: any): void {
    const filePath = this.getConfigPath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  loadConfig(filename: string): any {
    const filePath = this.getConfigPath(filename);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
  }

  getDataDir(): string {
    return this.dataDir;
  }

  getConfigDir(): string {
    return this.configDir;
  }
}
