import { z } from "zod";

type Environment = Record<string, string | undefined>;

const databaseEnvSchema = z.object({
  MONGODB_URI: z.string().min(1),
});

const runtimeEnvSchema = z.object({
  API_PORT: z.coerce.number().int().min(1).max(65_535).default(4000),
  WEB_ORIGIN: z.url().default("http://localhost:3000"),
});

const internalApiEnvSchema = z.object({
  INTERNAL_API_SECRET: z.string().min(32),
});

function parseEnvironment<T>(
  schema: z.ZodType<T>,
  environment: Environment,
  boundary: string,
): T {
  const result = schema.safeParse(environment);

  if (!result.success) {
    const fields = [
      ...new Set(result.error.issues.map((issue) => issue.path.join("."))),
    ];
    throw new Error(`Invalid ${boundary} environment: ${fields.join(", ")}`);
  }

  return result.data;
}

export function getDatabaseEnv(environment: Environment = process.env) {
  return parseEnvironment(databaseEnvSchema, environment, "database");
}

export function getApiRuntimeEnv(environment: Environment = process.env) {
  return parseEnvironment(runtimeEnvSchema, environment, "API runtime");
}

export function getInternalApiSecret(environment: Environment = process.env) {
  if (
    environment.NODE_ENV !== "production" &&
    !environment.INTERNAL_API_SECRET?.trim()
  ) {
    return "lingo-deutsch-local-internal-api-secret";
  }

  return parseEnvironment(internalApiEnvSchema, environment, "internal API")
    .INTERNAL_API_SECRET;
}
