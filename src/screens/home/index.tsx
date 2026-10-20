import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import { Link } from "expo-router";
import { useCallback, useState } from "react";
import { Text, View } from "react-native";

import { Button } from "@/components/button";
import type { Balance } from "@/entities/Balance";
import { useBalances } from "@/hooks/use-balances";
import { getApiError } from "@/store/api";
import { totalUsd } from "@/utils/amount";
import { claimsToShow } from "@/utils/claims";

import { BalanceRow } from "./BalanceRow";
import { BalancesHeader } from "./BalancesHeader";
import { BalancesSkeleton } from "./BalancesSkeleton";

const keyExtractor = (balance: Balance) => balance.asset;

const ListFooterComponent = () => (
  <Link href="/token" className="mt-4 py-2 text-center text-sm text-gray-500">
    Change token
  </Link>
);

export function Home() {
  const { data, items, claims, error, isLoading, isFetching, refetch } =
    useBalances();
  const apiError = error ? getApiError(error) : null;

  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const asOf = data?.asOf;
  const renderItem: ListRenderItem<Balance> = useCallback(
    ({ item }) => (
      <BalanceRow
        balance={item}
        claims={asOf ? claimsToShow(claims, item.asset, asOf) : []}
      />
    ),
    [claims, asOf],
  );

  if (isLoading || isRefreshing) {
    return <BalancesSkeleton />;
  }

  if (!data || !items) {
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
          <Button label="Try again" onPress={refresh} loading={isFetching} />
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlashList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={Gap}
        contentContainerStyle={{ padding: 20 }}
        refreshing={isRefreshing}
        onRefresh={refresh}
        ListHeaderComponent={
          <BalancesHeader
            totalUsd={totalUsd(items)}
            asOf={data.asOf}
            isFetching={isFetching}
            error={apiError}
            onRefresh={refresh}
          />
        }
        ListFooterComponent={<ListFooterComponent />}
      />
    </View>
  );
}

function Gap() {
  return <View className="h-3" />;
}
