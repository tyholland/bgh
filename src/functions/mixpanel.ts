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

export const trackEvent = (eventName: string, eventProperties?: Object) => {
  if (process.env.NODE_ENV === "development") {
    console.warn("trackEvent", {
      eventName,
      eventProperties,
    });

    return null;
  }

  mixpanel.track(eventName, eventProperties);
};

export const trackPage = (pageTitle: string, url: string) => {
  if (process.env.NODE_ENV === "development") {
    console.warn("trackPage", {
      eventName: "Page View",
      eventProperties: { page: pageTitle, url: url },
    });

    return null;
  }

  mixpanel.track_pageview({ page: pageTitle, url: url });
};

export const trackError = (eventName: string, eventProperties?: Object) => {
  const name = `Error: ${eventName}`;

  if (process.env.NODE_ENV === "development") {
    console.warn("trackError", {
      eventName: name,
      eventProperties,
    });

    return null;
  }

  mixpanel.track(name, eventProperties);
};
