import { Metadata } from "next";
import RoadMapPage from "../../content/road-map/road-map";
import { defaultMetaData, metaTitle, metaUrl } from "@/constants";

export const metadata: Metadata = defaultMetaData(
  `Road Map | ${metaTitle}`,
  undefined,
  `${metaUrl}/road-map`,
);

const RoadMap = () => <RoadMapPage />;

export default RoadMap;
