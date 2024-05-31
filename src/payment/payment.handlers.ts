import { Handler } from "express";
import { initializePaystackTransaction } from "./payment.helpers";
import { paymentRepository } from "./payment.repository";
import { v } from "./payment.validators";
import { customerRepository } from "../customer/customer.repository";
import { NotFoundError } from "../errors";
import { httpstatus } from "../ctx";

export const createPayment: Handler = async (req, res, next) => {
  try {
    const { bookingId, email } = v.makePaymentValidator.parse(req.body);
    const customer = await customerRepository.getCustomerDetails(email);
    if (!customer)
      throw new NotFoundError(`Customer with email ${email} does not exist.`);
    const booking = customer.bookings.find(
      (booking) => booking.id === bookingId
    );
    if (!booking)
      throw new NotFoundError(
        `Customer has not made a booking with ID ${bookingId}`
      );
    const { data, noError } = await initializePaystackTransaction({
      amount: (Number(booking.amount) * 100).toString(),
      email,
    });
    if (!noError || !data)
      throw new Error(
        `Error occured when processing payment. Please try again.`
      );
    const payment = await paymentRepository.createPayment({
      amount: booking.amount,
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
  getPaymentDetails,
};
