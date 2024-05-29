import { Handler } from "express";
import { initializePaystackTransaction } from "./payment.helpers";
import { paymentRepository } from "./payment.repository";
import { v } from "./payment.validators";
import { createHmac } from "crypto";
import { ENV_VARS } from "../../env";
import { customerRepository } from "../customer/customer.repository";
import { NotFoundError } from "../errors";
import { httpstatus } from "../ctx";

export const createPayment: Handler = async (req, res, next) => {
  try {
    const { amount, bookingId, email } = v.makePaymentValidator.parse(req.body);
    const customer = await customerRepository.getCustomerDetails(email);
    if (!customer)
      throw new NotFoundError(`Customer with email ${email} does not exist.`);
    const bookingExists = customer.bookings.find(
      (booking) => booking.id === bookingId
    );
    if (!bookingExists)
      throw new NotFoundError(
        `Customer has not made a booking with ID ${bookingId}`
      );
    const { data, noError } = await initializePaystackTransaction({
      amount: (Number(amount) * 100).toString(),
      email,
    });
    if (!noError || !data)
      throw new Error(
        `Error occured when processing payment. Please try again.`
      );
    const payment = await paymentRepository.createPayment({
      amount,
      bookingId,
      customerId: customer.id,
      reference: data.reference,
    });
    return res.json({
      payment: { ...payment, payment_url: data.authorization_url },
      isSucess: true,
    });
  } catch (err) {
    next(err);
  }
};

export const updatePaymentStatus: Handler = async (req, res, next) => {
  try {
    const hash = createHmac("sha512", ENV_VARS.PAYMENT_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");
    if (hash == req.headers["x-paystack-signature"]) {
      const body = req.body;
      if (body.event === "charge.success") {
        const payment = await paymentRepository.updatePaymentStatus({
          payedAt: body.data.paid_at,
          status: "confirmed",
          reference: body.data.reference,
        });
      }
    }
  } catch (err) {
    next(err);
  }
};

export const getPaymentDetails: Handler = async (req, res, next) => {
  try {
    const { id } = v.paymentIDValidator.parse(req.query);
    const paymentDetails = await paymentRepository.getPaymentDetails(id);
    if (!paymentDetails)
      throw new NotFoundError(`Payment with ID ${id} could not be found.`);
    return res.status(httpstatus.OK).json({ paymentDetails, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

export const paymentHandlers = {
  createPayment,
  updatePaymentStatus,
  getPaymentDetails,
};
