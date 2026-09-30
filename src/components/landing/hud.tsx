"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  type ComponentPropsWithoutRef,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { cyberpunkAudio } from "@/lib/cyberpunk-audio";
import { cn } from "@/lib/utils";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HudCorners({
  className,
  tone = "black",
}: {
  className?: string;
  tone?: "black" | "white" | "accent";
}) {
  const border =
    tone === "white"
      ? "border-white"
      : tone === "accent"
        ? "border-[var(--lp-accent)]"
        : "border-black";

  return (
    <>
      <span
        className={cn(
          "pointer-events-none absolute top-1 left-1 size-2 border-t-2 border-l-2",
          border,
          className,
        )}
        aria-hidden
      />
      <span
        className={cn(
          "pointer-events-none absolute top-1 right-1 size-2 border-t-2 border-r-2",
          border,
        )}
        aria-hidden
      />
      <span
        className={cn(
          "pointer-events-none absolute bottom-1 left-1 size-2 border-b-2 border-l-2",
          border,
        )}
        aria-hidden
      />
      <span
        className={cn(
          "pointer-events-none absolute right-1 bottom-1 size-2 border-r-2 border-b-2",
          border,
        )}
        aria-hidden
      />
    </>
  );
}

export function HudDiamond({
  active = false,
  className,
}: {
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "size-1.5 shrink-0 rotate-45 border-[1.5px]",
        active ? "border-black bg-black" : "border-current/40 bg-transparent",
        className,
      )}
      aria-hidden
    />
  );
}

export function HudIndex({
  value,
  className,
}: {
  value: number | string;
  className?: string;
}) {
  const label =
    typeof value === "number" ? String(value).padStart(2, "0") : value;

  return (
    <span
      className={cn(
        "font-[family-name:var(--font-display)] text-[0.6rem] font-extrabold tracking-[0.12em] tabular-nums",
        className,
      )}
      aria-hidden
    >
      {label}
    </span>
  );
}

export function HudSectionLabel({
  label,
  tone = "dark",
  className,
}: {
  label: string;
  tone?: "dark" | "light" | "accent";
  className?: string;
}) {
  const strip =
    tone === "light"
      ? "border-white/20 bg-black text-white"
      : tone === "accent"
        ? "border-black bg-black text-white"
        : "border-black bg-black text-white";

  return (
    <div
      data-lp-section-label
      data-lp-chrome="panel"
      className={cn(
        "pointer-events-none absolute top-0 right-0 left-0 z-30 flex items-stretch border-b-[3px] pr-14 md:pr-0",
        strip,
        className,
      )}
    >
      <span
        data-lp-chrome="chip"
        className="inline-flex shrink-0 items-center border-r-[3px] border-black bg-[var(--lp-accent)] px-3 py-2.5 font-[family-name:var(--font-display)] text-[0.65rem] font-extrabold tracking-[0.22em] text-black uppercase sm:px-4 sm:text-[0.7rem]"
      >
        Index
      </span>
      <span className="inline-flex min-w-0 items-center gap-2.5 px-3 py-2.5 sm:px-5">
        <HudDiamond active className="border-black bg-[var(--lp-accent)]" />
        <span className="font-[family-name:var(--font-display)] text-[clamp(0.95rem,2.4vw,1.35rem)] leading-none font-extrabold tracking-[0.08em] uppercase">
          {label}
        </span>
      </span>
    </div>
  );
}

export function HudBadge({
  children,
  variant = "accent",
  className,
}: {
  children: ReactNode;
  variant?: "accent" | "dark" | "light" | "ghost";
  className?: string;
}) {
  return (
    <span
      data-lp-chrome="chip"
      className={cn(
        "relative inline-flex items-center gap-1.5 border-[3px] border-black px-2.5 py-1 font-[family-name:var(--font-display)] text-[0.65rem] font-extrabold tracking-[0.14em] uppercase shadow-[3px_3px_0_#000]",
        variant === "accent" && "bg-[var(--lp-accent)] text-black",
        variant === "dark" && "bg-[var(--lp-hud)] text-[var(--lp-accent)]",
        variant === "light" && "bg-white text-black",
        variant === "ghost" && "bg-transparent text-inherit shadow-none",
        className,
      )}
    >
      {children}
    </span>
  );
}

type HudIconButtonProps = ComponentPropsWithoutRef<"a"> & {
  active?: boolean;
  tone?: "accent" | "dark" | "light";
};

