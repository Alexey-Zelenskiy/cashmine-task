import { z } from "zod";

// Amounts are decimal strings, never JSON numbers: "0.5" and "12" are valid,
// ".5", "1.", "05" and "1e-3" are not. They stay strings in the app too, so no
// float ever touches money (math lives in utils/amount). The second group is
// the fractional part, used to count decimal places
export const AMOUNT_PATTERN = /^(0|[1-9]\d*)(?:\.(\d+))?$/;

export const Amount = z.string().regex(AMOUNT_PATTERN);

// Activity amounts are signed: negative for reversals and claims
export const SignedAmount = z.string().regex(/^-?(0|[1-9]\d*)(\.\d+)?$/);

export const Timestamp = z.iso.datetime();
