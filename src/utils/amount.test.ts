import {
  decimalPlaces,
  formatUsd,
  isZero,
  receiveAmount,
  totalUsd,
  validateClaimAmount,
} from "./amount";

describe("decimalPlaces", () => {
  it.each([
    ["0.5", 1],
    ["12", 0],
    ["0", 0],
    ["0.00000001", 8],
    ["820.413207", 6],
  ])("%s has %i places", (value, places) => {
    expect(decimalPlaces(value)).toBe(places);
  });

  it.each([".5", "1.", "05", "1e-3", "-1", "1,5", " 1", "", "abc", "0x10"])(
    "rejects %j",
    (value) => {
      expect(decimalPlaces(value)).toBeNull();
    },
  );
});

describe("validateClaimAmount", () => {
  const rules = { decimals: 6, minAmount: "0.01", available: "0.75" };

  it("accepts an amount inside the rules", () => {
    expect(validateClaimAmount("0.5", rules)).toBeNull();
  });

  it("accepts exactly the minimum and exactly everything available", () => {
    expect(validateClaimAmount("0.01", rules)).toBeNull();
    expect(validateClaimAmount("0.75", rules)).toBeNull();
  });

  it("accepts the maximum number of decimal places", () => {
    expect(validateClaimAmount("0.123456", rules)).toBeNull();
  });

  it("rejects an empty or malformed amount", () => {
    expect(validateClaimAmount("", rules)).toBe("Enter an amount");
    expect(validateClaimAmount(".5", rules)).toBe("Enter a number like 0.5");
    expect(validateClaimAmount("1e-3", rules)).toBe("Enter a number like 0.5");
  });

  it("rejects more decimal places than the asset allows, without rounding", () => {
    expect(validateClaimAmount("0.1234567", rules)).toBe(
      "At most 6 decimal places",
    );
  });

  it("rejects below the minimum and above available", () => {
    expect(validateClaimAmount("0.009999", rules)).toBe("The minimum is 0.01");
    expect(validateClaimAmount("0.750001", rules)).toBe(
      "Only 0.75 is available",
    );
  });

  it("compares as decimals, not as strings", () => {
    // As strings "10" < "9"; as amounts it is above 9 available
    expect(
      validateClaimAmount("10", { ...rules, available: "9", minAmount: "1" }),
    ).toBe("Only 9 is available");
  });
});

describe("receiveAmount", () => {
  it("takes the fee out of the amount exactly", () => {
    expect(receiveAmount("0.5", "0.0012")).toBe("0.4988");
    expect(receiveAmount("0.3", "0.1")).toBe("0.2"); // 0.30000000000000004 - 0.1 with floats
  });

  it("prints tiny amounts in plain notation", () => {
    expect(receiveAmount("0.00000003", "0.00000002")).toBe("0.00000001");
  });

  it("can be zero", () => {
    expect(receiveAmount("0.01", "0.01")).toBe("0");
  });
});

describe("isZero", () => {
  it("treats any spelling of zero as zero", () => {
    expect(isZero("0")).toBe(true);
    expect(isZero("0.00")).toBe(true);
    expect(isZero("0.0005")).toBe(false);
  });
});

describe("totalUsd", () => {
  it("counts available, pending and claiming at the asset price", () => {
    expect(
      totalUsd([
        {
          available: "820.413207",
          pending: "50.12",
          claiming: "0",
          usdPrice: "1.0002",
        },
      ]),
    ).toBe("870.71");
  });

  it("rounds the total once, not each asset", () => {
    const half = {
      available: "0.005",
      pending: "0",
      claiming: "0",
      usdPrice: "1",
    };
    expect(totalUsd([half, half])).toBe("0.01");
  });

  it("is exact for small crypto amounts at large prices", () => {
    expect(
      totalUsd([
        {
          available: "0.00012345",
          pending: "0",
          claiming: "0",
          usdPrice: "67123.45",
        },
      ]),
    ).toBe("8.29"); // 8.2863899025
  });

  it("is zero for no balances", () => {
    expect(totalUsd([])).toBe("0.00");
  });
});

describe("formatUsd", () => {
  it("adds cents and thousands separators", () => {
    expect(formatUsd("1234.5")).toBe("$1,234.50");
    expect(formatUsd("1234567.891")).toBe("$1,234,567.89");
    expect(formatUsd("0")).toBe("$0.00");
  });
});
