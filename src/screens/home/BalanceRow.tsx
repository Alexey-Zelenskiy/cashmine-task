import { Link } from "expo-router";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Balance } from "@/entities/Balance";
import type { ActivityClaim } from "@/entities/Activity";
import { isZero } from "@/utils/amount";

import { ClaimPill } from "./ClaimPill";

type Props = {
  balance: Balance;
  claims: ActivityClaim[];
};

export const BalanceRow = memo(function BalanceRow({ balance, claims }: Props) {
  const { asset, available, pending, claiming } = balance;
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.asset}>{asset}</Text>
        <Text style={styles.available}>{available}</Text>
      </View>
      <Text style={styles.caption}>available</Text>
      {!isZero(pending) && (
        <Text style={styles.detail}>Pending: {pending}</Text>
      )}
      {!isZero(claiming) && (
        <Text style={styles.detail}>Claiming: {claiming}</Text>
      )}
      {claims.map((claim) => (
        <ClaimPill key={claim.id} claim={claim} />
      ))}
      <Link href={{ pathname: "/claim", params: { asset } }} asChild>
        <Pressable accessibilityRole="button" style={styles.claimButton}>
          {({ pressed }) => (
            <Text style={[styles.claimLabel, pressed && styles.pressed]}>
              Claim
            </Text>
          )}
        </Pressable>
      </Link>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  asset: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: "600",
    color: "#111827",
  },
  available: {
    fontSize: 18,
    lineHeight: 28,
    color: "#111827",
  },
  caption: {
    textAlign: "right",
    fontSize: 12,
    lineHeight: 16,
    color: "#6b7280",
  },
  detail: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4b5563",
  },
  claimButton: {
    alignSelf: "flex-end",
  },
  claimLabel: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "600",
    color: "#111827",
    textDecorationLine: "underline",
  },
  pressed: {
    opacity: 0.6,
  },
});