export function HudIconButton({
  className,
  children,
  active = false,
  tone = "accent",
  ...props
}: HudIconButtonProps) {
  return (
    <a
      data-lp-chrome="btn"
      className={cn(
        "relative inline-grid size-12 shrink-0 place-items-center border-[3px] border-black shadow-[4px_4px_0_#000] transition-transform hover:-translate-x-px hover:-translate-y-px hover:shadow-[6px_6px_0_#000] sm:size-14",
        tone === "accent" && "bg-[var(--lp-accent)] text-black",
        tone === "dark" && "bg-[var(--lp-hud)] text-[var(--lp-accent)]",
        tone === "light" && "bg-white text-black",
        className,
      )}
      {...props}
    >
      {children}
      {active ? <HudCorners /> : null}
    </a>
  );
}

type HudCtaProps = ComponentPropsWithoutRef<"a"> & {
  index?: number | string;
};

export function HudCta({ className, children, index, ...props }: HudCtaProps) {
  return (
    <a
      data-lp-chrome="btn"
      className={cn(
        "group relative inline-flex h-12 items-center gap-2.5 border-[3px] border-black bg-[var(--lp-hud)] px-4 font-[family-name:var(--font-display)] text-xs font-extrabold tracking-[0.16em] text-[var(--lp-accent)] uppercase shadow-[4px_4px_0_#000] transition-colors hover:bg-[var(--lp-accent)] hover:text-black sm:h-14 sm:px-5 sm:text-sm",
        className,
      )}
      {...props}
    >
      {index !== undefined ? (
        <HudIndex value={index} className="text-current/45" />
      ) : null}
      <HudDiamond className="border-current group-hover:border-black group-hover:bg-black" />
      <span>{children}</span>
      <HudCorners />
    </a>
  );
}

