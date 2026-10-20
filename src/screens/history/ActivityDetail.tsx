import { skipToken } from "@reduxjs/toolkit/query";
import { router } from "expo-router";
import { memo, useMemo } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { Button } from "@/components/button";
import {
  useGetActivityInfiniteQuery,
  useGetClaimQuery,
} from "@/store/api/payback";
import { cn } from "@/utils/cn";

const TITLES = {
  accrual: "Payback",
  reversal: "Reversal",
  claim: "Claim",
} as const;

const openHistory = () => router.replace("/history");

type Props = {
  id: string;
};

export function ActivityDetail({ id }: Props) {
  const { data, isLoading } = useGetActivityInfiniteQuery();
  const item = useMemo(
    () =>
      data?.pages
        .flatMap((page) => page.items)
        .find((entry) => entry.id === id),
    [data, id],
  );

  const claimId = item?.type === "claim" ? item.relatedId : null;
  const { data: claim, isFetching: isClaimLoading } = useGetClaimQuery(
    claimId ?? skipToken,
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 justify-center gap-4 bg-white px-5">
        <Text className="text-xl font-bold text-gray-900">
          Entry not loaded
        </Text>
        <Text className="text-base text-gray-600">
          It isn&apos;t in the loaded part of your history. Open it from the
          list.
        </Text>
        <Button label="Open history" onPress={openHistory} />
      </View>
    );
  }

  const { type, asset, amount, status, exchange, createdAt, relatedId } = item;

  return (
    <View className="flex-1 gap-5 bg-white p-5">
      <View className="gap-1">
        <Text className="text-sm text-gray-600">{TITLES[type]}</Text>
        <Text className="text-3xl font-bold text-gray-900">
          {amount} {asset}
        </Text>
        <Text
          className={cn([
            "text-sm font-semibold",
            {
              "text-amber-700": status === "pending",
              "text-red-700": status === "failed",
              "text-green-700":
                status === "confirmed" || status === "completed",
            },
          ])}
        >
          {status}
        </Text>
      </View>

      <View className="gap-3 rounded-xl border border-gray-200 p-4">
        <Row label="Date" value={new Date(createdAt).toLocaleString()} />
        {exchange && <Row label="Exchange" value={exchange} />}
        {type === "reversal" && relatedId && (
          <Row label="Reverses" value={relatedId} />
        )}
        {claim && (
          <>
            <Row label="Fee" value={`${claim.fee} ${asset}`} />
            <Row label="Received" value={`${claim.receiveAmount} ${asset}`} />
            {claim.failureReason && (
              <Row label="Reason" value={claim.failureReason} />
            )}
          </>
        )}
        {isClaimLoading && !claim && <ActivityIndicator />}
        <Row label="ID" value={id} />
      </View>
    </View>
  );
}

const Row = memo(function Row({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row justify-between gap-4">
      <Text className="text-sm text-gray-600">{label}</Text>
      <Text className="shrink text-right text-sm text-gray-900">{value}</Text>
    </View>
  );
});
