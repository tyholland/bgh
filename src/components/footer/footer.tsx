"use client";

import dayjs from "dayjs";
import Link from "next/link";

const Footer = () => {
  const year = dayjs().format("YYYY");

  return (
    <footer>
      <img src="/dark-logo.png" alt="BGH Scout Logo" width="170" height="104" />
      <div className="linkWrapper">
        <Link href="/about">About</Link>
        <Link href="/contact">Contact Us</Link>
        <Link href="/request">Request Company</Link>
        <Link href="/disclaimer">Disclaimer</Link>
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
