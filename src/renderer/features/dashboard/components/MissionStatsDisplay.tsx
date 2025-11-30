import React, { useState, useEffect } from "react";
import { MissionStats } from "@types";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";
import { Badge } from "@ui/badge";

interface MissionStatsDisplayProps {
  stats: MissionStats;
}

const MissionStatsDisplay: React.FC<MissionStatsDisplayProps> = ({ stats }) => {
  const [level, setLevel] = useState(1);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    calculateLevel();
  }, [stats.totalXP]);
  const calculateLevel = () => {
    const calculatedLevel = Math.floor(Math.sqrt(stats.totalXP / 100)) + 1;
    setLevel(calculatedLevel);
    const xpForCurrentLevel = (calculatedLevel - 1) ** 2 * 100;
    const xpForNextLevel = calculatedLevel ** 2 * 100;
    const xpIntoCurrentLevel = stats.totalXP - xpForCurrentLevel;
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
    const progressPercent = (xpIntoCurrentLevel / xpNeededForLevel) * 100;
    setProgress(Math.min(progressPercent, 100));
  };
  const getRankTitle = (level: number): string => {
    if (level >= 20) return "Interstellar Commander";
    if (level >= 15) return "Space Admiral";
    if (level >= 12) return "Fleet Captain";
    if (level >= 10) return "Mission Commander";
    if (level >= 8) return "Senior Navigator";
    if (level >= 6) return "Navigator";
    if (level >= 4) return "Pilot";
    if (level >= 2) return "Cadet";
    return "Rookie Astronaut";
  };
  const getRankEmoji = (level: number): string => {
    if (level >= 20) return "👑";
    if (level >= 15) return "⭐";
    if (level >= 12) return "🎖️";
    if (level >= 10) return "🏅";
    if (level >= 6) return "🛸";
    if (level >= 3) return "🚀";
    return "🧑‍🚀";
  };
  const getStabilityColor = (score: number): string => {
    if (score >= 80) return "var(--success)";
    if (score >= 60) return "var(--info)";
    if (score >= 40) return "var(--warning)";
    return "var(--error)";
  };
  const getStreakEmoji = (streak: number): string => {
    if (streak >= 30) return "🔥🔥🔥";
    if (streak >= 14) return "🔥🔥";
    if (streak >= 7) return "🔥";
    if (streak >= 3) return "⚡";
    return "✨";
  };
  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-[var(--btn-primary)] bg-gradient-to-br from-[var(--btn-primary)]/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">{getRankEmoji(level)}</span>
                <div>
                  <h3 className="text-2xl font-bold text-[color:var(--text-primary)]">
                    {getRankTitle(level)}
                  </h3>
                  <p className="text-sm text-[color:var(--text-muted)]">
                    Level {level}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[var(--btn-primary)]">
                {stats.totalXP.toLocaleString()}
              </div>
              <div className="text-xs text-[color:var(--text-muted)]">
                Total XP
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-[color:var(--text-muted)]">
              <span>Progress to Level {level + 1}</span>
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="relative h-3 bg-[var(--bg-app)] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[var(--btn-primary)] to-[var(--info)] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
              <div className="absolute top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl mb-2">
                {getStreakEmoji(stats.currentStreak)}
              </div>
              <div className="text-3xl font-bold text-[color:var(--text-primary)] mb-1">
                {stats.currentStreak}
              </div>
              <div className="text-sm text-[color:var(--text-muted)]">
                Day Streak
              </div>
              {stats.currentStreak >= 7 && (
                <Badge variant="success" className="mt-2 text-xs">
                  On Fire!
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl mb-2">
                {stats.weeklyStability >= 80
                  ? "🟢"
                  : stats.weeklyStability >= 60
                  ? "🟡"
                  : "🔴"}
              </div>
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: getStabilityColor(stats.weeklyStability) }}
              >
                {stats.weeklyStability}%
              </div>
              <div className="text-sm text-[color:var(--text-muted)]">
                Weekly Stability
              </div>
              <div className="mt-2 text-xs text-[color:var(--text-secondary)]">
                {stats.weeklyStability >= 80 && "Excellent consistency"}
                {stats.weeklyStability >= 60 &&
                  stats.weeklyStability < 80 &&
                  "Good progress"}
                {stats.weeklyStability < 60 && "Room for improvement"}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🎯</div>
              <div className="text-3xl font-bold text-[color:var(--text-primary)] mb-1">
                {stats.missionSuccessRate.toFixed(1)}%
              </div>
              <div className="text-sm text-[color:var(--text-muted)]">
                Success Rate
              </div>
              <div className="mt-2 text-xs text-[color:var(--text-secondary)]">
                Mission completion accuracy
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {stats.longestStreak > 0 && (
        <Card className="border border-[var(--warning)]/30 bg-gradient-to-r from-[var(--warning)]/5 to-transparent">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🏆</span>
                <div>
                  <p className="font-semibold text-[color:var(--text-primary)]">
                    Personal Record
                  </p>
                  <p className="text-sm text-[color:var(--text-muted)]">
                    Longest mission streak
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[var(--warning)]">
                  {stats.longestStreak}
                </div>
                <div className="text-xs text-[color:var(--text-muted)]">
                  days
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">🎖️</span>Mission Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.totalXP >= 1000 && (
              <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--success)]/30 text-center">
                <div className="text-2xl mb-1">⭐</div>
                <div className="text-xs font-medium text-[color:var(--text-primary)]">
                  XP Master
                </div>
                <div className="text-xs text-[color:var(--text-muted)]">
                  1000+ XP
                </div>
              </div>
            )}
            {stats.currentStreak >= 30 && (
              <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--error)]/30 text-center">
                <div className="text-2xl mb-1">🔥</div>
                <div className="text-xs font-medium text-[color:var(--text-primary)]">
                  Unstoppable
                </div>
                <div className="text-xs text-[color:var(--text-muted)]">
                  30 day streak
                </div>
              </div>
            )}
            {stats.missionSuccessRate >= 90 && (
              <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--info)]/30 text-center">
                <div className="text-2xl mb-1">🎯</div>
                <div className="text-xs font-medium text-[color:var(--text-primary)]">
                  Sharpshooter
                </div>
                <div className="text-xs text-[color:var(--text-muted)]">
                  90%+ success
                </div>
              </div>
            )}
            {level >= 10 && (
              <div className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--warning)]/30 text-center">
                <div className="text-2xl mb-1">👑</div>
                <div className="text-xs font-medium text-[color:var(--text-primary)]">
                  Elite Pilot
                </div>
                <div className="text-xs text-[color:var(--text-muted)]">
                  Level 10+
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MissionStatsDisplay;
