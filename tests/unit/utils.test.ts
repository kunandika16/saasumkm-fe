import { describe, it, expect } from "vitest";
import { formatIDR, formatDate, formatRelativeTime } from "@/lib/utils";

describe("formatIDR", () => {
  it("should format 0 as 'Rp 0'", () => {
    expect(formatIDR(0)).toBe("Rp 0");
  });

  it("should format 1000 as 'Rp 1.000'", () => {
    expect(formatIDR(1000)).toBe("Rp 1.000");
  });

  it("should format 25000 as 'Rp 25.000'", () => {
    expect(formatIDR(25000)).toBe("Rp 25.000");
  });

  it("should format 1500000 as 'Rp 1.500.000'", () => {
    expect(formatIDR(1500000)).toBe("Rp 1.500.000");
  });

  it("should format small numbers without separator", () => {
    expect(formatIDR(500)).toBe("Rp 500");
  });

  it("should floor decimal values", () => {
    expect(formatIDR(25999.99)).toBe("Rp 25.999");
  });

  it("should handle large numbers", () => {
    expect(formatIDR(10000000)).toBe("Rp 10.000.000");
  });
});

describe("formatDate", () => {
  it("should format ISO date to readable format", () => {
    // date-fns with Indonesian locale formats months in Indonesian
    const result = formatDate("2024-01-12T10:00:00Z");
    // Indonesian locale: "12 Jan 2024"
    expect(result).toBe("12 Jan 2024");
  });

  it("should format another date correctly", () => {
    const result = formatDate("2024-06-15T14:30:00Z");
    expect(result).toBe("15 Jun 2024");
  });

  it("should handle date at midnight UTC", () => {
    const result = formatDate("2024-12-25T00:00:00Z");
    expect(result).toBe("25 Des 2024");
  });
});

describe("formatRelativeTime", () => {
  it("should return a relative time string with Indonesian locale", () => {
    // Create a date 2 hours ago
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    const result = formatRelativeTime(twoHoursAgo);
    // Should contain Indonesian time reference
    expect(result).toContain("yang lalu");
  });

  it("should handle recent timestamps", () => {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const result = formatRelativeTime(oneMinuteAgo);
    expect(result).toContain("yang lalu");
  });
});
