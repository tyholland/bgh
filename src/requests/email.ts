const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type ContactKind = "feedback" | "company-request";

interface ContactPayload {
  kind: ContactKind;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

/**
 * Hands the message to the BGH Scout API, which owns the recipient list,
 * validation, and rate limiting. The client never specifies who it's sent to.
 */
export const sendContactMessage = async (payload: ContactPayload) => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not set — cannot send message.");
  }

  const res = await fetch(`${API_BASE_URL}/v1/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Contact API responded with ${res.status}`);
  }
};
