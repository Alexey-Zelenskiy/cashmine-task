import { router } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

import { Button } from "@/components/button";
import type { Claim } from "@/entities/Claim";
import { paybackApi, useGetClaimQuery } from "@/store/api/payback";
import { cn } from "@/utils/cn";

const STATUS_POLL_MS = 2_000;

type Props = {
  initialClaim: Claim;
};

export function ClaimStatus({ initialClaim }: Props) {
  const { data: cached } = paybackApi.endpoints.getClaim.useQueryState(
    initialClaim.id,
  );
  const isPending = (cached ?? initialClaim).status === "pending";
  const { data: claim = initialClaim } = useGetClaimQuery(initialClaim.id, {
    pollingInterval: isPending ? STATUS_POLL_MS : 0,
  });
  const { status, amount, fee, receiveAmount, asset, failureReason } = claim;

  return (
    <View className="flex-1 justify-center gap-5 bg-white px-5">
      <View className="items-center gap-3">
        {status === "pending" && <ActivityIndicator size="large" />}
        <Text
          className={cn([
            "text-2xl font-bold",
            {
              "text-gray-900": status === "pending",
              "text-green-700": status === "completed",
              "text-red-700": status === "failed",
            },
          ])}
        >
          {status === "pending" && "Claim processing"}
          {status === "completed" && "Claim completed"}
          {status === "failed" && "Claim failed"}
        </Text>
        <Text className="text-center text-base text-gray-600">
          {status === "pending" &&
            "Usually settles within 20 seconds. You can leave this screen, the balance card shows the status too."}
          {status === "completed" && `${receiveAmount} ${asset} is on its way.`}
          {status === "failed" &&
            `${failureReason ?? "The claim was declined"}. ${amount} ${asset} returns to your available balance.`}
        </Text>
      </View>

      <View className="gap-3 rounded-xl border border-gray-200 p-4">
        <Row label="Amount" value={`${amount} ${asset}`} />
        <Row label="Fee" value={`${fee} ${asset}`} />
        <Row label="You receive" value={`${receiveAmount} ${asset}`} />
      </View>

      <Button label="Back to balances" onPress={() => router.back()} />
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-4">
      <Text className="text-sm text-gray-600">{label}</Text>
      <Text className="shrink text-right text-sm text-gray-900">{value}</Text>
    </View>
  );
}
