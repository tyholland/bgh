import { User } from "@/types";
import mixpanel from "mixpanel-browser";

mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || "", {
  debug: true,
  track_pageview: false,
  persistence: "localStorage",
  autocapture: false,
});

export const trackIdentity = (auth_id: string, email: string, name: string) => {
  if (process.env.NODE_ENV === "development") {
    console.warn("trackIdentity", {
      identify: auth_id,
      people: {
        $email: email,
      },
    });

    return null;
  }

  mixpanel.identify(auth_id);

  mixpanel.people.set({
    $email: email,
    $name: name,
  });
};

export const trackEvent = (
  user: User | null,
  eventName: string,
  eventProperties?: Object,
) => {
  if (process.env.NODE_ENV === "development") {
    console.warn("trackEvent", {
      eventName,
      eventProperties,
    });

    return null;
  }

  if (!!user && mixpanel.get_distinct_id() !== user.uid) {
    trackIdentity(user.uid, user.email || "", user.displayName || "");
  }

  mixpanel.track(eventName, eventProperties);
};

export const trackPage = (
  user: User | null,
  pageTitle: string,
  url: string,
) => {
  if (process.env.NODE_ENV === "development") {
    console.warn("trackPage", {
      eventName: "Page View",
      eventProperties: { page: pageTitle, url: url },
    });

    return null;
  }

  if (!!user && mixpanel.get_distinct_id() !== user.uid) {
    trackIdentity(user.uid, user.email || "", user.displayName || "");
  }

  mixpanel.track_pageview({ page: pageTitle, url: url });
};

export const trackError = (
  user: User | null,
  eventName: string,
  eventProperties?: Object,
) => {
  const name = `Error: ${eventName}`;

  if (process.env.NODE_ENV === "development") {
    console.warn("trackError", {
      eventName: name,
      eventProperties,
    });

    return null;
  }

  if (!!user && mixpanel.get_distinct_id() !== user.uid) {
    trackIdentity(user.uid, user.email || "", user.displayName || "");
  }

  mixpanel.track(name, eventProperties);
};
