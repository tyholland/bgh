import { afterEach, describe, expect, it, vi } from "vitest";
import { User } from "@/types";

const mixpanelMock = {
  init: vi.fn(),
  identify: vi.fn(),
  people: { set: vi.fn() },
  track: vi.fn(),
  track_pageview: vi.fn(),
  get_distinct_id: vi.fn(() => "existing-distinct-id"),
};

vi.mock("mixpanel-browser", () => ({ default: mixpanelMock }));

const load = async () => {
  vi.resetModules();
  return import("@/functions/mixpanel");
};

const user: User = {
  uid: "uid-1",
  email: "jo@example.com",
  displayName: "Jo Rivera",
  phoneNumber: null,
  photoURL: null,
  providerId: "password",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  vi.clearAllMocks();
});

describe("trackIdentity", () => {
  it("logs instead of calling mixpanel in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { trackIdentity } = await load();
    const result = trackIdentity(user.uid, user.email!, user.displayName!);

    expect(result).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      "trackIdentity",
      expect.objectContaining({ identify: user.uid }),
    );
    expect(mixpanelMock.identify).not.toHaveBeenCalled();
    expect(mixpanelMock.people.set).not.toHaveBeenCalled();
  });

  it("identifies the user and sets people properties outside development", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const { trackIdentity } = await load();
    trackIdentity(user.uid, user.email!, user.displayName!);

    expect(mixpanelMock.identify).toHaveBeenCalledWith(user.uid);
    expect(mixpanelMock.people.set).toHaveBeenCalledWith({
      $email: user.email,
      $name: user.displayName,
    });
  });
});

describe("trackEvent", () => {
  it("logs instead of calling mixpanel in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { trackEvent } = await load();
    const result = trackEvent(user, "Clicked", { foo: "bar" });

    expect(result).toBeNull();
    expect(warn).toHaveBeenCalled();
    expect(mixpanelMock.track).not.toHaveBeenCalled();
  });

  it("tracks the event outside development", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mixpanelMock.get_distinct_id.mockReturnValue(user.uid);

    const { trackEvent } = await load();
    trackEvent(user, "Clicked", { foo: "bar" });

    expect(mixpanelMock.track).toHaveBeenCalledWith("Clicked", { foo: "bar" });
  });

  it("identifies the user first when the distinct id doesn't match", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mixpanelMock.get_distinct_id.mockReturnValue("some-other-id");

    const { trackEvent } = await load();
    trackEvent(user, "Clicked");

    expect(mixpanelMock.identify).toHaveBeenCalledWith(user.uid);
    expect(mixpanelMock.track).toHaveBeenCalledWith("Clicked", undefined);
  });

  it("skips identify when there is no user", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const { trackEvent } = await load();
    trackEvent(null, "Clicked");

    expect(mixpanelMock.identify).not.toHaveBeenCalled();
    expect(mixpanelMock.track).toHaveBeenCalledWith("Clicked", undefined);
  });
});

describe("trackPage", () => {
  it("logs instead of calling mixpanel in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { trackPage } = await load();
    const result = trackPage(user, "Home", "/home");

    expect(result).toBeNull();
    expect(warn).toHaveBeenCalled();
    expect(mixpanelMock.track_pageview).not.toHaveBeenCalled();
  });

  it("tracks the pageview outside development", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mixpanelMock.get_distinct_id.mockReturnValue(user.uid);

    const { trackPage } = await load();
    trackPage(user, "Home", "/home");

    expect(mixpanelMock.track_pageview).toHaveBeenCalledWith({
      page: "Home",
      url: "/home",
    });
  });
});

describe("trackError", () => {
  it("logs instead of calling mixpanel in development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { trackError } = await load();
    const result = trackError(user, "Signup", { reason: "network" });

    expect(result).toBeNull();
    expect(warn).toHaveBeenCalledWith(
      "trackError",
      expect.objectContaining({ eventName: "Error: Signup" }),
    );
    expect(mixpanelMock.track).not.toHaveBeenCalled();
  });

  it("prefixes the event name with 'Error: ' outside development", async () => {
    vi.stubEnv("NODE_ENV", "production");
    mixpanelMock.get_distinct_id.mockReturnValue(user.uid);

    const { trackError } = await load();
    trackError(user, "Signup", { reason: "network" });

    expect(mixpanelMock.track).toHaveBeenCalledWith("Error: Signup", {
      reason: "network",
    });
  });
});
