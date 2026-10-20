import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import type { ActivityItem } from "@/entities/Activity";

type Props = {
  item: ActivityItem;
};

const TITLES: Record<ActivityItem["type"], string> = {
  accrual: "Payback",
  reversal: "Reversal",
  claim: "Claim",
};

export const ActivityRow = memo(function ActivityRow({ item }: Props) {
  const { type, asset, amount, status, exchange, createdAt } = item;
  const isNegative = amount.startsWith("-");

  return (
    <View style={styles.row}>
      <View style={styles.main}>
        <Text style={styles.title}>
          {TITLES[type]}
          {exchange ? ` · ${exchange}` : ""}
        </Text>
        <Text style={styles.date}>{new Date(createdAt).toLocaleString()}</Text>
      </View>
      <View style={styles.side}>
        <Text style={[styles.amount, isNegative && styles.negative]}>
          {isNegative ? amount : `+${amount}`} {asset}
        </Text>
        <Text
          style={[
            styles.status,
            status === "failed" && styles.failed,
            status === "pending" && styles.pending,
          ]}
        >
          {status}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  main: {
    flexShrink: 1,
    gap: 2,
  },
  side: {
    alignItems: "flex-end",
    gap: 2,
  },
  title: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#111827",
  },
  date: {
    fontSize: 12,
    lineHeight: 16,
    color: "#6b7280",
  },
  amount: {
    fontSize: 14,
    lineHeight: 20,
    color: "#15803d",
  },
  negative: {
    color: "#111827",
  },
  status: {
    fontSize: 12,
    lineHeight: 16,
    color: "#6b7280",
  },
  pending: {
    color: "#b45309",
  },
  failed: {
    color: "#b91c1c",
  },
});
