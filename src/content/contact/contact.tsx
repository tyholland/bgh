"use client";

import { userAtom } from "@/caches/UserAtom";
import { getUserCreds } from "@/functions/userState";
import { useAtom } from "jotai";
import { ChangeEvent, useEffect, useState } from "react";
import * as S from "./contact.style";
import { sendEmail } from "@/requests/email";
import { trackError, trackEvent, trackPage } from "@/functions/mixpanel";
import ErrorBlock from "@/components/errorBlock/errorBlock";
import CronJob from "@/components/cronJob/cronJob";
import { useRouter } from "next/navigation";

const Contact = () => {
  const navigate = useRouter();
  const [user, setUser] = useAtom(userAtom);
  const [firstName, setFirstName] = useState<string>(
    user?.displayName?.split(" ")[0] || "",
  );
  const [lastName, setLastName] = useState<string>(
    user?.displayName?.split(" ")[1] || "",
  );
  const [userEmail, setUserEmail] = useState<string>(user?.email || "");
  const [feedback, setFeedback] = useState<string>("");
  const [hasFeedback, setHasFeedback] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setIsDisabled(true);

      await sendEmail(
        "ty@heiprodigital.com, cpbeganski@gmail.com, ben@greenefamily.us",
        "BGH Feedback",
        `First Name: ${firstName}\nLast Name: ${lastName}\nEmail: ${userEmail}\nMessage: ${feedback}\n`,
      );

      setHasFeedback(true);

      trackEvent("Feedback", {
        type: "submit",
        email: userEmail,
      });
    } catch (error: any) {
      setIsDisabled(false);
      setHasFeedback(false);
      const errorCode = error.code;
      const errorMessage = error.message;

      trackError("Send Feedback", {
        code: errorCode,
        message: errorMessage,
      });

      setErrorMsg(errorCode);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    type: string,
  ) => {
    const val = e.target.value;

    switch (type) {
      case "firstName":
        setFirstName(val);
        break;
      case "lastName":
        setLastName(val);
        break;
      case "email":
        setUserEmail(val);
        break;
      default:
        setFirstName(val);
        break;
    }

    setIsDisabled(!firstName || !lastName || !userEmail || !feedback);
  };

  const handleFeedback = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;

    setFeedback(val);
    setIsDisabled(!firstName || !lastName || !userEmail || !val);
  };

  const loadDefaultUserVal = () => {
    setFirstName(user?.displayName?.split(" ")[0] || "");
    setLastName(user?.displayName?.split(" ")[1] || "");
    setUserEmail(user?.email || "");
  };

  useEffect(() => {
    getUserCreds(user, setUser);
    !!user && loadDefaultUserVal();
  }, [user]);

  useEffect(() => {
    trackPage("Contact", window.location.href);
  }, []);

  return (
    <>
      <CronJob />
      <S.Wrapper>
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
                onChange={(e) => handleInputChange(e, "firstName")}
                placeholder="Enter your first name"
                value={firstName}
              />
            </div>
            <div>
              <S.Input
                type="text"
                name="lastName"
                onChange={(e) => handleInputChange(e, "lastName")}
                placeholder="Enter your last name"
                value={lastName}
              />
            </div>
            <div>
              <S.Input
                type="email"
                name="email"
                onChange={(e) => handleInputChange(e, "email")}
                placeholder="Enter your email"
                value={userEmail}
                required
              />
            </div>
            <div>
              <S.Textarea
                name="feedback"
                onChange={handleFeedback}
                placeholder="Enter your feedback"
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
