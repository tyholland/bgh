"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { useAtomValue } from "jotai";
import * as S from "./job.style";
import { CsvData } from "@/types";
import { userAtom } from "@/caches/UserAtom";
import { trackEvent, trackPage } from "@/functions/mixpanel";
import { getFirebaseAuth } from "@/functions/firebase";
import { createSavedJob, deleteSavedJob, getSavedJobs } from "@/requests/savedJobs";
import { formatViewCount } from "@/functions/formatViewCount";
import { jobHref } from "@/functions/jobHref";
import SignInModal from "@/components/signIn-modal/signIn-modal";
import LinkedInIcon from "@/svg/LinkedInIcon";
import XIcon from "@/svg/XIcon";
import FacebookIcon from "@/svg/FacebookIcon";
import LinkIcon from "@/svg/LinkIcon";

interface JobProps {
  job: CsvData;
  // Sanitized server-side (sanitizeJobDescription.server.ts) before this
  // component ever sees it — this is presentational only, not a second
  // sanitization pass.
  descriptionHtml: string;
  // Other open roles in the same industry (src/requests/jobs.ts's
  // getSimilarJobs) — already excludes this job and caps at a handful.
  similarJobs: CsvData[];
}

const Job = ({ job, descriptionHtml, similarJobs }: JobProps) => {
  const user = useAtomValue(userAtom);
  const details = job.Details;
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  // null = not saved; a string = saved, holding the saved_jobs row id needed
  // to unsave.
  const [savedJobId, setSavedJobId] = useState<string | null>(null);
  const [isSavingJob, setIsSavingJob] = useState<boolean>(false);

  const requireUser = () => {
    if (user) return true;
    setOpenModal(true);
    return false;
  };

  const shareText = `${job["Role Name"]} at ${job.Company}`;

  const openShareWindow = (shareUrl: string, platform: string) => {
    if (!requireUser()) return;

    trackEvent(user, "Share Job", { platform, ...job });
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  const showShareMessage = (message: string) => {
    setShareMessage(message);
    setTimeout(() => setShareMessage(null), 2500);
  };

  const handleCopyLink = async () => {
    if (!requireUser()) return;

    trackEvent(user, "Share Job", { platform: "copy-link", ...job });

    try {
      await navigator.clipboard.writeText(window.location.href);
      showShareMessage("Link copied!");
    } catch {
      // Clipboard access can be denied by the browser (e.g. non-HTTPS or
      // permission blocked) — fail silently rather than throw in the UI.
    }
  };

  useEffect(() => {
    trackPage(user, "Job Details Page", window.location.href);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Determines the button's initial Save/Saved state for this specific job —
  // only fetches the signed-in user's saved jobs once, on this one detail
  // page (not on every card in a list).
  useEffect(() => {
    if (!user || !job.id) return;

    let cancelled = false;

    const checkSaved = async () => {
      try {
        const idToken = await getFirebaseAuth().currentUser?.getIdToken();
        if (!idToken) return;

        const savedJobs = await getSavedJobs(idToken);
        const match = savedJobs.find((saved) => saved.jobId === job.id);

        if (!cancelled) setSavedJobId(match?.id ?? null);
      } catch {
        // Non-critical — the button just falls back to showing "Save Job".
      }
    };

    checkSaved();

    return () => {
      cancelled = true;
    };
  }, [user, job.id]);

  const handleToggleSaveJob = async () => {
    if (!requireUser() || !job.id) return;

    setIsSavingJob(true);

    try {
      const idToken = await getFirebaseAuth().currentUser?.getIdToken();
      if (!idToken) throw new Error("Not signed in");

      if (savedJobId) {
        await deleteSavedJob(savedJobId, idToken);
        setSavedJobId(null);
        trackEvent(user, "Unsave Job", { ...job });
      } else {
        const saved = await createSavedJob(
          {
            jobId: job.id,
            roleName: job["Role Name"],
            company: job.Company,
            link: job.Link,
          },
          idToken,
        );
        setSavedJobId(saved.id);
        trackEvent(user, "Save Job", { ...job });
      }
    } catch {
      // Best-effort — leave the button in its previous state rather than
      // show a dedicated error UI for this low-stakes action.
    } finally {
      setIsSavingJob(false);
    }
  };

  return (
    <>
      <S.Wrapper>
        <S.Back>
          <Link href="/">&larr; Back to job search</Link>
        </S.Back>

        <S.Heading>
          <h1>{job["Role Name"]}</h1>
          <div className="company">
            {job.Company} &middot; {job["Primary Industry"]}
          </div>
          {typeof job.viewCount === "number" && (
            <div className="viewCount">{formatViewCount(job.viewCount)}</div>
          )}
        </S.Heading>

        <S.ApplyBtn>
          <a
            href={job.Link}
            target="_blank"
            rel="nofollow noopener noreferrer"
            onClick={(e) => {
              if (!requireUser()) {
                e.preventDefault();
                return;
              }

              trackEvent(user, "See Role", { type: "jobPage", ...job });
            }}
          >
            Apply on {job.Company}&apos;s site
          </a>
          {job.id && (
            <button
              type="button"
              className="saveJob"
              onClick={handleToggleSaveJob}
              disabled={isSavingJob}
            >
              {savedJobId ? "★ Saved" : "☆ Save Job"}
            </button>
          )}
        </S.ApplyBtn>
        <S.ShareBtns>
          <span className="label">Share:</span>
          <button
            type="button"
            aria-label="Share on LinkedIn"
            title="Share on LinkedIn"
            onClick={() =>
              openShareWindow(
                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
                "linkedin",
              )
            }
          >
            <LinkedInIcon />
          </button>
          <button
            type="button"
            aria-label="Share on X"
            title="Share on X"
            onClick={() =>
              openShareWindow(
                `https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`,
                "x",
              )
            }
          >
            <XIcon />
          </button>
          <button
            type="button"
            aria-label="Share on Facebook"
            title="Share on Facebook"
            onClick={() =>
              openShareWindow(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
                "facebook",
              )
            }
          >
            <FacebookIcon />
          </button>
          <button
            type="button"
            aria-label="Copy link"
            title="Copy link"
            onClick={handleCopyLink}
          >
            <LinkIcon />
          </button>
          {shareMessage && <span className="copied">{shareMessage}</span>}
        </S.ShareBtns>
        {descriptionHtml && (
          <div className={!user ? "blur" : ""}>
            <span className="title">Job Description:</span>{" "}
            <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          </div>
        )}
        <S.AdditionalBtn>
          <button
            onClick={() => {
              trackEvent(user, "Additional Details");
              setShowDetails(!showDetails);
            }}
            className="submit"
          >
            Additional Details
          </button>
        </S.AdditionalBtn>
        {showDetails && (
          <div className={!user ? "blur" : ""}>
            <div>
              <i>-- Under Development --</i>
            </div>
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
                <span className="title">Job Benefits:</span>{" "}
                {details.jobBenefits}
              </div>
            )}
          </div>
        )}
        {similarJobs.length > 0 && (
          <S.SimilarJobs>
            <div className="title">Similar Jobs</div>
            <div className="list">
              {similarJobs.map((similar) => {
                const href = jobHref(similar);
                if (!href) return null;

                return (
                  <Link
                    key={similar.Link}
                    href={href}
                    className="item"
                    onClick={() =>
                      trackEvent(user, "Job Listing", {
                        type: "similar",
                        ...similar,
                      })
                    }
                  >
                    <div className="role">{similar["Role Name"]}</div>
                    <div className="meta">
                      {similar.Company} &middot; {similar["Primary Industry"]}
                    </div>
                  </Link>
                );
              })}
            </div>
          </S.SimilarJobs>
        )}
      </S.Wrapper>
      <SignInModal openModal={openModal} setOpenModal={setOpenModal} />
    </>
  );
};

export default Job;
