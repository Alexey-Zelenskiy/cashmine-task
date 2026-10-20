import { z } from "zod";

export const AMOUNT_PATTERN = /^(0|[1-9]\d*)(?:\.(\d+))?$/;

export const Amount = z.string().regex(AMOUNT_PATTERN);

export const SignedAmount = z.string().regex(/^-?(0|[1-9]\d*)(\.\d+)?$/);

export const Timestamp = z.iso.datetime();
