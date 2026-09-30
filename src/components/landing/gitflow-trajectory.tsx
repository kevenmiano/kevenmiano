"use client";

import Image from "next/image";
import { HudSectionLabel } from "@/components/landing/hud";
import { NewspaperSurface } from "@/components/landing/newspaper-surface";
import { getTechIconSrc } from "@/lib/tech-icons";
import { cn } from "@/lib/utils";

export type GitflowJob = {
  company: string;
  role: string;
  location: string;
  period: string;
  stack: string[];
  highlights: string[];
};

type FlowKind = "main" | "promo" | "feature";

type VisualKind = "main" | "promo" | "feature" | "head";

type FlowNode = {
  id: string;
  job: GitflowJob;
  kind: FlowKind;
  index: number;
  x: number;
  y: number;
};

type GitflowTrajectoryProps = {
  items: GitflowJob[];
  sectionLabel: string;
  title: string;
  labels: {
    main: string;
    head: string;
    promo: string;
    feature: string;
  };
};

const PAD_X = 280;
const STEP = 300;
const SVG_H = 280;
const Y_MAIN = 72;
const Y_PROMO = 152;
const Y_FEATURE = 232;
const CURVE = STEP * 0.55;

function laneY(kind: FlowKind) {
  if (kind === "promo") return Y_PROMO;
  if (kind === "feature") return Y_FEATURE;
  return Y_MAIN;
}

