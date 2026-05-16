"use client";

import { ChangeEvent, useState } from "react";
import * as S from "./search.style";
import { useAtom } from "jotai";
import { jobAtom } from "@/caches/JobsAtom";
import { clearAllSearched, updateSearchParams } from "@/functions/search";

const Search = () => {
  const [jobData, setJobData] = useAtom(jobAtom);
  const [searchWord, setSearchWord] = useState<string>("");

  const handledSearchedWord = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchWord(e.target.value);
  };

  const handleSearchBtn = () => {
    window.history.pushState({}, "", `/?search=${searchWord}`);

    jobData && updateSearchParams(jobData, searchWord, setJobData);
  };

  const handleClear = () => {
    window.history.pushState({}, "", "/");
    setSearchWord("");

    jobData && clearAllSearched(jobData, setJobData);
  };

  return (
    <S.Wrapper>
      <S.Input
        type="text"
        placeholder="Enter job role"
        value={searchWord}
        onChange={handledSearchedWord}
      />
      <button onClick={handleSearchBtn}>Search</button>
      <button className="reset" onClick={handleClear}>
        Clear All
      </button>
    </S.Wrapper>
  );
};

export default Search;
