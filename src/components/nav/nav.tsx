"use client";

import Link from "next/link";
import { trackEvent } from "@/functions/mixpanel";
import { useRouter } from "next/navigation";

const Nav = () => {
  const navigate = useRouter();

  const handleFeedback = () => {
    trackEvent("Feedback", {
      type: "button",
    });

    navigate.push("/contact");
  };

  return (
    <header>
      <Link href="/">
        <img src="/bgh-logo.png" width="200" />
      </Link>
      <div className="section">
        <button onClick={handleFeedback}>Feedback</button>
        <div className="linksWrapper">
          <div>Sign In / Logged In</div>
        </div>
      </div>
    </header>
  );
};

export default Nav;
