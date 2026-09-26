"use client";

import { useState } from "react";
import * as S from "./search.style";
import { useRouter, useSearchParams } from "next/navigation";
import { trackEvent } from "@/functions/mixpanel";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import SignInModal from "../signIn-modal/signIn-modal";

const Search = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAtomValue(userAtom);
  const [searchWord, setSearchWord] = useState<string>(
    searchParams.get("search") || "",
  );
  const [openModal, setOpenModal] = useState<boolean>(false);

  const applySearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    params.set("page", "1");
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const handleSearchBtn = () => {
    if (!user) {
      setOpenModal(true);
      return;
    }

    applySearch(searchWord.trim());

    trackEvent(user, "Search", {
      type: "input field",
      value: searchWord.trim(),
    });
  };

  const handleClear = () => {
    setSearchWord("");
    applySearch("");

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
            onChange={(e) => setSearchWord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchBtn()}
          />
          <button
            onClick={handleSearchBtn}
            disabled={searchWord.trim().length === 0}
          >
            Search Jobs
          </button>
          {(searchWord.length !== 0 || searchParams.get("search")) && (
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
