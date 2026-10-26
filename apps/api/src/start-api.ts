type ListeningApi = {
  listen(options: { host: string; port: number }): Promise<string>;
};

export async function listenWithDatabase({
  api,
  connectDatabase,
  host,
  port,
}: {
  api: ListeningApi;
  connectDatabase: () => Promise<unknown>;
  host: string;
  port: number;
}) {
  await connectDatabase();
  return api.listen({ host, port });
}
