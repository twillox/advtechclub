/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const viteChunk = path.join(
  __dirname,
  "..",
  "node_modules",
  "vite",
  "dist",
  "node",
  "chunks",
  "node.js"
);

function patch() {
  if (!fs.existsSync(viteChunk)) {
    console.log("[patch-vite-net-use] vite chunk not found, skipping");
    return;
  }

  const src = fs.readFileSync(viteChunk, "utf8");
  if (src.includes("CODEX_PATCH_NET_USE")) {
    console.log("[patch-vite-net-use] already patched");
    return;
  }

  const needle = 'exec("net use", (error, stdout) => {';
  const idx = src.indexOf(needle);
  if (idx === -1) {
    console.log("[patch-vite-net-use] pattern not found, skipping");
    return;
  }

  const afterNeedleIdx = idx + needle.length;
  const closeIdx = src.indexOf("});", afterNeedleIdx);
  if (closeIdx === -1) {
    console.log("[patch-vite-net-use] close pattern not found, skipping");
    return;
  }

  const before = src.slice(0, idx);
  const call = src.slice(idx, closeIdx + 3);
  const after = src.slice(closeIdx + 3);

  const patched =
    before +
    "/* CODEX_PATCH_NET_USE */\ntry {\n" +
    call +
    "\n} catch (e) {\n\t// Ignore spawn EPERM in restricted sandboxes.\n}\n" +
    after;

  fs.writeFileSync(viteChunk, patched, "utf8");
  console.log("[patch-vite-net-use] patched");
}

patch();

