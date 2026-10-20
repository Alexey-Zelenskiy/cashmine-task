import "../global.css";

import { Stack } from "expo-router";
import { View } from "react-native";
import { Provider } from "react-redux";

import { BackButton } from "@/components/back-button";
import { TokenScreen } from "@/screens/token";
import { store, useAppSelector } from "@/store";
import { selectToken } from "@/store/slices/auth";

function Root() {
  const token = useAppSelector(selectToken);

  if (!token) {
    return <TokenScreen />;
  }

  return (
    <Stack screenOptions={{ headerLeft: () => <BackButton /> }}>
      <Stack.Screen
        name="index"
        options={{ title: "Payback", headerLeft: () => null }}
      />
      <Stack.Screen name="claim" options={{ title: "Claim" }} />
      <Stack.Screen name="history/index" options={{ title: "History" }} />
      <Stack.Screen name="history/[id]" options={{ title: "Details" }} />
      <Stack.Screen name="token" options={{ title: "Change token" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <View className="w-full max-w-[480px] flex-1 self-center">
        <Root />
      </View>
    </Provider>
  );
}
