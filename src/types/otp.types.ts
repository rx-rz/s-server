export type SendOTPRequest = {
  email: string;
};

export type SendOTPResponse = {
  message: string;
  isSuccess: boolean;
};

export type VerifyOTPRequest = {
  otp: number;
  email: string;
};

export type VerifyOTPResponse = {
  message: string;
  isSuccess: boolean;
};
