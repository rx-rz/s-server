import { Router } from "express";
import { paymentHandlers } from "./payment.handlers";

export const paymentRouter = Router();
paymentRouter.post("/createPayment", paymentHandlers.createPayment);
paymentRouter.get("/getPaymentDetails", paymentHandlers.getPaymentDetails);
