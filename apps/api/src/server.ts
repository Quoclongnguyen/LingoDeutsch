import { config as loadEnvironment } from "dotenv";
import path from "node:path";

import { buildApi } from "@/app";
import { getApiRuntimeEnv, getInternalApiSecret } from "@/config/env";
import { connectToDatabase } from "@/lib/db/mongoose";
import { listenWithDatabase } from "@/start-api";

loadEnvironment({
  path: path.resolve(process.cwd(), "../../.env.local"),
  quiet: true,
});

const { API_PORT, WEB_ORIGIN } = getApiRuntimeEnv();
const api = await buildApi({
  internalApiSecret: getInternalApiSecret(),
  logger: true,
  webOrigin: WEB_ORIGIN,
});

async function closeApi(signal: string) {
  api.log.info({ signal }, "Stopping Lingo Deutsch API");
  await api.close();
  process.exit(0);
}

process.once("SIGINT", () => void closeApi("SIGINT"));
process.once("SIGTERM", () => void closeApi("SIGTERM"));

try {
  await listenWithDatabase({
    api,
    connectDatabase: connectToDatabase,
    host: "127.0.0.1",
    port: API_PORT,
  });
} catch (error) {
  api.log.error(error);
  process.exit(1);
}
