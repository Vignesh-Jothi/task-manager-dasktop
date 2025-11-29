import React, { useEffect, useState } from "react";

interface LoadingSplashProps {
  fadingOut: boolean;
  done: boolean; // data loaded
  minDuration: number; // ms required minimum display time
  startTime: number; // timestamp when splash started
}

export const LoadingSplash: React.FC<LoadingSplashProps> = ({
  fadingOut,
  done,
  minDuration,
  startTime,
}) => {
  const [progress, setProgress] = useState(0);
  const [internalDone, setInternalDone] = useState(false);

  // Progress simulation baseline
  useEffect(() => {
    let raf: number;
    const tick = () => {
      const elapsed = performance.now() - startTime;
      // Base curve: accelerate then ease
      const curve = Math.pow(Math.min(elapsed / (minDuration * 0.9), 1), 0.65);
      const target = curve * 90; // approach 90% before finalization
      setProgress((prev) => (target > prev ? target : prev));
      if (!internalDone) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [startTime, minDuration, internalDone]);

  // When external done triggers, smoothly fill to 100% respecting minDuration
  useEffect(() => {
    if (!done) return;
    const elapsed = performance.now() - startTime;
    const remaining = Math.max(0, minDuration - elapsed);
    const startProgress = progress;
    const fillStart = performance.now();
    const duration = remaining + 300; // remaining time plus smoothing window
    const animateFill = () => {
      const t = (performance.now() - fillStart) / duration;
      const eased = t >= 1 ? 1 : 1 - Math.pow(1 - t, 3); // easeOutCubic
      const next = startProgress + (100 - startProgress) * eased;
      setProgress(next);
      if (t < 1) requestAnimationFrame(animateFill);
      else setInternalDone(true);
    };
    requestAnimationFrame(animateFill);
  }, [done, progress, startTime, minDuration]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[var(--bg-app)] transition-opacity duration-400 ${
        fadingOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background:
          "radial-gradient(circle at 30% 30%, var(--bg-card) 0%, var(--bg-app) 60%)",
      }}
    >
      <div className="relative w-56 h-56 flex items-center justify-center">
        <div className="absolute inset-0 animate-spin-slow rounded-full border-[6px] border-[var(--bg-sidebar)] border-t-[var(--btn-primary)] border-r-[var(--btn-primary)]" />
        <div className="absolute inset-4 animate-pulse-soft rounded-full bg-[var(--bg-card)] shadow-xl flex flex-col items-center justify-center">
          <div className="text-4xl mb-2">📋</div>
          <div className="text-xs tracking-wide font-medium text-[color:var(--text-secondary)]">
            Initializing
          </div>
        </div>
      </div>
      <div className="mt-8 w-64 h-3 rounded-full bg-[var(--bg-sidebar)] overflow-hidden shadow-inner">
        <div
          className="h-full rounded-full bg-[var(--btn-primary)] animate-progress-shimmer"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-4 text-xs font-mono text-[color:var(--text-muted)]">
        {internalDone ? "Starting UI..." : `Loading ${Math.round(progress)}%`}
      </div>
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(14)].map((_, i) => (
          <div
            key={i}
            className="absolute w-24 h-24 rounded-full bg-[var(--btn-primary)]/5 backdrop-blur-sm animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 120}ms`,
              animationDuration: `${4000 + i * 200}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoadingSplash;
