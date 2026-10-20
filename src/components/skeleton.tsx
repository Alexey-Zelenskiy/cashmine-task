import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

import { cn } from "@/utils/cn";

type Props = {
  className?: string;
};

export function Skeleton({ className }: Props) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.4, { duration: 800 }), -1, true);
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={animatedStyle}>
      <View className={cn(["rounded-md bg-gray-200", className])} />
    </Animated.View>
  );
}
