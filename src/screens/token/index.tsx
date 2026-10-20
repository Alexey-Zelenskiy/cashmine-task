import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { useAppDispatch, useAppSelector } from "@/store";
import { selectToken, tokenChanged } from "@/store/slices/auth";
import { cn } from "@/utils/cn";

type Props = {
  onSaved?: () => void;
};

export function TokenScreen({ onSaved }: Props) {
  const dispatch = useAppDispatch();
  const currentToken = useAppSelector(selectToken);
  const [value, setValue] = useState(currentToken ?? "");
  const canSave = value.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    dispatch(tokenChanged(value));
    onSaved?.();
  };

  return (
    <View className="flex-1 justify-center gap-4 bg-white px-5">
      <Text className="text-2xl font-bold text-gray-900">Your API token</Text>
      <Text className="text-base text-gray-600">
        Paste the token from your task email. It&apos;s kept in this browser only.
      </Text>
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={save}
        placeholder="ct1.…"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus
        className="rounded-xl border border-gray-300 px-4 py-3 text-base text-gray-900"
      />
      <Pressable
        onPress={save}
        disabled={!canSave}
        accessibilityRole="button"
        className="rounded-xl bg-gray-900 py-4 disabled:opacity-40"
      >
        {({ pressed }) => (
          <Text
            className={cn([
              "text-center text-base font-semibold text-white",
              { "opacity-60": pressed },
            ])}
          >
            Save token
          </Text>
        )}
      </Pressable>
    </View>
  );
}
