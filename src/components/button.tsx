import { memo } from "react";
import { Pressable, Text } from "react-native";

import { cn } from "@/utils/cn";

type Props = {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

export const Button = memo(function Button({
  label,
  onPress,
  loading,
  disabled,
  variant = "primary",
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      className={cn([
        "rounded-xl py-3",
        {
          "bg-gray-900": variant === "primary",
          "border border-gray-300": variant === "secondary",
          "opacity-40": disabled,
        },
      ])}
    >
      {({ pressed }) => (
        <Text
          className={cn([
            "text-center text-base font-semibold",
            {
              "text-white": variant === "primary",
              "text-gray-900": variant === "secondary",
              "opacity-60": pressed || loading,
            },
          ])}
        >
          {loading ? "Loading…" : label}
        </Text>
      )}
    </Pressable>
  );
});
