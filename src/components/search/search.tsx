"use client";

import { ChangeEvent, useState } from "react";
import * as S from "./search.style";
import { useRouter } from "next/navigation";

const Search = () => {
  const router = useRouter();
  const [searchWord, setSearchWord] = useState<string>("");

  const handledSearchedWord = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchWord(e.target.value);
  };

  const handleSearchBtn = () => {
    router.push(`/?search=${searchWord}`);
  };

  const handleClear = () => {
    const query = window.location.search;
    const params = new URLSearchParams(query);

    params.set("search", "");
    params.set("company", "");
    params.set("date", "");
    params.set("industry", "");
    params.set("keyword", "");

    const updatedQuery = `?${params.toString()}`;

    router.push(updatedQuery);
  };

  return (
    <S.Wrapper>
      <S.Input
        type="text"
        placeholder="Enter job position"
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
