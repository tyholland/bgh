import { Metadata } from "next";
import SignInPage from "../../content/sign-in/sign-in";
import { defaultMetaData, metaTitle, metaUrl } from "@/constants";

export const metadata: Metadata = defaultMetaData(
  `Sign In | ${metaTitle}`,
  undefined,
  `${metaUrl}/sign-in`,
);

const SignIn = () => <SignInPage />;

export default SignIn;
