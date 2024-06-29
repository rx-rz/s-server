import { Handler } from "express";
import { initializePaystackTransaction } from "./payment.helpers";
import { paymentRepository } from "./payment.repository";
import { v } from "./payment.validators";
import { customerRepository } from "../customer/customer.repository";
import { DuplicateEntryError, NotFoundError } from "../errors";
import { httpstatus } from "../ctx";

export const createPayment: Handler = async (req, res, next) => {
  try {
    const { bookingId, email } = v.makePaymentValidator.parse(req.body);
    const customer =
      await customerRepository.getCustomerWithBookingAndPaymentDetails(email);
    if (!customer)
      throw new NotFoundError(`Customer with provided email does not exist.`);

    const existingPaymentForBooking = customer.payments.find(
      (payment) => payment.bookingId === bookingId
    );
    const existingBooking = customer.bookings.find(
      (booking) => booking.id === bookingId
    );
    if (!existingBooking)
      throw new NotFoundError(
        `Customer has not made a booking. Please make a booking first.`
      );

    if (
      existingPaymentForBooking &&
      existingPaymentForBooking.status === "pending"
    )
      throw new DuplicateEntryError(
        `A payment is already ${existingPaymentForBooking.status} for this booking.`
      );

    const { data, noError } = await initializePaystackTransaction({
      amount: (Number(existingBooking.amount) * 100).toString(),
      email,
    });
    if (!noError || !data)
      throw new Error(
        `Error occured when processing payment. Please try again.`
      );
    const payment = await paymentRepository.createPayment({
      amount: existingBooking.amount,
      bookingId,
      customerId: customer.id,
      reference: data.reference,
      roomNo: existingBooking.roomNo,
    });
    return res.json({
      payment: { ...payment, payment_url: data.authorization_url },
      isSuccess: true,
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
      throw new NotFoundError(
        `Payment with provided details could not be found.`
      );
    return res.status(httpstatus.OK).json({ paymentDetails, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

export const paymentHandlers = {
  createPayment,
  getPaymentDetails,
};
