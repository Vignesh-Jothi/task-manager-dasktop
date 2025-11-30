import React, { useState, useEffect } from "react";
import { Task } from "../../types";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface AbortMissionModeProps {
  tasks: Task[];
  onExit: () => void;
  onTasksFiltered: (filteredTasks: Task[]) => void;
}

const AbortMissionMode: React.FC<AbortMissionModeProps> = ({
  tasks,
  onExit,
  onTasksFiltered,
}) => {
  const [criticalTasks, setCriticalTasks] = useState<Task[]>([]);
  const [hiddenCount, setHiddenCount] = useState(0);

  useEffect(() => {
    filterCriticalTasks();
  }, [tasks]);

  const filterCriticalTasks = () => {
    // Only show tasks that are:
    // 1. Marked as abort-protected
    // 2. Deep-space orbit with deadline today/tomorrow
    // 3. High gravity (>70)
    // 4. Overdue

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayStr = today.toISOString().split("T")[0];
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const critical = tasks.filter((task) => {
      if (task.status === "completed" || task.status === "missed") return false;

      // Abort-protected tasks always show
      if (task.abortProtected) return true;

      // Overdue tasks
      if (task.deadline && task.deadline < todayStr) return true;

      // Deep-space with urgent deadline
      if (
        task.orbit?.level === "deep-space" &&
        task.deadline &&
        (task.deadline === todayStr || task.deadline === tomorrowStr)
      ) {
        return true;
      }

      // High gravity tasks
      if ((task.gravity || 0) > 70) return true;

      return false;
    });

    setCriticalTasks(critical);
    setHiddenCount(
      tasks.filter((t) => t.status !== "completed" && t.status !== "missed")
        .length - critical.length
    );
    onTasksFiltered(critical);
  };

  const handleProtectTask = async (taskId: string) => {
    await window.api.updateTask(taskId, { abortProtected: true });
    filterCriticalTasks();
  };

  const handleUnprotectTask = async (taskId: string) => {
    await window.api.updateTask(taskId, { abortProtected: false });
    filterCriticalTasks();
  };

  return (
    <div className="space-y-6">
      {/* Emergency Banner */}
      <Card className="border-2 border-[var(--error)] bg-gradient-to-r from-[var(--error)]/10 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="text-5xl animate-pulse">🚨</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[var(--error)] mb-2">
                Abort Mission Mode Active
              </h2>
              <p className="text-[color:var(--text-primary)] mb-3">
                Emergency protocol engaged. Non-critical tasks are temporarily
                hidden. Focus only on what matters most.
              </p>
              <div className="flex items-center gap-4">
                <Badge variant="danger" className="text-sm">
                  {criticalTasks.length} Critical Task
                  {criticalTasks.length !== 1 ? "s" : ""}
                </Badge>
                <Badge className="text-sm">
                  {hiddenCount} Task{hiddenCount !== 1 ? "s" : ""} Hidden
                </Badge>
              </div>
            </div>
            <Button
              onClick={onExit}
              variant="outline"
              className="border-[var(--error)]/50 text-[var(--error)] hover:bg-[var(--error)]/10"
            >
              Exit Emergency Mode
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Critical Tasks */}
      {criticalTasks.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-[color:var(--text-primary)] mb-2">
              All Clear
            </h3>
            <p className="text-[color:var(--text-secondary)] mb-6">
              No critical tasks detected. You can exit emergency mode.
            </p>
            <Button onClick={onExit}>Return to Normal Operations</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-[color:var(--text-primary)] flex items-center gap-2">
            <span>⚠️</span>
            Critical Missions Only
          </h3>
          {criticalTasks.map((task) => {
            const isOverdue =
              task.deadline &&
              task.deadline < new Date().toISOString().split("T")[0];
            const daysUntilDeadline = task.deadline
              ? Math.ceil(
                  (new Date(task.deadline).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              : null;

            return (
              <Card
                key={task.id}
                className={`border-l-4 ${
                  isOverdue
                    ? "border-l-[var(--error)]"
                    : task.abortProtected
                    ? "border-l-[var(--warning)]"
                    : "border-l-[var(--info)]"
                }`}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-lg font-semibold text-[color:var(--text-primary)]">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-[color:var(--text-secondary)] mt-1">
                              {task.description}
                            </p>
                          )}
                        </div>
                        {task.abortProtected ? (
                          <Badge variant="warning" className="ml-2">
                            🛡️ Protected
                          </Badge>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3 flex-wrap mt-3">
                        {task.orbit && (
                          <Badge>
                            {task.orbit.level === "deep-space" && "🌌"}
                            {task.orbit.level === "mid-orbit" && "🛰️"}
                            {task.orbit.level === "low-orbit" && "🌍"}{" "}
                            {task.orbit.level
                              .split("-")
                              .map(
                                (w) => w.charAt(0).toUpperCase() + w.slice(1)
                              )
                              .join(" ")}
                          </Badge>
                        )}
                        {task.gravity && task.gravity > 50 && (
                          <Badge
                            variant={task.gravity > 70 ? "danger" : "warning"}
                          >
                            Gravity: {task.gravity}
                          </Badge>
                        )}
                        {task.deadline && (
                          <Badge variant={isOverdue ? "danger" : "default"}>
                            {isOverdue && "⚠️ "}
                            {isOverdue
                              ? "OVERDUE"
                              : daysUntilDeadline !== null
                              ? daysUntilDeadline === 0
                                ? "Today"
                                : daysUntilDeadline === 1
                                ? "Tomorrow"
                                : `${daysUntilDeadline}d`
                              : ""}
                          </Badge>
                        )}
                      </div>

                      {/* Why it's critical */}
                      <div className="mt-3 p-2 rounded bg-[var(--bg-app)] text-xs text-[color:var(--text-muted)]">
                        <strong>Critical because:</strong>{" "}
                        {task.abortProtected && "Manually protected. "}
                        {isOverdue && "Overdue. "}
                        {task.gravity && task.gravity > 70 && "High gravity. "}
                        {task.orbit?.level === "deep-space" &&
                          task.deadline &&
                          "Deep-space with urgent deadline."}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {!task.abortProtected ? (
                        <Button
                          onClick={() => handleProtectTask(task.id)}
                          variant="outline"
                          size="sm"
                        >
                          🛡️ Protect
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleUnprotectTask(task.id)}
                          variant="outline"
                          size="sm"
                          className="border-[var(--warning)]/50"
                        >
                          Remove Protection
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <Card className="border border-[var(--info)]/30 bg-[var(--info)]/5">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1 text-sm text-[color:var(--text-secondary)]">
              <p className="font-semibold text-[color:var(--text-primary)] mb-1">
                About Abort Mission Mode
              </p>
              <p>
                This emergency mode helps when you're overwhelmed. It
                temporarily hides all non-critical tasks so you can focus on
                what truly matters. Tasks are considered critical if they're
                overdue, have urgent deadlines, high gravity, or you've manually
                protected them.
              </p>
              <p className="mt-2">
                <strong>Tip:</strong> Use the shield button to manually protect
                tasks you consider essential.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AbortMissionMode;
