// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearStoredSubscriptionStatus,
  readStoredSubscriptionStatus,
  writeStoredSubscriptionStatus,
} from "@/functions/subscriptionState";

const KEY = "bgh.subscriptionStatus";

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("readStoredSubscriptionStatus", () => {
  it("returns null when nothing is stored", () => {
    expect(readStoredSubscriptionStatus()).toBeNull();
  });

  it("returns the stored status when valid", () => {
    window.localStorage.setItem(KEY, JSON.stringify("trialing"));
    expect(readStoredSubscriptionStatus()).toBe("trialing");
  });

  it("returns null for invalid JSON instead of throwing", () => {
    window.localStorage.setItem(KEY, "{not json");
    expect(() => readStoredSubscriptionStatus()).not.toThrow();
    expect(readStoredSubscriptionStatus()).toBeNull();
  });

  it("returns null for a value that isn't a known status", () => {
    window.localStorage.setItem(KEY, JSON.stringify("made-up-status"));
    expect(readStoredSubscriptionStatus()).toBeNull();
  });

  it("returns null when localStorage access throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(readStoredSubscriptionStatus()).toBeNull();
  });
});

describe("writeStoredSubscriptionStatus", () => {
  it("persists the status as JSON", () => {
    writeStoredSubscriptionStatus("active");
    expect(JSON.parse(window.localStorage.getItem(KEY)!)).toBe("active");
  });

  it("swallows storage errors", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => writeStoredSubscriptionStatus("active")).not.toThrow();
  });
});

describe("clearStoredSubscriptionStatus", () => {
  it("removes the stored status", () => {
    window.localStorage.setItem(KEY, JSON.stringify("active"));
    clearStoredSubscriptionStatus();
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });

  it("swallows storage errors", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(() => clearStoredSubscriptionStatus()).not.toThrow();
  });
});
