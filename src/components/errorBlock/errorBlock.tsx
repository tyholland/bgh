"use client";

import { LoginErrors } from "@/constants";
import * as S from "./errorBlock.style";

interface ErrorBlockProps {
  error: string;
}

const ErrorBlock = ({ error }: ErrorBlockProps) => {
  const msg = LoginErrors.filter((item) => item.error === error)[0];

  return (
    <S.Wrapper>
      {msg?.value || "We encountered an error. Please try again"}
    </S.Wrapper>
  );
};

export default ErrorBlock;
