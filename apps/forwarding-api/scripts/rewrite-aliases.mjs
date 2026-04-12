// Post-build script: rewrites `@receipt-radar/api/*` import aliases in
// forwarding-api's emitted dist/ to relative paths that point at
// apps/api/dist/* at runtime.
//
// tsc-alias couldn't handle this cleanly because the alias target lives in
// a sibling project's output directory, outside forwarding-api's own outDir.
// A direct string rewrite with path.relative is shorter, clearer, and has
// no external deps.

import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const FORWARDING_ROOT = resolve(SCRIPT_DIR, "..");
const DIST = resolve(FORWARDING_ROOT, "dist");
const API_DIST = resolve(FORWARDING_ROOT, "..", "api", "dist");
const ALIAS = "@receipt-radar/api/";

async function* walk(dir) {
  for (const dirent of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* walk(p);
    } else if (dirent.name.endsWith(".js") || dirent.name.endsWith(".d.ts")) {
      yield p;
    }
  }
}

let filesChecked = 0;
let filesChanged = 0;

for await (const file of walk(DIST)) {
  filesChecked++;
  const content = await readFile(file, "utf8");
  if (!content.includes(ALIAS)) continue;

  const fileDir = dirname(file);
  const relPath = relative(fileDir, API_DIST).replaceAll("\\", "/");
  const prefix = relPath.startsWith(".") ? `${relPath}/` : `./${relPath}/`;
  const rewritten = content.replaceAll(ALIAS, prefix);

  if (rewritten !== content) {
    await writeFile(file, rewritten, "utf8");
    filesChanged++;
  }
}

console.log(
  `[rewrite-aliases] Checked ${filesChecked} files, rewrote @receipt-radar/api/* in ${filesChanged}.`
);
