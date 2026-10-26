import { describe, expect, it, vi } from "vitest";

import { listenWithDatabase } from "@/start-api";

describe("listenWithDatabase", () => {
  it("connects to MongoDB before accepting requests", async () => {
    const events: string[] = [];
    const connectDatabase = vi.fn(async () => {
      events.push("connect");
    });
    const listen = vi.fn(async () => {
      events.push("listen");
      return "http://127.0.0.1:4000";
    });

    await listenWithDatabase({
      api: { listen },
      connectDatabase,
      host: "127.0.0.1",
      port: 4000,
    });

    expect(events).toEqual(["connect", "listen"]);
  });

  it("does not listen when the database connection fails", async () => {
    const connectionError = new Error("database unavailable");
    const listen = vi.fn();

    await expect(
      listenWithDatabase({
        api: { listen },
        connectDatabase: vi.fn(async () => {
          throw connectionError;
        }),
        host: "127.0.0.1",
        port: 4000,
      }),
    ).rejects.toBe(connectionError);
    expect(listen).not.toHaveBeenCalled();
  });
});
