import { Link } from "expo-router";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

import type { Balance } from "@/entities/Balance";
import type { ActivityClaim } from "@/entities/Activity";
import { isZero } from "@/utils/amount";

import { ClaimPill } from "./ClaimPill";

const RESIZE = LinearTransition.duration(250);
const APPEAR = FadeIn.duration(250);
const DISAPPEAR = FadeOut.duration(200);

type Props = {
  balance: Balance;
  claims: ActivityClaim[];
};

export const BalanceRow = memo(function BalanceRow({ balance, claims }: Props) {
  const { asset, available, pending, claiming } = balance;
  return (
    <Animated.View layout={RESIZE} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.asset}>{asset}</Text>
        <Animated.Text
          key={available}
          entering={APPEAR}
          style={styles.available}
        >
          {available}
        </Animated.Text>
      </View>
      <Text style={styles.caption}>available</Text>
      {!isZero(pending) && (
        <Animated.Text
          entering={APPEAR}
          exiting={DISAPPEAR}
          style={styles.detail}
        >
          Pending: {pending}
        </Animated.Text>
      )}
      {!isZero(claiming) && (
        <Animated.Text
          entering={APPEAR}
          exiting={DISAPPEAR}
          style={styles.detail}
        >
          Claiming: {claiming}
        </Animated.Text>
      )}
      {claims.map((claim) => (
        <Animated.View
          key={`${claim.relatedId ?? claim.id}-${claim.status}`}
          entering={APPEAR}
          exiting={DISAPPEAR}
          layout={RESIZE}
        >
          <ClaimPill claim={claim} />
        </Animated.View>
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
    </Animated.View>
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
