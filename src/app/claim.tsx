import { useLocalSearchParams } from "expo-router";

import { ClaimScreen } from "@/screens/claim";

export default function ClaimRoute() {
  const { asset } = useLocalSearchParams<{ asset?: string }>();
  return <ClaimScreen initialAsset={asset} />;
}
