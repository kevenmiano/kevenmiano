"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { type MouseEvent, type ReactNode, useRef } from "react";
import {
  HudCorners,
  HudCta,
  HudDiamond,
  HudIndex,
} from "@/components/landing/hud";
import { cyberpunkAudio } from "@/lib/cyberpunk-audio";
import { handleNavClick } from "@/lib/smooth-scroll";
import { withBasePath } from "@/lib/utils";

export const CYBERPUNK_STORAGE_KEY = "lp-cyberpunk";
export const CYBERPUNK_CLASS = "lp-cyberpunk";

gsap.registerPlugin(useGSAP);

type HeroBentoProfile = {
  name: string;
  portrait: string;
};

type HeroBentoCopy = {
  line1: string;
  line2: string;
  line3: string;
  headline: string;
  tagline: string;
  getInTouch: string;
  statYears: string;
  learnMore: string;
  marquee: string;
  cyberpunkOn: string;
  cyberpunkOff: string;
};

export type CyberpunkPhase = "idle" | "awaiting" | "booting" | "active";

type BackdropStory = {
  kicker: string;
  title: string;
  lines: number;
};

type HeroNavItem = {
  label: string;
  href: string;
  sectionIds: string[];
};

type HeroBentoProps = {
  profile: HeroBentoProfile;
  yearsStat?: { value: string; label: string } | null;
  roleTitles: string[];
  roleSupport?: string;
  copy: HeroBentoCopy;
  backdropStories: BackdropStory[];
  nav: HeroNavItem[];
  activeSection: string;
  localeSwitcher: ReactNode;
  cyberpunkPhase: CyberpunkPhase;
  onCyberpunkRequest: () => void;
  onCyberpunkExit: () => void;
};

