import { Metadata } from "next";
import RequestPage from "../../content/request/request";
import { defaultMetaData, metaTitle, metaUrl } from "@/constants";

export const metadata: Metadata = defaultMetaData(
  `Request | ${metaTitle}`,
  undefined,
  `${metaUrl}/request`,
);

const Request = () => <RequestPage />;

export default Request;
