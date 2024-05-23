import { Handler } from "express";
import { sendOTPEmail } from "./otp.helpers";
import { v } from "./otp.validators";
import { customerRepository } from "../customer/customer.repository";
import { otpRepository } from "./otp.repository";
import { httpstatus } from "../ctx";
import { NotFoundError } from "../errors";

const sendOTP: Handler = async (req, res, next) => {
  try {
    const { email } = v.createOTPValidator.parse(req.query);
    // const { firstName, lastName } = await customerRepository.getCustomerDetails(
    //   email
    // );
    const otpDetails = await otpRepository.createOTP(email);
    //TODO:uncomment later lol
    // if (otpDetails) {
    //   const response = await sendOTPEmail({
    //     otp: otpDetails.otp,
    //     name: `${firstName} ${lastName}`,
    //     subscriberMail: email,
    //   });
    //   if (response) {
    return res.status(201).send({ otpDetails, isSuccess: true });
    //   }
    // }
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
      await otpRepository.deleteOTP(email);
      await customerRepository.updateCustomer({
        email: email,
        isVerified: true,
      });
      return res.status(httpstatus.OK).send({
        message: `User with email ${email} has been verified.`,
        isSuccess: true,
      });
    } else {
      throw new NotFoundError("Could not fetch a user with this OTP");
    }
  } catch (err) {
    next(err);
  }
};
export const otpHandlers = {
  sendOTP,
  verifyOTP,
};
