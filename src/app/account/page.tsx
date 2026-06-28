import { Metadata } from "next";
import AccountPage from "../../content/account/account";
import { defaultMetaData, metaTitle, metaUrl } from "@/constants";

export const metadata: Metadata = defaultMetaData(
  `Account | ${metaTitle}`,
  undefined,
  `${metaUrl}/account`,
);

const Account = () => <AccountPage />;

export default Account;
