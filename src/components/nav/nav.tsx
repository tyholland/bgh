"use client";

import Link from "next/link";
import { trackEvent } from "@/functions/mixpanel";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { jobAtom } from "@/caches/JobsAtom";

const Nav = () => {
  const navigate = useRouter();
  const jobData = useAtomValue(jobAtom);

  const handleFeedback = () => {
    navigate.push("/contact");

    trackEvent("Feedback", {
      type: "button",
    });
  };

  return (
    <header>
      <Link href={!!jobData ? "/home" : "/"}>
        <img src="/bgh-logo.png" width="200" />
      </Link>
      <div className="section">
        <button onClick={handleFeedback}>Feedback</button>
        <div className="linksWrapper">
          <Link href="/sign-in">Sign In</Link>
        </div>
      </div>
    </header>
  );
};

export default Nav;
