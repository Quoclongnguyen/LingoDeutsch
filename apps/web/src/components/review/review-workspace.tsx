"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ReviewCard } from "@/components/review/review-card";
import {
  ReviewComplete,
  ReviewEmpty,
  ReviewError,
  ReviewLoading,
  ReviewRecovery,
} from "@/components/review/review-states";
import type { ReviewRating, ReviewSession } from "@/components/review/types";
import { readDomainJson } from "@/lib/api/read-domain-json";

export function ReviewWorkspace() {
  const [session, setSession] = useState<ReviewSession>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [rating, setRating] = useState<ReviewRating>();
  const [recoveryChoice, setRecoveryChoice] = useState(false);
  const startedAt = useRef(0);
  const pendingEvent = useRef<{ id: string; rating: ReviewRating } | undefined>(
    undefined,
  );

  const startSession = useCallback(async (restart: boolean) => {
    setLoading(true);
    setError("");
    try {
      const result = await readDomainJson<ReviewSession>(
        await fetch("/api/domain/review-sessions", {
          body: JSON.stringify({ mode: "de-vi", restart }),
          headers: { "content-type": "application/json" },
          method: "POST",
        }),
        "Máy chủ chưa thể xử lý lượt ôn.",
      );
      setSession(result);
      setRecoveryChoice(result.resumed && !restart);
      setRevealed(false);
      startedAt.current = Date.now();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Không thể mở phiên ôn.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Loading remote application data is the synchronization performed by this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void startSession(false);
  }, [startSession]);

  const rateCard = useCallback(
    async (nextRating: ReviewRating) => {
      if (!session?.id || rating) return;
      const pending = pendingEvent.current ?? {
        id: crypto.randomUUID(),
        rating: nextRating,
      };
      if (pending.rating !== nextRating) return;
      pendingEvent.current = pending;
      setRating(nextRating);
      setError("");
      try {
        const result = await readDomainJson<{ session: ReviewSession }>(
          await fetch(`/api/domain/review-sessions/${session.id}/rate`, {
            body: JSON.stringify({
              rating: nextRating,
              responseTimeMs: Math.max(0, Date.now() - startedAt.current),
              reviewEventId: pending.id,
            }),
            headers: { "content-type": "application/json" },
            method: "POST",
          }),
          "Chưa lưu được lượt ôn.",
        );
        pendingEvent.current = undefined;
        setSession(result.session);
        setRevealed(false);
        startedAt.current = Date.now();
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Chưa lưu được lượt ôn.",
        );
      } finally {
        setRating(undefined);
      }
    },
    [rating, session],
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (loading || recoveryChoice || session?.status !== "active") return;
      if ((event.key === " " || event.code === "Space") && !revealed) {
        event.preventDefault();
        setRevealed(true);
        return;
      }
      const keyboardRatings: Record<string, ReviewRating> = {
        "1": "again",
        "2": "hard",
        "3": "good",
        "4": "easy",
      };
      const selected = keyboardRatings[event.key];
      if (revealed && selected) {
        event.preventDefault();
        void rateCard(selected);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loading, rateCard, recoveryChoice, revealed, session?.status]);

  if (loading) {
    return <ReviewLoading />;
  }

  if (!session && error) {
    return (
      <ReviewError message={error} onRetry={() => void startSession(false)} />
    );
  }

  if (recoveryChoice && session) {
    return (
      <ReviewRecovery
        session={session}
        onContinue={() => setRecoveryChoice(false)}
        onRestart={() => void startSession(true)}
      />
    );
  }

  if (session?.status === "empty") {
    return <ReviewEmpty session={session} />;
  }

  if (session?.status === "completed") {
    return <ReviewComplete session={session} />;
  }

  if (!session?.currentCard) {
    return (
      <ReviewError
        message={error || "Phiên ôn không có thẻ hiện tại."}
        onRetry={() => void startSession(false)}
      />
    );
  }

  return (
    <div className="review-workspace">
      <header className="review-progress">
        <div>
          <p className="eyebrow">Wiederholen · Ôn tập</p>
          <h1>Ôn từ đến hạn</h1>
        </div>
        <p
          aria-label={`Tiến độ ${session.currentIndex + 1} trên ${session.total}`}
        >
          <strong>{session.currentIndex + 1}</strong> / {session.total}
        </p>
      </header>
      <div className="review-progress__track" aria-hidden="true">
        <span
          style={{
            transform: `scaleX(${(session.currentIndex + 1) / session.total})`,
          }}
        />
      </div>
      {error ? (
        <p className="review-save-error" role="alert">
          {error} Hãy chọn lại cùng mức để thử lại.
        </p>
      ) : null}
      <ReviewCard
        card={session.currentCard}
        revealed={revealed}
        rating={rating}
        onReveal={() => setRevealed(true)}
        onRate={(value) => void rateCard(value)}
      />
    </div>
  );
}
