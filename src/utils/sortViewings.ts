import type { ViewingRequest } from "../types/viewing";

function toDateTime(viewing: ViewingRequest): number {
  return new Date(`${viewing.date}T${viewing.time}`).getTime();
}

export interface SplitViewings {
  upcoming: ViewingRequest[];
  past: ViewingRequest[];
}

export function splitViewingsByTime(viewings: ViewingRequest[], now: Date = new Date()): SplitViewings {
  const nowTime = now.getTime();
  const upcoming = viewings.filter((viewing) => toDateTime(viewing) >= nowTime);
  const past = viewings.filter((viewing) => toDateTime(viewing) < nowTime);

  upcoming.sort((a, b) => toDateTime(a) - toDateTime(b));
  past.sort((a, b) => toDateTime(b) - toDateTime(a));

  return { upcoming, past };
}
