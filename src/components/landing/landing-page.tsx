"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { CircularMenu } from "@/components/landing/circular-menu";
import { ContactSection } from "@/components/landing/contact-section";
import { CyberpunkRebootSplash } from "@/components/landing/cyberpunk-reboot-splash";
import { EducationSection } from "@/components/landing/education-section";
import { GitflowTrajectory } from "@/components/landing/gitflow-trajectory";
import {
  CYBERPUNK_CLASS,
  CYBERPUNK_STORAGE_KEY,
  type CyberpunkPhase,
  HeroBento,
} from "@/components/landing/hero-bento";
import {
  CyberpunkHudFrame,
  HudCorners,
  HudDiamond,
  HudSectionLabel,
} from "@/components/landing/hud";
import { NewspaperSurface } from "@/components/landing/newspaper-surface";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { cyberpunkAudio } from "@/lib/cyberpunk-audio";
import { getTechIconSrc } from "@/lib/tech-icons";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type CaseItem =
  | {
      id: string;
      kind: "stat";
      value: string;
      label: string;
    }
  | {
      id: string;
      kind: "case";
      company: string;
      href: string;
      quote: string;
      highlight?: string;
    };

type ExperienceItem = {
  company: string;
  role: string;
  location: string;
  period: string;
  stack: string[];
  highlights: string[];
};

type EducationItem = {
  school: string;
  course: string;
  location: string;
  period: string;
  kind: string;
};

type EducationCert = {
  title: string;
  kind: string;
  issuer?: string;
};

function SectionLabel({
  label,
  tone = "dark",
  className = "",
}: {
  label: string;
  tone?: "dark" | "light" | "accent";
  className?: string;
}) {
  return <HudSectionLabel label={label} tone={tone} className={className} />;
}

const CASE_TONES = [
  {
    wipe: "var(--lp-green)",
    accent: "var(--lp-yellow)",
    number: "text-black",
    title: "text-black",
    quote: "border-black bg-[var(--lp-hud)] text-white",
    label: "#ffffff",
  },
  {
    wipe: "var(--lp-blue)",
    accent: "var(--lp-yellow)",
    number: "text-black",
    title: "text-black",
    quote: "border-black bg-[var(--lp-hud)] text-white",
    label: "#ffffff",
  },
  {
    wipe: "var(--lp-red)",
    accent: "var(--lp-yellow)",
    number: "text-black",
    title: "text-black",
    quote: "border-black bg-[var(--lp-hud)] text-white",
    label: "#ffffff",
  },
  {
    wipe: "var(--lp-violet)",
    accent: "var(--lp-yellow)",
    number: "text-black",
    title: "text-black",
    quote: "border-black bg-[var(--lp-hud)] text-white",
    label: "#ffffff",
  },
  {
    wipe: "var(--lp-yellow)",
    accent: "var(--lp-red)",
    number: "text-black",
    title: "text-black",
    quote: "border-black bg-[var(--lp-hud)] text-white",
    label: "#ffffff",
  },
] as const;

function CaseQuoteText({
  quote,
  highlight,
}: {
  quote: string;
  highlight?: string;
}) {
  if (!highlight || !quote.includes(highlight)) {
    return <>{quote}</>;
  }

  const start = quote.indexOf(highlight);
  const before = quote.slice(0, start);
  const after = quote.slice(start + highlight.length);

  return (
    <>
      {before}
      <mark className="bg-[var(--lp-accent)] px-1.5 py-0.5 font-extrabold text-black [box-decoration-break:clone]">
        {highlight}
      </mark>
      {after}
    </>
  );
}

