"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cyberpunkAudio, HOLD_DURATION_MS } from "@/lib/cyberpunk-audio";

type SplashPhase = "hold" | "shutdown" | "poweron" | "init" | "reveal";

type CyberpunkRebootSplashProps = {
  open: boolean;
  title: string;
  trackingLabel: string;
  holdLabel: string;
  holdingLabel: string;
  offlineLabel: string;
  offlineSub: string;
  initLabel: string;
  abortHint: string;
  trollLines: string[];
  dropTease: string;
  initLines: string[];
  onHudReady: () => void;
  onReveal: () => void;
  onDrop: () => void;
  onComplete: () => void;
  onAbort: () => void;
};

const HOLD_MS = HOLD_DURATION_MS;
const DECAY_PER_MS = 0.04;
const SHUTDOWN_MS = 1600;
const POWERON_MS = 1100;
const REVEAL_MS = 1000;
const LINE_MS = 420;
const INIT_TAIL_MS = 700;

export function CyberpunkRebootSplash({
  open,
  title,
  trackingLabel,
  holdLabel,
  holdingLabel,
  offlineLabel,
  offlineSub,
  initLabel,
  abortHint,
  trollLines,
  dropTease,
  initLines,
  onHudReady,
  onReveal,
  onDrop,
  onComplete,
  onAbort,
}: CyberpunkRebootSplashProps) {
  const [phase, setPhase] = useState<SplashPhase>("hold");
  const [progress, setProgress] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [holding, setHolding] = useState(false);
  const [trollIndex, setTrollIndex] = useState(-1);
  const [teasing, setTeasing] = useState(false);
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [lineIndex, setLineIndex] = useState(0);

  const doneRef = useRef(false);
  const dropFiredRef = useRef(false);
  const hudReadyRef = useRef(false);
  const revealFiredRef = useRef(false);
  const holdingRef = useRef(false);
  const progressRef = useRef(0);
  const phaseRef = useRef<SplashPhase>("hold");
  const trollIndexRef = useRef(-1);
  const trollLinesRef = useRef(trollLines);
  trollLinesRef.current = trollLines;

  useEffect(() => {
    if (!open) {
      setPhase("hold");
      setProgress(0);
      setGlitch(false);
      setHolding(false);
      setTrollIndex(-1);
      setTeasing(false);
      setVisibleLines([]);
      setLineIndex(0);
      doneRef.current = false;
      dropFiredRef.current = false;
      hudReadyRef.current = false;
      revealFiredRef.current = false;
      holdingRef.current = false;
      progressRef.current = 0;
      phaseRef.current = "hold";
      trollIndexRef.current = -1;
      cyberpunkAudio.stopBootAmbient();
      return;
    }

    cyberpunkAudio.bootCue("reboot");
    return () => {
      cyberpunkAudio.stopBootAmbient();
    };
  }, [open]);

  useEffect(() => {
    if (!open || phase !== "hold") return;

    let raf = 0;
    let last = performance.now();
    let glitchUntil = 0;

    const tick = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;

      let next = progressRef.current;
      if (holdingRef.current) {
        next = Math.min(1, next + dt / HOLD_MS);
      } else if (next > 0 && next < 1) {
        next = Math.max(0, next - dt * DECAY_PER_MS);
      }

      progressRef.current = next;
      setProgress(Math.round(next * 100));
      cyberpunkAudio.syncHold(next, holdingRef.current);

      const pool = trollLinesRef.current;
      if (holdingRef.current && pool.length > 0 && next > 0.04) {
        const idx = Math.min(pool.length - 1, Math.floor(next * pool.length));
        if (idx !== trollIndexRef.current) {
          trollIndexRef.current = idx;
          setTrollIndex(idx);
          cyberpunkAudio.bootCue(idx % 2 === 0 ? "tick" : "sys");
          glitchUntil = now + 90;
          setGlitch(true);
        }
      }

      const nearDrop = next >= 0.86;
      setTeasing(nearDrop && holdingRef.current);

      if (
        holdingRef.current &&
        next > 0.08 &&
        next < 0.98 &&
        Math.random() > 0.9
      ) {
        glitchUntil = now + 70;
        setGlitch(true);
      }
      if (now >= glitchUntil) setGlitch(false);

      if (next >= 1 && phaseRef.current === "hold") {
        phaseRef.current = "shutdown";
        holdingRef.current = false;
        setHolding(false);
        setTeasing(false);
        setPhase("shutdown");
        setProgress(100);
        setGlitch(true);
        cyberpunkAudio.stopBootAmbient();
        cyberpunkAudio.playSystemOffline();
        return;
      }

      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [open, phase]);

  useEffect(() => {
    if (!open || phase !== "shutdown") return;
    const timer = window.setTimeout(() => {
      phaseRef.current = "poweron";
      setPhase("poweron");
      setGlitch(true);
      if (!hudReadyRef.current) {
        hudReadyRef.current = true;
        onHudReady();
      }
      cyberpunkAudio.bootCue("reboot");
    }, SHUTDOWN_MS);
    return () => window.clearTimeout(timer);
  }, [open, phase, onHudReady]);

  useEffect(() => {
    if (!open || phase !== "poweron") return;
    const flash = window.setTimeout(() => setGlitch(false), 420);
    const timer = window.setTimeout(() => {
      phaseRef.current = "init";
      setPhase("init");
      setGlitch(false);
      setVisibleLines([]);
      setLineIndex(0);
      cyberpunkAudio.bootCue("init");
    }, POWERON_MS);
    return () => {
      window.clearTimeout(flash);
      window.clearTimeout(timer);
    };
  }, [open, phase]);

  const finishBoot = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    phaseRef.current = "reveal";
    setPhase("reveal");
    setGlitch(true);
    cyberpunkAudio.stopBootAmbient();
    cyberpunkAudio.bootCue("reboot");
    if (!revealFiredRef.current) {
      revealFiredRef.current = true;
      onReveal();
    }
    if (!dropFiredRef.current) {
      dropFiredRef.current = true;
      onDrop();
    }
    window.setTimeout(() => setGlitch(false), 380);
    window.setTimeout(() => onComplete(), REVEAL_MS);
  }, [onReveal, onDrop, onComplete]);

  useEffect(() => {
    if (!open || phase !== "init") return;
    if (initLines.length === 0) {
      finishBoot();
      return;
    }

    if (lineIndex >= initLines.length) {
      const timer = window.setTimeout(() => finishBoot(), INIT_TAIL_MS);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(
      () => {
        const line = initLines[lineIndex];
        if (!line) return;
        setVisibleLines((prev) => [...prev, line]);
        setLineIndex((i) => i + 1);
        cyberpunkAudio.bootCue(lineIndex % 2 === 0 ? "tick" : "sys");
        setGlitch(true);
        window.setTimeout(() => setGlitch(false), 60);
      },
      lineIndex === 0 ? 180 : LINE_MS,
    );

    return () => window.clearTimeout(timer);
  }, [open, phase, lineIndex, initLines, finishBoot]);

  useEffect(() => {
    if (!open) return;

    const abort = () => {
      if (phaseRef.current !== "hold") return;
      holdingRef.current = false;
      setHolding(false);
      cyberpunkAudio.stopBootAmbient();
      onAbort();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        abort();
        return;
      }
      if (phaseRef.current !== "hold") return;
      if (event.code !== "Space" && event.key !== "Enter") return;
      if (event.repeat) return;
      event.preventDefault();
      holdingRef.current = true;
      setHolding(true);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (phaseRef.current !== "hold") return;
      if (event.code !== "Space" && event.key !== "Enter") return;
      event.preventDefault();
      holdingRef.current = false;
      setHolding(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [open, onAbort]);

  if (!open) return null;

  const startHold = () => {
    if (phaseRef.current !== "hold") return;
    holdingRef.current = true;
    setHolding(true);
  };

  const endHold = () => {
    if (phaseRef.current !== "hold") return;
    holdingRef.current = false;
    setHolding(false);
  };

  const headline = teasing
    ? dropTease
    : trollIndex >= 0 && trollLines[trollIndex]
      ? trollLines[trollIndex]
      : holdingLabel;

  return (
    <div
      className="lp-cyber-reboot"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-phase={phase}
      data-holding={holding ? "true" : "false"}
      data-tease={teasing ? "true" : "false"}
      data-glitch={glitch ? "true" : "false"}
    >
      <div className="lp-cyber-reboot-fx" aria-hidden>
        <div className="lp-cyber-reboot-crt" />
        <div className="lp-cyber-reboot-scan" />
        <div className="lp-cyber-reboot-static" />
        <div className="lp-cyber-reboot-static lp-cyber-reboot-static--low" />
        <div className="lp-cyber-reboot-glitch-band" />
        <div className="lp-cyber-reboot-chroma" />
        <div className="lp-cyber-reboot-vignette" />
        <div className="lp-cyber-reboot-collapse" />
        <div className="lp-cyber-reboot-flash" />
        <div className="lp-cyber-reboot-tube" />
      </div>

      <div className="lp-cyber-reboot-stage">
        {phase === "hold" ? (
          <>
            <div className="lp-cyber-reboot-center">
              <p className="lp-cyber-reboot-eyebrow">{title}</p>
              {holding || teasing ? (
                <p
                  key={`${teasing ? "tease" : "troll"}-${trollIndex}`}
                  className="lp-cyber-reboot-quote"
                >
                  {headline}
                </p>
              ) : null}
              <button
                type="button"
                className="lp-cyber-reboot-hold"
                aria-pressed={holding}
                aria-label={holdLabel}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  startHold();
                }}
                onPointerUp={endHold}
                onPointerCancel={endHold}
                onPointerLeave={(event) => {
                  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    endHold();
                  }
                }}
                onContextMenu={(event) => event.preventDefault()}
              >
                <span className="lp-cyber-reboot-hold-ring" aria-hidden>
                  <span
                    className="lp-cyber-reboot-hold-fill"
                    style={{
                      transform: `scaleY(${Math.max(progress / 100, holding ? 0.04 : 0)})`,
                    }}
                  />
                </span>
                <span className="lp-cyber-reboot-hold-label">
                  {holding ? holdingLabel : holdLabel}
                </span>
              </button>
            </div>
            <div className="lp-cyber-reboot-footer">
              <div className="lp-cyber-reboot-tracking" aria-hidden>
                <span className="lp-cyber-reboot-tracking-label">
                  {trackingLabel}
                </span>
                <div className="lp-cyber-reboot-track">
                  <div
                    className="lp-cyber-reboot-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="lp-cyber-reboot-pct">{progress}%</span>
              </div>
              <p className="lp-cyber-reboot-hint">{abortHint}</p>
            </div>
          </>
        ) : null}

        {phase === "shutdown" ? (
          <div className="lp-cyber-reboot-center">
            <div className="lp-cyber-offline" aria-hidden>
              <div className="lp-cyber-offline-stamp">
                <span className="lp-cyber-offline-mark" />
                <p className="lp-cyber-offline-title">{offlineLabel}</p>
                <p className="lp-cyber-offline-sub">{offlineSub}</p>
                <div className="lp-cyber-offline-bars">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {phase === "init" ? (
          <div className="lp-cyber-reboot-center lp-cyber-reboot-center--init">
            <p className="lp-cyber-reboot-eyebrow">{initLabel}</p>
            <ul className="lp-cyber-boot-log" aria-live="polite">
              {visibleLines.map((line) => (
                <li key={line}>
                  <span>{">"}</span>
                  {line}
                </li>
              ))}
              {lineIndex < initLines.length ? (
                <li className="lp-cyber-boot-log-cursor" aria-hidden>
                  <span>{">"}</span>
                  <i />
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
