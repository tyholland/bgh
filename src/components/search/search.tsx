"use client";

import { ChangeEvent, useState } from "react";
import * as S from "./search.style";
import { useAtom } from "jotai";
import { jobAtom } from "@/caches/JobsAtom";
import { handleSearchParams } from "@/functions/search";
import { trackEvent } from "@/functions/mixpanel";

const Search = () => {
  const [jobData, setJobData] = useAtom(jobAtom);
  const [searchWord, setSearchWord] = useState<string>("");

  const handledSearchedWord = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchWord(e.target.value);
  };

  const handleSearchBtn = () => {
    const query = window.location.search;
    const params = new URLSearchParams(query);

    params.set("search", searchWord);
    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    jobData && handleSearchParams(jobData, params, setJobData);

    trackEvent("Search", {
      type: "input field",
      value: searchWord,
    });
  };

  const handleClear = () => {
    const query = window.location.search;
    const params = new URLSearchParams(query);

    params.set("search", "");
    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    setSearchWord("");

    jobData && handleSearchParams(jobData, params, setJobData);

    trackEvent("Search", {
      type: "clear",
      value: "clear search input",
    });
  };

  return (
    <S.Wrapper>
      <S.Input
        type="text"
        name="mainSearch"
        placeholder="Enter job role"
        value={searchWord}
        onChange={handledSearchedWord}
      />
      <button onClick={handleSearchBtn}>Search</button>
      <button className="reset" onClick={handleClear}>
        Clear
      </button>
    </S.Wrapper>
  );
};

export default Search;
