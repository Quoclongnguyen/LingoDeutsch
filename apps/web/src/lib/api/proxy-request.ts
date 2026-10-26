type DomainFetcher = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

const allowedRoots = new Set([
  "dashboard",
  "grammar-topics",
  "learning-path",
  "lesson-progress",
  "lessons",
  "review-sessions",
  "reviews",
  "vocabulary",
  "vocabulary-sets",
]);

function isAllowedPath(path: string[]) {
  return path.length > 0 && allowedRoots.has(path[0] ?? "");
}

export async function proxyDomainRequest({
  baseUrl,
  fetcher = fetch,
  internalApiSecret,
  path,
  request,
  userId,
}: {
  baseUrl: string;
  fetcher?: DomainFetcher;
  internalApiSecret: string;
  path: string[];
  request: Request;
  userId: string;
}) {
  if (!isAllowedPath(path)) {
    return Response.json(
      { message: "Không tìm thấy tài nguyên." },
      { status: 404 },
    );
  }

  const incomingUrl = new URL(request.url);
  const upstreamUrl = new URL(
    `${baseUrl.replace(/\/$/u, "")}/${path.map(encodeURIComponent).join("/")}`,
  );
  upstreamUrl.search = incomingUrl.search;

  const canHaveBody = !["GET", "HEAD"].includes(request.method);
  const body = canHaveBody ? await request.text() : "";
  const headers: Record<string, string> = {
    accept: "application/json",
    authorization: `Bearer ${internalApiSecret}`,
    "x-lingo-user-id": userId,
  };
  if (body) headers["content-type"] = "application/json";

  const upstream = await fetcher(upstreamUrl.toString(), {
    body: body || undefined,
    cache: "no-store",
    headers,
    method: request.method,
  });

  return new Response(upstream.body, {
    headers: {
      "content-type":
        upstream.headers.get("content-type") ?? "application/json",
    },
    status: upstream.status,
    statusText: upstream.statusText,
  });
}
