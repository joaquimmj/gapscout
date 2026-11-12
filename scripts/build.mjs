// Bundles the MCP server and the CLI into self-contained files under dist/.
// The plugin's .mcp.json points at dist/mcp.mjs, so a plugin install needs no `npm install`.
import { build } from "esbuild";
import { chmodSync, readFileSync } from "node:fs";

const { version } = JSON.parse(readFileSync("package.json", "utf8"));

const common = {
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node22",
  // node:sqlite is a Node built-in; keep every node: import external.
  external: ["node:*"],
  define: { __GAPSCOUT_VERSION__: JSON.stringify(version) },
  banner: {
    js: "import { createRequire as __gsCreateRequire } from 'node:module'; const require = __gsCreateRequire(import.meta.url);",
  },
  logLevel: "info",
};

// Library entry (programmatic use + tests).
await build({ ...common, entryPoints: ["packages/core/src/index.ts"], outfile: "dist/core.mjs" });

const shebang ={ js: "#!/usr/bin/env node\n" + common.banner.js };
await build({ ...common, entryPoints: ["packages/mcp/src/index.ts"], outfile: "dist/mcp.mjs", banner: shebang });
chmodSync("dist/mcp.mjs", 0o755);
await build({
  ...common,
  entryPoints: ["packages/cli/src/index.ts"],
  outfile: "dist/cli.mjs",
  banner: { js: "#!/usr/bin/env node\n" + common.banner.js },
});
chmodSync("dist/cli.mjs", 0o755);
