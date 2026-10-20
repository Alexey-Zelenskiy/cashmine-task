import { View } from "react-native";

import { Skeleton } from "@/components/skeleton";

const ROWS = 3;

export function BalancesSkeleton() {
  return (
    <View className="flex-1 gap-4 bg-white p-5">
      <View className="gap-2 rounded-2xl bg-gray-900 p-5">
        <Skeleton className="h-4 w-24 bg-gray-700" />
        <Skeleton className="h-9 w-40 bg-gray-700" />
        <Skeleton className="h-3 w-28 bg-gray-700" />
      </View>
      {Array.from({ length: ROWS }, (_, index) => (
        <View
          key={index}
          className="flex-row items-center justify-between rounded-xl border border-gray-200 p-4"
        >
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-28" />
        </View>
      ))}
    </View>
  );
}
