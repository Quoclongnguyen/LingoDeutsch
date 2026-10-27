"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { readDomainJson } from "@/components/learning/read-domain-json";

type DomainResourceState<T> = {
  data?: T;
  error: string;
  loading: boolean;
  requestUrl: string;
};

export function useDomainResource<T>(url: string, fallbackMessage: string) {
  const requestId = useRef(0);
  const [state, setState] = useState<DomainResourceState<T>>({
    error: "",
    loading: true,
    requestUrl: "",
  });

  const load = useCallback(
    async (currentRequest: number) => {
      try {
        const data = await readDomainJson<T>(
          await fetch(url, { cache: "no-store" }),
        );
        if (requestId.current === currentRequest) {
          setState({ data, error: "", loading: false, requestUrl: url });
        }
      } catch (caught: unknown) {
        if (requestId.current === currentRequest) {
          setState({
            error: caught instanceof Error ? caught.message : fallbackMessage,
            loading: false,
            requestUrl: url,
          });
        }
      }
    },
    [fallbackMessage, url],
  );

  useEffect(() => {
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    void load(currentRequest);
    return () => {
      requestId.current += 1;
    };
  }, [load]);

  const retry = useCallback(async () => {
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;
    setState({ error: "", loading: true, requestUrl: url });
    await load(currentRequest);
  }, [load, url]);

  const updateData = useCallback((update: (current: T) => T) => {
    setState((current) =>
      current.data === undefined
        ? current
        : { ...current, data: update(current.data) },
    );
  }, []);

  const currentState: DomainResourceState<T> =
    state.requestUrl === url
      ? state
      : { error: "", loading: true, requestUrl: url };

  return { ...currentState, retry, updateData };
}
