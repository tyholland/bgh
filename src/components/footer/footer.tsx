"use client";

import dayjs from "dayjs";
import Link from "next/link";

const Footer = () => {
  const year = dayjs().format("YYYY");

  return (
    <footer>
      <div className="linkWrapper">
        <Link href="/about">About</Link>
        <span>|</span>
        <Link href="/contact">Contact Us</Link>
        <span>|</span>
        <Link href="/request">Request Company</Link>
        <span>|</span>
        <Link href="/disclaimer">Disclaimer</Link>
        <span>|</span>
        <Link href="/road-map">Road Map</Link>
      </div>
      <div className="copy">
        <div>&copy; {year} BGH Scout.</div>
        <div>
          Site by{" "}
          <a href="https://heiprodigital.com" target="_blank">
            HeiPro Digital
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
