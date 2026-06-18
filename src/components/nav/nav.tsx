"use client";

import Link from "next/link";
import { trackEvent } from "@/functions/mixpanel";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { jobAtom } from "@/caches/JobsAtom";
import { userAtom } from "@/caches/UserAtom";
import SignOutModal from "../signOut-modal/signOut-modal";
import { useState } from "react";
import UserIcon from "@/svg/UserIcon";
import Image from "next/image";

const Nav = () => {
  const navigate = useRouter();
  const jobData = useAtomValue(jobAtom);
  const user = useAtomValue(userAtom);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const handleFeedback = () => {
    navigate.push("/contact");

    trackEvent(user, "Feedback", {
      type: "button",
      location: "nav",
    });
  };

  return (
    <>
      <header>
        <Link href={!!jobData ? "/home" : "/"}>
          <Image src="/bgh-logo.png" alt="BGH Scout Logo" width="200" />
        </Link>
        <div className="section">
          <button onClick={handleFeedback}>Feedback</button>
          <div className="linksWrapper">
            {!!user ? (
              <button className="text" onClick={() => setOpenModal(true)}>
                Welcome
                {user.displayName
                  ? ` ${user.displayName.split(" ")[0]}`
                  : ""}{" "}
                <UserIcon />
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