function HeroMarquee({ items }: { items: string[] }) {
  const line = `${items.filter(Boolean).join("  ✦  ")}  ✦  `;

  return (
    <div className="relative z-30 w-full shrink-0 overflow-hidden border-b-[3px] border-black">
      <div className="overflow-hidden bg-black py-2.5 sm:py-4">
        <div className="flex w-max items-center will-change-transform animate-[lp-hero-marquee_26s_linear_infinite] motion-reduce:animate-none">
          <p className="font-[family-name:var(--font-display)] text-sm font-extrabold tracking-[0.14em] text-[var(--lp-accent)] uppercase whitespace-nowrap sm:text-base sm:tracking-[0.16em] md:text-xl">
            {line}
          </p>
          <p
            className="font-[family-name:var(--font-display)] text-sm font-extrabold tracking-[0.14em] text-[var(--lp-accent)] uppercase whitespace-nowrap sm:text-base sm:tracking-[0.16em] md:text-xl"
            aria-hidden
          >
            {line}
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleCube({ titles }: { titles: string[] }) {
  const items = titles.filter(Boolean);
  if (items.length === 0) return null;

  const faceCount = items.length;
  const step = 360 / faceCount;
  const faceHeight = "2.5rem";
  const depth = `calc(${faceHeight} / (2 * ${Math.tan(Math.PI / faceCount).toFixed(6)}))`;

  return (
    <div
      className="min-w-0 overflow-visible py-3"
      style={{
        perspective: "1200px",
        perspectiveOrigin: "50% 50%",
      }}
    >
      <div
        className="relative mx-auto w-full"
        style={{
          height: faceHeight,
          transformStyle: "preserve-3d",
        }}
      >
        <div
          className="absolute inset-0 will-change-transform animate-[lp-role-cube_7.5s_cubic-bezier(0.65,0,0.35,1)_infinite] motion-reduce:animate-none"
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "center center",
          }}
        >
          {items.map((title, index) => (
            <p
              key={`role-face-${index}-${title}`}
              className="absolute inset-x-0 top-0 flex items-center justify-start overflow-hidden bg-white font-[family-name:var(--font-display)] text-[clamp(0.95rem,4.2vw,1.35rem)] leading-none font-extrabold tracking-[-0.03em] text-black uppercase whitespace-nowrap"
              style={{
                height: faceHeight,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: `rotateX(${-index * step}deg) translateZ(${depth})`,
              }}
              aria-hidden={index > 0}
            >
              {title}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function PortraitSlats({ src, alt }: { src: string; alt: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const slatCount = 5;

  const { contextSafe } = useGSAP({ scope: rootRef });

  useGSAP(
    () => {
      const slats =
        rootRef.current?.querySelectorAll<HTMLElement>("[data-lp-slat]");
      if (!slats?.length) return;

      gsap.from(slats, {
        yPercent: 12,
        opacity: 0,
        duration: 0.7,
        stagger: 0.06,
        ease: "power3.out",
        delay: 0.15,
      });
    },
    { scope: rootRef },
  );

  const highlightSlat = contextSafe((index: number) => {
    const root = rootRef.current;
    const imgWrap = imgWrapRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const slats = root.querySelectorAll<HTMLElement>("[data-lp-slat]");
    const center = (slatCount - 1) / 2;
    const shift = (index - center) * 3.2;

    slats.forEach((slat, i) => {
      const active = i === index;
      const distance = Math.abs(i - index);
      const accent =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--lp-accent")
          .trim() || "#FACC00";

      gsap.to(slat, {
        y: active ? -8 : distance === 1 ? -2 : 0,
        scaleY: active ? 1.025 : 1,
        opacity: active ? 1 : 0.42,
        borderColor: active ? accent : "#000000",
        boxShadow: active ? "4px 4px 0 #000" : "0px 0px 0 #000",
        backgroundColor: active
          ? `color-mix(in srgb, ${accent} 8%, transparent)`
          : "rgba(0,0,0,0)",
        duration: reduceMotion ? 0 : 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    });

    if (imgWrap) {
      gsap.to(imgWrap, {
        xPercent: reduceMotion ? 0 : shift,
        scale: reduceMotion ? 1 : 1.03,
        duration: reduceMotion ? 0 : 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  });

  const resetSlats = contextSafe(() => {
    const root = rootRef.current;
    const imgWrap = imgWrapRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const slats = root.querySelectorAll<HTMLElement>("[data-lp-slat]");

    gsap.to(slats, {
      y: 0,
      scaleY: 1,
      opacity: 1,
      borderColor: "#000000",
      boxShadow: "0px 0px 0 #000",
      backgroundColor: "rgba(0,0,0,0)",
      duration: reduceMotion ? 0 : 0.4,
      ease: "power2.out",
      overwrite: "auto",
      stagger: reduceMotion ? 0 : 0.03,
    });

    if (imgWrap) {
      gsap.to(imgWrap, {
        xPercent: 0,
        scale: 1,
        duration: reduceMotion ? 0 : 0.45,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  });

  return (
    <div
      ref={rootRef}
      className="absolute inset-0 z-[1] overflow-hidden rounded-none bg-white p-1.5 sm:rounded-[1.6rem] sm:p-3"
    >
      <div className="relative h-full w-full pt-1.5 sm:pt-2">
        <div className="lp-portrait-stage absolute inset-x-0 top-1.5 bottom-0 overflow-hidden rounded-none bg-[#f3efe4] sm:top-2 sm:rounded-[1.35rem]">
          <div
            ref={imgWrapRef}
            className="absolute inset-0 will-change-transform"
          >
            <Image
              src={withBasePath(src)}
              alt={alt}
              fill
              priority
              quality={90}
              sizes="(max-width: 1023px) 100vw, 52vw"
              className="lp-portrait-img origin-bottom object-contain object-bottom scale-[1.06] translate-x-[10%] sm:scale-[1.1] sm:translate-x-[18%] lg:scale-[1.15] lg:translate-x-[28%]"
            />
          </div>
        </div>
        <div
          className="absolute inset-x-0 top-2 bottom-0 z-[2] flex"
          onMouseLeave={resetSlats}
        >
          {Array.from({ length: slatCount }).flatMap((_, index) => {
            const slat = (
              <div
                key={`slat-${index}`}
                data-lp-slat
                onMouseEnter={() => highlightSlat(index)}
                className="relative h-full min-w-0 flex-1 origin-bottom cursor-pointer rounded-none border-[3px] border-black bg-transparent will-change-transform"
              />
            );
            if (index >= slatCount - 1) return [slat];
            return [
              slat,
              <div
                key={`gap-${index}`}
                className="pointer-events-none w-2 shrink-0 bg-white sm:w-2.5"
              />,
            ];
          })}
        </div>
      </div>
    </div>
  );
}

function CircleBadge({
  label,
  onNavigate,
}: {
  label: string;
  onNavigate: (event: MouseEvent<HTMLElement>) => void;
}) {
  return (
    <button
      type="button"
      onClick={(event) => onNavigate(event)}
      data-lp-chrome="btn"
      className="group relative inline-flex size-[5.25rem] shrink-0 flex-col items-center justify-center gap-1.5 border-[3px] border-black bg-[var(--lp-hud)] text-[var(--lp-accent)] shadow-[4px_4px_0_#000] transition-colors hover:bg-[var(--lp-accent)] hover:text-black sm:size-[6.5rem] sm:gap-2 sm:shadow-[5px_5px_0_#000] md:size-[7.25rem]"
      aria-label={label}
    >
      <HudIndex value="GO" className="text-[0.55rem] text-current/50" />
      <ArrowUpRight
        className="size-6 sm:size-7 md:size-8"
        strokeWidth={2.8}
        aria-hidden
      />
      <span className="max-w-[88%] truncate text-center font-[family-name:var(--font-display)] text-[0.5rem] font-extrabold tracking-[0.14em] uppercase sm:text-[0.55rem] sm:tracking-[0.16em]">
        {label}
      </span>
      <HudCorners tone="accent" />
    </button>
  );
}

function TaglineHover({
  text,
  activateLabel,
  deactivateLabel,
  phase,
  onRequest,
  onExit,
}: {
  text: string;
  activateLabel: string;
  deactivateLabel: string;
  phase: CyberpunkPhase;
  onRequest: () => void;
  onExit: () => void;
}) {
  const cleaned = text.replace(/\.$/, "").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  const active = phase === "active";
  const hoverGateRef = useRef(0);

  const playHover = () => {
    if (!active) return;
    void cyberpunkAudio.resume();
    const now = performance.now();
    if (now - hoverGateRef.current < 90) return;
    hoverGateRef.current = now;
    cyberpunkAudio.hover();
  };

  const onTaglineClick = () => {
    if (phase === "idle") {
      onRequest();
      return;
    }
    if (phase === "active") {
      onExit();
    }
  };

  return (
    <button
      type="button"
      className="lp-tagline lp-line flex min-h-0 w-full flex-1 flex-col justify-start text-left"
      aria-pressed={active}
      aria-label={active ? deactivateLabel : activateLabel}
      onClick={onTaglineClick}
      onMouseEnter={playHover}
      onFocus={playHover}
    >
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="lp-tagline-word"
          style={{ transitionDelay: `${index * 55}ms` }}
          data-text={`${word}${index === words.length - 1 ? "." : ""}`}
          onMouseEnter={playHover}
        >
          {word}
          {index === words.length - 1 ? "." : ""}
        </span>
      ))}
    </button>
  );
}

function TextLines({ count }: { count: number }) {
  return (
    <div className="mt-2 space-y-1.5">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`line-${index}`}
          className="h-[3px] bg-black/35"
          style={{
            width: `${72 + ((index * 17) % 28)}%`,
            opacity: 0.55 - index * 0.04,
          }}
        />
      ))}
    </div>
  );
}

function NewspaperBackdrop({ stories }: { stories: BackdropStory[] }) {
  const columns = [
    stories.slice(0, 3),
    stories.slice(3, 6),
    stories.slice(6, 9),
  ];

  return (
    <div
      aria-hidden
      className="lp-news-bg pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
    >
      <div className="lp-news-texture absolute inset-0" />
      <div className="lp-news-bg-hatch absolute inset-0" />
      <div className="lp-news-bg-grid absolute inset-[-8%] grid grid-cols-2 gap-x-6 gap-y-8 px-4 py-8 opacity-[0.18] sm:grid-cols-3 sm:gap-x-8 sm:px-8 sm:opacity-[0.22] lg:grid-cols-4 lg:opacity-[0.26]">
        {columns.flatMap((column, colIndex) =>
          column.map((story, storyIndex) => (
            <article
              key={`${colIndex}-${storyIndex}-${story.title}`}
              className="lp-news-story border-t-[2px] border-black/50 pt-2"
              style={{
                transform: `rotate(${(colIndex - 1) * 0.6 + storyIndex * 0.25}deg)`,
              }}
            >
              <p className="font-[family-name:var(--font-display)] text-[0.55rem] font-extrabold tracking-[0.18em] text-black/70 uppercase">
                {story.kicker}
              </p>
              <h3 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(0.85rem,1.4vw,1.15rem)] leading-[1.05] font-extrabold tracking-[-0.03em] text-black/80 uppercase">
                {story.title}
              </h3>
              <TextLines count={story.lines} />
              {storyIndex % 2 === 0 ? (
                <div className="mt-3 aspect-[4/3] w-full border-[2px] border-black/40 bg-black/[0.06]" />
              ) : null}
            </article>
          )),
        )}
        {stories.slice(0, 4).map((story, index) => (
          <article
            key={`extra-${index}-${story.title}`}
            className="lp-news-story hidden border-t-[2px] border-black/50 pt-2 lg:block"
          >
            <p className="font-[family-name:var(--font-display)] text-[0.55rem] font-extrabold tracking-[0.18em] text-black/70 uppercase">
              {story.kicker}
            </p>
            <h3 className="mt-1 font-[family-name:var(--font-display)] text-[clamp(0.85rem,1.4vw,1.15rem)] leading-[1.05] font-extrabold tracking-[-0.03em] text-black/80 uppercase">
              {story.title}
            </h3>
            <TextLines count={Math.max(3, story.lines - 1)} />
          </article>
        ))}
      </div>
      <div className="lp-news-bg-veil absolute inset-0" />
    </div>
  );
}

export function HeroBento({
  profile,
  yearsStat,
  roleTitles,
  roleSupport,
  copy,
  backdropStories,
  nav,
  activeSection,
  localeSwitcher,
  cyberpunkPhase,
  onCyberpunkRequest,
  onCyberpunkExit,
}: HeroBentoProps) {
  const nameParts = [copy.line1, copy.line2, copy.line3]
    .map((part) => part.replace(/\.$/, "").trim())
    .filter(Boolean);
  const marqueeItems = copy.marquee
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);
  const navAccents = [
    "var(--lp-yellow)",
    "var(--lp-blue)",
    "var(--lp-green)",
    "var(--lp-violet)",
    "var(--lp-red)",
  ] as const;

  return (
    <div className="lp-hero relative flex min-h-0 flex-1 flex-col overflow-x-clip overflow-y-visible rounded-none bg-[var(--lp-paper-news)] md:overflow-y-hidden lg:min-h-0">
      <NewspaperBackdrop stories={backdropStories} />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col gap-4 py-3 sm:gap-5 sm:py-5 lg:gap-7 lg:py-6">
          <header className="shrink-0">
            <h1 className="lp-line flex w-full min-w-0 items-baseline justify-between gap-2 px-3 font-[family-name:var(--font-display)] text-[clamp(1.85rem,10.5vw,7.5rem)] leading-[0.82] font-extrabold tracking-[-0.07em] text-black uppercase sm:gap-3 sm:px-6 lg:px-8">
              <span className="min-w-0 shrink truncate">{nameParts[0]}</span>
              {nameParts.length > 1 ? (
                <>
                  <span
                    className="hidden min-w-0 flex-1 text-center text-black/25 sm:inline"
                    aria-hidden
                  >
                    ·
                  </span>
                  <span className="min-w-0 shrink truncate text-right">
                    {nameParts[nameParts.length - 1]}
                  </span>
                </>
              ) : null}
            </h1>

            <nav
              className="lp-nav mt-2.5 flex w-full items-stretch gap-0 border-y-[3px] border-black bg-black sm:mt-4"
              aria-label="Primary"
            >
              <div
                data-lp-chrome="chip"
                className="hidden shrink-0 items-center border-r-[3px] border-black bg-[var(--lp-blue)] px-3 md:flex lg:px-4"
              >
                <span className="font-[family-name:var(--font-display)] text-[0.65rem] font-extrabold tracking-[0.22em] text-black uppercase lg:text-[0.7rem]">
                  Index
                </span>
              </div>

              <div className="hidden min-w-0 flex-1 items-stretch overflow-x-auto md:flex">
                {nav.map((item, index) => {
                  const isActive = item.sectionIds.includes(activeSection);
                  const tone = navAccents[index % navAccents.length];
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      data-lp-chrome="btn"
                      onClick={(event) => handleNavClick(event, item.href)}
                      className={`group relative inline-flex min-h-11 shrink-0 items-center gap-2 border-r-[3px] border-black px-3.5 transition-colors lg:min-h-12 lg:gap-2.5 lg:px-4 ${
                        isActive
                          ? "text-black"
                          : "bg-[var(--lp-hud)] text-white/55 hover:bg-[var(--lp-hud-raised)] hover:text-[var(--lp-accent)]"
                      }`}
                      style={isActive ? { backgroundColor: tone } : undefined}
                      aria-current={isActive ? "true" : undefined}
                    >
                      <span
                        className={`font-[family-name:var(--font-display)] text-[0.6rem] font-extrabold tracking-[0.12em] tabular-nums ${
                          isActive ? "text-black/55" : "text-white/30"
                        }`}
                        aria-hidden
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`size-1.5 shrink-0 rotate-45 border-[1.5px] ${
                          isActive
                            ? "border-black bg-black"
                            : "border-white/35 bg-transparent group-hover:border-[var(--lp-accent)]"
                        }`}
                        aria-hidden
                      />
                      <span className="font-[family-name:var(--font-display)] text-[0.7rem] font-extrabold tracking-[0.16em] uppercase lg:text-[0.75rem]">
                        {item.label}
                      </span>
                      {isActive ? (
                        <>
                          <span
                            className="pointer-events-none absolute top-1 left-1 size-2 border-t-2 border-l-2 border-black"
                            aria-hidden
                          />
                          <span
                            className="pointer-events-none absolute top-1 right-1 size-2 border-t-2 border-r-2 border-black"
                            aria-hidden
                          />
                          <span
                            className="pointer-events-none absolute bottom-1 left-1 size-2 border-b-2 border-l-2 border-black"
                            aria-hidden
                          />
                          <span
                            className="pointer-events-none absolute right-1 bottom-1 size-2 border-r-2 border-b-2 border-black"
                            aria-hidden
                          />
                        </>
                      ) : null}
                    </a>
                  );
                })}
              </div>

              <p className="flex min-h-11 flex-1 items-center px-4 font-[family-name:var(--font-display)] text-[0.7rem] font-extrabold tracking-[0.22em] text-[var(--lp-accent)] uppercase md:hidden">
                Index
              </p>

              <div className="ml-auto flex shrink-0 items-stretch border-l-[3px] border-black md:border-l-0">
                {localeSwitcher}
              </div>
            </nav>

            <HeroMarquee items={marqueeItems} />
          </header>

          <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 px-3 sm:gap-5 sm:px-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-6 lg:px-8 xl:gap-8">
            <article className="lp-hero-card relative min-h-[18rem] overflow-hidden rounded-none border-[3px] border-black bg-white shadow-[4px_4px_0_#000] sm:min-h-[22rem] sm:shadow-[6px_6px_0_#000] lg:min-h-0">
              <PortraitSlats src={profile.portrait} alt={profile.name} />

              <div className="absolute inset-x-0 bottom-0 z-20 flex items-stretch border-t-[3px] border-black bg-black">
                <div className="flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 sm:gap-4 sm:px-5 sm:py-3.5">
                  <HudDiamond
                    active
                    className="border-[var(--lp-red)] bg-[var(--lp-red)]"
                  />
                  <span className="shrink-0 font-[family-name:var(--font-display)] text-[clamp(2rem,8vw,3.5rem)] leading-none font-extrabold tracking-[-0.07em] text-[var(--lp-yellow)]">
                    {yearsStat?.value ?? "7+"}
                  </span>
                  <span className="max-w-[11ch] font-[family-name:var(--font-display)] text-[0.62rem] leading-[1.1] font-extrabold tracking-[0.12em] text-white uppercase sm:max-w-[12ch] sm:text-xs sm:tracking-[0.14em]">
                    {copy.statYears}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(event) => handleNavClick(event, "#contact")}
                  data-lp-chrome="btn"
                  className="relative inline-flex shrink-0 items-center justify-center gap-2 border-l-[3px] border-black bg-[var(--lp-green)] px-3 transition-colors hover:bg-white sm:px-5"
                  aria-label={copy.getInTouch}
                >
                  <HudIndex value="GO" className="text-black/45" />
                  <ArrowUpRight
                    className="size-6 text-black sm:size-7 md:size-8"
                    strokeWidth={2.6}
                    aria-hidden
                  />
                </button>
              </div>
            </article>

            <div
              data-lp-hero-aside
              className="flex min-h-0 flex-col gap-5 sm:gap-6 lg:min-h-0 lg:gap-12"
            >
              <article className="lp-hero-card flex min-h-0 items-start gap-3 rounded-none border-[3px] border-black bg-white p-4 shadow-[4px_4px_0_#000] sm:min-h-[13rem] sm:items-center sm:gap-5 sm:p-6 sm:shadow-[6px_6px_0_#000] md:min-h-[14.5rem] md:p-7">
                <div className="min-w-0 flex-1">
                  <RoleCube titles={roleTitles} />
                  {roleSupport ? (
                    <p
                      className="mt-3 max-w-[48ch] border-t-[3px] border-black pt-3 text-sm leading-snug font-semibold tracking-[-0.015em] text-black/75 sm:mt-5 sm:pt-5 sm:text-lg sm:leading-snug md:text-xl md:leading-[1.35]"
                      data-lp-role-support
                    >
                      {roleSupport}
                    </p>
                  ) : null}
                </div>

                <CircleBadge
                  label={copy.learnMore}
                  onNavigate={(event) => handleNavClick(event, "#cases")}
                />
              </article>

              <div
                data-lp-tagline-card
                className="lp-hero-card relative flex min-h-0 flex-1 flex-col justify-between gap-4 sm:gap-5 lg:gap-6"
              >
                <TaglineHover
                  text={copy.tagline}
                  activateLabel={copy.cyberpunkOn}
                  deactivateLabel={copy.cyberpunkOff}
                  phase={cyberpunkPhase}
                  onRequest={onCyberpunkRequest}
                  onExit={onCyberpunkExit}
                />

                <div className="flex shrink-0 justify-end">
                  <HudCta
                    href="#contact"
                    index={1}
                    onClick={(event) => handleNavClick(event, "#contact")}
                  >
                    {copy.getInTouch}
                  </HudCta>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
