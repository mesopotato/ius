// components/CaptchaVerification.tsx

import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from "react";

interface CaptchaVerificationProps {
  onVerify: (token: string | null) => void;
}

export default function CaptchaVerification({ onVerify }: CaptchaVerificationProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  return (
    <div className="flex h-screen justify-center items-center bg-sky-100">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-teal-800 mb-4">
          Please verify that you are a human
        </h2>
        <ReCAPTCHA
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
          onChange={onVerify}
          ref={recaptchaRef}
        />
      </div>
    </div>
  );
}
