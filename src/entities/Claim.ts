import { z } from "zod";

import { Amount, Timestamp } from "./common";

export const ClaimOptions = z.object({
  asset: z.string(),
  minAmount: Amount,
  fee: Amount,
  destinations: z.array(z.object({ id: z.string(), label: z.string() })),
});
export type ClaimOptions = z.infer<typeof ClaimOptions>;

export const ClaimStatus = z.enum(["pending", "completed", "failed"]);
export type ClaimStatus = z.infer<typeof ClaimStatus>;

export const Claim = z.object({
  id: z.string(),
  asset: z.string(),
  amount: Amount,
  fee: Amount,
  receiveAmount: Amount,
  destinationId: z.string(),
  status: ClaimStatus,
  failureReason: z.string().nullable(),
  createdAt: Timestamp,
  updatedAt: Timestamp,
});
export type Claim = z.infer<typeof Claim>;

export type CreateClaimRequest = {
  asset: string;
  amount: string;
  destinationId: string;
  idempotencyKey: string;
};
