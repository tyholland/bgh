"use client";

import { useRouter } from "next/navigation";
import * as S from "./about.style";
import { trackEvent } from "@/functions/mixpanel";
import Link from "next/link";

const About = () => {
  const navigate = useRouter();

  const handleFeedback = () => {
    navigate.push("/contact");

    trackEvent("Feedback", {
      type: "button",
    });
  };

  return (
    <S.Wrapper>
      <h1>About BGH Scout</h1>
      <div>Built by Job Seekers. Designed to Help Job Seekers.</div>
      <div>
        BGH Scout stands for Beganski, Greene, and Holland — three professionals
        united by a shared belief that better visibility leads to better
        opportunities.
      </div>
      <div>BGH Scout started with a simple problem.</div>
      <div>
        In 2025, Chris Beganski was unexpectedly laid off and began his own job
        search. As he searched, he noticed something frustrating:
      </div>
      <div>
        The best opportunities often weren't the hardest to qualify for, but the
        hardest to find in time.
      </div>
      <div>
        The more Chris researched, the more he realized that timing and
        visibility play a huge role in the job search process. Finding the right
        role a few days earlier can mean the difference between being one of the
        first applicants and being one of hundreds.
      </div>
      <div>
        To solve that problem, Chris began building a tool that could identify
        newly posted opportunities directly from company career websites.
      </div>
      <div>
        What started as a personal resource quickly grew. More companies were
        added. More search capabilities were built. More people began using it
        and sharing feedback.
      </div>
      <div>
        Eventually, Chris shared the platform with Ben Greene and Ty Holland.
        Together, they saw an opportunity to turn a personal project into a
        resource that could help thousands of job seekers discover opportunities
        faster and more efficiently.
      </div>
      <div>
        Today, BGH Scout continues to grow with the same mission that inspired
        it from the beginning:
      </div>
      <div>Help people uncover opportunities they might otherwise miss.</div>
      <hr />
      <h1>What We Believe</h1>
      <div>We believe that visibility creates opportunity.</div>
      <div>
        BGH Scout is not designed to automate applications or replace
        networking.
      </div>
      <div>
        It exists to help people discover opportunities faster by bringing
        together job postings from company career websites into one searchable
        platform.
      </div>

      <div>
        Our goal is simple:
        <ul>
          <li>Help job seekers find opportunities sooner</li>
          <li>Help recruiters and career coaches uncover relevant openings</li>
          <li>
            Help people spend less time searching and more time pursuing the
            right opportunities
          </li>
        </ul>
      </div>
      <hr />
      <h1>Meet the Founders</h1>
      <h2>Chris Beganski</h2>
      <h3>Founder & Product Development</h3>
      <div>
        Chris created the technology behind BGH Scout after experiencing
        firsthand the challenges of a modern job search. What began as a
        personal solution evolved into the platform that powers BGH Scout today.
        He continues to lead platform development, data collection, search
        capabilities, and future enhancements.
      </div>
      <div>
        <Link
          href="https://www.linkedin.com/in/chris-beganski/"
          target="_blank"
        >
          LinkedIn Profile
        </Link>
      </div>
      <h2>Ben Greene</h2>
      <h3>Founder & Growth</h3>
      <div>
        Ben focuses on growth, partnerships, user feedback, and helping shape
        the long-term vision of BGH Scout. His background in sales and business
        development helps ensure the platform remains focused on creating value
        for job seekers and the broader hiring community.
      </div>
      <div>
        <Link
          href="https://www.linkedin.com/in/ben-greene-sales/"
          target="_blank"
        >
          LinkedIn Profile
        </Link>
      </div>
      <h2>Ty Holland</h2>
      <h3>Founder & Website Development</h3>
      <div>
        Ty leads website development, user experience, branding, and marketing
        initiatives. His expertise helps transform powerful technology into an
        intuitive platform that is accessible and useful for every user.
      </div>
      <div>
        <Link href="https://www.linkedin.com/in/taholland/" target="_blank">
          LinkedIn Profile
        </Link>
      </div>
      <hr />
      <h1>Looking Ahead</h1>
      <div>We're just getting started.</div>
      <div>
        As BGH Scout continues to grow, we will keep expanding company coverage,
        improving search capabilities, and developing features that help users
        discover opportunities more effectively.
      </div>
      <div>
        Everything we build will be guided by the same principle that started
        this project:
      </div>
      <div>Helping people find opportunities they might otherwise miss.</div>
    </S.Wrapper>
  );
};

export default About;
