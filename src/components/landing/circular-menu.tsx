"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { handleNavClick } from "@/lib/smooth-scroll";

gsap.registerPlugin(useGSAP);

type NavItem = {
  label: string;
  href: string;
};

type CircularMenuProps = {
  items: NavItem[];
  openLabel: string;
  closeLabel: string;
  footer?: ReactNode;
};

export function CircularMenu({
  items,
  openLabel,
  closeLabel,
  footer,
}: CircularMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const auraRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lineTopRef = useRef<HTMLSpanElement>(null);
  const lineBottomRef = useRef<HTMLSpanElement>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useGSAP(
    () => {
      if (!mounted) return;

      const overlay = overlayRef.current;
      const aura = auraRef.current;
      const links = linksRef.current?.querySelectorAll(".menu-link");
      const indexes = linksRef.current?.querySelectorAll(".menu-index");
      const footerEl = footerRef.current;
      const closeBtn = closeRef.current;
      const top = lineTopRef.current;
      const bottom = lineBottomRef.current;
      if (!overlay || !aura || !top || !bottom) return;

      if (open) {
        wasOpenRef.current = true;
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        gsap.set(overlay, { autoAlpha: 1 });
        gsap.set(links ?? [], { autoAlpha: 0, y: 28 });
        gsap.set(indexes ?? [], { autoAlpha: 0, y: 16 });
        if (footerEl) gsap.set(footerEl, { autoAlpha: 0, y: 16 });
        if (closeBtn) gsap.set(closeBtn, { autoAlpha: 0, y: -10 });

        tl.fromTo(
          aura,
          { scale: 0 },
          {
            scale: 1,
            duration: 0.9,
            ease: "power3.inOut",
            transformOrigin: "50% 50%",
          },
          0,
        )
          .to(top, { y: 3.5, rotate: 45, duration: 0.3, ease: "power2.out" }, 0)
          .to(
            bottom,
            { y: -3.5, rotate: -45, duration: 0.3, ease: "power2.out" },
            0,
          )
          .to(
            links ?? [],
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.11,
            },
            0.38,
          )
          .to(
            indexes ?? [],
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.11,
            },
            0.42,
          );

        if (footerEl) {
          tl.to(
            footerEl,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.45,
              ease: "power2.out",
            },
            0.55,
          );
        }

        if (closeBtn) {
          tl.to(
            closeBtn,
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.45,
              ease: "power2.out",
            },
            0.5,
          );
        }
        return;
      }

      if (!wasOpenRef.current) {
        gsap.set(overlay, { autoAlpha: 0 });
        gsap.set(aura, { scale: 0 });
        gsap.set(links ?? [], { autoAlpha: 0 });
        gsap.set(indexes ?? [], { autoAlpha: 0 });
        if (footerEl) gsap.set(footerEl, { autoAlpha: 0 });
        if (closeBtn) gsap.set(closeBtn, { autoAlpha: 0 });
        return;
      }

      const exit = gsap.timeline({ defaults: { ease: "power2.in" } });
      exit
        .to(top, { y: 0, rotate: 0, duration: 0.25, ease: "power2.inOut" }, 0)
        .to(
          bottom,
          { y: 0, rotate: 0, duration: 0.25, ease: "power2.inOut" },
          0,
        );
      if (closeBtn)
        exit.to(closeBtn, { autoAlpha: 0, y: -8, duration: 0.22 }, 0);
      if (footerEl)
        exit.to(footerEl, { autoAlpha: 0, y: 10, duration: 0.2 }, 0);
      exit
        .to(indexes ?? [], { autoAlpha: 0, duration: 0.2, stagger: 0.03 }, 0)
        .to(
          links ?? [],
          {
            autoAlpha: 0,
            y: 16,
            duration: 0.28,
            stagger: 0.04,
          },
          0.05,
        )
        .to(
          aura,
          {
            scale: 0,
            duration: 0.55,
            ease: "power3.inOut",
            transformOrigin: "50% 50%",
            onComplete: () => {
              gsap.set(overlay, { autoAlpha: 0 });
            },
          },
          0.12,
        );
    },
    { dependencies: [open, mounted] },
  );

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    const html = document.documentElement;
    const { body } = document;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlScrollbarGutter = html.style.scrollbarGutter;
    const scrollbarWidth = window.innerWidth - html.clientWidth;

    html.classList.add("menu-lock");
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    html.style.scrollbarGutter = "auto";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    window.addEventListener("keydown", onKey);

    return () => {
      window.removeEventListener("keydown", onKey);
      html.classList.remove("menu-lock");
      html.style.overflow = previousHtmlOverflow;
      body.style.overflow = previousBodyOverflow;
      html.style.scrollbarGutter = previousHtmlScrollbarGutter;
      body.style.paddingRight = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  const overlay =
    mounted && typeof document !== "undefined" ? (
      <div
        ref={overlayRef}
        className={
          open
            ? "pointer-events-auto fixed inset-0 z-50 overflow-hidden overscroll-none"
            : "pointer-events-none fixed inset-0 z-50 overflow-hidden overscroll-none"
        }
        style={{ opacity: 0, visibility: "hidden", contain: "paint" }}
        aria-hidden={!open}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2">
            <div
              ref={auraRef}
              className="lp-paper aspect-square h-[300vmax] w-[300vmax] rounded-full bg-[var(--lp-paper)] will-change-transform"
            />
          </div>
        </div>

        <div className="absolute inset-0 z-10 flex min-w-0 flex-col">
          <button
            ref={closeRef}
            type="button"
            aria-label={closeLabel}
            onClick={close}
            data-lp-chrome="btn"
            className="absolute top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-30 grid size-12 place-items-center border-[3px] border-black bg-[var(--lp-accent)] text-black shadow-[4px_4px_0_#000] transition-transform hover:-translate-x-px hover:-translate-y-px hover:shadow-[6px_6px_0_#000] sm:top-10 sm:right-10 sm:size-14 md:top-12 md:right-12 md:size-16 lg:right-16 lg:top-14"
          >
            <X className="size-5 sm:size-6 md:size-7" strokeWidth={2.5} />
          </button>

          <nav
            ref={linksRef}
            className="flex h-full w-full min-w-0 flex-col items-start justify-center overflow-hidden px-6 py-24 sm:px-14 sm:py-28 md:px-20 md:py-0 lg:px-28"
          >
            <div className="flex w-full min-w-0 flex-col items-start gap-1 sm:gap-2 md:max-w-[90%] md:gap-3 lg:max-w-[70%]">
              {items.map((item, index) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(event) => {
                    handleNavClick(event, item.href, { delay: 420 });
                    close();
                  }}
                  className="menu-link group relative inline-flex max-w-full min-w-0 items-center gap-3 border-[3px] border-transparent px-3 py-2 text-left transition-colors hover:border-black hover:bg-[var(--lp-accent)] sm:gap-4 sm:px-4 sm:py-2.5 md:gap-5"
                >
                  <span className="menu-index shrink-0 font-[family-name:var(--font-display)] text-[clamp(0.85rem,2.2vw,1.15rem)] font-extrabold tracking-[0.12em] text-black/35 transition-colors duration-300 group-hover:text-black/55">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="size-1.5 shrink-0 rotate-45 border-[1.5px] border-black/30 bg-transparent transition-colors group-hover:border-black group-hover:bg-black"
                    aria-hidden
                  />
                  <span className="relative inline-flex min-w-0 max-w-full flex-col font-[family-name:var(--font-display)] text-[clamp(1.85rem,calc(0.7rem+5.2vw),6.5rem)] leading-[0.95] font-extrabold tracking-[-0.04em] text-[var(--lp-ink)] uppercase">
                    <span className="break-words transition-transform duration-300 group-hover:translate-x-1">
                      {item.label}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </nav>

          {footer ? (
            <div
              ref={footerRef}
              className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-6 z-20 sm:bottom-10 sm:left-14 md:left-20 lg:left-28"
            >
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        aria-label={open ? closeLabel : openLabel}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        data-lp-chrome="btn"
        className="relative z-[60] flex h-12 w-12 flex-col items-center justify-center gap-[5px] border-[3px] border-black bg-[var(--lp-hud)] shadow-[4px_4px_0_#000] transition-transform hover:-translate-x-px hover:-translate-y-px hover:bg-[var(--lp-accent)] hover:shadow-[6px_6px_0_#000] group"
      >
        <span
          ref={lineTopRef}
          className="block h-[2.5px] w-5 origin-center bg-[var(--lp-accent)] transition-colors group-hover:bg-black"
        />
        <span
          ref={lineBottomRef}
          className="block h-[2.5px] w-5 origin-center bg-[var(--lp-accent)] transition-colors group-hover:bg-black"
        />
      </button>

      {overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
