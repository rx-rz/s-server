import { Handler } from "express";
import { v } from "./otp.validators";
import { customerRepository } from "../customer/customer.repository";
import { otpRepository } from "./otp.repository";
import { httpstatus } from "../ctx";
import { NotFoundError } from "../errors";
import { adminRepository } from "../admin";

const sendOTP: Handler = async (req, res, next) => {
  try {
    const { email, role } = v.createOTPValidator.parse(req.query);
    let user;
    if (role === "admin") {
      user = await adminRepository.getAdminDetails(email);
      if (!user) {
        throw new NotFoundError(`Details provided for user does not exist.`);
      }
    } else {
      user = await customerRepository.getCustomerDetails(email);
      if (!user)
        throw new NotFoundError(`Details provided for user does not exist.`);
    }
    const otpDetails = await otpRepository.createOTP(email, role);
    //TODO: uncomment later lol
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
      if (dbOTP.role === "admin") {
        await adminRepository.updateAdminDetails({
          email: email,
          isVerified: true,
        });
        return res.status(httpstatus.OK).send({
          message: `User  has been verified.`,
          isSuccess: true,
        });
      }
      await customerRepository.updateCustomer({
        email: email,
        isVerified: true,
      });
      return res.status(httpstatus.OK).send({
        message: `User has been verified.`,
        isSuccess: true,
      });
    } else {
      throw new NotFoundError("Could not fetch user with provided details");
    }
  } catch (err) {
    next(err);
  }
};
export const otpHandlers = {
  sendOTP,
  verifyOTP,
};
