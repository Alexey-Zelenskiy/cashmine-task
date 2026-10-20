import "../global.css";

import { Stack } from "expo-router";
import { View } from "react-native";
import { Provider } from "react-redux";

import { TokenScreen } from "@/screens/token";
import { store, useAppSelector } from "@/store";
import { selectToken } from "@/store/slices/auth";

function Root() {
  const token = useAppSelector(selectToken);

  // Every /v1 request needs a token, so nothing else renders without one
  if (!token) return <TokenScreen />;

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Payback" }} />
      <Stack.Screen name="token" options={{ title: "Change token" }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      {/* Phone-width column, centered when opened on a desktop browser */}
      <View className="w-full max-w-[480px] flex-1 self-center">
        <Root />
      </View>
    </Provider>
  );
}