function softStep(x0: number, y0: number, x1: number, y1: number) {
  const mx = (x0 + x1) / 2;
  return `C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
}

function getVisualKind(kind: FlowKind, isHead: boolean): VisualKind {
  if (isHead && kind === "main") return "head";
  return kind;
}

function branchPathStroke(kind: FlowKind) {
  return cn(
    "fill-none stroke-[8] [stroke-linecap:round] [stroke-linejoin:round]",
    kind === "promo" && "stroke-[var(--chart-4)]",
    kind === "feature" && "stroke-[var(--chart-1)]",
  );
}

function commitKindClass(visualKind: VisualKind) {
  return cn(
    "relative z-[2] block aspect-square size-5 shrink-0 rounded-none border-[3px] border-[var(--lp-border)] shadow-[3px_3px_0_var(--lp-border)] origin-center will-change-transform data-[active=true]:shadow-none",
    visualKind === "main" && "bg-[var(--chart-1)]",
    visualKind === "promo" && "bg-[var(--chart-4)]",
    visualKind === "feature" && "bg-[var(--lp-hud)] border-black",
    visualKind === "head" && "size-6 bg-[var(--chart-2)]",
  );
}

function branchTagClass(visualKind: VisualKind) {
  return cn(
    "absolute bottom-[calc(100%+0.7rem)] left-1/2 z-[3] -translate-x-1/2 border-[3px] border-[var(--lp-border)] px-[0.45rem] py-[0.15rem] font-[family-name:var(--font-display)] text-[0.62rem] font-extrabold tracking-[0.08em] uppercase whitespace-nowrap shadow-[3px_3px_0_var(--lp-border)] opacity-0",
    visualKind === "main" && "bg-[var(--chart-1)] text-black",
    visualKind === "promo" && "bg-[var(--chart-4)] text-black",
    visualKind === "feature" && "bg-[var(--lp-hud)] text-white",
    visualKind === "head" && "bg-[var(--chart-2)] text-black",
  );
}

function kindBadgeClass(visualKind: VisualKind) {
  return cn(
    "inline-flex border-[3px] border-[var(--lp-border)] px-[0.65rem] py-1 font-[family-name:var(--font-display)] text-[0.7rem] font-extrabold tracking-[0.1em] uppercase shadow-[3px_3px_0_#000]",
    visualKind === "main" && "bg-[var(--chart-1)] text-black",
    visualKind === "promo" && "bg-[var(--chart-4)] text-black",
    visualKind === "feature" && "bg-[var(--lp-hud)] text-white",
    visualKind === "head" && "bg-[var(--chart-2)] text-black",
  );
}

function buildNodes(items: GitflowJob[]): FlowNode[] {
  const chrono = [...items].reverse();

  return chrono.map((job, index, arr) => {
    const prev = arr[index - 1];
    const isPromo = Boolean(prev && prev.company === job.company);
    const isFeature =
      !isPromo &&
      (job.company.toLowerCase().includes("typper") ||
        job.role.toLowerCase().includes("consultor") ||
        job.role.toLowerCase().includes("consultant"));

    const kind: FlowKind = isPromo
      ? "promo"
      : isFeature
        ? "feature"
        : "main";

    return {
      id: `${job.company}-${job.role}-${job.period}`,
      job,
      kind,
      index,
      x: PAD_X + index * STEP,
      y: laneY(kind),
    };
  });
}

function buildMainPath(nodes: FlowNode[], svgW: number) {
  if (nodes.length === 0) return "";
  const start = `M ${Math.max(8, nodes[0].x - 180)} ${Y_MAIN}`;
  const segs = nodes.map((node) => `L ${node.x} ${Y_MAIN}`);
  const end = `L ${Math.min(svgW - 8, nodes[nodes.length - 1].x + 180)} ${Y_MAIN}`;
  return [start, ...segs, end].join(" ");
}

function buildBranchPaths(nodes: FlowNode[]) {
  const paths: { d: string; kind: FlowKind; index: number }[] = [];
  let i = 0;

  while (i < nodes.length) {
    const node = nodes[i];
    if (node.kind === "main") {
      i += 1;
      continue;
    }

    const kind = node.kind;
    let j = i + 1;
    while (j < nodes.length && nodes[j].kind === kind) j += 1;

    const run = nodes.slice(i, j);
    const y = laneY(kind);
    const first = run[0];
    const last = run[run.length - 1];
    const prev = nodes[i - 1];
    const next = nodes[j];
    const forkX = prev ? prev.x : first.x - CURVE;
    const mergeX = next ? next.x : last.x + CURVE;

    const through = run
      .slice(1)
      .map((item) => `L ${item.x} ${y}`)
      .join(" ");

    const d = [
      `M ${forkX} ${Y_MAIN}`,
      softStep(forkX, Y_MAIN, first.x, y),
      through,
      softStep(last.x, y, mergeX, Y_MAIN),
    ]
      .filter(Boolean)
      .join(" ");

    paths.push({ d, kind, index: i });
    i = j;
  }

  return paths;
}

function StackIcons({
  labels,
  keyPrefix,
}: {
  labels: string[];
  keyPrefix: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      {labels.map((label) => {
        const src = getTechIconSrc(label);
        return (
          <span
            key={`${keyPrefix}-${label}`}
            title={label}
            className="inline-grid size-9 shrink-0 place-items-center border-[3px] border-black bg-[var(--lp-hud)] text-[var(--lp-accent)] shadow-[3px_3px_0_#000] sm:size-11"
          >
            {src ? (
              <Image
                src={src}
                alt={label}
                width={20}
                height={20}
                className="size-5 object-contain"
              />
            ) : (
              <span className="px-1 text-[10px] font-extrabold tracking-tight uppercase">
                {label.slice(0, 3)}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export function GitflowTrajectory({
  items,
  sectionLabel,
  title,
  labels,
}: GitflowTrajectoryProps) {
  const nodes = buildNodes(items);
  const svgW = PAD_X * 2 + Math.max(nodes.length - 1, 0) * STEP;
  const mainPath = buildMainPath(nodes, svgW);
  const branchPaths = buildBranchPaths(nodes);
  const titleParts = title
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return (
    <div
      id="experience"
      data-lp-pile
      data-lp-section="experience"
      className="relative min-w-0 rounded-none origin-top will-change-transform md:h-svh md:min-h-svh md:max-h-svh md:w-full md:overflow-x-clip md:overflow-y-hidden"
    >
      <NewspaperSurface
        className="h-full w-full overflow-visible md:h-full md:min-h-full md:max-h-full"
        contentClassName="relative flex h-full w-full flex-col overflow-visible"
      >
        <HudSectionLabel label={sectionLabel} tone="accent" />

        <div
          data-lp-gitflow-stage
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] hidden h-[38%] items-center overflow-visible md:flex"
          aria-hidden
        >
          <div
            data-lp-gitflow-plane
            className="relative flex h-[min(34vh,300px)] w-full origin-[50%_60%] items-center overflow-visible will-change-transform"
          >
            <div
              data-lp-gitflow-viewport
              className="relative h-full w-full overflow-visible"
            >
              <div
                data-lp-gitflow-track
                data-track-width={svgW}
                className="absolute top-1/2 left-0 overflow-visible will-change-transform"
                style={{ width: `${svgW}px` }}
              >
                <div
                  className="relative overflow-visible"
                  style={{ width: `${svgW}px`, height: `${SVG_H}px` }}
                >
                  <svg
                    data-lp-gitflow-svg
                    className="pointer-events-none block overflow-visible"
                    viewBox={`0 0 ${svgW} ${SVG_H}`}
                    width={svgW}
                    height={SVG_H}
                    preserveAspectRatio="xMidYMid meet"
                    fill="none"
                  >
                    <path
                      data-lp-gitflow-main
                      d={mainPath}
                      className="fill-none stroke-[8] [stroke-linecap:round] [stroke-linejoin:round] stroke-[var(--lp-ink)]"
                    />
                    {branchPaths.map((branch) => (
                      <path
                        key={`branch-${branch.index}`}
                        data-lp-gitflow-branch
                        data-branch-index={branch.index}
                        d={branch.d}
                        className={branchPathStroke(branch.kind)}
                      />
                    ))}
                  </svg>

                  <div className="pointer-events-none absolute inset-0 overflow-visible">
                    {nodes.map((node, index) => {
                      const isHead = index === nodes.length - 1;
                      const visualKind = getVisualKind(node.kind, isHead);
                      const branchLabel =
                        node.kind === "promo"
                          ? labels.promo
                          : node.kind === "feature"
                            ? labels.feature
                            : isHead
                              ? labels.head
                              : labels.main;

                      return (
                        <div
                          key={node.id}
                          data-lp-gitflow-node
                          data-node-index={index}
                          data-node-x={node.x}
                          className="group absolute opacity-55 data-[focus=true]:opacity-100 data-[near=true]:opacity-85"
                          style={{
                            left: `${(node.x / svgW) * 100}%`,
                            top: `${(node.y / SVG_H) * 100}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                        >
                          <div className="relative flex w-max flex-col items-center">
                            {node.y <= Y_MAIN ? (
                              <span
                                data-lp-gitflow-branch-tag
                                className={branchTagClass(visualKind)}
                              >
                                {branchLabel}
                              </span>
                            ) : null}

                            {node.y > Y_MAIN ? (
                              <div className="mb-2 flex w-max max-w-44 flex-col items-center text-center">
                                <span className="block w-full text-center font-[family-name:var(--font-display)] text-sm font-extrabold tracking-[-0.02em] leading-[1.1] text-balance text-black group-data-[focus=true]:text-base">
                                  {node.job.company}
                                </span>
                                <span className="mt-0.5 block w-full text-center font-[family-name:var(--font-display)] text-[0.68rem] font-extrabold tracking-[0.12em] text-black/55">
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                              </div>
                            ) : null}

                            <span className="relative flex size-10 shrink-0 items-center justify-center">
                              <span
                                data-lp-gitflow-commit
                                className={cn(
                                  commitKindClass(visualKind),
                                  "peer",
                                )}
                              />
                              <span
                                className="pointer-events-none absolute left-1/2 top-1/2 z-[1] aspect-square size-9 -translate-x-1/2 -translate-y-1/2 rounded-none border-[3px] border-black opacity-0 peer-data-[active=true]:opacity-100"
                                aria-hidden
                              />
                            </span>

                            {node.y <= Y_MAIN ? (
                              <div className="mt-2 flex w-max max-w-44 flex-col items-center text-center">
                                <span className="block w-full text-center font-[family-name:var(--font-display)] text-[0.68rem] font-extrabold tracking-[0.12em] text-black/55">
                                  {String(index + 1).padStart(2, "0")}
                                </span>
                                <span className="mt-0.5 block w-full text-center font-[family-name:var(--font-display)] text-sm font-extrabold tracking-[-0.02em] leading-[1.1] text-balance text-black group-data-[focus=true]:text-base">
                                  {node.job.company}
                                </span>
                              </div>
                            ) : (
                              <span
                                data-lp-gitflow-branch-tag
                                className={cn(
                                  branchTagClass(visualKind),
                                  "top-[calc(100%+0.7rem)] bottom-auto",
                                )}
                              >
                                {branchLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 flex min-h-0 flex-1 flex-col overflow-visible px-3 sm:px-6 md:px-8 lg:px-10">
          <header className="relative z-30 mx-auto w-full max-w-6xl shrink-0 overflow-visible pt-16 sm:pt-24 md:pt-24">
            <h2
              data-lp-gitflow-title
              className="flex w-full min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-[family-name:var(--font-display)] text-[clamp(1.45rem,7.5vw,4.25rem)] leading-[0.9] font-extrabold tracking-[-0.035em] text-black uppercase sm:gap-x-5"
            >
              <span className="shrink-0">{titleParts[0]}</span>
              {titleParts.length > 1 ? (
                <>
                  <span
                    className="pointer-events-none hidden min-w-[1.5rem] flex-1 self-center text-center text-black/20 md:inline"
                    aria-hidden
                  >
                    ·
                  </span>
                  <span className="ml-auto shrink-0 text-right">
                    {titleParts[titleParts.length - 1]}
                  </span>
                </>
              ) : null}
            </h2>
          </header>

          <div
            data-lp-gitflow-copy
            className="relative z-20 box-border mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col justify-center overflow-visible pt-10 pb-8 sm:pt-12 sm:pb-10 md:max-h-[64%] md:pt-12 md:pb-4 lg:pt-14"
          >
            <div className="relative flex h-full min-h-0 w-full flex-col justify-center gap-8 overflow-visible sm:gap-10 md:block">
              {nodes.map((node, index) => {
                const isHead = index === nodes.length - 1;
                const visualKind = getVisualKind(node.kind, isHead);
                const kindLabel =
                  node.kind === "promo"
                    ? labels.promo
                    : node.kind === "feature"
                      ? labels.feature
                      : isHead
                        ? labels.head
                        : labels.main;

                return (
                  <article
                    key={node.id}
                    data-lp-gitflow-card
                    data-gitflow-active={index === 0 ? "true" : "false"}
                    className="relative flex w-full flex-col justify-center overflow-visible md:absolute md:inset-x-0 md:top-0 md:bottom-auto md:opacity-0 md:invisible md:pointer-events-none md:data-[gitflow-active=true]:z-[2]"
                  >
                    <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-[auto_minmax(0,1fr)] md:items-start md:gap-8 lg:gap-10">
                      <p
                        className="pointer-events-none w-[2.15em] shrink-0 font-[family-name:var(--font-display)] text-[clamp(2.75rem,16vw,7.5rem)] leading-[0.78] font-extrabold tracking-[-0.08em] text-black tabular-nums"
                        aria-hidden
                      >
                        {String(index + 1).padStart(2, "0")}
                      </p>

                      <div className="min-w-0 overflow-visible">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                          <p className="inline-flex w-fit max-w-full border-[3px] border-black bg-white px-[0.65rem] py-1 text-[0.65rem] font-extrabold tracking-[0.12em] text-black uppercase shadow-[3px_3px_0_#000] sm:text-[0.7rem]">
                            {node.job.period}
                          </p>
                          <span className={kindBadgeClass(visualKind)}>
                            {kindLabel}
                          </span>
                          <span className="font-[family-name:var(--font-display)] text-[0.65rem] font-extrabold tracking-[0.14em] text-black/55 uppercase sm:text-[0.7rem]">
                            {node.job.location}
                          </span>
                        </div>

                        <h3 className="mt-2.5 max-w-full font-[family-name:var(--font-display)] text-[clamp(1.65rem,8vw,4.1rem)] leading-[0.95] font-extrabold tracking-[-0.05em] break-words text-black uppercase sm:mt-3">
                          {node.job.company}
                        </h3>
                        <p className="mt-1.5 font-[family-name:var(--font-display)] text-[clamp(0.95rem,4.2vw,1.5rem)] leading-[1.15] font-extrabold tracking-[-0.03em] text-black sm:mt-2">
                          {node.job.role}
                        </p>

                        <ul className="m-0 mt-3 max-h-[min(44vh,24rem)] list-none overflow-y-auto border-[3px] border-black bg-black p-3.5 text-white shadow-[5px_5px_0_#000] sm:mt-5 sm:p-5 sm:shadow-[7px_7px_0_#000] md:max-h-[min(38vh,22rem)] md:p-6">
                          {node.job.highlights.map((item) => (
                            <li
                              key={item}
                              className="flex min-w-0 gap-2.5 border-t-[2px] border-white/15 py-2 text-[clamp(0.84rem,3.4vw,1.08rem)] leading-[1.35] font-semibold text-pretty first:border-t-0 first:pt-0 last:pb-0 sm:gap-3"
                            >
                              <span
                                className="mt-[0.4rem] size-[0.55rem] shrink-0 bg-[var(--lp-accent)]"
                                aria-hidden
                              />
                              <span className="text-pretty">{item}</span>
                            </li>
                          ))}
                        </ul>

                        <footer className="mt-3 sm:mt-4">
                          <StackIcons
                            labels={node.job.stack}
                            keyPrefix={node.id}
                          />
                        </footer>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </NewspaperSurface>
    </div>
  );
}
