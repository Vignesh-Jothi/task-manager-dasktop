import React, { useState, useEffect, useRef } from "react";
import { Task } from "../../types";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface MissionModeProps {
  task: Task;
  onComplete: () => void;
  onExit: () => void;
}

const MissionMode: React.FC<MissionModeProps> = ({
  task,
  onComplete,
  onExit,
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetDuration = task.durationMinutes || 25; // default 25min pomodoro

  useEffect(() => {
    // Start timer
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  useEffect(() => {
    // Update task as in_progress when mission mode starts
    if (task.status !== "in_progress") {
      window.api.updateTask(task.id, {
        status: "in_progress",
        missionMode: true,
      });
    }
  }, []);

  const handleComplete = async () => {
    setShowSuccess(true);
    generateParticles();

    // Update task
    await window.api.updateTask(task.id, {
      status: "completed",
      completedAt: new Date().toISOString(),
      missionMode: false,
    });

    // Play success animation for 2 seconds
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  const handleAbort = () => {
    if (confirm("Abort this mission? Progress will be saved.")) {
      window.api.updateTask(task.id, { missionMode: false });
      onExit();
    }
  };

  const generateParticles = () => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setParticles(newParticles);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = Math.min((timeElapsed / (targetDuration * 60)) * 100, 100);
  const isOvertime = timeElapsed > targetDuration * 60;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden">
        {/* Success particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-[var(--success)] rounded-full animate-ping"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          />
        ))}

        <div className="text-center z-10 animate-fade-in">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h1 className="text-4xl font-bold text-[var(--success)] mb-4">
            Mission Successful!
          </h1>
          <p className="text-xl text-[color:var(--text-primary)]">
            Launch completed in {formatTime(timeElapsed)}
          </p>
          {task.xpValue && (
            <div className="mt-6">
              <Badge variant="success" className="text-lg px-4 py-2">
                +{task.xpValue} XP
              </Badge>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      {/* Background stars effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-50 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Mission Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <span className="text-5xl">🎯</span>
            Mission Mode
          </h1>
          <p className="text-[color:var(--text-muted)]">
            All distractions eliminated. Focus engaged.
          </p>
        </div>

        {/* Main mission card */}
        <Card className="bg-[var(--bg-card)]/90 backdrop-blur-md border-2 border-[var(--btn-primary)]">
          <CardHeader className="border-b border-[color:var(--text-muted)]/20">
            <CardTitle className="text-2xl text-[color:var(--text-primary)]">
              {task.title}
            </CardTitle>
            {task.description && (
              <p className="text-[color:var(--text-secondary)] mt-2">
                {task.description}
              </p>
            )}
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Timer Display */}
            <div className="text-center">
              <div
                className={`text-7xl font-mono font-bold ${
                  isOvertime
                    ? "text-[var(--warning)]"
                    : "text-[color:var(--text-primary)]"
                }`}
              >
                {formatTime(timeElapsed)}
              </div>
              <p className="text-sm text-[color:var(--text-muted)] mt-2">
                {isOvertime ? (
                  <span className="text-[var(--warning)]">⚠️ Overtime</span>
                ) : (
                  `Target: ${targetDuration} minutes`
                )}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-[var(--bg-app)] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  isOvertime ? "bg-[var(--warning)]" : "bg-[var(--btn-primary)]"
                }`}
                style={{ width: `${progress}%` }}
              />
              {!isOvertime && (
                <div className="absolute top-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              )}
            </div>

            {/* Task metadata */}
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {task.orbit && (
                <Badge>
                  {task.orbit.level === "deep-space" && "🌌"}
                  {task.orbit.level === "mid-orbit" && "🛰️"}
                  {task.orbit.level === "low-orbit" && "🌍"}{" "}
                  {task.orbit.level
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ")}
                </Badge>
              )}
              {task.gravity && (
                <Badge variant={task.gravity > 50 ? "danger" : "default"}>
                  Gravity: {task.gravity}
                </Badge>
              )}
              {task.deadline && (
                <Badge variant="warning">
                  🕐 {new Date(task.deadline).toLocaleDateString()}
                </Badge>
              )}
            </div>

            {/* Controls */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setIsPaused(!isPaused)}
                variant="outline"
                className="flex-1"
              >
                {isPaused ? "▶️ Resume" : "⏸️ Pause"}
              </Button>
              <Button
                onClick={handleComplete}
                className="flex-1 bg-[var(--success)] hover:bg-[var(--success)]/90"
              >
                ✅ Complete Mission
              </Button>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAbort}
                variant="outline"
                className="flex-1 text-[var(--error)] border-[var(--error)]/30 hover:bg-[var(--error)]/10"
              >
                🚨 Abort Mission
              </Button>
            </div>

            {/* Motivational text */}
            <div className="text-center pt-4 border-t border-[color:var(--text-muted)]/20">
              <p className="text-sm text-[color:var(--text-muted)] italic">
                "One task. One moment. One mission at a time."
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MissionMode;
