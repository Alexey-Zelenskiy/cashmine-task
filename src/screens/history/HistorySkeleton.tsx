import { memo } from "react";
import { View } from "react-native";

import { Skeleton } from "@/components/skeleton";

const ROWS = 8;

export const HistorySkeleton = memo(function HistorySkeleton() {
  return (
    <View className="flex-1 bg-white px-5">
      <Skeleton className="mb-2 mt-4 h-4 w-20" />
      {Array.from({ length: ROWS }, (_, index) => (
        <View
          key={index}
          className="flex-row justify-between border-b border-gray-100 py-3"
        >
          <View className="gap-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </View>
          <View className="items-end gap-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-14" />
          </View>
        </View>
      ))}
    </View>
  );
});
