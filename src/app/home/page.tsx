import { redirect } from "next/navigation";

// The job board now lives at "/". Keep this path working for old links.
const Home = () => redirect("/");

export default Home;
