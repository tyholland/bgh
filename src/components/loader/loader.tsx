"use client";

const Loader = () => {
  return (
    <div className="loadingWrapper">
      <img
        src="/loader-img.png"
        alt="BGH Scout spinning arrow"
        width="200"
        height="200"
      />
      <div>Loading...</div>
    </div>
  );
};

export default Loader;
