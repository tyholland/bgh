"use client";

import { jobAtom } from "@/caches/JobsAtom";
import { handleSearchParams } from "@/functions/search";
import { AllSearchData, CsvData } from "@/types";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import Papa from "papaparse";
import { trackError } from "@/functions/mixpanel";

const CronJob = () => {
  const lastRunRef = useRef("");
  const [jobData, setJobData] = useAtom(jobAtom);

  const runTask = async () => {
    if (!!jobData) {
      try {
        const res = await fetch(
          "https://docs.google.com/spreadsheets/d/e/2PACX-1vTWtRcbb_EAVdtXttu1a9auwcoh67J9kY92xsDf-zttSXKSrIq6olsZq5GI6gNgJ85119sgnpiVGNFy/pub?output=csv",
          {
            cache: "no-store",
          },
        );

        const csvText = await res.text();
        const parsedData = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });
        const searchableData: AllSearchData | null = {
          ...jobData,
          allData: parsedData.data as CsvData[],
        };
        const query = window.location.search;
        const params = new URLSearchParams(query);

        handleSearchParams(searchableData, params, setJobData);
      } catch (error: any) {
        const errorCode = error.code;
        const errorMessage = error.message;

        trackError("Cron Job", {
          code: errorCode,
          message: errorMessage,
        });
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      const hour = now.getHours(); // 0-23
      const minute = now.getMinutes();

      // Run only at xx:00
      if ([3, 9, 15, 21].includes(hour) && minute === 0) {
        // Prevent duplicate runs during the same minute
        const key = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${hour}`;

        if (lastRunRef.current !== key) {
          lastRunRef.current = key;

          runTask();
        }
      }
    }, 60 * 1000); // check every minute

    return () => clearInterval(interval);
  }, []);

  return null;
};

export default CronJob;
