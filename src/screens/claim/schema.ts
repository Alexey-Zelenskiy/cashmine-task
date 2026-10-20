import { z } from "zod";

import { validateClaimAmount, type ClaimRules } from "@/utils/amount";

// The rules come from the selected asset (decimals, available) and its claim
// options (minAmount), so the schema is built per asset. The checks
// themselves are validateClaimAmount, which the unit tests cover
export const claimFormSchema = (rules: ClaimRules) =>
  z.object({
    amount: z.string().superRefine((amount, ctx) => {
      const message = validateClaimAmount(amount, rules);
      if (message) ctx.addIssue({ code: "custom", message });
    }),
    destinationId: z.string(),
  });

export type ClaimFormValues = z.infer<ReturnType<typeof claimFormSchema>>;
