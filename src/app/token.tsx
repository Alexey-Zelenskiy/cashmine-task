import { router } from "expo-router";

import { TokenScreen } from "@/screens/token";

export default function TokenRoute() {
  return <TokenScreen onSaved={() => router.replace("/")} />;
}