function CasesReveal({
  items,
  sectionLabel,
  sectionTitle,
  openNewsLabel,
}: {
  items: Extract<CaseItem, { kind: "case" }>[];
  sectionLabel: string;
  sectionTitle: string;
  openNewsLabel: (company: string) => string;
}) {
  return (
    <NewspaperSurface
      id="cases"
      data-lp-pile
      data-lp-section="cases"
      className="relative z-20 flex min-w-0 flex-col origin-top will-change-transform md:h-svh md:max-h-svh md:min-h-svh md:w-full"
      contentClassName="relative z-20 flex min-h-0 flex-1 flex-col"
    >
      <SectionLabel label={sectionLabel} tone="accent" />
      <h2 className="sr-only">{sectionTitle}</h2>

      <div className="relative z-20 flex min-h-0 flex-1 flex-col overflow-hidden md:block">
        {items.map((item, index) => {
          const tone = CASE_TONES[index % CASE_TONES.length];

          return (
            <article
              key={item.id}
              data-lp-case-card
              data-case-active={index === 0 ? "true" : "false"}
              className="lp-case-card relative flex min-h-[min(78svh,42rem)] flex-1 overflow-hidden bg-[var(--case-bg)] md:absolute md:inset-0 md:min-h-0 md:bg-transparent"
              style={
                {
                  zIndex: index === 0 ? 40 : index + 1,
                  pointerEvents: index === 0 ? "auto" : "none",
                  "--case-bg": tone.wipe,
                  "--lp-accent": tone.accent,
                } as CSSProperties
              }
            >
              <div className="pointer-events-none absolute top-0 right-0 hidden translate-x-1/2 -translate-y-1/2 md:block">
                <div
                  data-lp-case-wipe
                  className="pointer-events-none aspect-square h-[300vmax] w-[300vmax] rounded-full will-change-transform"
                  style={{ backgroundColor: tone.wipe }}
                />
              </div>

              <div
                aria-hidden
                className="lp-news-texture-ink absolute inset-0 z-[15]"
              />
              <div
                aria-hidden
                className="lp-news-bg-hatch absolute inset-0 z-[15]"
              />

              <div
                data-lp-case-content
                className="relative z-30 flex h-full min-h-0 w-full flex-col justify-center px-4 pt-20 pb-8 sm:px-8 sm:pt-28 sm:pb-12 md:px-12 md:pt-32 lg:px-16"
                style={{ pointerEvents: index === 0 ? "auto" : "none" }}
              >
                <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-[minmax(0,0.32fr)_minmax(0,0.68fr)] md:items-center md:gap-12 lg:gap-16">
                  <p
                    className={`pointer-events-none font-[family-name:var(--font-display)] text-[clamp(3.75rem,22vw,11rem)] leading-[0.72] font-extrabold tracking-[-0.08em] ${tone.number}`}
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, "0")}
                  </p>

                  <div className="relative z-40 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <h3
                        className={`font-[family-name:var(--font-display)] text-[clamp(1.85rem,8vw,4.75rem)] leading-[0.92] font-extrabold tracking-[-0.045em] break-words ${tone.title}`}
                      >
                        {item.company}
                      </h3>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        aria-label={openNewsLabel(item.company)}
                        data-lp-chrome="btn"
                        className="relative z-50 inline-grid size-12 shrink-0 place-items-center border-[3px] border-black bg-[var(--lp-hud)] text-[var(--lp-accent)] shadow-[4px_4px_0_#000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[var(--lp-accent)] hover:text-black hover:shadow-[6px_6px_0_#000] sm:size-14"
                      >
                        <ArrowUpRight
                          className="size-6 sm:size-7"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                        <HudCorners tone="accent" />
                      </a>
                    </div>
                    <p
                      className={`relative z-50 mt-5 border-[3px] p-4 text-base leading-snug font-semibold tracking-[-0.02em] shadow-[5px_5px_0_#000] sm:mt-7 sm:p-8 sm:text-xl sm:shadow-[7px_7px_0_#000] md:text-2xl md:leading-[1.3] ${tone.quote}`}
                    >
                      <span className="mb-3 flex items-center gap-2 font-[family-name:var(--font-display)] text-[0.65rem] font-extrabold tracking-[0.18em] text-[var(--lp-accent)] uppercase">
                        <HudDiamond
                          active
                          className="border-[var(--lp-accent)] bg-[var(--lp-accent)]"
                        />
                        Dispatch
                      </span>
                      <CaseQuoteText
                        quote={item.quote}
                        highlight={item.highlight}
                      />
                    </p>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </NewspaperSurface>
  );
}

function _TechIconRow({
  labels,
  keyPrefix,
}: {
  labels: string[];
  keyPrefix: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {labels.map((label) => {
        const src = getTechIconSrc(label);

        return (
          <span
            key={`${keyPrefix}-${label}`}
            title={label}
            className="inline-grid size-12 shrink-0 place-items-center border-[3px] border-black bg-white text-black shadow-[4px_4px_0_#000]"
          >
            {src ? (
              <Image
                src={src}
                alt={label}
                width={22}
                height={22}
                className="size-5 object-contain"
              />
            ) : (
              <span className="px-1 text-center text-[9px] font-bold leading-tight tracking-wide text-black/70">
                {label}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hoverGateRef = useRef(0);
  const sectionAudioReady = useRef(false);
  const bootTimerRef = useRef<number | null>(null);
  const visorTimerRef = useRef<number | null>(null);
  const [activeSection, setActiveSection] = useState("about");
  const [cyberpunkPhase, setCyberpunkPhase] = useState<CyberpunkPhase>("idle");
  const [helmetEnterId, setHelmetEnterId] = useState(0);
  const tNav = useTranslations("Nav");
  const tHero = useTranslations("Hero");
  const tProfile = useTranslations("Profile");
  const tCases = useTranslations("Cases");
  const tExperience = useTranslations("Experience");
  const tEducation = useTranslations("Education");
  const tContact = useTranslations("Contact");
  const tRoles = useTranslations("Roles");
  const featuredCases = tCases.raw("items") as CaseItem[];
  const experiences = tExperience.raw("items") as ExperienceItem[];
  const education = tEducation.raw("items") as EducationItem[];
  const educationCerts = tEducation.raw("certs") as EducationCert[];
  const roleTitles = tRoles.raw("titles") as string[];
  const yearsStat = featuredCases.find(
    (item): item is Extract<CaseItem, { kind: "stat" }> => item.kind === "stat",
  );
  const caseOnly = featuredCases.filter(
    (item): item is Extract<CaseItem, { kind: "case" }> => item.kind === "case",
  );

  const clearCyberpunkAnimClasses = useCallback(() => {
    document.documentElement.classList.remove(
      "lp-cyberpunk-boot",
      "lp-cyberpunk-visor-enter",
    );
  }, []);

  const playHelmetEnter = useCallback(() => {
    if (bootTimerRef.current !== null)
      window.clearTimeout(bootTimerRef.current);
    if (visorTimerRef.current !== null)
      window.clearTimeout(visorTimerRef.current);
    clearCyberpunkAnimClasses();

    document.documentElement.classList.add(
      CYBERPUNK_CLASS,
      "lp-cyberpunk-boot",
      "lp-cyberpunk-visor-enter",
    );
    setHelmetEnterId((id) => id + 1);

    const world = document.querySelector<HTMLElement>(".lp-cyber-world");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (world && !reduceMotion) {
      const panels = world.querySelectorAll<HTMLElement>(
        "[data-lp-section], [data-lp-pile]",
      );
      gsap.set(world, {
        opacity: 0,
        scaleY: 0.02,
        scaleX: 1.08,
        transformOrigin: "50% 50%",
      });
      gsap.set(panels, { opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", force3D: true },
        onComplete: () => {
          gsap.set([world, ...panels], { clearProps: "transform,opacity" });
          ScrollTrigger.refresh();
        },
      });

      tl.to(
        world,
        {
          opacity: 1,
          scaleY: 1,
          scaleX: 1,
          duration: 0.85,
          ease: "power3.out",
        },
        0.38,
      );
      tl.to(
        panels,
        {
          opacity: 1,
          duration: 0.55,
          stagger: 0.035,
          ease: "power2.out",
        },
        0.62,
      );
    }

    bootTimerRef.current = window.setTimeout(() => {
      document.documentElement.classList.remove("lp-cyberpunk-boot");
      bootTimerRef.current = null;
    }, 1400);

    visorTimerRef.current = window.setTimeout(() => {
      document.documentElement.classList.remove("lp-cyberpunk-visor-enter");
      visorTimerRef.current = null;
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }, 2400);
  }, [clearCyberpunkAnimClasses]);

  useEffect(() => {
    const stored = window.sessionStorage.getItem(CYBERPUNK_STORAGE_KEY) === "1";
    if (!stored) return;
    setCyberpunkPhase("active");
    document.documentElement.classList.add(CYBERPUNK_CLASS);
    requestAnimationFrame(() => {
      playHelmetEnter();
      void cyberpunkAudio.resume();
      ScrollTrigger.refresh();
    });
  }, [playHelmetEnter]);

  useEffect(() => {
    return () => {
      if (bootTimerRef.current !== null)
        window.clearTimeout(bootTimerRef.current);
      if (visorTimerRef.current !== null)
        window.clearTimeout(visorTimerRef.current);
      if (cyberpunkAudio.isEnabled()) cyberpunkAudio.disable();
    };
  }, []);

  const requestCyberpunk = async () => {
    if (cyberpunkPhase !== "idle") return;
    setCyberpunkPhase("awaiting");
    await cyberpunkAudio.beginAwaitingStart();
  };

  const cancelCyberpunkAwaiting = () => {
    setCyberpunkPhase("idle");
    document.documentElement.classList.remove(
      "lp-cyberpunk-booting",
      "lp-cyberpunk-revealing",
      CYBERPUNK_CLASS,
    );
    cyberpunkAudio.disable();
  };

  const confirmCyberpunkStart = () => {
    setCyberpunkPhase("active");
    window.sessionStorage.setItem(CYBERPUNK_STORAGE_KEY, "1");
    document.documentElement.classList.remove(
      "lp-cyberpunk-booting",
      "lp-cyberpunk-revealing",
    );
    document.documentElement.classList.add(CYBERPUNK_CLASS);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  const enterCyberpunkBoot = () => {
    setCyberpunkPhase("booting");
    document.documentElement.classList.remove("lp-cyberpunk-revealing");
    document.documentElement.classList.add(
      CYBERPUNK_CLASS,
      "lp-cyberpunk-booting",
    );
  };

  const revealCyberpunkWorld = () => {
    document.documentElement.classList.add(
      CYBERPUNK_CLASS,
      "lp-cyberpunk-booting",
      "lp-cyberpunk-revealing",
    );
    playHelmetEnter();
  };

  const startCyberpunkDrop = () => {
    void cyberpunkAudio.confirmStart();
  };

  const exitCyberpunk = () => {
    setCyberpunkPhase("idle");
    window.sessionStorage.setItem(CYBERPUNK_STORAGE_KEY, "0");
    clearCyberpunkAnimClasses();
    document.documentElement.classList.remove(
      CYBERPUNK_CLASS,
      "lp-cyberpunk-booting",
      "lp-cyberpunk-revealing",
    );
    cyberpunkAudio.disable();
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const isCyberpunk = () =>
      document.documentElement.classList.contains("lp-cyberpunk");

    const interactiveSelector =
      "a, button, [data-lp-slat], [data-lp-case-card], [data-lp-gitflow-card], [role='button']";

    const onPointerOver = (event: PointerEvent) => {
      if (!isCyberpunk()) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const interactive = target.closest(interactiveSelector);
      if (!interactive || !root.contains(interactive)) return;
      if (interactive.classList.contains("lp-tagline")) return;
      if (interactive.classList.contains("lp-cyber-mute")) return;
      const now = performance.now();
      if (now - hoverGateRef.current < 70) return;
      hoverGateRef.current = now;

      void (async () => {
        if (!cyberpunkAudio.isEnabled()) {
          await cyberpunkAudio.resume();
        }
        cyberpunkAudio.hover();
      })();
    };

    const onClick = (event: MouseEvent) => {
      if (!isCyberpunk()) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const interactive = target.closest(interactiveSelector);
      if (!interactive || !root.contains(interactive)) return;
      if (interactive.classList.contains("lp-tagline")) return;
      if (interactive.classList.contains("lp-cyber-mute")) return;

      const isNav = Boolean(interactive.closest("nav, [aria-label='Primary']"));

      void (async () => {
        if (!cyberpunkAudio.isEnabled()) {
          await cyberpunkAudio.resume();
        }
        if (isNav) {
          cyberpunkAudio.nav();
          return;
        }
        cyberpunkAudio.click();
      })();
    };

    root.addEventListener("pointerover", onPointerOver);
    root.addEventListener("click", onClick);

    return () => {
      root.removeEventListener("pointerover", onPointerOver);
      root.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    if (!sectionAudioReady.current) {
      sectionAudioReady.current = true;
      return;
    }
    if (!document.documentElement.classList.contains("lp-cyberpunk")) return;
    if (!cyberpunkAudio.isEnabled()) return;
    cyberpunkAudio.transition("in");
  }, []);

  const nav = [
    { label: tNav("about"), href: "#about", sectionIds: ["about"] },
    { label: tNav("cases"), href: "#cases", sectionIds: ["cases"] },
    {
      label: tNav("experience"),
      href: "#experience",
      sectionIds: ["experience"],
    },
    {
      label: tNav("education"),
      href: "#education",
      sectionIds: ["education"],
    },
    { label: tNav("contact"), href: "#contact", sectionIds: ["contact"] },
  ];

  const sectionLabels: Record<string, string> = {
    about: tNav("about"),
    cases: tNav("cases"),
    experience: tNav("experience"),
    education: tNav("education"),
    contact: tNav("contact"),
  };

  const profile = {
    brand: tProfile("brand"),
    name: tProfile("name"),
    role: tProfile("role"),
    location: tProfile("location"),
    email: tProfile("email"),
    linkedin: tProfile("linkedin"),
    phone: tProfile("phone"),
    phoneHref: tProfile("phoneHref"),
    portrait: tProfile("portrait"),
    summary: tProfile("summary"),
  };

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".lp-nav", { y: -16, opacity: 0, duration: 0.6 })
        .from(".lp-hero", { y: 28, opacity: 0, duration: 0.85 }, "-=0.25")
        .from(
          ".lp-news-bg-grid",
          { opacity: 0, scale: 1.08, duration: 1.1, ease: "power2.out" },
          "-=0.7",
        )
        .from(
          ".lp-hero-card",
          { y: 32, opacity: 0, duration: 0.7, stagger: 0.06 },
          "-=0.55",
        )
        .from(
          ".lp-line",
          { y: 36, opacity: 0, duration: 0.65, stagger: 0.07 },
          "-=0.45",
        )
        .from(
          ".lp-portrait-img",
          { opacity: 0, y: 16, duration: 0.9, ease: "power2.out" },
          "-=0.7",
        );

      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) {
        const decor = gsap.utils.toArray(".lp-neo-decor");
        if (decor.length) gsap.set(decor, { clearProps: "all" });
      }

      const revealNodes = gsap.utils.toArray<HTMLElement>(
        "[data-lp-reveal]",
        rootRef.current ?? undefined,
      );

      revealNodes.forEach((node) => {
        const isStackCard = node.hasAttribute("data-lp-stack-card");
        if (reduceMotion) {
          gsap.set(node, { clearProps: "all" });
          return;
        }
        gsap.fromTo(
          node,
          isStackCard ? { autoAlpha: 0 } : { y: 36, autoAlpha: 0 },
          {
            ...(isStackCard ? { autoAlpha: 1 } : { y: 0, autoAlpha: 1 }),
            duration: 0.75,
            ease: "power3.out",
            overwrite: "auto",
            scrollTrigger: {
              trigger: node,
              start: "top 88%",
              toggleActions: "play none none none",
              once: true,
            },
          },
        );
      });

      const mm = gsap.matchMedia();

      const stackRoot =
        rootRef.current?.querySelector<HTMLElement>(".lp-bento-stack");
      const panels = stackRoot
        ? gsap.utils.toArray<HTMLElement>("[data-lp-pile]", stackRoot)
        : [];

      const getNavOffset = () => 3;

      if (rootRef.current) {
        ScrollTrigger.create({
          trigger: rootRef.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.transform = `scaleX(${self.progress})`;
            }
          },
        });
      }

      panels.forEach((panel) => {
        const sectionId = panel.dataset.lpSection || panel.id;
        if (!sectionId) return;

        ScrollTrigger.create({
          trigger: panel,
          start: "top 45%",
          end: "bottom 45%",
          onEnter: () => setActiveSection(sectionId),
          onEnterBack: () => setActiveSection(sectionId),
        });
      });

      if (!reduceMotion) {
        mm.add("(min-width: 768px)", () => {
          if (!stackRoot || panels.length < 2) return;

          panels.forEach((panel, i) => {
            const layer = i + 1;
            panel.dataset.lpPileLayer = String(layer);
            gsap.set(panel, {
              position: "relative",
              zIndex: layer,
            });
          });

          panels.forEach((panel, i) => {
            const next = panels[i + 1];
            const pinStart = () => `top top+=${getNavOffset()}`;
            const pinPriority = panels.length - i;

            if (panel.id === "experience") {
              const stage = panel.querySelector<HTMLElement>(
                "[data-lp-gitflow-stage]",
              );
              const plane = panel.querySelector<HTMLElement>(
                "[data-lp-gitflow-plane]",
              );
              const viewport = panel.querySelector<HTMLElement>(
                "[data-lp-gitflow-viewport]",
              );
              const track = panel.querySelector<HTMLElement>(
                "[data-lp-gitflow-track]",
              );
              const titleEl = panel.querySelector<HTMLElement>(
                "[data-lp-gitflow-title]",
              );
              const copyEl = panel.querySelector<HTMLElement>(
                "[data-lp-gitflow-copy]",
              );
              const mainPath = panel.querySelector<SVGPathElement>(
                "[data-lp-gitflow-main]",
              );
              const branchPaths = gsap.utils.toArray<SVGPathElement>(
                "[data-lp-gitflow-branch]",
                panel,
              );
              const nodeSlots = gsap.utils.toArray<HTMLElement>(
                "[data-lp-gitflow-node]",
                panel,
              );
              const commits = gsap.utils.toArray<HTMLElement>(
                "[data-lp-gitflow-commit]",
                panel,
              );
              const cards = gsap.utils.toArray<HTMLElement>(
                "[data-lp-gitflow-card]",
                panel,
              );
              const tags = gsap.utils.toArray<HTMLElement>(
                "[data-lp-gitflow-branch-tag]",
                panel,
              );

              if (!stage || !plane || !viewport || !track || cards.length === 0)
                return;

              const trackWidth =
                Number(track.dataset.trackWidth) || track.offsetWidth || 1;

              const preparePath = (path: SVGPathElement) => {
                const length = path.getTotalLength();
                if (!Number.isFinite(length) || length <= 0) return 0;
                gsap.set(path, {
                  strokeDasharray: length,
                  strokeDashoffset: length,
                });
                return length;
              };

              const mainLength = mainPath ? preparePath(mainPath) : 0;
              branchPaths.forEach(preparePath);

              gsap.set(commits, { scale: 0, transformOrigin: "50% 50%" });
              gsap.set(tags, { autoAlpha: 0 });
              gsap.set(plane, {
                scale: 1.22,
                yPercent: -36,
                transformOrigin: "50% 50%",
              });
              gsap.set(stage, { autoAlpha: 1 });
              if (titleEl)
                gsap.set(titleEl, {
                  autoAlpha: 1,
                  y: 0,
                  height: "auto",
                  marginTop: "",
                });
              if (copyEl) gsap.set(copyEl, { autoAlpha: 0 });

              let focused = -1;
              const focusStage = (index: number) => {
                if (index === focused) return;
                focused = index;

                nodeSlots.forEach((node, i) => {
                  node.dataset.focus = i === index ? "true" : "false";
                  node.dataset.near =
                    Math.abs(i - index) === 1 ? "true" : "false";
                });

                commits.forEach((commit) => {
                  commit.dataset.active = "false";
                });
                if (commits[index]) commits[index].dataset.active = "true";

                tags.forEach((tag, i) => {
                  gsap.set(tag, { autoAlpha: i === index ? 1 : 0 });
                });

                cards.forEach((card, i) => {
                  card.dataset.gitflowActive = i === index ? "true" : "false";
                });
              };

              const nodeX = (index: number) => {
                const slot = nodeSlots[index];
                if (!slot) return 0;
                const raw = Number(slot.dataset.nodeX);
                if (Number.isFinite(raw)) return raw;
                return (Number.parseFloat(slot.style.left) / 100) * trackWidth;
              };

              const centerX = (index: number) =>
                viewport.clientWidth / 2 - nodeX(index);

              cards.forEach((card) => {
                card.dataset.gitflowActive = "false";
                gsap.set(card, { autoAlpha: 0, y: 36 });
              });

              focusStage(0);
              gsap.set(track, { x: centerX(0), yPercent: -50 });

              const intro = 3.2;
              const settle = 1.8;
              const hold = 3.6;
              const dive = 0.75;
              const travel = 1.1;
              const peek = 0.7;
              const resurface = 1;
              const hop = dive + travel + peek + resurface;
              const endHold = 6.5;
              const jobsSpan =
                hold +
                Math.max(cards.length - 1, 0) * (hold + hop) +
                hold +
                endHold;
              const jobsStart = intro + settle;
              const total = jobsStart + jobsSpan;
              const scrollSpan = Math.max(total * 2.15, 14);

              const stageFromProgress = (progress: number) => {
                const p = progress * total;
                if (p < jobsStart) {
                  focusStage(0);
                  return;
                }
                const jobP = p - jobsStart;
                let idx = 0;
                for (let i = 1; i < cards.length; i += 1) {
                  const at = hold + i * (hold + hop) - hop;
                  if (jobP >= at + dive + travel * 0.5) idx = i;
                }
                focusStage(idx);
              };

              const tl = gsap.timeline({
                scrollTrigger: {
                  id: "lp-gitflow",
                  trigger: panel,
                  start: pinStart,
                  end: () => `+=${Math.round(window.innerHeight * scrollSpan)}`,
                  pin: true,
                  pinSpacing: true,
                  scrub: 1.55,
                  invalidateOnRefresh: true,
                  refreshPriority: pinPriority,
                  onRefresh: (self) => {
                    focused = -1;
                    stageFromProgress(self.progress);
                    const p = self.progress * total;
                    let idx = 0;
                    if (p >= jobsStart) {
                      const jobP = p - jobsStart;
                      for (let i = 1; i < cards.length; i += 1) {
                        const at = hold + i * (hold + hop) - hop;
                        if (jobP >= at + dive + travel * 0.5) idx = i;
                      }
                    }
                    gsap.set(track, { x: centerX(idx), yPercent: -50 });
                  },
                  onUpdate: (self) => {
                    stageFromProgress(self.progress);
                  },
                },
              });

              if (mainPath && mainLength > 0) {
                tl.fromTo(
                  mainPath,
                  { strokeDashoffset: mainLength },
                  {
                    strokeDashoffset: 0,
                    ease: "none",
                    duration: intro * 0.92,
                  },
                  0,
                );
              }

              commits.forEach((commit, index) => {
                const at =
                  (index / Math.max(commits.length - 1, 1)) * intro * 0.85;
                tl.to(
                  commit,
                  {
                    scale: 1,
                    ease: "none",
                    duration: 0.14,
                  },
                  at,
                );
              });

              branchPaths.forEach((path) => {
                const branchIndex = Number(path.dataset.branchIndex ?? 0);
                const length = path.getTotalLength();
                if (!Number.isFinite(length) || length <= 0) return;
                const at =
                  (branchIndex / Math.max(cards.length - 1, 1)) * intro * 0.8;
                tl.fromTo(
                  path,
                  { strokeDashoffset: length },
                  {
                    strokeDashoffset: 0,
                    ease: "none",
                    duration: intro * 0.22,
                  },
                  Math.max(0, at),
                );
              });

              if (cards.length > 1) {
                tl.to(
                  track,
                  {
                    x: () => centerX(Math.min(2, cards.length - 1)),
                    yPercent: -50,
                    ease: "none",
                    duration: intro * 0.7,
                  },
                  intro * 0.15,
                );
                tl.to(
                  track,
                  {
                    x: () => centerX(0),
                    yPercent: -50,
                    ease: "none",
                    duration: intro * 0.25,
                  },
                  intro * 0.85,
                );
              }

              tl.to(
                plane,
                {
                  scale: 1,
                  yPercent: 0,
                  ease: "none",
                  duration: settle,
                },
                intro,
              );
              tl.to(
                stage,
                {
                  autoAlpha: 0.55,
                  ease: "none",
                  duration: settle,
                },
                intro,
              );
              if (titleEl) {
                tl.to(
                  titleEl,
                  {
                    autoAlpha: 0,
                    y: -72,
                    height: 0,
                    marginTop: 0,
                    overflow: "hidden",
                    ease: "none",
                    duration: settle * 0.85,
                  },
                  intro,
                );
              }
              if (copyEl) {
                tl.to(
                  copyEl,
                  {
                    autoAlpha: 1,
                    ease: "none",
                    duration: settle * 0.65,
                  },
                  intro + settle * 0.25,
                );
              }

              tl.fromTo(
                cards[0],
                { autoAlpha: 0, y: 40 },
                {
                  autoAlpha: 1,
                  y: 0,
                  ease: "none",
                  duration: settle * 0.7,
                },
                intro + settle * 0.3,
              );

              for (let i = 1; i < cards.length; i += 1) {
                const at = jobsStart + hold + i * (hold + hop) - hop;
                const prev = cards[i - 1];
                const nextCard = cards[i];
                const diveAt = at;
                const travelAt = at + dive;
                const peekAt = at + dive + travel;
                const riseAt = at + dive + travel + peek;

                tl.to(
                  prev,
                  {
                    autoAlpha: 0,
                    y: -28,
                    ease: "none",
                    duration: dive * 0.75,
                  },
                  diveAt,
                );
                if (copyEl) {
                  tl.to(
                    copyEl,
                    {
                      autoAlpha: 0,
                      ease: "none",
                      duration: dive * 0.7,
                    },
                    diveAt,
                  );
                }
                tl.to(
                  stage,
                  {
                    autoAlpha: 1,
                    ease: "none",
                    duration: dive,
                  },
                  diveAt,
                );
                tl.to(
                  plane,
                  {
                    scale: 1.2,
                    yPercent: -42,
                    ease: "none",
                    duration: dive,
                  },
                  diveAt,
                );

                tl.to(
                  track,
                  {
                    x: () => centerX(i),
                    yPercent: -50,
                    ease: "none",
                    duration: travel,
                  },
                  travelAt,
                );

                tl.to({}, { duration: peek }, peekAt);

                tl.to(
                  plane,
                  {
                    scale: 1,
                    yPercent: 0,
                    ease: "none",
                    duration: resurface,
                  },
                  riseAt,
                );
                tl.to(
                  stage,
                  {
                    autoAlpha: 0.55,
                    ease: "none",
                    duration: resurface,
                  },
                  riseAt,
                );
                if (copyEl) {
                  tl.to(
                    copyEl,
                    {
                      autoAlpha: 1,
                      ease: "none",
                      duration: resurface * 0.7,
                    },
                    riseAt + resurface * 0.2,
                  );
                }
                tl.fromTo(
                  nextCard,
                  { autoAlpha: 0, y: 32 },
                  {
                    autoAlpha: 1,
                    y: 0,
                    ease: "none",
                    duration: resurface * 0.75,
                  },
                  riseAt + resurface * 0.25,
                );
              }

              const lastJobAt =
                jobsStart + hold + Math.max(cards.length - 1, 0) * (hold + hop);
              tl.to({}, { duration: hold + endHold }, lastJobAt);

              return;
            }

            if (panel.id === "cases") {
              const cards = gsap.utils.toArray<HTMLElement>(
                "[data-lp-case-card]",
                panel,
              );
              if (cards.length === 0) return;

              const label = panel.querySelector<HTMLElement>(
                "[data-lp-section-label]",
              );
              const wipes = cards.map((card) =>
                card.querySelector<HTMLElement>("[data-lp-case-wipe]"),
              );
              const contents = cards.map((card) =>
                card.querySelector<HTMLElement>("[data-lp-case-content]"),
              );
              const labelColors = CASE_TONES.map((tone) => tone.label);

              if (label) gsap.set(label, { zIndex: 50, color: labelColors[0] });

              const setActiveCard = (activeIndex: number) => {
                cards.forEach((card, index) => {
                  const isActive = index === activeIndex;
                  card.dataset.caseActive = isActive ? "true" : "false";
                  gsap.set(card, {
                    zIndex: isActive ? 40 : index + 1,
                    pointerEvents: isActive ? "auto" : "none",
                  });
                });
              };

              setActiveCard(0);

              cards.forEach((_card, index) => {
                const wipe = wipes[index];
                const content = contents[index];
                const isActive = index === 0;
                if (wipe) {
                  gsap.set(wipe, {
                    scale: isActive ? 1 : 0,
                    transformOrigin: "50% 50%",
                    force3D: true,
                  });
                }
                if (content) {
                  gsap.set(content, {
                    autoAlpha: isActive ? 1 : 0,
                    y: isActive ? 0 : 40,
                    pointerEvents: isActive ? "auto" : "none",
                  });
                }
              });

              if (cards.length < 2) {
                if (!next) return;
                ScrollTrigger.create({
                  trigger: panel,
                  start: pinStart,
                  endTrigger: next,
                  end: pinStart,
                  pin: true,
                  pinSpacing: false,
                  invalidateOnRefresh: true,
                  refreshPriority: pinPriority,
                });
                return;
              }

              const holdPerCard = cards.map((_, index) =>
                index === cards.length - 1 ? 2.8 : 1.75,
              );
              const transition = 1.55;
              const exit = 0.85;

              let cursor = 0;
              const marks: number[] = [0];

              cursor += holdPerCard[0];
              for (let i = 1; i < cards.length; i += 1) {
                marks.push(cursor);
                cursor += transition + holdPerCard[i];
              }
              const exitAt = cursor;
              cursor += exit;
              const total = cursor;

              const tl = gsap.timeline({
                scrollTrigger: {
                  trigger: panel,
                  start: pinStart,
                  end: () =>
                    `+=${Math.round(window.innerHeight * Math.max(total * 1.55, 6))}`,
                  pin: true,
                  pinSpacing: true,
                  pinType: "fixed",
                  scrub: 1.15,
                  invalidateOnRefresh: true,
                  refreshPriority: pinPriority,
                  onRefresh: () => {
                    const y = window.scrollY;
                    requestAnimationFrame(() => {
                      if (Math.abs(window.scrollY - y) > 1) {
                        window.scrollTo(0, y);
                      }
                    });
                  },
                },
              });

              for (let i = 1; i < cards.length; i += 1) {
                const at = marks[i];
                const wipe = wipes[i];
                const content = contents[i];
                const prevContent = contents[i - 1];
                const prevCard = cards[i - 1];

                if (wipe) {
                  tl.fromTo(
                    wipe,
                    { scale: 0 },
                    {
                      scale: 1,
                      ease: "none",
                      duration: transition,
                      force3D: true,
                    },
                    at,
                  );
                }

                if (prevContent) {
                  tl.to(
                    prevContent,
                    {
                      autoAlpha: 0,
                      y: -20,
                      ease: "none",
                      duration: transition * 0.35,
                    },
                    at,
                  );
                }

                if (content) {
                  tl.fromTo(
                    content,
                    { autoAlpha: 0, y: 40 },
                    {
                      autoAlpha: 1,
                      y: 0,
                      ease: "none",
                      duration: transition * 0.4,
                    },
                    at + transition * 0.35,
                  );
                }

                if (label) {
                  tl.to(
                    label,
                    {
                      color: labelColors[i % labelColors.length],
                      ease: "none",
                      duration: 0.25,
                    },
                    at + transition * 0.2,
                  );
                }

                if (prevContent) {
                  tl.set(prevContent, { pointerEvents: "none" }, at);
                }

                if (content) {
                  tl.set(
                    content,
                    { pointerEvents: "auto" },
                    at + transition * 0.35,
                  );
                }

                tl.set(
                  cards[i],
                  {
                    pointerEvents: "auto",
                    zIndex: 40,
                    attr: { "data-case-active": "true" },
                  },
                  at + transition * 0.35,
                );

                if (prevCard) {
                  tl.set(
                    prevCard,
                    {
                      pointerEvents: "none",
                      zIndex: i,
                      attr: { "data-case-active": "false" },
                    },
                    at + transition * 0.35,
                  );
                  tl.set(prevCard, { autoAlpha: 0 }, at + transition);
                }
              }

              const lastContent = contents[contents.length - 1];
              const lastCard = cards[cards.length - 1];

              if (lastContent) {
                tl.to(
                  lastContent,
                  {
                    autoAlpha: 0,
                    y: -28,
                    pointerEvents: "none",
                    ease: "none",
                    duration: exit * 0.7,
                  },
                  exitAt,
                );
              }

              if (label) {
                tl.to(
                  label,
                  {
                    autoAlpha: 0,
                    y: -18,
                    ease: "none",
                    duration: exit * 0.55,
                  },
                  exitAt + exit * 0.08,
                );
              }

              if (lastCard) {
                tl.set(
                  lastCard,
                  {
                    pointerEvents: "none",
                    attr: { "data-case-active": "false" },
                  },
                  exitAt,
                );
                tl.to(
                  lastCard,
                  {
                    autoAlpha: 0,
                    ease: "none",
                    duration: exit * 0.4,
                  },
                  exitAt + exit * 0.35,
                );
              }

              return;
            }

            if (panel.id === "education") {
              const blocks = gsap.utils.toArray<HTMLElement>(
                "[data-lp-edu-block]",
                panel,
              );
              const headlines = gsap.utils.toArray<HTMLElement>(
                "[data-lp-edu-headline]",
                panel,
              );
              const lists = gsap.utils.toArray<HTMLElement>(
                "[data-lp-edu-list]",
                panel,
              );
              const reveals = gsap.utils.toArray<HTMLElement>(
                "[data-lp-edu-reveal]",
                panel,
              );
              const lines = gsap.utils.toArray<HTMLElement>(
                "[data-lp-edu-line]",
                panel,
              );

              if (headlines.length + lists.length === 0) {
                if (!next) return;
                ScrollTrigger.create({
                  trigger: panel,
                  start: pinStart,
                  endTrigger: next,
                  end: pinStart,
                  pin: true,
                  pinSpacing: false,
                  invalidateOnRefresh: true,
                  refreshPriority: pinPriority,
                });
                return;
              }

              if (headlines.length)
                gsap.set(headlines, { autoAlpha: 0, y: 18 });
              if (lists.length) gsap.set(lists, { autoAlpha: 0, y: 24 });
              if (reveals.length) {
                gsap.set(reveals, {
                  scaleX: 1,
                  transformOrigin: "left center",
                });
              }
              if (lines.length)
                gsap.set(lines, { scaleX: 0, transformOrigin: "left center" });

              const intro = 2.2;
              const step = 1.15;
              const blockGap = 0.95;
              const outro = 4.8;
              const lineDur = step * 0.75;
              const contentDur = step * 0.8;
              const revealDur = step * 1.05;
              let duration = intro;

              blocks.forEach((block) => {
                const headline = block.querySelector("[data-lp-edu-headline]");
                const list = block.querySelector("[data-lp-edu-list]");
                const itemLines = gsap.utils.toArray<HTMLElement>(
                  "[data-lp-edu-item] [data-lp-edu-line]",
                  block,
                );
                if (headline) duration += step;
                if (list) duration += step * 1.55;
                duration += Math.max(itemLines.length, 1) * step * 0.42;
                duration += blockGap;
              });
              duration += outro;

              const tl = gsap.timeline({
                scrollTrigger: {
                  id: "lp-education",
                  trigger: panel,
                  start: pinStart,
                  end: () =>
                    `+=${Math.round(
                      window.innerHeight * Math.max(duration * 1.7, 8),
                    )}`,
                  pin: true,
                  pinSpacing: true,
                  scrub: 1.35,
                  invalidateOnRefresh: true,
                  refreshPriority: pinPriority,
                },
              });

              let at = intro;
              blocks.forEach((block) => {
                const headline = block.querySelector<HTMLElement>(
                  "[data-lp-edu-headline]",
                );
                const list =
                  block.querySelector<HTMLElement>("[data-lp-edu-list]");
                const reveal = block.querySelector<HTMLElement>(
                  "[data-lp-edu-reveal]",
                );
                const topLine = block.querySelector<HTMLElement>(
                  "[data-lp-edu-list] > [data-lp-edu-line]",
                );
                const itemLines = gsap.utils.toArray<HTMLElement>(
                  "[data-lp-edu-item] [data-lp-edu-line]",
                  block,
                );

                if (headline) {
                  tl.fromTo(
                    headline,
                    { autoAlpha: 0, y: 18 },
                    {
                      autoAlpha: 1,
                      y: 0,
                      ease: "none",
                      duration: contentDur,
                    },
                    at,
                  );
                  at += step * 0.6;
                }

                if (list) {
                  tl.fromTo(
                    list,
                    { autoAlpha: 0, y: 24 },
                    {
                      autoAlpha: 1,
                      y: 0,
                      ease: "none",
                      duration: contentDur * 0.45,
                    },
                    at,
                  );
                }

                if (reveal) {
                  tl.fromTo(
                    reveal,
                    { scaleX: 1 },
                    {
                      scaleX: 0,
                      ease: "none",
                      duration: revealDur,
                    },
                    at + step * 0.12,
                  );
                }

                if (topLine) {
                  tl.fromTo(
                    topLine,
                    { scaleX: 0 },
                    {
                      scaleX: 1,
                      ease: "none",
                      duration: lineDur,
                    },
                    at + step * 0.6,
                  );
                }

                itemLines.forEach((line, index) => {
                  tl.fromTo(
                    line,
                    { scaleX: 0 },
                    {
                      scaleX: 1,
                      ease: "none",
                      duration: lineDur,
                    },
                    at + step * 0.8 + index * step * 0.32,
                  );
                });

                at += step * 1.55 + itemLines.length * step * 0.32;
                at += blockGap;
              });

              tl.to({}, { duration: outro }, at);

              return;
            }

            if (!next) return;

            ScrollTrigger.create({
              trigger: panel,
              start: pinStart,
              endTrigger: next,
              end: pinStart,
              pin: true,
              pinSpacing: false,
              invalidateOnRefresh: true,
              refreshPriority: pinPriority,
            });

            gsap.fromTo(
              panel,
              { scale: 1, filter: "brightness(1)" },
              {
                scale: 0.94,
                filter: "brightness(0.82)",
                transformOrigin: "50% 0%",
                ease: "none",
                scrollTrigger: {
                  trigger: next,
                  start: "top bottom",
                  end: pinStart,
                  scrub: true,
                  invalidateOnRefresh: true,
                  refreshPriority: pinPriority,
                },
              },
            );
          });

          const refreshSafe = () => {
            const y = window.scrollY;
            ScrollTrigger.refresh();
            if (Math.abs(window.scrollY - y) > 1) {
              window.scrollTo(0, y);
            }
          };

          requestAnimationFrame(() => {
            requestAnimationFrame(refreshSafe);
          });

          const onLoad = () => refreshSafe();
          window.addEventListener("load", onLoad, { once: true });

          return () => {
            window.removeEventListener("load", onLoad);
          };
        });

        mm.add("(max-width: 767px)", () => {
          const eduPanel =
            rootRef.current?.querySelector<HTMLElement>("#education");
          if (!eduPanel) return;

          const headlines = gsap.utils.toArray<HTMLElement>(
            "[data-lp-edu-headline]",
            eduPanel,
          );
          const lists = gsap.utils.toArray<HTMLElement>(
            "[data-lp-edu-list]",
            eduPanel,
          );
          const reveals = gsap.utils.toArray<HTMLElement>(
            "[data-lp-edu-reveal]",
            eduPanel,
          );
          const lines = gsap.utils.toArray<HTMLElement>(
            "[data-lp-edu-line]",
            eduPanel,
          );
          if (headlines.length + lists.length === 0) return;

          if (headlines.length) gsap.set(headlines, { autoAlpha: 0, y: 16 });
          if (lists.length) gsap.set(lists, { autoAlpha: 0, y: 20 });
          if (reveals.length) {
            gsap.set(reveals, {
              scaleX: 1,
              transformOrigin: "left center",
            });
          }
          if (lines.length)
            gsap.set(lines, { scaleX: 0, transformOrigin: "left center" });

          headlines.forEach((el) => {
            ScrollTrigger.create({
              trigger: el,
              start: "top 92%",
              once: true,
              onEnter: () => {
                gsap.to(el, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.45,
                  ease: "power3.out",
                  overwrite: "auto",
                });
              },
            });
          });

          lists.forEach((list) => {
            const reveal = list.querySelector<HTMLElement>(
              "[data-lp-edu-reveal]",
            );
            const listLines = gsap.utils.toArray<HTMLElement>(
              "[data-lp-edu-line]",
              list,
            );
            ScrollTrigger.create({
              trigger: list,
              start: "top 90%",
              once: true,
              onEnter: () => {
                gsap.to(list, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.35,
                  ease: "power3.out",
                  overwrite: "auto",
                });
                if (reveal) {
                  gsap.fromTo(
                    reveal,
                    { scaleX: 1 },
                    {
                      scaleX: 0,
                      duration: 0.7,
                      ease: "power2.inOut",
                      delay: 0.05,
                      overwrite: "auto",
                    },
                  );
                }
                if (listLines.length) {
                  gsap.to(listLines, {
                    scaleX: 1,
                    duration: 0.65,
                    ease: "power2.out",
                    stagger: 0.08,
                    delay: 0.45,
                    overwrite: "auto",
                  });
                }
              },
            });
          });
        });
      }

      mm.add("(min-width: 1024px)", () => {
        const stacks = gsap.utils.toArray<HTMLElement>(
          "[data-lp-stack]",
          rootRef.current ?? undefined,
        );

        stacks.forEach((stack) => {
          const header = stack.querySelector<HTMLElement>(
            "[data-lp-stack-header]",
          );
          const items = gsap.utils.toArray<HTMLElement>(
            "[data-lp-stack-item]",
            stack,
          );
          if (items.length < 2) return;

          const headerOffset = () => (header?.offsetHeight ?? 0) + 12;

          items.forEach((item, i) => {
            const card =
              item.querySelector<HTMLElement>("[data-lp-stack-card]") ?? item;
            const next = items[i + 1];
            const top = headerOffset() + i * 18;

            gsap.set(item, {
              zIndex: i + 1,
              position: "sticky",
              top,
            });

            if (!next) return;

            gsap.fromTo(
              card,
              { y: 0, transformOrigin: "top center" },
              {
                y: 8 + i * 2,
                ease: "none",
                scrollTrigger: {
                  trigger: next,
                  start: `top top+=${top + 18}`,
                  end: `top top+=${top}`,
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              },
            );
          });
        });
      });

      return () => {
        mm.revert();
      };
    },
    { scope: rootRef },
  );

  return (
    <div
      ref={rootRef}
      className="relative min-h-dvh bg-[var(--lp-paper)] text-[var(--lp-ink)]"
    >
      <CyberpunkHudFrame
        muteLabel={tHero("cyberpunkMute")}
        unmuteLabel={tHero("cyberpunkUnmute")}
        active={cyberpunkPhase === "active" || cyberpunkPhase === "booting"}
        enterId={helmetEnterId}
      />
      <CyberpunkRebootSplash
        open={cyberpunkPhase === "awaiting" || cyberpunkPhase === "booting"}
        title={tHero("rebootTitle")}
        trackingLabel={tHero("rebootTracking")}
        holdLabel={tHero("rebootHold")}
        holdingLabel={tHero("rebootHolding")}
        offlineLabel={tHero("rebootOffline")}
        offlineSub={tHero("rebootOfflineSub")}
        initLabel={tHero("rebootInit")}
        abortHint={tHero("rebootAbort")}
        trollLines={tHero.raw("rebootTrollLines") as string[]}
        dropTease={tHero("rebootDropTease")}
        initLines={tHero.raw("rebootInitLines") as string[]}
        onHudReady={enterCyberpunkBoot}
        onReveal={revealCyberpunkWorld}
        onDrop={startCyberpunkDrop}
        onComplete={confirmCyberpunkStart}
        onAbort={cancelCyberpunkAwaiting}
      />
      <div
        className="lp-progress pointer-events-none fixed top-0 right-0 left-0 z-[120] h-1 bg-black"
        aria-hidden
      >
        <div
          ref={progressRef}
          className="lp-progress-bar h-full w-full origin-left scale-x-0 will-change-transform"
          style={{
            background:
              "linear-gradient(90deg, var(--lp-yellow), var(--lp-green), var(--lp-blue), var(--lp-violet), var(--lp-red))",
          }}
        />
      </div>

      <div className="fixed top-[max(0.75rem,env(safe-area-inset-top))] right-[max(0.75rem,env(safe-area-inset-right))] z-[110] md:hidden">
        <CircularMenu
          items={nav}
          openLabel={tNav("openMenu")}
          closeLabel={tNav("closeMenu")}
          footer={<LocaleSwitcher />}
        />
      </div>

      <div className="lp-cyber-world">
        <section
          id="about"
          data-lp-bento-stack
          className="lp-bento-stack relative flex flex-col gap-[var(--lp-gap)] overflow-visible rounded-none bg-[var(--lp-border)] p-[var(--lp-gap)] isolate md:gap-0 md:bg-transparent md:p-0"
        >
          <div
            data-lp-pile
            data-lp-section="about"
            className="relative flex min-w-0 flex-col overflow-hidden rounded-none bg-[var(--lp-paper-news)] origin-top will-change-transform md:h-svh md:max-h-svh md:min-h-svh md:w-full"
          >
            <HeroBento
              profile={{
                name: profile.name,
                portrait: profile.portrait,
              }}
              yearsStat={yearsStat}
              roleTitles={roleTitles}
              roleSupport={tRoles("support")}
              nav={nav}
              activeSection={activeSection}
              cyberpunkPhase={cyberpunkPhase}
              onCyberpunkRequest={() => {
                void requestCyberpunk();
              }}
              onCyberpunkExit={exitCyberpunk}
              localeSwitcher={
                <LocaleSwitcher className="hidden md:inline-flex" />
              }
              backdropStories={
                tHero.raw("backdropStories") as {
                  kicker: string;
                  title: string;
                  lines: number;
                }[]
              }
              copy={{
                line1: tHero("line1"),
                line2: tHero("line2"),
                line3: tHero("line3"),
                headline: tHero("headline"),
                tagline: tHero("tagline"),
                getInTouch: tHero("getInTouch"),
                statYears: tHero("statYears"),
                learnMore: tHero("learnMore"),
                marquee: tHero("marquee"),
                cyberpunkOn: tHero("cyberpunkOn"),
                cyberpunkOff: tHero("cyberpunkOff"),
              }}
            />
          </div>

          <div
            className="pointer-events-none hidden w-full shrink-0 invisible md:block md:h-[120svh]"
            aria-hidden
          />

          <CasesReveal
            items={caseOnly}
            sectionLabel={sectionLabels.cases}
            sectionTitle={tCases("title")}
            openNewsLabel={(company) => tCases("openNews", { company })}
          />

          <GitflowTrajectory
            items={experiences}
            sectionLabel={sectionLabels.experience}
            title={tExperience("title")}
            labels={{
              main: tExperience("branchMain"),
              head: tExperience("branchHead"),
              promo: tExperience("branchPromo"),
              feature: tExperience("branchFeature"),
            }}
          />

          <EducationSection
            sectionLabel={sectionLabels.education}
            title={tEducation("title")}
            certsTitle={tEducation("certsTitle")}
            items={education}
            certs={educationCerts}
          />

          <footer
            id="contact"
            data-lp-pile
            data-lp-section="contact"
            className="relative min-w-0 origin-top will-change-transform md:h-svh md:max-h-svh md:min-h-svh md:w-full"
          >
            <ContactSection
              profile={{
                brand: profile.brand,
                role: profile.role,
                location: profile.location,
                email: profile.email,
                linkedin: profile.linkedin,
                phone: profile.phone,
                phoneHref: profile.phoneHref,
              }}
              copy={{
                sectionLabel: sectionLabels.contact,
                title: tContact("title"),
                description: tContact("description"),
                edition: tContact("edition"),
                classifieds: tContact("classifieds"),
                channels: tContact("channels"),
                emailLabel: tContact("emailLabel"),
                phoneLabel: tContact("phoneLabel"),
                linkedin: tContact("linkedin"),
                emailAria: tContact("emailAria", { email: profile.email }),
                phoneAria: tContact("phoneAria", { phone: profile.phone }),
                credit: tContact("credit", { name: profile.name }),
              }}
            />
          </footer>
        </section>
      </div>
    </div>
  );
}
