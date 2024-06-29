export type SendOTPResponse = {
  otpDetails: {
    otp: number;
    email: string;
    role: "admin" | "customer" | null;
    expiresAt: number;
  };
  isSuccess: boolean;
};

export type VerifyOTPResponse = {
  message: string;
  isSuccess: boolean;
};
