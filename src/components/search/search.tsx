"use client";

import { useState } from "react";
import * as S from "./search.style";
import { useRouter, useSearchParams } from "next/navigation";
import { trackEvent } from "@/functions/mixpanel";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import SignInModal from "../signIn-modal/signIn-modal";
import SaveSearchModal from "../save-search-modal/save-search-modal";

const splitParam = (value: string | null) =>
  value ? value.split(",").filter(Boolean) : [];

const Search = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAtomValue(userAtom);

  const searchBubble = splitParam(searchParams.get("search"));

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openSaveSearchModal, setOpenSaveSearchModal] =
    useState<boolean>(false);
  const [searchWord, setSearchWord] = useState<string>("");

  const requireUser = () => {
    if (user) return true;
    setOpenModal(true);
    return false;
  };

  const pushParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.set("page", "1");
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const handleSearch = () => {
    if (!requireUser()) return;

    const entry = searchWord.trim();
    if (!entry || searchBubble.includes(entry)) return;

    pushParams((params) =>
      params.set("search", [...searchBubble, entry].join(",")),
    );
    setSearchWord("");

    trackEvent(user, "Search", { type: "search", value: entry });
  };

  const handleRemoveSearch = (entry: string) => {
    if (!requireUser()) return;

    const updated = searchBubble.filter((item) => item !== entry);
    pushParams((params) => params.set("search", updated.join(",")));

    trackEvent(user, "Search", {
      type: "remove search",
      value: entry,
      searches: updated.join(","),
    });
  };

  const handleSaveSearchClick = () => {
    if (!requireUser()) return;
    setOpenSaveSearchModal(true);
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
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={searchWord.trim().length === 0}
          >
            Search Jobs
          </button>
          <button className="save" onClick={handleSaveSearchClick}>
            Save Search
          </button>
        </S.Section>
        {searchBubble.length > 0 && (
          <S.KeywordBubble>
            {searchBubble.map((item: string) => (
              <button
                className="bubble"
                onClick={() => handleRemoveSearch(item)}
                key={item}
              >
                {item} <span>x</span>
              </button>
            ))}
          </S.KeywordBubble>
        )}
      </S.Wrapper>
      <SignInModal openModal={openModal} setOpenModal={setOpenModal} />
      <SaveSearchModal
        openModal={openSaveSearchModal}
        setOpenModal={setOpenSaveSearchModal}
      />
    </>
  );
};

export default Search;
