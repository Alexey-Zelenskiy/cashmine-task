import { z } from "zod";

import { SignedAmount, Timestamp } from "./common";

const activityFields = {
  id: z.string(),
  asset: z.string(),
  amount: SignedAmount,
  createdAt: Timestamp,
};

export const ActivityItem = z.discriminatedUnion("type", [
  z.object({
    ...activityFields,
    type: z.literal("accrual"),
    status: z.enum(["pending", "confirmed"]),
    exchange: z.string(),
    relatedId: z.string().nullable(),
  }),
  z.object({
    ...activityFields,
    type: z.literal("reversal"),
    status: z.literal("confirmed"),
    exchange: z.string(),
    // The accrual this reversal takes back
    relatedId: z.string(),
  }),
  z.object({
    ...activityFields,
    type: z.literal("claim"),
    status: z.enum(["pending", "completed", "failed"]),
    exchange: z.null(),
    // The claim id for claims made through the API, null for older ones
    relatedId: z.string().nullable(),
  }),
]);
export type ActivityItem = z.infer<typeof ActivityItem>;
export type ActivityClaim = Extract<ActivityItem, { type: "claim" }>;

export const ActivityPage = z.object({
  items: z.array(ActivityItem),
  nextCursor: z.string().nullable(),
});
export type ActivityPage = z.infer<typeof ActivityPage>;
