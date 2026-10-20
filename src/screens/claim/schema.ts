import { z } from "zod";

import { validateClaimAmount, type ClaimRules } from "@/utils/amount";

export const claimFormSchema = (rules: ClaimRules) =>
  z.object({
    amount: z.string().superRefine((amount, ctx) => {
      const message = validateClaimAmount(amount, rules);
      if (message) ctx.addIssue({ code: "custom", message });
    }),
    destinationId: z.string(),
  });

export type ClaimFormValues = z.infer<ReturnType<typeof claimFormSchema>>;
