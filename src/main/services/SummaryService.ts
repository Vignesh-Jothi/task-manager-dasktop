import { Task } from "../../types";

export interface SummaryResult {
  plain: string;
  metrics: Record<string, any>;
}

export class SummaryService {
  constructor() {}

  private isSameDay(dateIso: string, reference: Date): boolean {
    const d = new Date(dateIso);
    return (
      d.getFullYear() === reference.getFullYear() &&
      d.getMonth() === reference.getMonth() &&
      d.getDate() === reference.getDate()
    );
  }

  private inLastDays(dateIso: string, days: number): boolean {
    const d = new Date(dateIso).getTime();
    const now = Date.now();
    return d >= now - days * 24 * 60 * 60 * 1000 && d <= now;
  }

  generateDaily(tasks: Task[]): SummaryResult {
    const today = new Date();
    const createdToday = tasks.filter((t) =>
      this.isSameDay(t.createdAt, today)
    );
    const completedToday = tasks.filter(
      (t) => t.completedAt && this.isSameDay(t.completedAt, today)
    );
    const pending = tasks.filter((t) => t.status === "pending");
    const inProgress = tasks.filter((t) => t.status === "in_progress");
    const overdue = tasks.filter(
      (t) =>
        t.deadline && new Date(t.deadline) < today && t.status !== "completed"
    );

    const topPriority = pending
      .concat(inProgress)
      .sort((a, b) => {
        const weight: any = { higher: 3, high: 2, low: 1 };
        return (
          weight[b.priority] - weight[a.priority] ||
          (a.deadline ? new Date(a.deadline).getTime() : Infinity) -
            (b.deadline ? new Date(b.deadline).getTime() : Infinity)
        );
      })
      .slice(0, 5);

    const plain = [
      `Daily Task Summary - ${today.toDateString()}`,
      "",
      `Created Today: ${createdToday.length}`,
      `Completed Today: ${completedToday.length}`,
      `Pending: ${pending.length}`,
      `In Progress: ${inProgress.length}`,
      `Overdue: ${overdue.length}`,
      "",
      "Top Focus Tasks:",
      ...topPriority.map(
        (t) =>
          `- [${t.priority}] ${t.title}${
            t.deadline ? " (Due " + t.deadline.split("T")[0] + ")" : ""
          }`
      ),
    ].join("\n");

    return {
      plain,
      metrics: {
        createdToday: createdToday.length,
        completedToday: completedToday.length,
        pending: pending.length,
        inProgress: inProgress.length,
        overdue: overdue.length,
        topIds: topPriority.map((t) => t.id),
      },
    };
  }

  generateWeekly(tasks: Task[]): SummaryResult {
    const created = tasks.filter((t) => this.inLastDays(t.createdAt, 7));
    const completed = tasks.filter(
      (t) => t.completedAt && this.inLastDays(t.completedAt, 7)
    );
    const overdue = tasks.filter(
      (t) =>
        t.deadline &&
        new Date(t.deadline) < new Date() &&
        t.status !== "completed"
    );
    const plain = [
      `Weekly Task Summary (Last 7 Days)`,
      "",
      `Created: ${created.length}`,
      `Completed: ${completed.length}`,
      `Overdue: ${overdue.length}`,
      "",
      "Recently Completed:",
      ...completed.slice(-10).map((t) => `- ${t.title}`),
    ].join("\n");
    return {
      plain,
      metrics: {
        created: created.length,
        completed: completed.length,
        overdue: overdue.length,
      },
    };
  }

  generateMonthly(tasks: Task[]): SummaryResult {
    const created = tasks.filter((t) => this.inLastDays(t.createdAt, 30));
    const completed = tasks.filter(
      (t) => t.completedAt && this.inLastDays(t.completedAt, 30)
    );
    const plain = [
      `Monthly Task Summary (Last 30 Days)`,
      "",
      `Created: ${created.length}`,
      `Completed: ${completed.length}`,
      "",
      "Highlights:",
      ...completed.slice(-15).map((t) => `- ${t.title}`),
    ].join("\n");
    return {
      plain,
      metrics: { created: created.length, completed: completed.length },
    };
  }
}
