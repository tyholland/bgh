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
  const query = window.location.search;
  const defaultParams = new URLSearchParams(query);
  const user = useAtomValue(userAtom);
  const [jobData, setJobData] = useAtom(jobAtom);
  const [searchWord, setSearchWord] = useState<string>(
    defaultParams?.get("search") || "",
  );
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

    trackEvent(user, "Search", {
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

    trackEvent(user, "Search", {
      type: "clear",
      value: "clear search input",
    });
  };

  return (
    <>
      <S.Wrapper>
        <div className="header">Find your next opportunity</div>
        <div>Discover roles at top companies and grow your career</div>
        <S.Section>
          <S.Input
            type="text"
            name="mainSearch"
            placeholder="Search jobs, keywords, skills..."
            value={searchWord}
            onChange={handledSearchedWord}
          />
          <button onClick={handleSearchBtn} disabled={searchWord.length === 0}>
            Search Jobs
          </button>
          {searchWord.length !== 0 && (
            <button className="reset" onClick={handleClear}>
              Clear
            </button>
          )}
        </S.Section>
      </S.Wrapper>
      <SignInModal openModal={openModal} setOpenModal={setOpenModal} />
    </>
  );
};

export default Search;
