import { config as loadEnvironment } from "dotenv";
import path from "node:path";

loadEnvironment({
  path: path.resolve(process.cwd(), "../../.env.local"),
  quiet: true,
});

const [, , command, ...args] = process.argv;

if (!command) {
  throw new Error("A Next.js command is required.");
}

process.env.NEXT_DIST_DIR = command === "dev" ? ".next" : ".next-build";
process.argv = [process.execPath, "next", command, ...args];

await import("../../../node_modules/next/dist/bin/next");
