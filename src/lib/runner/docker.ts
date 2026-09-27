/**
 * Project detection — inspects cloned repository to determine language, package manager, test framework.
 */
import fs from "fs";
import path from "path";
import { ProjectInfo } from "../investigations/types";

export function detectProject(repoPath: string): ProjectInfo {
  const has = (file: string) => fs.existsSync(path.join(repoPath, file));
  const read = (file: string) => {
    try {
      return fs.readFileSync(path.join(repoPath, file), "utf-8");
    } catch {
      return null;
    }
  };

  // Language
  const hasTypeScript = has("tsconfig.json") || findFiles(repoPath, ".ts").length > 0;
  const language: ProjectInfo["language"] = hasTypeScript
    ? "typescript"
    : has("package.json")
    ? "javascript"
    : "unknown";

  // Prefer the repository's explicit packageManager declaration. It is the
  // source of truth for repos that keep more than one lockfile.
  let packageManager: ProjectInfo["packageManager"] = "unknown";
  const packageJson = read("package.json");
  if (packageJson) {
    try {
      const declared = JSON.parse(packageJson).packageManager as unknown;
      const manager = typeof declared === "string" ? declared.split("@")[0] : "";
      if (manager === "npm" || manager === "pnpm" || manager === "yarn") {
        packageManager = manager;
      }
    } catch {
      // Fall back to lockfile detection below.
    }
  }
  if (packageManager === "unknown") {
    if (has("pnpm-lock.yaml")) packageManager = "pnpm";
    else if (has("yarn.lock")) packageManager = "yarn";
    else if (has("package-lock.json")) packageManager = "npm";
    else if (has("package.json")) packageManager = "npm-install";
  }

  // Test framework
  let testFramework: ProjectInfo["testFramework"] = "unknown";
  let testCommand: string | undefined;

  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson);
      const deps = {
        ...pkg.dependencies,
        ...pkg.devDependencies,
      };
      if (deps["vitest"]) {
        testFramework = "vitest";
        testCommand = "npx vitest run";
      } else if (deps["jest"] || deps["@jest/core"] || deps["ts-jest"]) {
        testFramework = "jest";
        testCommand = "npx jest --runInBand --forceExit";
      }
      // Check scripts.test as fallback
      if (testFramework === "unknown" && pkg.scripts?.test) {
        const testScript = pkg.scripts.test as string;
        if (testScript.includes("vitest")) {
          testFramework = "vitest";
          testCommand = "npm test";
        } else if (testScript.includes("jest")) {
          testFramework = "jest";
          testCommand = "npm test";
        }
      }
    } catch {
      // ignore parse errors
    }
  }

  // Check config files
  if (testFramework === "unknown") {
    if (
      has("vitest.config.ts") ||
      has("vitest.config.js") ||
      has("vitest.config.mts")
    ) {
      testFramework = "vitest";
      testCommand = "npx vitest run";
    } else if (
      has("jest.config.ts") ||
      has("jest.config.js") ||
      has("jest.config.mjs")
    ) {
      testFramework = "jest";
      testCommand = "npx jest --runInBand --forceExit";
    }
  }

  // Framework detection
  let framework: string | undefined;
  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps["next"]) framework = "next.js";
      else if (deps["express"]) framework = "express";
      else if (deps["fastify"]) framework = "fastify";
      else if (deps["react"]) framework = "react";
    } catch {
      // ignore
    }
  }

  const supported = language !== "unknown" && packageManager !== "unknown";

  return {
    language,
    packageManager,
    framework,
    testFramework,
    testCommand,
    supported,
  };
}

function findFiles(dir: string, ext: string, depth = 3): string[] {
  if (depth === 0) return [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const results: string[] = [];
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
      if (entry.isDirectory()) {
        results.push(...findFiles(path.join(dir, entry.name), ext, depth - 1));
      } else if (entry.name.endsWith(ext)) {
        results.push(path.join(dir, entry.name));
        if (results.length >= 5) return results; // quick check
      }
    }
    return results;
  } catch {
    return [];
  }
}




