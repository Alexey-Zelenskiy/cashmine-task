import Big from "big.js";

import { AMOUNT_PATTERN } from "@/entities/common";

// Money never goes through JS numbers (0.1 + 0.2 !== 0.3). Amounts stay
// strings from the API, and all math is done by big.js, which is exact
// decimal arithmetic.
//
// Two big.js traps handled here:
// - it parses ".5", "1e-3" and "05", which the API rejects, so the format is
//   checked with our own pattern before anything reaches Big;
// - toString() switches to exponent form for small values ("1e-8"), so
//   results are always printed with toFixed(), which never does.

// Decimal places in a valid amount, or null when the string isn't one
//   decimalPlaces("0.5")  → 1
//   decimalPlaces("12")   → 0
//   decimalPlaces(".5"), decimalPlaces("1."), decimalPlaces("05"),
//   decimalPlaces("1e-3") → null
export function decimalPlaces(value: string): number | null {
  const match = AMOUNT_PATTERN.exec(value);
  return match ? (match[2]?.length ?? 0) : null;
}

export type ClaimRules = {
  decimals: number;
  minAmount: string;
  available: string;
};

// The API's rules for a claim amount, as a message for the field, or null
// when the amount is fine. With { decimals: 6, minAmount: "0.01",
// available: "0.75" }:
//   "0.5"       → null (fine)
//   "abc"       → "Enter a number like 0.5"
//   "0.1234567" → "At most 6 decimal places"
//   "0.005"     → "The minimum is 0.01"
//   "1"         → "Only 0.75 is available"
export function validateClaimAmount(
  amount: string,
  { decimals, minAmount, available }: ClaimRules,
): string | null {
  if (amount === "") return "Enter an amount";

  const places = decimalPlaces(amount);
  if (places === null) return "Enter a number like 0.5";
  if (places > decimals) return `At most ${decimals} decimal places`;

  const value = new Big(amount);
  if (value.lt(minAmount)) return `The minimum is ${minAmount}`;
  if (value.gt(available)) return `Only ${available} is available`;
  return null;
}

// The fee comes out of the claimed amount
//   receiveAmount("0.5", "0.0012") → "0.4988"
//   receiveAmount("0.01", "0.01")  → "0"
export function receiveAmount(amount: string, fee: string): string {
  return new Big(amount).minus(fee).toFixed();
}

//   isZero("0.00")   → true
//   isZero("0.0005") → false
export function isZero(value: string): boolean {
  return new Big(value).eq(0);
}

type BalanceValue = {
  available: string;
  pending: string;
  claiming: string;
  usdPrice: string;
};

// Total in USD of everything that is still the user's: claimable now, not
// yet confirmed, and in claims that haven't settled. Summed exactly and
// rounded to cents once, so per-asset rounding can't add up to a wrong cent
//   USDT: (820.413207 + 50.12 + 0) × 1.0002 = 870.7073136414 → "870.71"
//   two assets worth $0.005 each: exact 0.010 → "0.01"; rounding each one
//   first would give 0.01 + 0.01 = "0.02", a cent that doesn't exist
export function totalUsd(balances: BalanceValue[]): string {
  return balances
    .reduce(
      (sum, { available, pending, claiming, usdPrice }) =>
        sum.plus(
          new Big(available).plus(pending).plus(claiming).times(usdPrice),
        ),
      new Big(0),
    )
    .toFixed(2, Big.roundHalfUp);
}

//   formatUsd("1234.5") → "$1,234.50"
//   formatUsd("0")      → "$0.00"
export function formatUsd(value: string): string {
  const [whole, fraction] = new Big(value)
    .toFixed(2, Big.roundHalfUp)
    .split(".");
  return `$${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${fraction}`;
}
