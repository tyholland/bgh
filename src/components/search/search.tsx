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

  return (
    <S.Wrapper>
      <S.Input
        type="text"
        placeholder="Enter position"
        onChange={handledSearchedWord}
      />
      <button onClick={handleSearchBtn}>Search</button>
    </S.Wrapper>
  );
};

export default Search;
