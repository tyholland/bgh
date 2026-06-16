"use client";

import Image from "next/image";

const Loader = () => {
  return (
    <div className="loadingWrapper">
      <Image src="/loader-img.png" alt="BGH Scout spinning arrow" width="200" />
      <div>Loading...</div>
    </div>
  );
};

export default Loader;
