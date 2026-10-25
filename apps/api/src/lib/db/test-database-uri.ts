type MongoEnvironment = Record<string, string | undefined>;

function databaseNameFromUrl(url: URL): string {
  return decodeURIComponent(url.pathname.replace(/^\//u, ""));
}

export function resolveTestDatabaseUri(environment: MongoEnvironment): string {
  const explicitTestUri = environment.MONGODB_TEST_URI?.trim();

  if (explicitTestUri) {
    const parsed = new URL(explicitTestUri);
    const databaseName = databaseNameFromUrl(parsed);

    if (!databaseName.endsWith("_test")) {
      throw new Error(
        "MONGODB_TEST_URI must target a database ending in _test.",
      );
    }

    return parsed.toString();
  }

  const productionUri = environment.MONGODB_URI?.trim();
  if (!productionUri) {
    throw new Error(
      "MONGODB_URI or MONGODB_TEST_URI is required for integration tests.",
    );
  }

  const parsed = new URL(productionUri);
  const productionDatabase = databaseNameFromUrl(parsed);
  const testDatabase = productionDatabase
    ? `${productionDatabase.replace(/_test$/u, "")}_test`
    : "lingo_deutsch_test";

  parsed.pathname = `/${testDatabase}`;
  return parsed.toString();
}
