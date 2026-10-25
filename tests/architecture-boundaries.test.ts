import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repositoryRoot = path.resolve(import.meta.dirname, "..");

function sourceFiles(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory).flatMap((entry) => {
    const absolutePath = path.join(directory, entry);
    return statSync(absolutePath).isDirectory()
      ? sourceFiles(absolutePath)
      : /\.[cm]?[jt]sx?$/.test(entry)
        ? [absolutePath]
        : [];
  });
}

describe("monorepo architecture boundaries", () => {
  it("has explicit web, API, and shared workspaces", () => {
    expect(existsSync(path.join(repositoryRoot, "apps/web/package.json"))).toBe(
      true,
    );
    expect(existsSync(path.join(repositoryRoot, "apps/api/package.json"))).toBe(
      true,
    );
    expect(
      existsSync(path.join(repositoryRoot, "packages/shared/package.json")),
    ).toBe(true);
    expect(existsSync(path.join(repositoryRoot, "src"))).toBe(false);
  });

  it("keeps database code out of the frontend", () => {
    const frontendSource = sourceFiles(
      path.join(repositoryRoot, "apps/web/src"),
    )
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(frontendSource).not.toMatch(
      /from ["'](?:mongoose|@\/models|@\/repositories|@\/services|@\/lib\/db)/,
    );
  });

  it("keeps frontend frameworks out of the domain API", () => {
    const backendSource = sourceFiles(path.join(repositoryRoot, "apps/api/src"))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(backendSource).not.toMatch(
      /from ["'](?:react|react-dom|next(?:\/|["']))/,
    );
  });

  it("keeps shared contracts independent from frameworks and databases", () => {
    const sharedSource = sourceFiles(
      path.join(repositoryRoot, "packages/shared/src"),
    )
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");

    expect(sharedSource).not.toMatch(
      /from ["'](?:react|react-dom|next(?:\/|["'])|fastify|mongoose)/,
    );
  });

  it("isolates production Next.js output from the development cache", () => {
    const runner = readFileSync(
      path.join(repositoryRoot, "apps/web/scripts/run-next.mjs"),
      "utf8",
    );
    const nextConfig = readFileSync(
      path.join(repositoryRoot, "apps/web/next.config.ts"),
      "utf8",
    );
    const eslintConfig = readFileSync(
      path.join(repositoryRoot, "eslint.config.mjs"),
      "utf8",
    );

    expect(runner).toContain('command === "dev" ? ".next" : ".next-build"');
    expect(nextConfig).toContain("distDir: process.env.NEXT_DIST_DIR");
    expect(eslintConfig).toContain('"**/.next-build/**"');
  });
});
