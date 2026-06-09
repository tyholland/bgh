export const defaultModalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#FFFAF1",
  borderRadius: "20px",
  boxShadow: 24,
  p: 4,
};

export const MediumModalStyle = {
  ...defaultModalStyle,
  width: 500,
};

export const LoginErrors = [
  {
    error: "auth/invalid-credential",
    value: "Your email and/or password is incorrect. Please try again.",
  },
  {
    error: "auth/email-already-in-use",
    value:
      "The email you entered already exists on BGH Scout. Please try again.",
  },
];
