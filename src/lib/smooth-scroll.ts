import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { MouseEvent } from "react";

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

type SmoothScrollOptions = {
  duration?: number;
  offset?: number;
  delay?: number;
};

export function smoothScrollTo(
  target: string | number,
  options: SmoothScrollOptions = {},
) {
  const duration = options.duration ?? 1.05;
  const offset = options.offset ?? 0;
  const delay = options.delay ?? 0;

  const run = () => {
    if (typeof target === "number") {
      gsap.to(window, {
        duration,
        ease: "power2.inOut",
        scrollTo: { y: target, autoKill: true },
        onComplete: () => {
          const y = window.scrollY;
          ScrollTrigger.refresh();
          if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
        },
      });
      return;
    }

    const id = target.startsWith("#") ? target.slice(1) : target;
    if (!id) {
      gsap.to(window, {
        duration,
        ease: "power2.inOut",
        scrollTo: { y: 0, autoKill: true },
        onComplete: () => {
          const y = window.scrollY;
          ScrollTrigger.refresh();
          if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
        },
      });
      return;
    }

    const el = document.getElementById(id);
    if (!el) return;

    gsap.to(window, {
      duration,
      ease: "power2.inOut",
      scrollTo: { y: el, offsetY: offset, autoKill: true },
      onComplete: () => {
        history.replaceState(null, "", `#${id}`);
        const y = window.scrollY;
        ScrollTrigger.refresh();
        if (Math.abs(window.scrollY - y) > 1) window.scrollTo(0, y);
      },
    });
  };

  if (delay > 0) {
    window.setTimeout(run, delay);
    return;
  }

  run();
}

export function handleNavClick(
  event: MouseEvent<HTMLElement>,
  href: string,
  options?: SmoothScrollOptions,
) {
  if (!href.startsWith("#")) return;

  event.preventDefault();
  smoothScrollTo(href, options);
}
