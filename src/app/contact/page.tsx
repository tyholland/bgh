import { Metadata } from "next";
import ContactPage from "../../content/contact/contact";
import { defaultMetaData, metaTitle, metaUrl } from "@/constants";

export const metadata: Metadata = defaultMetaData(
  `Contact | ${metaTitle}`,
  undefined,
  `${metaUrl}/contact`,
);

const Contact = () => <ContactPage />;

export default Contact;
