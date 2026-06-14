import { Metadata } from "next";
import AboutPage from "../../content/about/about";
import { defaultMetaData, metaTitle, metaUrl } from "@/constants";

export const metadata: Metadata = defaultMetaData(
  `About | ${metaTitle}`,
  undefined,
  `${metaUrl}/about`,
);

const About = () => <AboutPage />;

export default About;
