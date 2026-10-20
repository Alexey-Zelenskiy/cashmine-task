import type { ActivityItem } from "@/entities/Activity";

import { groupByDay } from "./history";

const item = (id: string, createdAt: string): ActivityItem => ({
  id,
  type: "accrual",
  asset: "USDT",
  amount: "1",
  status: "confirmed",
  exchange: "Binance",
  relatedId: null,
  createdAt,
});

describe("groupByDay", () => {
  const now = new Date(2026, 9, 20, 18, 0);

  it("puts a header before each day and reports where the headers are", () => {
    const { rows, headerIndices } = groupByDay(
      [
        item("a", new Date(2026, 9, 20, 17, 0).toISOString()),
        item("b", new Date(2026, 9, 20, 9, 0).toISOString()),
        item("c", new Date(2026, 9, 19, 12, 0).toISOString()),
        item("d", new Date(2026, 8, 1, 12, 0).toISOString()),
      ],
      now,
    );
    expect(rows.map((r) => (r.kind === "header" ? r.title : r.key))).toEqual([
      "Today",
      "a",
      "b",
      "Yesterday",
      "c",
      expect.stringMatching(/1/),
      "d",
    ]);
    expect(headerIndices).toEqual([0, 3, 5]);
  });

  it("returns nothing for no items", () => {
    expect(groupByDay([], now)).toEqual({ rows: [], headerIndices: [] });
  });
});
