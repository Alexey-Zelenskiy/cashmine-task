import type { ActivityClaim } from "@/entities/Activity";
import type { Balance } from "@/entities/Balance";

import { claimsOf, claimsToShow, withUnsnapshotted } from "./claims";

const balance: Balance = {
  asset: "ETH",
  decimals: 18,
  available: "2",
  pending: "0.1",
  claiming: "0",
  usdPrice: "3000",
};

const claim = (overrides: Partial<ActivityClaim>): ActivityClaim => ({
  id: "act_1",
  type: "claim",
  asset: "ETH",
  amount: "-0.5",
  status: "pending",
  exchange: null,
  relatedId: "clm_1",
  createdAt: "2026-10-20T18:00:05.000Z",
  ...overrides,
});

const BEFORE = "2026-10-20T18:00:00.000Z";
const AFTER = "2026-10-20T18:00:15.000Z";

describe("claimsOf", () => {
  it("keeps only claims from the history", () => {
    const accrual = {
      id: "act_2",
      type: "accrual" as const,
      asset: "USDT",
      amount: "9.81",
      status: "confirmed" as const,
      exchange: "Binance",
      relatedId: null,
      createdAt: BEFORE,
    };
    expect(claimsOf([accrual, claim({})])).toEqual([claim({})]);
  });
});

describe("withUnsnapshotted", () => {
  it("moves a pending claim from available to claiming when the snapshot predates it", () => {
    expect(withUnsnapshotted(balance, BEFORE, [claim({})])).toMatchObject({
      available: "1.5",
      claiming: "0.5",
    });
  });

  it("uses the snapshot alone once it was taken after the claim", () => {
    const snapshot = { ...balance, available: "1.5", claiming: "0.5" };
    expect(withUnsnapshotted(snapshot, AFTER, [claim({})])).toEqual(snapshot);
  });

  it("takes a completed claim out of available only", () => {
    expect(
      withUnsnapshotted(balance, BEFORE, [claim({ status: "completed" })]),
    ).toMatchObject({ available: "1.5", claiming: "0" });
  });

  it("changes nothing for a failed claim: the amount came back", () => {
    expect(
      withUnsnapshotted(balance, BEFORE, [claim({ status: "failed" })]),
    ).toEqual(balance);
  });

  it("ignores claims for other assets", () => {
    expect(
      withUnsnapshotted(balance, BEFORE, [claim({ asset: "BTC" })]),
    ).toEqual(balance);
  });
});

describe("claimsToShow", () => {
  it("always shows pending claims", () => {
    expect(claimsToShow([claim({})], "ETH", AFTER)).toHaveLength(1);
  });

  it("shows a settled claim only until the snapshot counts it", () => {
    const settled = claim({ status: "completed" });
    expect(claimsToShow([settled], "ETH", BEFORE)).toHaveLength(1);
    expect(claimsToShow([settled], "ETH", AFTER)).toHaveLength(0);
  });
});
