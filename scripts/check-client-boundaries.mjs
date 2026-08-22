#!/usr/bin/env node
/**
 * Guards the server/client boundary in ways tsc and ESLint cannot.
 *
 * Everything a `"use client"` module exports becomes a client reference, so a
 * server component that calls one throws at render time - and only at render
 * time, which means a typecheck and a lint both pass on broken code.
 *
 * Two checks:
 *   1. A client module must not re-export from a non-client module. That gives
 *      one pure helper two import paths, one of which silently poisons it.
 *   2. A server file (no "use client", under src/app or a server component)
 *      must not import a lowercase - that is, non-component - binding from a
 *      client module.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve, dirname } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SRC = join(ROOT, "src");

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.tsx?$/.test(full) ? [full] : [];
  });
}

const files = walk(SRC);
const source = new Map(files.map((file) => [file, readFileSync(file, "utf8")]));
const isClient = (file) => /^\s*(['"])use client\1/.test(source.get(file) ?? "");

/** Resolve an import specifier to a file we know about. */
function resolveImport(fromFile, spec) {
  const base = spec.startsWith("@/")
    ? join(SRC, spec.slice(2))
    : spec.startsWith(".")
      ? resolve(dirname(fromFile), spec)
      : null;
  if (!base) return null;
  for (const candidate of [
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ]) {
    if (source.has(candidate)) return candidate;
  }
  return null;
}

const problems = [];
const IMPORT = /import\s+(?:type\s+)?({[\s\S]*?}|[\w*]+(?:\s*,\s*{[\s\S]*?})?)\s+from\s+["']([^"']+)["']/g;
const REEXPORT = /export\s+(?:\*|{[\s\S]*?})\s+from\s+["']([^"']+)["']/g;

for (const file of files) {
  const text = source.get(file);
  const shown = relative(ROOT, file);

  if (isClient(file)) {
    for (const [, spec] of text.matchAll(REEXPORT)) {
      const target = resolveImport(file, spec);
      if (target && !isClient(target)) {
        problems.push(
          `${shown}\n    re-exports from "${spec}", which is not a client module.\n` +
            `    That publishes a server-safe helper through a client boundary, so any\n` +
            `    server component importing it here crashes at render. Import it from\n` +
            `    "${spec}" directly instead.`,
        );
      }
    }
    continue;
  }

  for (const [, clause, spec] of text.matchAll(IMPORT)) {
    if (clause.trimStart().startsWith("type ")) continue;
    const target = resolveImport(file, spec);
    if (!target || !isClient(target)) continue;

    const names = (clause.match(/{([\s\S]*)}/)?.[1] ?? "")
      .split(",")
      .map((part) => part.split(/\s+as\s+/)[0].trim())
      .filter((name) => name && !name.startsWith("type "));

    // Components are fine for a server file to render; plain functions are not.
    const callable = names.filter((name) => /^[a-z]/.test(name));
    if (callable.length > 0) {
      problems.push(
        `${shown}\n    imports ${callable.map((n) => `\`${n}\``).join(", ")} from "${spec}", a client module.\n` +
          `    A server file may render a client component but cannot call a client\n` +
          `    function. Move the helper to a module without "use client".`,
      );
    }
  }
}

if (problems.length > 0) {
  console.error(`\nClient boundary violations (${problems.length}):\n`);
  for (const problem of problems) console.error(`  ${problem}\n`);
  process.exit(1);
}
console.log("Client boundaries OK");
