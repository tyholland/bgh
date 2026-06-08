"use client";

import { userAtom } from "@/caches/UserAtom";
import { getUserCreds } from "@/functions/userState";
import { useAtom } from "jotai";
import mailtoLink from "mailto-link";
import { ChangeEvent, useEffect, useState } from "react";

const Contact = () => {
  const [user, setUser] = useAtom(userAtom);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");

  const handleSubmit = () => {
    mailtoLink({
      to: "ty@heiprodigital.com",
      subject: "BGH Feedback",
      body: `First Name: ${firstName}\Last Name: ${lastName}\nEmail: ${userEmail}\nMessage: ${feedback}\n`,
    });
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
  };

  const handleFeedback = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;

    setFeedback(val);
  };

  useEffect(() => {
    getUserCreds(user, setUser);
  }, []);

  return (
    <div>
      Please provide us with any feedback. Your feedback will help make our
      product stronger.
      <div>
        <input
          type="text"
          name="firstName"
          onChange={(e) => handleInputChange(e, "firstName")}
          placeholder="Enter your first name"
          value={
            user ? user.displayName?.split(" ")[0] || undefined : undefined
          }
        />
      </div>
      <div>
        <input
          type="text"
          name="lastName"
          onChange={(e) => handleInputChange(e, "lastName")}
          placeholder="Enter your last name"
          value={
            user ? user.displayName?.split(" ")[1] || undefined : undefined
          }
        />
      </div>
      <div>
        <input
          type="email"
          name="email"
          onChange={(e) => handleInputChange(e, "email")}
          placeholder="Enter your email"
          value={user ? user.email || undefined : undefined}
          required
        />
      </div>
      <div>
        <textarea
          name="feedback"
          onChange={handleFeedback}
          placeholder="Enter your feedback"
          required
        />
      </div>
      <button onClick={handleSubmit}>Submit Feedback</button>
    </div>
  );
};

export default Contact;
