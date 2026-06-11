"use client";

import { userAtom } from "@/caches/UserAtom";
import { getUserCreds } from "@/functions/userState";
import { useAtom } from "jotai";
import { ChangeEvent, useEffect, useState } from "react";
import * as S from "./request.style";
import { sendEmail } from "@/requests/email";
import { trackError } from "@/functions/mixpanel";
import ErrorBlock from "@/components/errorBlock/errorBlock";
import CronJob from "@/components/cronJob/cronJob";
import { useRouter } from "next/navigation";

const Request = () => {
  const navigate = useRouter();
  const [user, setUser] = useAtom(userAtom);
  const [firstName, setFirstName] = useState<string>(
    user?.displayName?.split(" ")[0] || "",
  );
  const [lastName, setLastName] = useState<string>(
    user?.displayName?.split(" ")[1] || "",
  );
  const [userEmail, setUserEmail] = useState<string>(user?.email || "");
  const [request, setRequest] = useState<string>("");
  const [hasRequest, setHasRequest] = useState<boolean>(false);
  const [isDisabled, setIsDisabled] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setIsDisabled(true);

      await sendEmail(
        "ty@heiprodigital.com, cpbeganski@gmail.com, ben@greenefamily.us",
        "BGH Request Company",
        `First Name: ${firstName}\nLast Name: ${lastName}\nEmail: ${userEmail}\nRequest: ${request}\n`,
      );

      setHasRequest(true);
    } catch (error: any) {
      setIsDisabled(false);
      setHasRequest(false);
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
      case "request":
        setRequest(val);
        break;
      default:
        setFirstName(val);
        break;
    }

    setIsDisabled(!firstName || !lastName || !userEmail || !request);
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

  return (
    <>
      <CronJob />
      <S.Wrapper>
        {hasRequest ? (
          <div>Thank you for your request</div>
        ) : (
          <>
            Request a new company to add to our list
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
              <S.Input
                type="text"
                name="request"
                onChange={(e) => handleInputChange(e, "request")}
                placeholder="Enter company name"
                value={request}
                required
              />
            </div>
            {errorMsg && <ErrorBlock error={errorMsg} />}
            <S.BtnWrapper>
              <S.Button onClick={handleSubmit} disabled={isDisabled}>
                Submit Request
              </S.Button>
              <S.Button onClick={() => navigate.push("/contact")}>
                Provide Feedback
              </S.Button>
            </S.BtnWrapper>
          </>
        )}
      </S.Wrapper>
    </>
  );
};

export default Request;
