import type { ReactNode } from "react";
import {
  HudBadge,
  HudDiamond,
  HudSectionLabel,
} from "@/components/landing/hud";
import { NewspaperSurface } from "@/components/landing/newspaper-surface";

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

type EducationSectionProps = {
  sectionLabel: string;
  title: string;
  certsTitle: string;
  items: EducationItem[];
  certs: EducationCert[];
};

function EduLine() {
  return (
    <span
      data-lp-edu-line
      className="block h-[3px] w-full origin-left scale-x-0 bg-black will-change-transform motion-reduce:scale-x-100"
      aria-hidden
    />
  );
}

function EduBlock({
  headline,
  children,
}: {
  headline: string;
  children: ReactNode;
}) {
  return (
    <section data-lp-edu-block className="w-full">
      <div data-lp-edu-headline className="mb-2 flex items-center gap-3">
        <HudBadge variant="dark">{headline}</HudBadge>
      </div>
      <div
        data-lp-edu-list
        className="relative w-full overflow-hidden border-[3px] border-black bg-white shadow-[5px_5px_0_#000]"
      >
        <span
          data-lp-edu-reveal
          className="pointer-events-none absolute inset-0 z-20 origin-left scale-x-100 bg-black will-change-transform motion-reduce:scale-x-0"
          aria-hidden
        />
        <EduLine />
        <ol className="m-0 flex list-none flex-col p-0">{children}</ol>
      </div>
    </section>
  );
}

function EduRow({
  index,
  period,
  title,
  meta,
}: {
  index: number;
  period: string;
  title: string;
  meta?: string;
}) {
  return (
    <li data-lp-edu-item className="flex flex-col gap-0">
      <div
        data-lp-edu-content
        className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-[0.85rem] px-4 py-[1.15rem] max-md:gap-x-[0.85rem] max-md:gap-y-[0.65rem] max-md:px-3 max-md:py-4 sm:px-5"
      >
        <span
          className="pt-[0.15rem] font-[family-name:var(--font-display)] text-[clamp(1.75rem,3vw,2.5rem)] leading-[0.9] font-extrabold tracking-[-0.05em] text-black/25"
          aria-hidden
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <p className="mb-[0.45rem] inline-flex items-center gap-2 font-[family-name:var(--font-display)] text-[0.7rem] font-extrabold tracking-[0.14em] text-black/55 uppercase">
            <HudDiamond active className="border-black/40 bg-black/40" />
            {period}
          </p>
          <h3 className="font-[family-name:var(--font-display)] text-[clamp(1.2rem,2.6vw,1.95rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-balance text-black uppercase">
            {title}
          </h3>
          {meta ? (
            <p className="mt-[0.4rem] text-[0.92rem] leading-[1.35] font-semibold text-black/55">
              {meta}
            </p>
          ) : null}
        </div>
      </div>
      <EduLine />
    </li>
  );
}

export function EducationSection({
  sectionLabel,
  title,
  certsTitle,
  items,
  certs,
}: EducationSectionProps) {
  return (
    <div
      id="education"
      data-lp-pile
      data-lp-section="education"
      className="relative min-w-0 origin-top rounded-none will-change-transform md:h-svh md:max-h-svh md:min-h-svh md:w-full md:overflow-hidden"
    >
      <NewspaperSurface
        className="h-full w-full md:h-full md:max-h-full md:min-h-full"
        contentClassName="flex h-full min-h-0 w-full flex-col"
      >
        <HudSectionLabel label={sectionLabel} tone="accent" />

        <div className="relative z-10 box-border m-0 flex h-full min-h-0 w-full flex-1 flex-col justify-center gap-[clamp(1.25rem,3.5vw,2.75rem)] overflow-auto px-3 pt-16 pb-5 max-md:justify-start sm:px-5 sm:pt-24 sm:pb-7 md:px-8 md:pt-[6rem] md:pb-8">
          <EduBlock headline={title}>
            {items.map((item, index) => (
              <EduRow
                key={`${item.course}-${item.period}`}
                index={index}
                period={item.period}
                title={item.course}
                meta={`${item.school} · ${item.location}`}
              />
            ))}
          </EduBlock>

          {certs.length > 0 ? (
            <EduBlock headline={certsTitle}>
              {certs.map((cert, index) => (
                <EduRow
                  key={cert.title}
                  index={index}
                  period={cert.kind}
                  title={cert.title}
                  meta={cert.issuer}
                />
              ))}
            </EduBlock>
          ) : null}
        </div>
      </NewspaperSurface>
    </div>
  );
}
