import { Metadata } from "next";
import SignUpPage from "../../content/sign-up/sign-up";
import { defaultMetaData, metaTitle, metaUrl } from "@/constants";

export const metadata: Metadata = defaultMetaData(
  `Sign Up | ${metaTitle}`,
  undefined,
  `${metaUrl}/sign-up`,
);

const SignUp = () => <SignUpPage />;

export default SignUp;
