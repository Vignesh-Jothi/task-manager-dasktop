import { Octokit } from "@octokit/rest";
import { EncryptionService } from "./EncryptionService";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

interface GitHubConfig {
  enabled: boolean;
  token: string;
  repo: string; // format: owner/repo
  autoSync: boolean;
  syncInterval: "daily" | "manual";
}

export class GitHubService {
  private encryptionService: EncryptionService;
  private configDir: string;
  private dataDir: string;
  private logsDir: string;
  private configPath: string;
  private octokit: Octokit | null = null;

  constructor(
    encryptionService: EncryptionService,
    configDir: string,
    dataDir: string,
    logsDir: string
  ) {
    this.encryptionService = encryptionService;
    this.configDir = configDir;
    this.dataDir = dataDir;
    this.logsDir = logsDir;
    this.configPath = path.join(configDir, "github.enc.json");
  }

  async saveSettings(settings: GitHubConfig): Promise<void> {
    const encryptedToken = this.encryptionService.encrypt(settings.token);
    const configToSave = {
      ...settings,
      token: encryptedToken,
    };

    fs.writeFileSync(this.configPath, JSON.stringify(configToSave, null, 2));

    // Initialize Octokit with new token
    if (settings.enabled) {
      this.octokit = new Octokit({ auth: settings.token });
    }
  }

  getSettings(): GitHubConfig | null {
    if (!fs.existsSync(this.configPath)) {
      return null;
    }

    const data = fs.readFileSync(this.configPath, "utf-8");
    const config = JSON.parse(data);

    if (config.token) {
      config.token = this.encryptionService.decrypt(config.token);
    }

    return config;
  }

  private initializeOctokit(): void {
    if (this.octokit) return;

    const settings = this.getSettings();
    if (settings && settings.enabled) {
      this.octokit = new Octokit({ auth: settings.token });
    }
  }

  async syncToGitHub(): Promise<{ success: boolean; message: string }> {
    const settings = this.getSettings();

    if (!settings || !settings.enabled) {
      return { success: false, message: "GitHub sync is not enabled" };
    }

    this.initializeOctokit();

    if (!this.octokit) {
      return { success: false, message: "GitHub client not initialized" };
    }

    try {
      const [owner, repo] = settings.repo.split("/");

      // Get all files to upload
      const files = this.getAllFiles();

      // Upload each file
      for (const file of files) {
        await this.uploadFile(owner, repo, file.path, file.content);
      }

      return {
        success: true,
        message: `Successfully synced ${files.length} files to GitHub`,
      };
    } catch (error: any) {
      console.error("GitHub sync failed:", error);
      return { success: false, message: `Sync failed: ${error.message}` };
    }
  }

  private getAllFiles(): Array<{ path: string; content: string }> {
    const files: Array<{ path: string; content: string }> = [];

    // Get all markdown files from data directory
    this.collectFiles(this.dataDir, files, "data");

    // Get all log files
    this.collectFiles(this.logsDir, files, "logs");

    // Add index.json
    const indexPath = path.join(this.configDir, "index.json");
    if (fs.existsSync(indexPath)) {
      files.push({
        path: "config/index.json",
        content: fs.readFileSync(indexPath, "utf-8"),
      });
    }

    return files;
  }

  private collectFiles(
    dir: string,
    files: Array<{ path: string; content: string }>,
    prefix: string
  ): void {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        this.collectFiles(fullPath, files, `${prefix}/${entry.name}`);
      } else {
        files.push({
          path: `${prefix}/${entry.name}`,
          content: fs.readFileSync(fullPath, "utf-8"),
        });
      }
    }
  }

  private async uploadFile(
    owner: string,
    repo: string,
    filePath: string,
    content: string
  ): Promise<void> {
    if (!this.octokit) return;

    try {
      // Get current file SHA if it exists
      let sha: string | undefined;
      try {
        const { data } = await this.octokit.repos.getContent({
          owner,
          repo,
          path: filePath,
        });

        if ("sha" in data) {
          sha = data.sha;
        }
      } catch (error) {
        // File doesn't exist, that's okay
      }

      // Create or update file
      await this.octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path: filePath,
        message: `Update ${filePath}`,
        content: Buffer.from(content).toString("base64"),
        sha,
      });
    } catch (error) {
      console.error(`Failed to upload ${filePath}:`, error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    const settings = this.getSettings();

    if (!settings) {
      return false;
    }

    try {
      this.initializeOctokit();

      if (!this.octokit) {
        return false;
      }

      const [owner, repo] = settings.repo.split("/");
      await this.octokit.repos.get({ owner, repo });

      return true;
    } catch (error) {
      console.error("GitHub connection test failed:", error);
      return false;
    }
  }
}
