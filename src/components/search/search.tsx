"use client";

import { ChangeEvent, useState } from "react";
import * as S from "./search.style";
import { useAtom, useAtomValue } from "jotai";
import { jobAtom } from "@/caches/JobsAtom";
import { handleSearchParams } from "@/functions/search";
import { trackEvent } from "@/functions/mixpanel";
import { userAtom } from "@/caches/UserAtom";
import SignInModal from "../signIn-modal/signIn-modal";

const Search = () => {
  const user = useAtomValue(userAtom);
  const [jobData, setJobData] = useAtom(jobAtom);
  const [searchWord, setSearchWord] = useState<string>("");
  const [openModal, setOpenModal] = useState<boolean>(false);

  const handledSearchedWord = (e: ChangeEvent<HTMLInputElement>) => {
    const choosen = e.target.value;
    setSearchWord(choosen);

    if (choosen === "") {
      const query = window.location.search;
      const params = new URLSearchParams(query);
      params.set("search", "");

      const updatedQuery = `?${params.toString()}`;
      window.history.pushState({}, "", updatedQuery);

      jobData && handleSearchParams(jobData, params, setJobData);
    }
  };

  const handleSearchBtn = () => {
    if (!user) {
      setOpenModal(true);
      return;
    }

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
    <>
      <S.Wrapper>
        <S.Input
          type="text"
          name="mainSearch"
          placeholder="Enter job role"
          value={searchWord}
          onChange={handledSearchedWord}
        />
        <button onClick={handleSearchBtn} disabled={searchWord.length === 0}>
          Search
        </button>
        {searchWord.length !== 0 && (
          <button className="reset" onClick={handleClear}>
            Clear
          </button>
        )}
      </S.Wrapper>
      <SignInModal openModal={openModal} setOpenModal={setOpenModal} />
    </>
  );
};

export default Search;
