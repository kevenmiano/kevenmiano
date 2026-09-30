import { ArrowUpRight, Mail, Phone } from "lucide-react";
import type { ReactNode } from "react";
import {
  HudBadge,
  HudCorners,
  HudCta,
  HudDiamond,
  HudPanel,
  HudSectionLabel,
} from "@/components/landing/hud";
import { NewspaperSurface } from "@/components/landing/newspaper-surface";
import { LogoKeven } from "@/components/logo-keven";

type ContactProfile = {
  brand: string;
  role: string;
  location: string;
  email: string;
  linkedin: string;
  phone: string;
  phoneHref: string;
};

type ContactCopy = {
  sectionLabel: string;
  title: string;
  description: string;
  edition: string;
  classifieds: string;
  channels: string;
  emailLabel: string;
  phoneLabel: string;
  linkedin: string;
  emailAria: string;
  phoneAria: string;
  credit: string;
};

type ContactSectionProps = {
  profile: ContactProfile;
  copy: ContactCopy;
};

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.064 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  );
}

function ChannelRow({
  href,
  ariaLabel,
  icon,
  label,
  value,
  index,
  external,
}: {
  href: string;
  ariaLabel: string;
  icon: ReactNode;
  label: string;
  value: string;
  index: number;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group flex items-center gap-3 border-b-[3px] border-black/15 px-4 py-3.5 text-inherit last:border-b-0 transition-colors hover:bg-black/[0.04] sm:gap-4 sm:px-5"
    >
      <span
        className="font-[family-name:var(--font-display)] text-[0.65rem] font-extrabold tracking-[0.12em] text-black/30 tabular-nums"
        aria-hidden
      >
        {String(index).padStart(2, "0")}
      </span>
      <span
        data-lp-chrome="chip"
        className="inline-grid size-10 shrink-0 place-items-center border-[3px] border-black bg-[var(--lp-accent)] text-black shadow-[3px_3px_0_#000] sm:size-11"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-[family-name:var(--font-display)] text-[0.62rem] font-extrabold tracking-[0.16em] text-black/45 uppercase">
          <HudDiamond active className="border-black/40 bg-black/40" />
          {label}
        </span>
        <span className="mt-0.5 block truncate font-[family-name:var(--font-display)] text-sm font-extrabold tracking-[-0.02em] text-black sm:text-base">
          {value}
        </span>
      </span>
      <ArrowUpRight
        className="size-5 shrink-0 text-black/30 transition-colors group-hover:text-black"
        strokeWidth={2.4}
        aria-hidden
      />
    </a>
  );
}

export function ContactSection({ profile, copy }: ContactSectionProps) {
  const linkedinShort = profile.linkedin
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  return (
    <NewspaperSurface
      className="h-full w-full"
      contentClassName="flex h-full min-h-0 flex-col"
    >
      <HudSectionLabel label={copy.sectionLabel} tone="accent" />

      <div className="relative z-10 box-border m-0 flex h-full min-h-0 w-full flex-1 flex-col justify-center gap-[clamp(1.25rem,3vw,2.25rem)] overflow-auto px-3 pt-16 pb-5 max-md:justify-start sm:px-5 sm:pt-24 sm:pb-7 md:px-8 md:pt-[6rem] md:pb-8">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-stretch gap-5 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:gap-6 lg:gap-8">
          <div data-lp-reveal className="relative">
            <HudPanel className="flex h-full flex-col justify-between gap-6 p-5 sm:gap-8 sm:p-7 md:p-8">
              <HudCorners tone="accent" />
              <span
                className="absolute -top-2.5 -right-2.5 size-5 border-[3px] border-black bg-[var(--lp-accent)] sm:size-6"
                aria-hidden
              />

              <div>
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <HudBadge variant="accent">
                    <HudDiamond active />
                    {copy.edition}
                  </HudBadge>
                  <LogoKeven
                    title={profile.brand}
                    size="lg"
                    className="text-white"
                  />
                </div>

                <p className="mb-3 inline-flex items-center gap-2 font-[family-name:var(--font-display)] text-[0.65rem] font-extrabold tracking-[0.18em] text-[var(--lp-accent)] uppercase">
                  <HudDiamond
                    active
                    className="border-[var(--lp-accent)] bg-[var(--lp-accent)]"
                  />
                  {copy.classifieds}
                </p>

                <h2 className="font-[family-name:var(--font-display)] text-[clamp(1.85rem,4.2vw,3.1rem)] leading-[1.02] font-extrabold tracking-[-0.04em] text-balance text-white uppercase">
                  {copy.title}
                </h2>
                <p className="mt-4 max-w-md text-[0.95rem] leading-[1.45] font-semibold text-white/55 md:text-base">
                  {copy.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t-[3px] border-white/15 pt-5">
                <div className="min-w-0 flex-1">
                  <p className="font-[family-name:var(--font-display)] text-[0.62rem] font-extrabold tracking-[0.14em] text-[var(--lp-accent)] uppercase">
                    {profile.role}
                  </p>
                  <p className="mt-0.5 font-[family-name:var(--font-display)] text-[0.62rem] font-extrabold tracking-[0.12em] text-white/40 uppercase">
                    {profile.location}
                  </p>
                </div>
                <HudCta href={`mailto:${profile.email}`} index="GO">
                  {copy.emailLabel}
                </HudCta>
              </div>
            </HudPanel>
          </div>

          <section className="flex min-h-0 flex-col gap-3">
            <div className="flex items-center gap-3">
              <HudBadge variant="dark">{copy.channels}</HudBadge>
            </div>

            <div
              data-lp-reveal
              data-lp-chrome="panel"
              className="relative flex min-h-0 flex-1 flex-col overflow-hidden border-[3px] border-black bg-white shadow-[5px_5px_0_#000]"
            >
              <HudCorners />
              <span className="block h-[3px] w-full bg-black" aria-hidden />
              <ul className="m-0 flex list-none flex-col p-0">
                <li>
                  <ChannelRow
                    href={`mailto:${profile.email}`}
                    ariaLabel={copy.emailAria}
                    icon={<Mail className="size-4" strokeWidth={2.5} />}
                    label={copy.emailLabel}
                    value={profile.email}
                    index={1}
                  />
                </li>
                <li>
                  <ChannelRow
                    href={profile.linkedin}
                    ariaLabel={copy.linkedin}
                    icon={<LinkedInIcon className="size-4" />}
                    label={copy.linkedin}
                    value={linkedinShort}
                    index={2}
                    external
                  />
                </li>
                <li>
                  <ChannelRow
                    href={profile.phoneHref}
                    ariaLabel={copy.phoneAria}
                    icon={<Phone className="size-4" strokeWidth={2.5} />}
                    label={copy.phoneLabel}
                    value={profile.phone}
                    index={3}
                  />
                </li>
              </ul>
            </div>
          </section>
        </div>

        <div
          data-lp-chrome="panel"
          className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 border-[3px] border-black bg-[var(--lp-hud)] px-4 py-2.5 text-white shadow-[4px_4px_0_#000]"
        >
          <span className="inline-flex items-center gap-2 font-[family-name:var(--font-display)] text-[0.65rem] font-extrabold tracking-[0.16em] text-[var(--lp-accent)] uppercase">
            <HudDiamond
              active
              className="border-[var(--lp-accent)] bg-[var(--lp-accent)]"
            />
            {copy.edition}
          </span>
          <span className="ml-auto font-[family-name:var(--font-display)] text-[0.65rem] font-extrabold tracking-[0.14em] text-white/45 uppercase">
            {copy.credit}
          </span>
        </div>
      </div>
    </NewspaperSurface>
  );
}
