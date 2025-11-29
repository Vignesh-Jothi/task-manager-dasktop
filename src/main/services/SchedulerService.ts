import cron from "node-cron";
import { TaskService } from "./TaskService";
import { NotificationService } from "./NotificationService";
import { JiraService } from "./JiraService";
import { GitHubService } from "./GitHubService";
import { LoggerService } from "./LoggerService";
import { EmailService } from "./EmailService";
import { SummaryService } from "./SummaryService";
import { FeatureFlagService } from "./FeatureFlagService";

export class SchedulerService {
  private taskService: TaskService;
  private notificationService: NotificationService;
  private jiraService: JiraService;
  private githubService: GitHubService;
  private loggerService: LoggerService;
  private emailService?: EmailService;
  private summaryService?: SummaryService;
  private featureFlags?: FeatureFlagService;
  private tasks: any[] = [];

  constructor(
    taskService: TaskService,
    notificationService: NotificationService,
    jiraService: JiraService,
    githubService: GitHubService,
    loggerService: LoggerService,
    emailService?: EmailService,
    summaryService?: SummaryService,
    featureFlags?: FeatureFlagService
  ) {
    this.taskService = taskService;
    this.notificationService = notificationService;
    this.jiraService = jiraService;
    this.githubService = githubService;
    this.loggerService = loggerService;
    this.emailService = emailService;
    this.summaryService = summaryService;
    this.featureFlags = featureFlags;
  }

  start(): void {
    // Check for upcoming deadlines every 5 minutes
    const deadlineCheck = cron.schedule("*/5 * * * *", () => {
      this.checkUpcomingDeadlines();
      this.checkMissedDeadlines();
    });
    this.tasks.push(deadlineCheck);

    // Daily GitHub backup at 2 AM
    const dailyBackup = cron.schedule("0 2 * * *", async () => {
      const settings = await this.githubService.getSettings();
      if (
        settings?.enabled &&
        settings?.autoSync &&
        settings?.syncInterval === "daily"
      ) {
        await this.githubService.syncToGitHub();
      }
    });
    this.tasks.push(dailyBackup);

    // Daily summary email 7:00 local
    const dailySummary = cron.schedule("0 7 * * *", async () => {
      await this.sendSummary("daily");
    });
    this.tasks.push(dailySummary);

    // Weekly summary Friday 7:00
    const weeklySummary = cron.schedule("0 7 * * 5", async () => {
      await this.sendSummary("weekly");
    });
    this.tasks.push(weeklySummary);

    // Monthly summary 30th 7:00
    const monthlySummary = cron.schedule("0 7 30 * *", async () => {
      await this.sendSummary("monthly");
    });
    this.tasks.push(monthlySummary);

    console.log("Scheduler started");
  }

  stop(): void {
    this.tasks.forEach((task) => task.stop());
    this.tasks = [];
    console.log("Scheduler stopped");
  }

  private checkUpcomingDeadlines(): void {
    // Check for deadlines in 30 minutes, 1 hour, and 1 day
    const intervals = [30, 60, 1440]; // minutes

    intervals.forEach((minutes) => {
      const tasks = this.taskService.getUpcomingDeadlines(minutes / 60);

      tasks.forEach((task) => {
        // Only notify if we haven't already notified for this interval
        const taskDeadline = new Date(task.deadline!);
        const now = new Date();
        const minutesUntil = Math.floor(
          (taskDeadline.getTime() - now.getTime()) / (1000 * 60)
        );

        // Notify if within 5 minutes of the interval
        if (Math.abs(minutesUntil - minutes) <= 5) {
          this.notificationService.notifyUpcomingDeadline(task, minutesUntil);
        }
      });
    });
  }

  private checkMissedDeadlines(): void {
    const missedTasks = this.taskService.getMissedDeadlines();

    missedTasks.forEach((task) => {
      // Mark as missed if not already
      if (task.status !== "missed") {
        this.taskService.markAsMissed(task.id);
        this.notificationService.notifyMissedDeadline(task);
      }
    });
  }

  async notifyNextTask(): Promise<void> {
    const nextTask = this.taskService.getNextTask();
    if (nextTask) {
      this.notificationService.notifyNextTask(nextTask);
    }
  }

  async sendSummary(type: "daily" | "weekly" | "monthly"): Promise<void> {
    if (!this.emailService || !this.summaryService) return;
    const cfg = this.emailService.getConfig();
    const flags = this.featureFlags?.getFlags();
    if (flags && !flags.enableEmailSummaries) return;
    if (!cfg || !cfg.enabled) return;
    if (type === "daily" && !cfg.daily) return;
    if (type === "weekly" && !cfg.weekly) return;
    if (type === "monthly" && !cfg.monthly) return;

    const all = this.taskService.getAllTasks();
    let summary;
    if (type === "daily") summary = this.summaryService.generateDaily(all);
    else if (type === "weekly")
      summary = this.summaryService.generateWeekly(all);
    else summary = this.summaryService.generateMonthly(all);
    const subject = `${type[0].toUpperCase() + type.slice(1)} Task Summary`;
    await this.emailService.sendEmail(subject, summary.plain);
  }
}
