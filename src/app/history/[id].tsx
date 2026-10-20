import { useLocalSearchParams } from "expo-router";

import { ActivityDetail } from "@/screens/history/ActivityDetail";

export default function ActivityDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ActivityDetail id={id} />;
}
