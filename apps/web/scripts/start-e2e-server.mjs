process.env.AUTH_GITHUB_ID = "playwright-github-client";
process.env.AUTH_GITHUB_SECRET = "playwright-github-secret";
process.env.AUTH_SECRET = "lingo-deutsch-playwright-secret-value";
process.env.NEXTAUTH_URL = "http://127.0.0.1:3100";
process.env.NEXT_DIST_DIR = ".next-e2e";

process.argv = [
  process.execPath,
  "next",
  "dev",
  "--webpack",
  "--hostname",
  "127.0.0.1",
  "--port",
  "3100",
];

await import("../../../node_modules/next/dist/bin/next");
