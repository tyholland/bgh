import { afterEach, describe, expect, it, vi } from "vitest";

const getFirebaseAuthMock = vi.fn(() => ({ mock: "auth" }));
const signInWithPopupMock = vi.fn();
const getAdditionalUserInfoMock = vi.fn();
const createUserMock = vi.fn();
const trackErrorMock = vi.fn();

vi.mock("@/functions/firebase", () => ({
  getFirebaseAuth: getFirebaseAuthMock,
}));

vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: vi.fn(function GoogleAuthProvider() {}),
  signInWithPopup: signInWithPopupMock,
  getAdditionalUserInfo: getAdditionalUserInfoMock,
}));

vi.mock("@/requests/user", () => ({
  createUser: createUserMock,
}));

vi.mock("@/functions/mixpanel", () => ({
  trackError: trackErrorMock,
}));

const load = async () => {
  vi.resetModules();
  return import("@/functions/googleAuth");
};

const makeFbUser = (overrides: Partial<Record<string, unknown>> = {}) => ({
  uid: "uid-1",
  email: "jo@example.com",
  displayName: "Jo Rivera",
  phoneNumber: null,
  photoURL: "https://example.com/photo.png",
  providerData: [{ providerId: "google.com" }],
  getIdToken: vi.fn().mockResolvedValue("id-token"),
  ...overrides,
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("signInWithGoogle", () => {
  it("signs in via a Google popup using the shared Firebase auth instance", async () => {
    const fbUser = makeFbUser();
    signInWithPopupMock.mockResolvedValue({ user: fbUser });
    getAdditionalUserInfoMock.mockReturnValue({ isNewUser: false });

    const { signInWithGoogle } = await load();
    await signInWithGoogle();

    expect(signInWithPopupMock).toHaveBeenCalledTimes(1);
    expect(signInWithPopupMock.mock.calls[0][0]).toEqual({ mock: "auth" });
  });

  it("returns the signed-in user without registering a profile when the account already existed", async () => {
    const fbUser = makeFbUser();
    signInWithPopupMock.mockResolvedValue({ user: fbUser });
    getAdditionalUserInfoMock.mockReturnValue({ isNewUser: false });

    const { signInWithGoogle } = await load();
    const result = await signInWithGoogle();

    expect(result).toEqual({ user: fbUser, isNewUser: false });
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("falls back to isNewUser: false when additionalUserInfo is unavailable", async () => {
    const fbUser = makeFbUser();
    signInWithPopupMock.mockResolvedValue({ user: fbUser });
    getAdditionalUserInfoMock.mockReturnValue(null);

    const { signInWithGoogle } = await load();
    const result = await signInWithGoogle();

    expect(result.isNewUser).toBe(false);
    expect(createUserMock).not.toHaveBeenCalled();
  });

  it("registers the BGH Scout API profile when the Google account is new", async () => {
    const fbUser = makeFbUser();
    signInWithPopupMock.mockResolvedValue({ user: fbUser });
    getAdditionalUserInfoMock.mockReturnValue({ isNewUser: true });
    createUserMock.mockResolvedValue(undefined);

    const { signInWithGoogle } = await load();
    const result = await signInWithGoogle();

    expect(result.isNewUser).toBe(true);
    expect(fbUser.getIdToken).toHaveBeenCalledTimes(1);
    expect(createUserMock).toHaveBeenCalledTimes(1);
    expect(createUserMock).toHaveBeenCalledWith(
      {
        uid: "uid-1",
        email: "jo@example.com",
        displayName: "Jo Rivera",
        phoneNumber: null,
        photoURL: "https://example.com/photo.png",
        providerId: "google.com",
      },
      "id-token",
    );
  });

  it("falls back to a google.com providerId when providerData is empty", async () => {
    const fbUser = makeFbUser({ providerData: [] });
    signInWithPopupMock.mockResolvedValue({ user: fbUser });
    getAdditionalUserInfoMock.mockReturnValue({ isNewUser: true });
    createUserMock.mockResolvedValue(undefined);

    const { signInWithGoogle } = await load();
    await signInWithGoogle();

    expect(createUserMock).toHaveBeenCalledWith(
      expect.objectContaining({ providerId: "google.com" }),
      "id-token",
    );
  });

  it("does not block sign-in when registering the API profile fails", async () => {
    const fbUser = makeFbUser();
    signInWithPopupMock.mockResolvedValue({ user: fbUser });
    getAdditionalUserInfoMock.mockReturnValue({ isNewUser: true });
    createUserMock.mockRejectedValue(new Error("API responded with 500"));

    const { signInWithGoogle } = await load();
    const result = await signInWithGoogle();

    expect(result).toEqual({ user: fbUser, isNewUser: true });
    expect(trackErrorMock).toHaveBeenCalledWith(
      null,
      "Create User Profile",
      expect.objectContaining({
        message: "API responded with 500",
        email: "jo@example.com",
      }),
    );
  });

  it("propagates the error when the popup sign-in itself fails", async () => {
    const popupError = Object.assign(new Error("popup closed"), {
      code: "auth/popup-closed-by-user",
    });
    signInWithPopupMock.mockRejectedValue(popupError);

    const { signInWithGoogle } = await load();

    await expect(signInWithGoogle()).rejects.toBe(popupError);
    expect(createUserMock).not.toHaveBeenCalled();
  });
});
