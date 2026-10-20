import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import { Link } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import type { Balance } from "@/entities/Balance";
import { getApiError } from "@/store/api";
import { useGetBalancesQuery } from "@/store/api/payback";
import { formatUsd, totalUsd } from "@/utils/amount";
import { cn } from "@/utils/cn";

import { BalanceRow } from "./BalanceRow";

const POLL_MS = 15_000;

const keyExtractor = (balance: Balance) => balance.asset;

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString();
}

export function Home() {
  const { data, error, isLoading, isFetching, refetch } = useGetBalancesQuery(
    undefined,
    { pollingInterval: POLL_MS, skipPollingIfUnfocused: true },
  );
  const apiError = error ? getApiError(error) : null;

  const [isPulling, setIsPulling] = useState(false);

  const pullToRefresh = async () => {
    setIsPulling(true);
    await refetch();
    setIsPulling(false);
  };

  const renderItem: ListRenderItem<Balance> = useCallback(
    ({ item }) => <BalanceRow balance={item} />,
    [],
  );

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 justify-center gap-4 bg-white px-5">
        <Text className="text-xl font-bold text-gray-900">
          Couldn&apos;t load balances
        </Text>
        <Text className="text-base text-gray-600">{apiError?.message}</Text>
        {apiError?.code === "UNAUTHORIZED" ? (
          <Link href="/token" asChild>
            <Button label="Change token" />
          </Link>
        ) : (
          <Button label="Try again" onPress={refetch} loading={isFetching} />
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlashList
        data={data.items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={Gap}
        contentContainerStyle={{ padding: 20 }}
        refreshing={isPulling}
        onRefresh={pullToRefresh}
        ListHeaderComponent={
          <View className="mb-4 gap-4">
            <View className="gap-1 rounded-2xl bg-gray-900 p-5">
              <Text className="text-sm text-gray-300">Total payback</Text>
              <Text className="text-3xl font-bold text-white">
                {formatUsd(totalUsd(data.items))}
              </Text>
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-gray-400">
                  As of {formatTime(data.asOf)}
                </Text>
                <Pressable
                  onPress={refetch}
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

            {apiError && (
              <View className="gap-2 rounded-xl bg-amber-50 p-4">
                <Text className="text-sm text-amber-900">
                  Couldn&apos;t refresh: {apiError.message}. Showing the
                  balances from {formatTime(data.asOf)}.
                </Text>
                <Button
                  label="Try again"
                  onPress={refetch}
                  loading={isFetching}
                />
              </View>
            )}
          </View>
        }
        ListFooterComponent={
          <Link
            href="/token"
            className="mt-4 py-2 text-center text-sm text-gray-500"
          >
            Change token
          </Link>
        }
      />
    </View>
  );
}

function Gap() {
  return <View className="h-3" />;
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
};

function Button({ label, onPress, loading }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      className="rounded-xl bg-gray-900 py-3"
    >
      {({ pressed }) => (
        <Text
          className={cn([
            "text-center text-base font-semibold text-white",
            { "opacity-60": pressed || loading },
          ])}
        >
          {loading ? "Loading…" : label}
        </Text>
      )}
    </Pressable>
  );
}
