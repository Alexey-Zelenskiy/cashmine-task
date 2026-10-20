import { memo } from "react";
import { Text, View } from "react-native";

import type { Balance } from "@/entities/Balance";
import { isZero } from "@/utils/amount";

type Props = {
  balance: Balance;
};

export const BalanceRow = memo(function BalanceRow({ balance }: Props) {
  const { asset, available, pending, claiming } = balance;
  return (
    <View className="gap-1 rounded-xl border border-gray-200 p-4">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-lg font-semibold text-gray-900">{asset}</Text>
        <Text className="text-lg text-gray-900">{available}</Text>
      </View>
      <Text className="text-right text-xs text-gray-500">available</Text>
      {!isZero(pending) && (
        <Text className="text-sm text-gray-600">Pending: {pending}</Text>
      )}
      {!isZero(claiming) && (
        <Text className="text-sm text-gray-600">Claiming: {claiming}</Text>
      )}
    </View>
  );
});
