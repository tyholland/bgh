import { atom } from "jotai";
import { AllSearchData } from "../types";

export const jobAtom = atom<AllSearchData | null>(null);
