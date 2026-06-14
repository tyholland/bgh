import { Metadata } from "next";
import DisclaimerPage from "../../content/disclaimer/disclaimer";
import { defaultMetaData, metaTitle, metaUrl } from "@/constants";

export const metadata: Metadata = defaultMetaData(
  `Disclaimer | ${metaTitle}`,
  undefined,
  `${metaUrl}/disclaimer`,
);

const Disclaimer = () => <DisclaimerPage />;

export default Disclaimer;
