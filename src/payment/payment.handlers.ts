import { Handler } from "express";
import { paymentRepository } from "./payment.repository";
import { v } from "./payment.validators";
import { NotFoundError } from "../errors";
import { httpstatus } from "../ctx";



export const getPaymentDetails: Handler = async (req, res, next) => {
  try {
    const { id } = v.paymentIDValidator.parse(req.query);
    const paymentDetails = await paymentRepository.getPaymentDetails(id);
    if (!paymentDetails)
      throw new NotFoundError(
        `Payment with provided details could not be found.`
      );
    return res.status(httpstatus.OK).json({ paymentDetails, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

export const paymentHandlers = {
  getPaymentDetails,
};
