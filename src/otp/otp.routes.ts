import { Router } from "express";
import { otpHandlers } from "./otp.handlers";
import { otpRoutes } from "../routes";

export const otpRouter = Router();

otpRouter.get(otpRoutes.send_otp, otpHandlers.sendOTP);
otpRouter.post(otpRoutes.verify_otp, otpHandlers.verifyOTP);
