import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "out");
const basePath = (process.env.PAGES_BASE_PATH ?? "").replace(/\/$/, "");
const target = `${basePath}/pt/`;

if (!existsSync(outDir)) {
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });

writeFileSync(
  join(outDir, "index.html"),
  `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0;url=${target}" />
    <link rel="canonical" href="${target}" />
    <title>Keven Miano</title>
    <script>
      location.replace(${JSON.stringify(target)} + location.search + location.hash);
    </script>
  </head>
  <body></body>
</html>
`,
);
