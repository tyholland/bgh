"use client";

import { useAtomValue } from "jotai";
import * as S from "./signIn-modal.style";
import ModalComponent from "../modal/modal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { userAtom } from "@/caches/UserAtom";
import { subscriptionStatusAtom } from "@/caches/SubscriptionAtom";
import { hasActiveAccess } from "@/functions/subscription";
import { getStripeCheckoutUrl } from "@/functions/stripeCheckout";
import { trackEvent } from "@/functions/mixpanel";

interface SignInModalProps {
  openModal: boolean;
  setOpenModal: (val: boolean) => void;
}

const SignInModal = ({ openModal, setOpenModal }: SignInModalProps) => {
  const navigate = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const user = useAtomValue(userAtom);
  const subscriptionStatus = useAtomValue(subscriptionStatusAtom);

  const goToAuth = (path: "/sign-in" | "/sign-up") => {
    const query = searchParams.toString();
    const redirectTo = `${pathname}${query ? `?${query}` : ""}`;

    setOpenModal(false);
    navigate.push(`${path}?redirect=${encodeURIComponent(redirectTo)}`);
  };

  const handleStartTrial = () => {
    if (!user) return;

    const checkoutUrl = getStripeCheckoutUrl(user.uid, user.email);
    if (!checkoutUrl) return;

    trackEvent(user, "Start Free Trial", { type: "button", from: "gate" });
    setOpenModal(false);
    window.location.href = checkoutUrl;
  };

  // Signed in, but has never started a trial/subscription (or it lapsed) —
  // the same gated actions (requireAccess()/hasActiveAccess() at every call
  // site below) open this modal for both this case and the signed-out one,
  // but there's no "Sign Up"/"Sign In" left to offer here.
  if (user && !hasActiveAccess(subscriptionStatus)) {
    return (
      <ModalComponent
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        title="Start Your Free Trial"
      >
        <S.ModalWrapper>
          <span>
            Start your free 7-day trial to unlock full access to BGH
            features.
          </span>
          <S.ModalBtn $single>
            <button className="submit" onClick={handleStartTrial}>
              Start Free Trial
            </button>
          </S.ModalBtn>
        </S.ModalWrapper>
      </ModalComponent>
    );
  }

  return (
    <ModalComponent
      isOpen={openModal}
      onClose={() => setOpenModal(false)}
      title={`Please Sign In`}
    >
      <S.ModalWrapper>
        <span>
          Sign up and get a free 7-day trial to unlock BGH features — already
          have an account? Sign in instead.
        </span>
        <S.ModalBtn>
          <button className="submit" onClick={() => goToAuth("/sign-up")}>
            Sign Up
          </button>
          <button onClick={() => goToAuth("/sign-in")}>Sign In</button>
        </S.ModalBtn>
      </S.ModalWrapper>
    </ModalComponent>
  );
};

export default SignInModal;
