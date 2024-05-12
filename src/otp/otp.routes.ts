import { Router } from "express";
import { otpHandlers } from "./otp.handlers";

export const otpRouter = Router();

otpRouter.get("/sendOTP", otpHandlers.sendOTP);
otpRouter.post("/verifyOTP", otpHandlers.verifyOTP);
