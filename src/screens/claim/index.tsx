import { zodResolver } from "@hookform/resolvers/zod";
import type { SerializedError } from "@reduxjs/toolkit";
import { skipToken, type FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button } from "@/components/button";
import type { Claim, CreateClaimRequest } from "@/entities/Claim";
import { useBalances } from "@/hooks/use-balances";
import { getApiError, type ApiError } from "@/store/api";
import {
  useCreateClaimMutation,
  useGetClaimOptionsQuery,
} from "@/store/api/payback";
import { receiveAmount, validateClaimAmount } from "@/utils/amount";
import { cn } from "@/utils/cn";

import { ClaimStatus } from "./ClaimStatus";
import { claimFormSchema, type ClaimFormValues } from "./schema";

const OUTCOME_UNKNOWN = new Set<ApiError["code"]>([
  "TIMEOUT",
  "NETWORK",
  "SERVER",
  "RATE_LIMITED",
  "INVALID_RESPONSE",
  "UNKNOWN",
]);

type Step =
  | { name: "form" }
  | { name: "review"; request: CreateClaimRequest }
  | { name: "unknown"; request: CreateClaimRequest; message: string }
  | { name: "submitted"; claim: Claim };

type Props = {
  initialAsset?: string;
};

export function ClaimScreen({ initialAsset }: Props) {
  const { items, error: balancesError, refetch } = useBalances();
  const [asset, setAsset] = useState(initialAsset);
  const balance = items?.find((b) => b.asset === asset) ?? items?.[0];

  const options = useGetClaimOptionsQuery(balance?.asset ?? skipToken);
  const rules = {
    decimals: balance?.decimals ?? 0,
    minAmount: options.data?.minAmount ?? "0",
    available: balance?.available ?? "0",
  };

  const { control, handleSubmit, reset, setValue, formState } =
    useForm<ClaimFormValues>({
      resolver: zodResolver(claimFormSchema(rules)),
      defaultValues: { amount: "", destinationId: "" },
      mode: "onChange",
    });
  const [amount, destinationId] = useWatch({
    control,
    name: ["amount", "destinationId"],
  });
  const [step, setStep] = useState<Step>({ name: "form" });
  const [rejection, setRejection] = useState<string | null>(null);
  const [createClaim, { isLoading: isSubmitting }] = useCreateClaimMutation();

  if (!balance && balancesError) {
    return (
      <View className="flex-1 justify-center gap-4 bg-white px-5">
        <Text className="text-xl font-bold text-gray-900">
          Couldn&apos;t load balances
        </Text>
        <Text className="text-base text-gray-600">
          {getApiError(balancesError).message}
        </Text>
        <Button label="Try again" onPress={refetch} />
      </View>
    );
  }

  if (!balance) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  const destination =
    options.data?.destinations.find((d) => d.id === destinationId) ??
    options.data?.destinations[0];

  const isAmountValid =
    !!options.data && validateClaimAmount(amount, rules) === null;
  const canReview = isAmountValid && !!destination;

  const selectAsset = (next: string) => {
    setAsset(next);
    reset();
    setRejection(null);
  };

  const review = handleSubmit(({ amount }) => {
    if (!destination) return;
    setStep({
      name: "review",
      request: {
        asset: balance.asset,
        amount,
        destinationId: destination.id,
        idempotencyKey: crypto.randomUUID(),
      },
    });
  });

  const submit = async (request: CreateClaimRequest) => {
    try {
      const claim = await createClaim(request).unwrap();
      setStep({ name: "submitted", claim });
    } catch (error) {
      const apiError = getApiError(
        error as FetchBaseQueryError | SerializedError,
      );
      if (OUTCOME_UNKNOWN.has(apiError.code)) {
        setStep({ name: "unknown", request, message: apiError.message });
      } else {
        setRejection(apiError.message);
        setStep({ name: "form" });
      }
    }
  };

  if (step.name === "submitted") {
    return <ClaimStatus initialClaim={step.claim} />;
  }

  if (step.name === "unknown") {
    const { request } = step;
    return (
      <View className="flex-1 justify-center gap-4 bg-white px-5">
        <Text className="text-xl font-bold text-gray-900">
          We couldn&apos;t confirm your claim
        </Text>
        <Text className="text-base text-gray-600">
          {step.message}. Your claim of {request.amount} {request.asset} may or
          may not have been created.
        </Text>
        <Text className="text-base text-gray-600">
          Checking again sends the same request. If the claim exists you&apos;ll
          see it; if not, it&apos;s created now. It can never be created twice.
        </Text>
        <Button
          label="Check again"
          onPress={() => submit(request)}
          loading={isSubmitting}
        />
        <Button
          label="Back to balances"
          variant="secondary"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  if (step.name === "review") {
    const { request } = step;
    return (
      <ScrollView
        className="flex-1 bg-white"
        contentContainerClassName="gap-4 p-5"
      >
        <Text className="text-xl font-bold text-gray-900">
          Confirm your claim
        </Text>
        <View className="gap-3 rounded-xl border border-gray-200 p-4">
          <Row label="Amount" value={`${request.amount} ${request.asset}`} />
          <Row label="Fee" value={`${options.data?.fee} ${request.asset}`} />
          <Row
            label="You receive"
            value={`${receiveAmount(request.amount, options.data!.fee)} ${request.asset}`}
            strong
          />
          <Row label="To" value={destination?.label ?? ""} />
        </View>
        <Button
          label="Confirm claim"
          onPress={() => submit(request)}
          loading={isSubmitting}
        />
        <Button
          label="Edit"
          variant="secondary"
          disabled={isSubmitting}
          onPress={() => setStep({ name: "form" })}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="gap-5 p-5"
      keyboardShouldPersistTaps="handled"
    >
      <View className="flex-row flex-wrap gap-2">
        {items?.map(({ asset: option }) => (
          <Chip
            key={option}
            label={option}
            selected={option === balance.asset}
            onPress={() => selectAsset(option)}
          />
        ))}
      </View>

      <Text className="text-sm text-gray-600">
        Available: {balance.available} {balance.asset}
      </Text>

      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <Controller
            control={control}
            name="amount"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value}
                onChangeText={(text) => onChange(text.replace(",", "."))}
                onBlur={onBlur}
                placeholder="0.0"
                inputMode="decimal"
                keyboardType="decimal-pad"
                autoCorrect={false}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-lg text-gray-900"
              />
            )}
          />
          <Chip
            label="Max"
            onPress={() =>
              setValue("amount", balance.available, { shouldValidate: true })
            }
            selected={false}
          />
        </View>
        {formState.errors.amount && (
          <Text className="text-sm text-red-600">
            {formState.errors.amount.message}
          </Text>
        )}
      </View>

      {options.isLoading && <ActivityIndicator />}
      {options.isError && (
        <View className="gap-2">
          <Text className="text-sm text-red-600">
            Couldn&apos;t load the claim rules.
          </Text>
          <Button
            label="Try again"
            variant="secondary"
            onPress={options.refetch}
          />
        </View>
      )}
      {options.data && (
        <View className="gap-3 rounded-xl border border-gray-200 p-4">
          <Row
            label="Minimum"
            value={`${options.data.minAmount} ${balance.asset}`}
          />
          <Row label="Fee" value={`${options.data.fee} ${balance.asset}`} />
          <Row
            label="You receive"
            value={
              isAmountValid
                ? `${receiveAmount(amount, options.data.fee)} ${balance.asset}`
                : "—"
            }
            strong
          />
          {options.data.destinations.length > 1 ? (
            <View className="flex-row flex-wrap gap-2">
              {options.data.destinations.map((d) => (
                <Chip
                  key={d.id}
                  label={d.label}
                  selected={d.id === destination?.id}
                  onPress={() => setValue("destinationId", d.id)}
                />
              ))}
            </View>
          ) : (
            <Row label="To" value={destination?.label ?? "—"} />
          )}
        </View>
      )}

      {rejection && (
        <Text className="text-sm text-red-600">
          The claim wasn&apos;t created: {rejection}
        </Text>
      )}

      <Button label="Review claim" onPress={review} disabled={!canReview} />
    </ScrollView>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <View className="flex-row justify-between gap-4">
      <Text className="text-sm text-gray-600">{label}</Text>
      <Text
        className={cn([
          "shrink text-right text-sm text-gray-900",
          { "font-semibold": strong },
        ])}
      >
        {value}
      </Text>
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={cn([
        "rounded-full border px-4 py-2",
        {
          "border-gray-900 bg-gray-900": selected,
          "border-gray-300": !selected,
        },
      ])}
    >
      {({ pressed }) => (
        <Text
          className={cn([
            "text-sm font-semibold",
            {
              "text-white": selected,
              "text-gray-900": !selected,
              "opacity-60": pressed,
            },
          ])}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
