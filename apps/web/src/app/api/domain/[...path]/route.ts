import { getDomainApiConfiguration } from "@/lib/env/server";
import { proxyDomainRequest } from "@/lib/api/proxy-request";
import { requireUser } from "@/lib/auth/session";

type DomainRouteContext = {
  params: Promise<{ path: string[] }>;
};

async function handle(request: Request, context: DomainRouteContext) {
  const [user, { path }] = await Promise.all([requireUser(), context.params]);
  const configuration = getDomainApiConfiguration();

  return proxyDomainRequest({
    ...configuration,
    path,
    request,
    userId: user.id,
  });
}

export const DELETE = handle;
export const GET = handle;
export const PATCH = handle;
export const POST = handle;
