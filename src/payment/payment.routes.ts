import { Router } from "express";
import { paymentHandlers } from "./payment.handlers";

export const paymentRouter = Router();
paymentRouter.post("/createPayment", paymentHandlers.createPayment);
//paystack requires a post endpoint for payment status update webhooks
paymentRouter.post("/updatePaymentStatus", paymentHandlers.updatePaymentStatus);
paymentRouter.get("/getPaymentDetails", paymentHandlers.getPaymentDetails);
