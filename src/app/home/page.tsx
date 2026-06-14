import { Metadata } from "next";
import HomePage from "../../content/home/home";
import { defaultMetaData, metaTitle, metaUrl } from "@/constants";

export const metadata: Metadata = defaultMetaData(
  `Home | ${metaTitle}`,
  undefined,
  `${metaUrl}/home`,
);

const Home = () => <HomePage />;

export default Home;
