"use client";

import { userAtom } from "@/caches/UserAtom";
import { useAtomValue } from "jotai";
import { ChangeEvent, useEffect, useState } from "react";
import * as S from "./contact.style";
import { sendContactMessage } from "@/requests/email";
import { trackError, trackEvent, trackPage } from "@/functions/mixpanel";
import ErrorBlock from "@/components/errorBlock/errorBlock";
import { useRouter } from "next/navigation";

const Contact = () => {
  const navigate = useRouter();
  const user = useAtomValue(userAtom);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [hasFeedback, setHasFeedback] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);

  // Prefill from the signed-in user once it resolves (adjust-state-in-render).
  if (user && user.uid !== prefilledFor) {
    setPrefilledFor(user.uid);
    setFirstName(user.displayName?.split(" ")[0] ?? "");
    setLastName(user.displayName?.split(" ")[1] ?? "");
    setUserEmail(user.email ?? "");
  }

  useEffect(() => {
    trackPage(user, "Contact", window.location.href);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await sendContactMessage({
        kind: "feedback",
        firstName,
        lastName,
        email: userEmail,
        message: feedback,
      });

      setHasFeedback(true);
      trackEvent(user, "Feedback", { type: "submit", email: userEmail });
    } catch (error) {
      setIsSubmitting(false);
      trackError(user, "Send Feedback", {
        code: (error as { code?: string }).code ?? "unknown",
        message: (error as { message?: string }).message ?? "",
      });
      setErrorMsg("unknown");
    }
  };

  const isDisabled =
    isSubmitting || !firstName || !lastName || !userEmail || !feedback;

  return (
    <>
      <S.Wrapper>
        <S.VisuallyHidden>Contact | BGH Scout</S.VisuallyHidden>
        {hasFeedback ? (
          <div>Thank you for your feedback</div>
        ) : (
          <>
            Please provide us with any feedback. Your feedback will help make
            our product stronger.
            <div>
              <S.Input
                type="text"
                name="firstName"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setFirstName(e.target.value)
                }
                placeholder="Enter your first name"
                value={firstName}
              />
            </div>
            <div>
              <S.Input
                type="text"
                name="lastName"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setLastName(e.target.value)
                }
                placeholder="Enter your last name"
                value={lastName}
              />
            </div>
            <div>
              <S.Input
                type="email"
                name="email"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setUserEmail(e.target.value)
                }
                placeholder="Enter your email"
                value={userEmail}
                required
              />
            </div>
            <div>
              <S.Textarea
                name="feedback"
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setFeedback(e.target.value)
                }
                placeholder="Enter your feedback"
                value={feedback}
                required
              />
            </div>
            {errorMsg && <ErrorBlock error={errorMsg} />}
            <S.BtnWrapper>
              <S.Button onClick={handleSubmit} disabled={isDisabled}>
                Submit Feedback
              </S.Button>
              <S.Button onClick={() => navigate.push("/request")}>
                Request a Company
              </S.Button>
            </S.BtnWrapper>
          </>
        )}
      </S.Wrapper>
    </>
  );
};

export default Contact;
