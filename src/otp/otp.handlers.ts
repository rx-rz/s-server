import { Handler } from "express";
import { v } from "./otp.validators";
import { otpRepository } from "./otp.repository";
import { httpstatus } from "../ctx";
import { NotFoundError } from "../errors";
import { adminRepository } from "../admin";
import { sendOTPEmail } from "./otp.helpers";

const sendOTP: Handler = async (req, res, next) => {
  try {
    const { email } = v.createOTPValidator.parse(req.body);
    const user = await adminRepository.getAdminDetails(email);

    if (!user) {
      throw new NotFoundError("User does not exist.");
    }
    const otpDetails = await otpRepository.createOTP(email);
    //TODO: uncomment later lol
    if (otpDetails) {
      const response = await sendOTPEmail({
        otp: otpDetails.otp,
        name: `${user.firstName} ${user.lastName}`,
        subscriberMail: email,
      });
      if (response) {
        return res
          .status(httpstatus.CREATED)
          .send({ otpDetails, isSuccess: true });
      }
    }
  } catch (err) {
    next(err);
  }
};

const verifyOTP: Handler = async (req, res, next) => {
  try {
    const { email, otp } = v.verifyOTPValidator.parse(req.body);
    const dbOTP = await otpRepository.getOTP(email);
    if (dbOTP.expiresAt < Date.now()) {
      await otpRepository.deleteOTP(email);
      return res.status(httpstatus.GONE).send({
        message: `User OTP has expired. Please get another one`,
        isSuccess: false,
      });
    }

    if (dbOTP.otp === otp) {
      await Promise.all([
        otpRepository.deleteOTP(email),
        adminRepository.updateAdminDetails({
          email: email,
          isVerified: true,
        }),
      ]);
      return res.status(httpstatus.OK).send({
        message: `User has been verified.`,
        isSuccess: true,
      });
    } else {
      throw new NotFoundError("Incorrect OTP");
    }
  } catch (err) {
    next(err);
  }
};
export const otpHandlers = {
  sendOTP,
  verifyOTP,
};
