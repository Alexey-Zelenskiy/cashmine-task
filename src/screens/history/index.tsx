import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import { useCallback, useMemo } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/button";
import { getApiError } from "@/store/api";
import { useGetActivityInfiniteQuery } from "@/store/api/payback";
import { groupByDay, type HistoryRow } from "@/utils/history";

import { ActivityRow } from "./ActivityRow";

const keyExtractor = (row: HistoryRow) => row.key;

const getItemType = (row: HistoryRow) => row.kind;

const renderItem: ListRenderItem<HistoryRow> = ({ item: row }) =>
  row.kind === "header" ? (
    <Text style={styles.header}>{row.title}</Text>
  ) : (
    <ActivityRow item={row.item} />
  );

export function History() {
  const {
    data,
    error,
    isLoading,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetActivityInfiniteQuery();

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const { rows, headerIndices } = useMemo(() => groupByDay(items), [items]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetching) void fetchNextPage();
  }, [hasNextPage, isFetching, fetchNextPage]);

  const footer = useMemo(() => {
    if (isFetchingNextPage) return <ActivityIndicator className="py-4" />;
    if (error && items.length > 0) {
      return (
        <View className="gap-2 py-4">
          <Text className="text-sm text-red-600">
            Couldn&apos;t load more: {getApiError(error).message}
          </Text>
          <Button label="Try again" variant="secondary" onPress={loadMore} />
        </View>
      );
    }
    if (!hasNextPage && items.length > 0) {
      return (
        <Text className="py-4 text-center text-xs text-gray-500">
          That&apos;s everything
        </Text>
      );
    }
    return null;
  }, [isFetchingNextPage, error, hasNextPage, items.length, loadMore]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <View className="flex-1 justify-center gap-4 bg-white px-5">
        <Text className="text-xl font-bold text-gray-900">
          Couldn&apos;t load history
        </Text>
        <Text className="text-base text-gray-600">
          {getApiError(error).message}
        </Text>
        <Button label="Try again" onPress={refetch} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlashList
        data={rows}
        keyExtractor={keyExtractor}
        getItemType={getItemType}
        renderItem={renderItem}
        stickyHeaderIndices={headerIndices}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <Text className="py-10 text-center text-sm text-gray-500">
            No activity yet
          </Text>
        }
        ListFooterComponent={footer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#ffffff",
    paddingTop: 16,
    paddingBottom: 8,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    color: "#6b7280",
  },
});
