import { afterEach, describe, expect, it, vi } from "vitest";

const getAppsMock = vi.fn();
const initializeAppMock = vi.fn();
const getAuthMock = vi.fn(() => ({ mock: "auth" }));

vi.mock("firebase/app", () => ({
  getApps: getAppsMock,
  initializeApp: initializeAppMock,
}));

vi.mock("firebase/auth", () => ({
  getAuth: getAuthMock,
}));

const load = async () => {
  vi.resetModules();
  return import("@/functions/firebase");
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("initFirebase", () => {
  it("initializes the app when none exists yet", async () => {
    getAppsMock.mockReturnValue([]);

    const { initFirebase } = await load();
    initFirebase();

    expect(initializeAppMock).toHaveBeenCalledTimes(1);
  });

  it("does not re-initialize when an app already exists", async () => {
    getAppsMock.mockReturnValue([{ name: "[DEFAULT]" }]);

    const { initFirebase } = await load();
    initFirebase();

    expect(initializeAppMock).not.toHaveBeenCalled();
  });
});

describe("getFirebaseAuth", () => {
  it("ensures the app is initialized and returns the Auth instance", async () => {
    getAppsMock.mockReturnValue([]);

    const { getFirebaseAuth } = await load();
    const auth = getFirebaseAuth();

    expect(initializeAppMock).toHaveBeenCalledTimes(1);
    expect(getAuthMock).toHaveBeenCalledTimes(1);
    expect(auth).toEqual({ mock: "auth" });
  });

  it("does not re-initialize when an app already exists", async () => {
    getAppsMock.mockReturnValue([{ name: "[DEFAULT]" }]);

    const { getFirebaseAuth } = await load();
    getFirebaseAuth();

    expect(initializeAppMock).not.toHaveBeenCalled();
    expect(getAuthMock).toHaveBeenCalledTimes(1);
  });
});