export function HudPanel({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-lp-chrome="panel"
      className={cn(
        "relative border-[3px] border-black bg-[var(--lp-hud)] text-white shadow-[6px_6px_0_#000]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function HudBackdrop({ className }: { className?: string }) {
  return (
    <div className={cn("lp-hud-bg", className)} aria-hidden>
      <div className="lp-hud-bg-base" />
      <div className="lp-hud-bg-grid" />
      <div className="lp-hud-bg-scan" />
      <div className="lp-hud-bg-veil" />
    </div>
  );
}

export function CyberpunkHudFrame({
  muteLabel,
  unmuteLabel,
  active = false,
  enterId = 0,
}: {
  muteLabel: string;
  unmuteLabel: string;
  active?: boolean;
  enterId?: number;
}) {
  const [muted, setMuted] = useState(false);
  const hoverGateRef = useRef(0);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cyberpunkAudio.restoreMutePreference();
    setMuted(cyberpunkAudio.isMuted());
  }, []);

  useEffect(() => {
    if (!active) return;
    setMuted(cyberpunkAudio.isMuted());
  }, [active]);

  useGSAP(
    () => {
      if (!active) return;

      const root = frameRef.current;
      if (!root) return;

      const veil = root.querySelector<HTMLElement>(".lp-cyber-helmet-veil");
      const brow = root.querySelector<HTMLElement>(".lp-cyber-helmet-brow");
      const visorLayers = root.querySelectorAll<HTMLElement>(".lp-cyber-visor");
      const svg = root.querySelector<SVGElement>(".lp-cyber-visor-svg");
      const shell = root.querySelector<SVGElement>(".lp-cyber-visor-shell");
      const chrome = gsap.utils.toArray<HTMLElement>(
        ".lp-cyber-frame-chip, .lp-cyber-frame-status",
        root,
      );

      if (veil) gsap.set(veil, { opacity: 0, visibility: "hidden" });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(
          [shell, svg, brow, ...chrome, ...visorLayers].filter(Boolean),
          { opacity: 1, clearProps: "transform" },
        );
        return;
      }

      gsap.set([shell, svg, ...visorLayers].filter(Boolean), {
        opacity: 0,
        scaleY: 0.02,
        transformOrigin: "50% 50%",
      });
      gsap.set([brow, ...chrome].filter(Boolean), {
        opacity: 0,
        y: -22,
      });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", force3D: true },
      });

      if (shell) {
        tl.to(
          shell,
          { opacity: 1, scaleY: 1, duration: 0.7, ease: "power3.out" },
          0.35,
        );
      }
      if (svg) {
        tl.to(
          svg,
          { opacity: 1, scaleY: 1, duration: 0.75, ease: "power3.out" },
          0.38,
        );
      }
      tl.to(
        visorLayers,
        { opacity: 1, scaleY: 1, duration: 0.7, stagger: 0.04 },
        0.42,
      );
      if (brow) tl.to(brow, { opacity: 1, y: 0, duration: 0.5 }, 0.7);
      if (chrome.length) {
        tl.to(
          chrome,
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.06 },
          0.78,
        );
      }
    },
    {
      dependencies: [active, enterId],
      scope: frameRef,
      revertOnUpdate: true,
    },
  );

  const toggleMute = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    void (async () => {
      await cyberpunkAudio.resume();
      const next = !muted;
      cyberpunkAudio.setMuted(next);
      setMuted(next);
      if (!next) {
        cyberpunkAudio.click();
      }
    })();
  };

  const playHover = () => {
    void cyberpunkAudio.resume();
    const now = performance.now();
    if (now - hoverGateRef.current < 90) return;
    hoverGateRef.current = now;
    cyberpunkAudio.hover();
  };

  return (
    <div
      ref={frameRef}
      className="lp-cyber-frame pointer-events-none fixed inset-0 z-[190]"
      data-active={active ? "true" : "false"}
      style={{ visibility: active ? "visible" : "hidden" }}
    >
      <div className="lp-cyber-visor" aria-hidden />
      <div className="lp-cyber-helmet-veil" aria-hidden />

      <svg
        className="lp-cyber-visor-svg absolute inset-0 size-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
        focusable="false"
      >
        <defs>
          <linearGradient
            id="lp-cyber-visor-stroke"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="var(--cp-cyan)" stopOpacity="0.18" />
            <stop offset="18%" stopColor="var(--cp-red)" stopOpacity="0.95" />
            <stop offset="50%" stopColor="var(--cp-red)" stopOpacity="0.75" />
            <stop offset="82%" stopColor="var(--cp-red)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--cp-cyan)" stopOpacity="0.18" />
          </linearGradient>
        </defs>

        <path
          className="lp-cyber-visor-shell"
          fillRule="evenodd"
          d="M 0 0 H 100 V 100 H 0 Z M 1.4 1.8 H 98.6 V 98.2 H 1.4 Z"
        />

        <rect
          className="lp-cyber-visor-path"
          x="1.4"
          y="1.8"
          width="97.2"
          height="96.4"
          fill="none"
          stroke="url(#lp-cyber-visor-stroke)"
          strokeWidth="0.28"
          vectorEffect="non-scaling-stroke"
        />
        <rect
          className="lp-cyber-visor-path-inner"
          x="2.3"
          y="2.7"
          width="95.4"
          height="94.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.1"
          vectorEffect="non-scaling-stroke"
          opacity="0.35"
        />
        <path
          className="lp-cyber-visor-arc-top"
          d="M 8 3.1 C 28 1.15, 72 1.15, 92 3.1"
          fill="none"
          stroke="var(--cp-cyan)"
          strokeWidth="0.2"
          vectorEffect="non-scaling-stroke"
          opacity="0.7"
        />
      </svg>

      <div className="lp-cyber-helmet">
        <div className="lp-cyber-helmet-brow">
          <div className="lp-cyber-frame-chip hidden items-center gap-2 px-2.5 py-1 sm:inline-flex">
            <span className="lp-cyber-frame-diamond" />
            <span>BRAINDANCE</span>
          </div>

          <div className="lp-cyber-frame-status pointer-events-auto flex flex-wrap items-center justify-end gap-2">
            <p className="lp-cyber-rec inline-flex w-fit items-center gap-2 px-3 py-1.5 font-[family-name:var(--font-display)] text-[0.65rem] font-extrabold tracking-[0.24em] uppercase sm:text-xs">
              <span className="lp-cyber-rec-dot" aria-hidden />
              <span className="sr-only">Recording</span>
              REC
            </p>
            <button
              type="button"
              className="lp-cyber-mute inline-flex h-8 items-center gap-2 border-[3px] border-black bg-[var(--lp-hud)] px-2.5 font-[family-name:var(--font-display)] text-[0.6rem] font-extrabold tracking-[0.18em] text-[var(--lp-accent)] uppercase shadow-[3px_3px_0_#000]"
              aria-pressed={muted}
              aria-label={muted ? unmuteLabel : muteLabel}
              onClick={toggleMute}
              onMouseEnter={playHover}
            >
              <span aria-hidden>{muted ? "SND OFF" : "SND ON"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
