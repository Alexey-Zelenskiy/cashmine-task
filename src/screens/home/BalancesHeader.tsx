import { memo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { Button } from "@/components/button";
import type { ApiError } from "@/store/api";
import { formatUsd } from "@/utils/amount";
import { cn } from "@/utils/cn";

type Props = {
  totalUsd: string;
  asOf: string;
  isFetching: boolean;
  error: ApiError | null;
  onRefresh: () => void;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString();
}

export const BalancesHeader = memo(function BalancesHeader({
  totalUsd,
  asOf,
  isFetching,
  error,
  onRefresh,
}: Props) {
  return (
    <View className="mb-4 gap-4">
      <View className="gap-1 rounded-2xl bg-gray-900 p-5">
        <Text className="text-sm text-gray-300">Total payback</Text>
        <Text className="text-3xl font-bold text-white">
          {formatUsd(totalUsd)}
        </Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-gray-400">
            As of {formatTime(asOf)}
          </Text>
          <Pressable
            onPress={onRefresh}
            disabled={isFetching}
            accessibilityRole="button"
            hitSlop={8}
          >
            {({ pressed }) =>
              isFetching ? (
                <ActivityIndicator size="small" color="#9ca3af" />
              ) : (
                <Text
                  className={cn([
                    "text-xs font-semibold text-white",
                    { "opacity-60": pressed },
                  ])}
                >
                  Refresh
                </Text>
              )
            }
          </Pressable>
        </View>
      </View>

      {error && (
        <View className="gap-2 rounded-xl bg-amber-50 p-4">
          <Text className="text-sm text-amber-900">
            Couldn&apos;t refresh: {error.message}. Showing the balances from{" "}
            {formatTime(asOf)}.
          </Text>
          <Button label="Try again" onPress={onRefresh} loading={isFetching} />
        </View>
      )}
    </View>
  );
});
