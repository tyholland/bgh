"use client";

import Image from "next/image";
import Card from "@/components/card/card";
import * as S from "./home.style";
import Pagination from "@/components/pagination/pagination";
import Search from "@/components/search/search";
import { AllSearchData } from "@/types";
import { useAtomValue } from "jotai";
import { ChangeEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import List from "@/components/list/list";
import { userAtom } from "@/caches/UserAtom";
import dayjs from "dayjs";
import { trackEvent, trackPage } from "@/functions/mixpanel";
import SignInModal from "@/components/signIn-modal/signIn-modal";
import FilterModal from "@/components/filter-modal/filter-modal";
import SaveSearchModal from "@/components/save-search-modal/save-search-modal";

interface HomeProps {
  csvData: AllSearchData;
}

const sortMap = (value: string) => {
  switch (value) {
    case "a":
      return "A-Z";
    case "z":
      return "Z-A";
    case "least":
      return "Least Recent";
    case "most":
    default:
      return "Most Recent";
  }
};

const Home = ({ csvData }: HomeProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAtomValue(userAtom);
  const [isListView, setIsListView] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openFilterModal, setOpenFilterModal] = useState<boolean>(false);
  const [openSaveSearchModal, setOpenSaveSearchModal] =
    useState<boolean>(false);

  const currentSort = searchParams.get("sort") || "most";

  useEffect(() => {
    trackPage(user, "Home", window.location.href);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSort = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!user) {
      setOpenModal(true);
      return;
    }

    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.set("page", "1");
    router.push(`/?${params.toString()}`, { scroll: false });

    trackEvent(user, "Sort", { type: "select", value: sortMap(value) });
  };

  const handleSaveSearchClick = () => {
    if (!user) {
      setOpenModal(true);
      return;
    }

    setOpenSaveSearchModal(true);
  };

  return (
    <>
      <S.Wrapper>
        <S.ResultsWrapper>
          <S.JobResultsWrapper>
            <Search />
            <S.Section className="wrapper">
              <div className="jobs">
                <div>
                  <strong>{csvData.total}</strong> jobs found
                </div>
                <div>
                  <strong>Opportunity Refresh:</strong>{" "}
                  {csvData.refreshedAt
                    ? dayjs(csvData.refreshedAt).format("MM-DD-YYYY hh:mmA")
                    : "—"}
                </div>
              </div>
              <div className="options">
                <button
                  className="btnFilter"
                  onClick={() => setOpenFilterModal(true)}
                >
                  Filter Jobs
                </button>
                <S.Select
                  name="sortSelect"
                  onChange={handleSort}
                  value={currentSort}
                >
                  <option value="most">Most Recent</option>
                  <option value="least">Least Recent</option>
                  <option value="a">A-Z</option>
                  <option value="z">Z-A</option>
                </S.Select>
                <S.ListSection>
                  <button
                    onClick={() => setIsListView(false)}
                    disabled={!isListView}
                  >
                    <Image
                      src={
                        !isListView
                          ? "/dark-grid-view-icon.png"
                          : "/grid-view-icon.png"
                      }
                      alt="Grid View Icon"
                      width={30}
                      height={30}
                    />
                  </button>
                  <button
                    onClick={() => setIsListView(true)}
                    disabled={isListView}
                  >
                    <Image
                      src={
                        isListView
                          ? "/dark-list-view-icon.png"
                          : "/list-view-icon.png"
                      }
                      alt="List View Icon"
                      width={30}
                      height={30}
                    />
                  </button>
                </S.ListSection>
              </div>
            </S.Section>
            <Pagination totalPages={csvData.totalPages} page={csvData.page} />
            <S.CardWrapper className={isListView ? "list" : ""}>
              {isListView ? (
                <List jobs={csvData.data} />
              ) : (
                <Card jobs={csvData.data} />
              )}
            </S.CardWrapper>
            <Pagination totalPages={csvData.totalPages} page={csvData.page} />
          </S.JobResultsWrapper>
        </S.ResultsWrapper>
        <S.Banner>
          <S.BannerSection>
            <Image
              src="/trusted-icon.png"
              alt="Trusted Opportunities"
              width={50}
              height={50}
            />
            <div className="content">
              <div className="title">Trusted Opportunities</div>
              <div>Curated roles from top companies</div>
            </div>
          </S.BannerSection>
          <S.BannerSection>
            <Image
              src="/bolt-icon.png"
              alt="Real-time Updates"
              width={50}
              height={50}
            />
            <div className="content">
              <div className="title">Real-time Updates</div>
              <div>New jobs posted every day</div>
            </div>
          </S.BannerSection>
          <S.BannerSection>
            <Image
              src="/compass-icon.png"
              alt="Easy to Explore"
              width={50}
              height={50}
            />
            <div className="content">
              <div className="title">Easy to Explore</div>
              <div>Search, filter, and discover with ease.</div>
            </div>
          </S.BannerSection>
        </S.Banner>
      </S.Wrapper>
      <SignInModal openModal={openModal} setOpenModal={setOpenModal} />
      <FilterModal
        openModal={openFilterModal}
        setOpenModal={setOpenFilterModal}
        data={csvData}
        onSaveSearchClick={handleSaveSearchClick}
      />
      <SaveSearchModal
        openModal={openSaveSearchModal}
        setOpenModal={setOpenSaveSearchModal}
      />
    </>
  );
};

export default Home;
