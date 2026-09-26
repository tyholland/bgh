// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearStoredUser,
  readStoredUser,
  writeStoredUser,
} from "@/functions/userState";
import { User } from "@/types";

const KEY = "bgh.user";

const validUser: User = {
  uid: "abc123",
  email: "jo@example.com",
  displayName: "Jo Rivera",
  phoneNumber: null,
  photoURL: null,
  providerId: "password",
};

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("readStoredUser", () => {
  it("returns null when nothing is stored", () => {
    expect(readStoredUser()).toBeNull();
  });

  it("returns the stored user when the value is valid", () => {
    window.localStorage.setItem(KEY, JSON.stringify(validUser));
    expect(readStoredUser()).toEqual(validUser);
  });

  it("returns null for invalid JSON instead of throwing", () => {
    window.localStorage.setItem(KEY, "{not json");
    expect(() => readStoredUser()).not.toThrow();
    expect(readStoredUser()).toBeNull();
  });

  it("returns null when the parsed value has no string uid", () => {
    window.localStorage.setItem(KEY, JSON.stringify({ email: "x@y.z" }));
    expect(readStoredUser()).toBeNull();

    window.localStorage.setItem(KEY, JSON.stringify({ uid: 42 }));
    expect(readStoredUser()).toBeNull();

    window.localStorage.setItem(KEY, JSON.stringify("just a string"));
    expect(readStoredUser()).toBeNull();
  });

  it("returns null when localStorage access throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    expect(readStoredUser()).toBeNull();
  });
});

describe("writeStoredUser", () => {
  it("persists the user as JSON", () => {
    writeStoredUser(validUser);
    expect(JSON.parse(window.localStorage.getItem(KEY)!)).toEqual(validUser);
  });

  it("swallows storage errors", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => writeStoredUser(validUser)).not.toThrow();
  });
});

describe("clearStoredUser", () => {
  it("removes the stored user", () => {
    window.localStorage.setItem(KEY, JSON.stringify(validUser));
    clearStoredUser();
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });

  it("swallows storage errors", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(
      () => {
        throw new Error("SecurityError");
      },
    );
    expect(() => clearStoredUser()).not.toThrow();
  });
});
