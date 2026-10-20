import type { ActivityItem } from "@/entities/Activity";

export type HistoryRow =
  | { kind: "header"; key: string; title: string }
  | { kind: "item"; key: string; item: ActivityItem };

/**
 * @description Groups history, newest first, into one header per local day
 * followed by that day's items, and returns where the headers are so the
 * list can make them sticky.
 * @example
 * groupByDay(items).rows.map((r) => r.kind); // ["header", "item", "item", "header", "item"]
 */
export function groupByDay(items: ActivityItem[], now = new Date()) {
  const rows: HistoryRow[] = [];
  const headerIndices: number[] = [];
  let currentDay = "";

  for (const item of items) {
    const date = new Date(item.createdAt);
    const day = date.toDateString();
    if (day !== currentDay) {
      currentDay = day;
      headerIndices.push(rows.length);
      rows.push({
        kind: "header",
        key: `day-${day}`,
        title: dayTitle(date, now),
      });
    }
    rows.push({ kind: "item", key: item.id, item });
  }

  return { rows, headerIndices };
}

function dayTitle(date: Date, now: Date) {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === now.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: date.getFullYear() === now.getFullYear() ? undefined : "numeric",
  });
}
