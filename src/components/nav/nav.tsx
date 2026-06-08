"use client";

import Link from "next/link";
import { trackEvent } from "@/functions/mixpanel";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { jobAtom } from "@/caches/JobsAtom";
import { userAtom } from "@/caches/UserAtom";
import SignOutModal from "../signOut-modal/signOut-modal";
import { useState } from "react";

const Nav = () => {
  const navigate = useRouter();
  const jobData = useAtomValue(jobAtom);
  const user = useAtomValue(userAtom);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const handleFeedback = () => {
    navigate.push("/contact");

    trackEvent("Feedback", {
      type: "button",
    });
  };

  return (
    <>
      <header>
        <Link href={!!jobData ? "/home" : "/"}>
          <img src="/bgh-logo.png" width="200" />
        </Link>
        <div className="section">
          <button onClick={handleFeedback}>Feedback</button>
          <div className="linksWrapper">
            {!!user ? (
              <button onClick={() => setOpenModal(true)}>
                Welcome
                {user.displayName ? ` ${user.displayName.split(" ")[0]}` : ""}
              </button>
            ) : (
              <Link href="/sign-in">Sign In</Link>
            )}
          </div>
        </div>
      </header>
      <SignOutModal openModal={openModal} setOpenModal={setOpenModal} />
    </>
  );
};

export default Nav;
