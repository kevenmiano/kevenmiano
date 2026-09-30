import { withBasePath } from "@/lib/utils";

const TECH_ICON_SRC: Record<string, string> = {
  react: "/images/tech/react.svg",
  "next.js": "/images/tech/nextjs.svg",
  nextjs: "/images/tech/nextjs.svg",
  go: "/images/tech/go.svg",
  golang: "/images/tech/go.svg",
  "node.js": "/images/tech/nodejs.svg",
  nodejs: "/images/tech/nodejs.svg",
  nestjs: "/images/tech/nestjs.svg",
  aws: "/images/tech/aws.svg",
  cloud: "/images/tech/aws.svg",
  kubernetes: "/images/tech/kubernetes.svg",
  k8s: "/images/tech/kubernetes.svg",
  docker: "/images/tech/docker.svg",
  graphql: "/images/tech/graphql.svg",
  python: "/images/tech/python.svg",
  iot: "/images/tech/mqtt.svg",
  mqtt: "/images/tech/mqtt.svg",
  openai: "/images/tech/openai.svg",
  ai: "/images/tech/openai.svg",
  angular: "/images/tech/angular.svg",
  "c#": "/images/tech/csharp.svg",
  csharp: "/images/tech/csharp.svg",
  "electron.js": "/images/tech/electron.svg",
  electron: "/images/tech/electron.svg",
  flask: "/images/tech/flask.svg",
  selenium: "/images/tech/selenium.svg",
  "web scraping": "/images/tech/selenium.svg",
  preact: "/images/tech/preact.svg",
  "argo cd": "/images/tech/argo.svg",
  argo: "/images/tech/argo.svg",
  gitops: "/images/tech/git.svg",
  nats: "/images/tech/nats.svg",
  harness: "/images/tech/harness.svg",
  kraken: "/images/tech/kraken.svg",
  microfrontends: "/images/tech/webpack.svg",
  ".net": "/images/tech/dotnet.svg",
  dotnet: "/images/tech/dotnet.svg",
};

export function getTechIconSrc(label: string): string | null {
  const src = TECH_ICON_SRC[label.trim().toLowerCase()] ?? null;
  return src ? withBasePath(src) : null;
}
