import axios from "axios";
import { Task, AppSettings } from "../../types";
import { EncryptionService } from "./EncryptionService";
import * as fs from "fs";
import * as path from "path";

interface JiraConfig {
  domain: string;
  email: string;
  apiToken: string;
  projectKey: string;
  autoSync: boolean;
  enabled?: boolean;
}

export class JiraService {
  private encryptionService: EncryptionService;
  private configDir: string;
  private configPath: string;

  constructor(encryptionService: EncryptionService, configDir: string) {
    this.encryptionService = encryptionService;
    this.configDir = configDir;
    this.configPath = path.join(configDir, "jira.enc.json");
  }

  async saveSettings(settings: JiraConfig): Promise<void> {
    const encryptedToken = this.encryptionService.encrypt(settings.apiToken);
    const configToSave = {
      ...settings,
      apiToken: encryptedToken,
      enabled: settings.enabled ?? true,
    };

    fs.writeFileSync(this.configPath, JSON.stringify(configToSave, null, 2));
  }

  getSettings(): JiraConfig | null {
    if (!fs.existsSync(this.configPath)) {
      return null;
    }

    const data = fs.readFileSync(this.configPath, "utf-8");
    const config = JSON.parse(data);

    if (config.apiToken) {
      config.apiToken = this.encryptionService.decrypt(config.apiToken);
    }

    if (typeof config.enabled === "undefined") {
      config.enabled = true;
    }

    return config as JiraConfig;
  }

  async createJiraIssue(task: Task): Promise<string | null> {
    const settings = this.getSettings();

    if (!settings || !settings.autoSync) {
      return null;
    }

    try {
      const auth = Buffer.from(
        `${settings.email}:${settings.apiToken}`
      ).toString("base64");

      const issueData = {
        fields: {
          project: {
            key: settings.projectKey,
          },
          summary: task.title,
          description: task.description,
          issuetype: {
            name: "Task",
          },
          priority: {
            name: this.mapPriority(task.priority),
          },
          duedate: task.deadline
            ? new Date(task.deadline).toISOString().split("T")[0]
            : undefined,
        },
      };

      const response = await axios.post(
        `https://${settings.domain}/rest/api/3/issue`,
        issueData,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.key;
    } catch (error) {
      console.error("Failed to create Jira issue:", error);
      return null;
    }
  }

  async transitionJiraIssue(
    issueKey: string,
    transitionName: string = "Done"
  ): Promise<boolean> {
    const settings = this.getSettings();

    if (!settings || !settings.autoSync) {
      return false;
    }

    try {
      const auth = Buffer.from(
        `${settings.email}:${settings.apiToken}`
      ).toString("base64");

      // Get available transitions
      const transitionsResponse = await axios.get(
        `https://${settings.domain}/rest/api/3/issue/${issueKey}/transitions`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
        }
      );

      const transition = transitionsResponse.data.transitions.find(
        (t: any) => t.name.toLowerCase() === transitionName.toLowerCase()
      );

      if (!transition) {
        console.error("Transition not found:", transitionName);
        return false;
      }

      // Execute transition
      await axios.post(
        `https://${settings.domain}/rest/api/3/issue/${issueKey}/transitions`,
        {
          transition: {
            id: transition.id,
          },
        },
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
        }
      );

      return true;
    } catch (error) {
      console.error("Failed to transition Jira issue:", error);
      return false;
    }
  }

  private mapPriority(priority: string): string {
    const mapping: { [key: string]: string } = {
      higher: "Highest",
      high: "High",
      low: "Low",
    };
    return mapping[priority] || "Medium";
  }

  async testConnection(): Promise<boolean> {
    const settings = this.getSettings();

    if (!settings) {
      return false;
    }

    try {
      const auth = Buffer.from(
        `${settings.email}:${settings.apiToken}`
      ).toString("base64");

      await axios.get(`https://${settings.domain}/rest/api/3/myself`, {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      });

      return true;
    } catch (error) {
      console.error("Jira connection test failed:", error);
      return false;
    }
  }
}
