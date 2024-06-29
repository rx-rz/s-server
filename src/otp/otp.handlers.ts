import { Handler } from "express";
import { v } from "./otp.validators";
import { customerRepository } from "../customer/customer.repository";
import { otpRepository } from "./otp.repository";
import { httpstatus } from "../ctx";
import { NotFoundError } from "../errors";
import { adminRepository } from "../admin";

const sendOTP: Handler = async (req, res, next) => {
  try {
    const { email, role } = v.createOTPValidator.parse(req.body);
    let user;
    if (role === "admin") {
      user = await adminRepository.getAdminDetails(email);
    } else {
      user = await customerRepository.getCustomerDetails(email);
    }
    if (!user) {
      throw new NotFoundError("User does not exist.");
    }
    console.log({user})
    const otpDetails = await otpRepository.createOTP(email, role)
    //TODO: uncomment later lol
    // if (otpDetails) {
    //   const response = await sendOTPEmail({
    //     otp: otpDetails.otp,
    //     name: `${firstName} ${lastName}`,
    //     subscriberMail: email,
    //   });
    //   if (response) {
    return res.status(httpstatus.CREATED).send({ otpDetails, isSuccess: true });
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
      await Promise.all([
        otpRepository.deleteOTP(email),
        dbOTP.role === "admin"
          ? adminRepository.updateAdminDetails({
              email: email,
              isVerified: true,
            })
          : customerRepository.updateCustomer({
              email: email,
              isVerified: true,
            }),
      ]);
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
