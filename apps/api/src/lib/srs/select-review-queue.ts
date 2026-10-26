export function selectReviewQueue<T extends { state: string }>(
  candidates: T[],
  {
    introducedNewToday,
    maxCards,
    maxNewPerDay,
  }: {
    introducedNewToday: number;
    maxCards: number;
    maxNewPerDay: number;
  },
) {
  let remainingNew = Math.max(0, maxNewPerDay - introducedNewToday);
  const selected: T[] = [];

  for (const candidate of candidates) {
    if (selected.length >= maxCards) break;
    if (candidate.state === "new") {
      if (remainingNew === 0) continue;
      remainingNew -= 1;
    }
    selected.push(candidate);
  }

  return selected;
}
