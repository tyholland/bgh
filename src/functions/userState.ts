import { User } from "@/types";

export const getUserCreds = (
  user: User | null,
  setUser: (val: User) => void,
) => {
  const localUser = window.localStorage.getItem("bgh.user");

  if (!user && !!localUser) {
    const userData = JSON.parse(localUser);
    setUser(userData);
  }
};
