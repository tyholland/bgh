"use client";

import Link from "next/link";
import Image from "next/image";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import UserIcon from "@/svg/UserIcon";
import { useHasMounted } from "@/functions/useHasMounted";

const Nav = () => {
  const rawUser = useAtomValue(userAtom);
  // Same mount-gating as account.tsx/saved-searches.tsx: userAtom can
  // already hold a cached-session user before this component's own
  // hydration completes, which the server-rendered HTML never saw.
  const hasMounted = useHasMounted();
  const user = hasMounted ? rawUser : null;

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
