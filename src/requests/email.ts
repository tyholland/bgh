export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    await fetch("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject,
        text,
      }),
    });
  } catch {
    throw new Error(`Failed to send email`);
  }
};
