import { skipToken } from "@reduxjs/toolkit/query";
import { Text, View } from "react-native";

import type { ActivityClaim } from "@/entities/Activity";
import { useGetClaimQuery } from "@/store/api/payback";
import { cn } from "@/utils/cn";

type Props = {
  claim: ActivityClaim;
};

export function ClaimPill({ claim }: Props) {
  const { status, asset, relatedId } = claim;
  const amount = claim.amount.replace(/^-/, "");

  // History has no failure reason; it's on the claim itself
  const { data: details } = useGetClaimQuery(
    status === "failed" && relatedId ? relatedId : skipToken,
  );

  return (
    <View
      className={cn([
        "rounded-lg px-3 py-2",
        {
          "bg-amber-50": status === "pending",
          "bg-green-50": status === "completed",
          "bg-red-50": status === "failed",
        },
      ])}
    >
      <Text
        className={cn([
          "text-xs",
          {
            "text-amber-900": status === "pending",
            "text-green-900": status === "completed",
            "text-red-900": status === "failed",
          },
        ])}
      >
        {status === "pending" &&
          `Claim of ${amount} ${asset} is processing, usually under 20 s. It's already taken out of available.`}
        {status === "completed" &&
          `Claim of ${amount} ${asset} completed. The balance updates within 15 s.`}
        {status === "failed" &&
          `Claim of ${amount} ${asset} failed${details?.failureReason ? `: ${details.failureReason}` : ""}. The amount returns to available.`}
      </Text>
    </View>
  );
}
