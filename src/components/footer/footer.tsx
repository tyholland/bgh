"use client";

import dayjs from "dayjs";

const Footer = () => {
  const year = dayjs().format("YYYY");

  return (
    <footer>
      <div>&copy; {year} BGH Scout.</div>
      <div>
        Site by{" "}
        <a href="https://heiprodigital.com" target="_blank">
          HeiPro Digital
        </a>
      </div>
    </footer>
  );
};

export default Footer;
