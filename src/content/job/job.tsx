"use client";

import { useEffect } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { useAtomValue } from "jotai";
import * as S from "./job.style";
import { CsvData } from "@/types";
import { userAtom } from "@/caches/UserAtom";
import { trackEvent, trackPage } from "@/functions/mixpanel";

interface JobProps {
  job: CsvData;
  // Sanitized server-side (sanitizeJobDescription.server.ts) before this
  // component ever sees it — this is presentational only, not a second
  // sanitization pass.
  descriptionHtml: string;
}

const Job = ({ job, descriptionHtml }: JobProps) => {
  const user = useAtomValue(userAtom);
  const details = job.Details;

  useEffect(() => {
    trackPage(user, "Job Details Page", window.location.href);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <S.Wrapper>
      <S.Back>
        <Link href="/">&larr; Back to job search</Link>
      </S.Back>

      <S.Heading>
        <h1>{job["Role Name"]}</h1>
        <div className="company">
          {job.Company} &middot; {job["Primary Industry"]}
        </div>
      </S.Heading>

      <S.ApplyBtn>
        <a
          href={job.Link}
          target="_blank"
          rel="nofollow noopener noreferrer"
          onClick={() =>
            trackEvent(user, "See Role", { type: "jobPage", ...job })
          }
        >
          Apply on {job.Company}&apos;s site
        </a>
      </S.ApplyBtn>

      {descriptionHtml && (
        <div>
          <span className="title">Job Description:</span>{" "}
          <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
        </div>
      )}

      {details?.datePosted && (
        <div>
          <span className="title">Date Posted by Company:</span>{" "}
          {dayjs(details.datePosted).format("MM-DD-YYYY")}
        </div>
      )}
      {details?.validThrough && (
        <div>
          <span className="title">Valid Through:</span>{" "}
          {dayjs(details.validThrough).format("MM-DD-YYYY")}
        </div>
      )}
      {details?.employmentType && (
        <div>
          <span className="title">Employment Type:</span>{" "}
          {details.employmentType}
        </div>
      )}
      {details?.jobLocation?.address?.addressLocality && (
        <div>
          <span className="title">Location:</span>{" "}
          {details.jobLocation.address.addressLocality}
        </div>
      )}
      {details?.jobBenefits && (
        <div>
          <span className="title">Job Benefits:</span> {details.jobBenefits}
        </div>
      )}
    </S.Wrapper>
  );
};

export default Job;
