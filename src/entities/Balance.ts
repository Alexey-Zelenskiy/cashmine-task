import { z } from "zod";

import { Amount, Timestamp } from "./common";

export const Balance = z.object({
  asset: z.string(),
  decimals: z.int().nonnegative(),
  available: Amount,
  pending: Amount,
  claiming: Amount,
  usdPrice: Amount,
});
export type Balance = z.infer<typeof Balance>;

export const Balances = z.object({
  asOf: Timestamp,
  items: z.array(Balance),
});
export type Balances = z.infer<typeof Balances>;
