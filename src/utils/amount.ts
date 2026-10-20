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

/**
 * @description Checks a string against the API's amount format and counts
 * its decimal places. Returns null when the string isn't a valid amount.
 * @example
 * decimalPlaces("0.5"); // 1
 * decimalPlaces("12"); // 0
 * decimalPlaces(".5"); // null, and the same for "1.", "05", "1e-3"
 */
export function decimalPlaces(value: string): number | null {
  const match = AMOUNT_PATTERN.exec(value);
  return match ? (match[2]?.length ?? 0) : null;
}

export type ClaimRules = {
  decimals: number;
  minAmount: string;
  available: string;
};

/**
 * @description Applies the API's rules for a claim amount: the format, at
 * most `decimals` places, at least `minAmount`, at most `available`. Returns
 * a message for the field, or null when the amount is fine.
 * @example
 * const rules = { decimals: 6, minAmount: "0.01", available: "0.75" };
 * validateClaimAmount("0.5", rules); // null
 * validateClaimAmount("abc", rules); // "Enter a number like 0.5"
 * validateClaimAmount("0.1234567", rules); // "At most 6 decimal places"
 * validateClaimAmount("0.005", rules); // "The minimum is 0.01"
 * validateClaimAmount("1", rules); // "Only 0.75 is available"
 */
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

/**
 * @description What the user receives from a claim: the fee comes out of
 * the claimed amount.
 * @example
 * receiveAmount("0.5", "0.0012"); // "0.4988"
 * receiveAmount("0.01", "0.01"); // "0"
 */
export function receiveAmount(amount: string, fee: string): string {
  return new Big(amount).minus(fee).toFixed();
}

/**
 * @description Whether an amount is zero, however it's written.
 * @example
 * isZero("0.00"); // true
 * isZero("0.0005"); // false
 */
export function isZero(value: string): boolean {
  return new Big(value).eq(0);
}

type BalanceValue = {
  available: string;
  pending: string;
  claiming: string;
  usdPrice: string;
};

/**
 * @description Total in USD of everything that is still the user's:
 * claimable now, not yet confirmed, and in claims that haven't settled.
 * Summed exactly and rounded to cents once, so per-asset rounding can't add
 * up to a wrong cent.
 * @example
 * // (820.413207 + 50.12 + 0) × 1.0002 = 870.7073136414
 * totalUsd([
 *   { available: "820.413207", pending: "50.12", claiming: "0", usdPrice: "1.0002" },
 * ]); // "870.71"
 *
 * // Two assets worth $0.005 each: the exact sum is 0.01. Rounding each one
 * // first would give 0.01 + 0.01 = 0.02, a cent that doesn't exist
 * const half = { available: "0.005", pending: "0", claiming: "0", usdPrice: "1" };
 * totalUsd([half, half]); // "0.01"
 */
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

/**
 * @description Formats a USD value with cents and thousands separators.
 * @example
 * formatUsd("1234.5"); // "$1,234.50"
 * formatUsd("0"); // "$0.00"
 */
export function formatUsd(value: string): string {
  const [whole, fraction] = new Big(value)
    .toFixed(2, Big.roundHalfUp)
    .split(".");
  return `$${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${fraction}`;
}
