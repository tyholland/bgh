"use client";

import Link from "next/link";
import Image from "next/image";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import UserIcon from "@/svg/UserIcon";

const Nav = () => {
  const user = useAtomValue(userAtom);

  return (
    <header>
      <Link href="/">
        <Image
          src="/bgh-logo.png"
          alt="BGH Scout Logo"
          width={200}
          height={134}
        />
      </Link>
      <div className="section">
        <div className="linksWrapper">
          {user ? (
            <Link href="/account">
              Welcome
              {user.displayName
                ? ` ${user.displayName.split(" ")[0]}`
                : ""}{" "}
              <UserIcon />
            </Link>
          ) : (
            <Link href="/sign-in">Sign In</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Nav;
