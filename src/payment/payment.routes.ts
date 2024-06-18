import { Router } from "express";
import { paymentHandlers } from "./payment.handlers";
import { paymentRoutes } from "../routes";

export const paymentRouter = Router();
paymentRouter.post(paymentRoutes.create_payment, paymentHandlers.createPayment);
paymentRouter.get(
  paymentRoutes.get_payment_details,
  paymentHandlers.getPaymentDetails
);
