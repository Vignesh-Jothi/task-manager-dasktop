import nodemailer from "nodemailer";
import { FileSystemService } from "./FileSystemService";
import { LoggerService } from "./LoggerService";

export interface EmailConfig {
  enabled: boolean;
  to: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
  };
  daily: boolean;
  weekly: boolean;
  monthly: boolean;
}

export class EmailService {
  private fileSystem: FileSystemService;
  private logger: LoggerService;
  private readonly CONFIG_FILE = "email-config.json";

  constructor(fileSystem: FileSystemService, logger: LoggerService) {
    this.fileSystem = fileSystem;
    this.logger = logger;
  }

  getConfig(): EmailConfig | null {
    const data = this.fileSystem.loadConfig(this.CONFIG_FILE);
    return data || null;
  }

  saveConfig(config: EmailConfig): void {
    this.fileSystem.saveConfig(this.CONFIG_FILE, config);
  }

  async sendEmail(
    subject: string,
    body: string
  ): Promise<{ success: boolean; message: string }> {
    const cfg = this.getConfig();
    if (!cfg || !cfg.enabled) {
      return { success: false, message: "Email not enabled" };
    }
    if (!cfg.to || !cfg.smtp.host || !cfg.smtp.user || !cfg.smtp.pass) {
      return { success: false, message: "Incomplete SMTP configuration" };
    }

    try {
      const transporter = nodemailer.createTransport({
        host: cfg.smtp.host,
        port: cfg.smtp.port || 587,
        secure: cfg.smtp.secure || false,
        auth: {
          user: cfg.smtp.user,
          pass: cfg.smtp.pass,
        },
      });

      await transporter.sendMail({
        from: cfg.smtp.user,
        to: cfg.to,
        subject,
        text: body,
      });

      this.logger.log({
        timestamp: new Date().toISOString(),
        taskId: "summary",
        action: "email_sent",
        newValue: { subject },
      });

      return { success: true, message: "Email sent" };
    } catch (err: any) {
      this.logger.log({
        timestamp: new Date().toISOString(),
        taskId: "summary",
        action: "email_error",
        newValue: { error: err.message },
      });
      return { success: false, message: "Failed: " + err.message };
    }
  }
}
