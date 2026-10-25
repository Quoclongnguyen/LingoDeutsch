import { z } from "zod";

type Environment = Record<string, string | undefined>;

const authEnvSchema = z.object({
  AUTH_SECRET: z.string().min(32),
  AUTH_GITHUB_ID: z.string().min(1),
  AUTH_GITHUB_SECRET: z.string().min(1),
});

const authVariableNames = [
  "AUTH_SECRET",
  "AUTH_GITHUB_ID",
  "AUTH_GITHUB_SECRET",
] as const;

const domainApiEnvSchema = z.object({
  baseUrl: z.url(),
  internalApiSecret: z.string().min(32),
});

const localDomainApiConfiguration = {
  baseUrl: "http://127.0.0.1:4000/api/v1",
  internalApiSecret: "lingo-deutsch-local-internal-api-secret",
};

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

export function getAuthEnv(environment: Environment = process.env) {
  return parseEnvironment(authEnvSchema, environment, "authentication");
}

export function normalizeNextAuthUrl(environment: Environment = process.env) {
  if (
    environment.NEXTAUTH_URL !== undefined &&
    !environment.NEXTAUTH_URL.trim()
  ) {
    delete environment.NEXTAUTH_URL;
  }
}

export function getAuthConfiguration(environment: Environment = process.env) {
  const hasNoAuthValues = authVariableNames.every(
    (name) => !environment[name]?.trim(),
  );

  if (environment.NODE_ENV === "development" && hasNoAuthValues) {
    return { mode: "development" as const };
  }

  return {
    mode: "github" as const,
    ...getAuthEnv(environment),
  };
}

export function getDomainApiConfiguration(
  environment: Environment = process.env,
) {
  const baseUrl = environment.NEXT_PUBLIC_API_URL?.trim();
  const internalApiSecret = environment.INTERNAL_API_SECRET?.trim();

  if (environment.NODE_ENV === "development") {
    return parseEnvironment(
      domainApiEnvSchema,
      {
        baseUrl: baseUrl || localDomainApiConfiguration.baseUrl,
        internalApiSecret:
          internalApiSecret || localDomainApiConfiguration.internalApiSecret,
      },
      "domain API",
    );
  }

  return parseEnvironment(
    domainApiEnvSchema,
    { baseUrl, internalApiSecret },
    "domain API",
  );
}
