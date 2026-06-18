"use client";

import { useRouter } from "next/navigation";
import * as S from "./road-map.style";
import { trackEvent, trackPage } from "@/functions/mixpanel";
import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";

const RoadMap = () => {
  const navigate = useRouter();
  const user = useAtomValue(userAtom);

  const handleFeedback = () => {
    navigate.push("/contact");

    trackEvent(user, "Feedback", {
      type: "button",
      location: "road map",
    });
  };

  useEffect(() => {
    trackPage(user, "Road Map", window.location.href);
  }, []);

  return (
    <S.Wrapper>
      <h1>What We're Working On</h1>
      <div>
        BGH Scout was built to help job seekers discover opportunities faster
        and gain visibility into openings they may not otherwise find.
      </div>
      <div>
        As we continue to grow, we're actively developing new features designed
        to make the job search process more organized, personalized, and
        effective. Many of the ideas below come directly from conversations with
        our users, and we expect our roadmap to evolve as we continue to receive
        feedback.
      </div>
      <h1>Smarter Search Experience</h1>
      <div>
        We're working on ways to help users quickly find the opportunities that
        matter most to them, including:
        <ul>
          <li>Saved searches</li>
          <li>Enhanced filtering options</li>
          <li>Personalized search preferences</li>
          <li>Faster access to frequently searched criteria</li>
        </ul>
      </div>
      <h1>Alerts & Notifications</h1>
      <div>
        Timing matters in a job search. We're exploring ways to help users stay
        informed about new opportunities as quickly as possible.
      </div>
      <div>
        Potential enhancements include:
        <ul>
          <li>Notifications based on saved searches</li>
          <li>Custom job alerts</li>
          <li>Alerts for newly discovered opportunities</li>
          <li>More control over how and when notifications are received</li>
          <li>
            Near real-time notifications for opportunities that match specific
            criteria
          </li>
        </ul>
      </div>
      <h1>Job Search Activity Tracking</h1>
      <div>
        We're evaluating tools that help users better understand and organize
        their job search activity, including:
        <ul>
          <li>Tracking job links clicked</li>
          <li>Self-reported application tracking</li>
          <li>Search activity insights</li>
          <li>Personal job search dashboards</li>
        </ul>
      </div>
      <h1>User Profiles</h1>
      <div>
        We're exploring profile features that would allow users to personalize
        their experience and better manage their job search.
      </div>
      <div>
        Potential features include:
        <ul>
          <li>Saved opportunities</li>
          <li>Search history</li>
          <li>Job tracking tools</li>
          <li>Personalized recommendations</li>
        </ul>
      </div>
      <h1>Networking & Connections</h1>
      <div>Applying is only one part of a successful job search.</div>
      <div>
        We're exploring ways to help users identify and connect with
        professionals at organizations of interest, making it easier to build
        relationships, learn more about companies, and gain valuable insights
        throughout the job search process.
      </div>
      <h1>Additional Job Search Tools</h1>
      <div>
        We're continuously evaluating new features that can support job seekers
        throughout their entire journey, from discovering opportunities to
        preparing for interviews and making informed career decisions.
      </div>
      <div>As BGH Scout grows, we expect this section to grow with it.</div>
      <h1>Help Shape What's Next</h1>
      <div>
        BGH Scout is still in its early stages, and user feedback plays a major
        role in determining what comes next.
      </div>
      <div>
        If there's a feature you'd like to see, a challenge you're facing in
        your job search, or an idea that could make the platform more valuable,
        we'd love to hear from you.
      </div>
      <div>
        Many of the improvements we're building today started as suggestions
        from users just like you.
      </div>
      <h2>Have feedback or a feature request? We'd love to hear from you.</h2>
      <button onClick={handleFeedback}>Add Feedback</button>
    </S.Wrapper>
  );
};

export default RoadMap;
