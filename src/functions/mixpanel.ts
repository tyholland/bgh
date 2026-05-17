import mixpanel from "mixpanel-browser";

mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN || "", {
  debug: true,
  track_pageview: false,
  persistence: "localStorage",
  autocapture: false,
});

export const trackIdentity = (
  sub_id: number,
  auth_id?: string,
  email?: string,
) => {
  if (process.env.NODE_ENV === "development") {
    console.warn("trackIdentity", {
      identify: auth_id,
      people: {
        $email: email,
        subscription: sub_id,
      },
    });

    return null;
  }

  mixpanel.identify(auth_id);

  mixpanel.people.set({
    $email: email,
    subscription: sub_id,
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

// export const trackPage = (path: string) => {

//   if (process.env.NODE_ENV === "development") {
//     console.warn("trackPage", {
//       eventName: "Page View",
//       eventProperties: { title: pageTitle },
//     });

//     return null;
//   }

//   mixpanel.track("Page View", { title: pageTitle });
// };

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
