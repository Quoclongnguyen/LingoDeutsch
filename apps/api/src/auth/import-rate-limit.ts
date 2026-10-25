export class ImportRateLimitError extends Error {
  constructor() {
    super("Too many vocabulary import requests. Please try again later.");
    this.name = "ImportRateLimitError";
  }
}

export function createImportRateLimiter({
  limit,
  windowMs,
}: {
  limit: number;
  windowMs: number;
}) {
  const windows = new Map<string, { count: number; startedAt: number }>();

  return {
    assertAllowed(key: string, now = Date.now()) {
      const current = windows.get(key);
      if (!current || now - current.startedAt >= windowMs) {
        windows.set(key, { count: 1, startedAt: now });
        return;
      }
      if (current.count >= limit) throw new ImportRateLimitError();
      current.count += 1;
    },
  };
}

export const vocabularyImportRateLimiter = createImportRateLimiter({
  limit: 20,
  windowMs: 60_000,
});
