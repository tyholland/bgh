import { Metadata } from "next";

export const defaultModalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#FFFAF1",
  borderRadius: "20px",
  boxShadow: 24,
  p: 4,
};

export const MediumModalStyle = {
  ...defaultModalStyle,
  width: 500,
};

export const LargeModalStyle = {
  ...defaultModalStyle,
  width: "90%",
  height: "auto",
  maxHeight: "90%",
  minHeight: 100,
  overflowY: "scroll",
};

export const LoginErrors = [
  {
    error: "auth/invalid-credential",
    value: "Your email and/or password is incorrect. Please try again.",
  },
  {
    error: "auth/email-already-in-use",
    value:
      "The email you entered already exists on BGH Scout. Please try again.",
  },
];

export const metaTitle = "BGH Scout";
export const metaUrl = "https://www.bghscout.com";
const metaDescription =
  "BGH Scout is designed to help job seekers discover career opportunities more quickly by aggregating job openings from employer career pages and other publicly available sources.";
const metaLogo = "https://www.bghscout.com/bgh-logo.png";
const metaIcon = "https://www.bghscout.com/favicon.ico";
const metaSite = "BGH Scout";

export const defaultMetaData = (
  title: string | undefined = metaTitle,
  descript: string | undefined = metaDescription,
  url: string | undefined = metaUrl,
) => {
  const data: Metadata = {
    title: title,
    description: descript,
    openGraph: {
      title: title,
      description: descript,
      url: url,
      siteName: metaSite,
      images: [
        {
          url: metaLogo,
          width: 909,
          height: 606,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: descript,
      images: [metaLogo],
    },
    icons: {
      icon: metaIcon,
      apple: metaIcon,
    },
  };

  return data;
};
