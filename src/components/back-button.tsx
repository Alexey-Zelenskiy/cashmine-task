import { router } from "expo-router";
import { memo } from "react";
import { Pressable, Text } from "react-native";

import { cn } from "@/utils/cn";

const goBack = () => {
  if (router.canGoBack()) router.back();
  else router.replace("/");
};

export const BackButton = memo(function BackButton() {
  return (
    <Pressable
      onPress={goBack}
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={8}
      className="px-2"
    >
      {({ pressed }) => (
        <Text
          className={cn([
            "text-base font-semibold text-gray-900",
            { "opacity-60": pressed },
          ])}
        >
          ‹ Back
        </Text>
      )}
    </Pressable>
  );
});
