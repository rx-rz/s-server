import { Handler } from "express";
import { v } from "./booking.validators";
import { bookingRepository } from "./booking.repository";
import { httpstatus } from "../ctx";
import { checkIfRoomIsAvailable, getNoOfDays } from "./booking.helpers";
import {
  DuplicateEntryError,
  InvalidInputError,
  NotFoundError,
} from "../errors";
import { createHmac } from "node:crypto";
import { ENV_VARS } from "../../env";
import { paymentRepository } from "../payment/payment.repository";
import { roomRepository } from "../room/room.repository";
import { initializePaystackTransaction } from "../payment/payment.helpers";

export async function checkIfBookingExists(id: string) {
  const booking = await bookingRepository.getBookingDetails(id);
  if (!booking) throw new NotFoundError(`Booking does not exist.`);
  return booking;
}

const createBooking: Handler = async (req, res, next) => {
  try {
    const { paymentCallbackUrl, ...bookingRequest } =
      v.createBookingValidator.parse(req.body);
    const room = await checkIfRoomIsAvailable(bookingRequest.roomNo);
    if (!room) {
      throw new DuplicateEntryError(`Room is already booked.`);
    }
    const noOfDays = getNoOfDays({
      startDate: bookingRequest.startDate,
      endDate: bookingRequest.endDate,
    });
    const bookingPrice = Number(room.roomType.price) * noOfDays;
    if (bookingPrice !== Number(bookingRequest.amount))
      throw new InvalidInputError(
        `Booking price is incorrect. The correct booking price is ${bookingPrice}`
      );
    const [bookingCreated] = await Promise.all([
      bookingRepository.createBooking(bookingRequest),
      roomRepository.updateRoom({
        roomNo: bookingRequest.roomNo,
        status: "pending",
      }),
    ]);
    const { data: paymentData } = await initializePaystackTransaction({
      amount: (Number(bookingCreated.amount) * 100).toString(),
      email: bookingRequest.customerEmail,
      callback_url: paymentCallbackUrl,
    });
    await paymentRepository.createPayment({
      amount: bookingRequest.amount,
      bookingId: bookingCreated.id,
      customerEmail: bookingRequest.customerEmail,
      reference: paymentData?.reference || "",
      roomNo: bookingCreated.roomNo,
    });
    return res.status(httpstatus.CREATED).json({
      bookingCreated,
      paymentUrl: paymentData?.authorization_url,
      paymentReference: paymentData?.reference,
      isSuccess: true,
    });
  } catch (err) {
    next(err);
  }
};

const updateBookingAndBookingPaymentStatus: Handler = async (
  req,
  res,
  next
) => {
  try {
    const hash = createHmac("sha512", ENV_VARS.PAYMENT_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");
    if (hash == req.headers["x-paystack-signature"]) {
      const body = req.body;
      const payment = await paymentRepository.getPaymentDetailsByReference(
        body.data.reference
      );
      if (!payment)
        throw new NotFoundError(
          `Payment with provided reference does not exist.`
        );
      const existingBooking = await checkIfBookingExists(payment.bookingId);
      const roomToBeBooked = await roomRepository.getRoomDetails(
        existingBooking.roomNo
      );
      if (body.event === "charge.success") {
        await Promise.all([
          bookingRepository.updateBooking({
            id: existingBooking.id,
            status: "active",
          }),
          roomRepository.updateRoom({
            roomNo: Number(existingBooking.roomNo),
            noOfTimesBooked: Number(roomToBeBooked?.noOfTimesBooked) + 1,
            status: "booked",
          }),
          paymentRepository.updatePayment({
            reference: body.data.reference,
            status: "confirmed",
          }),
        ]);
      } else {
        await Promise.all([
          bookingRepository.updateBooking({
            id: existingBooking.id,
            status: "cancelled",
          }),
          paymentRepository.updatePayment({
            reference: body.data.reference,
            status: "failed",
          }),
          roomRepository.updateRoom({
            roomNo: Number(existingBooking.roomNo),
            status: "available",
          }),
        ]);
      }
    }
  } catch (err) {
    next(err);
  }
};

const updateBooking: Handler = async (req, res, next) => {
  try {
    const body = v.updateBookingValidator.parse(req.body);
    await checkIfBookingExists(body.id);
    const bookingUpdated = await bookingRepository.updateBooking(body);
    return res
      .status(httpstatus.ACCEPTED)
      .json({ bookingUpdated, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const deleteBooking: Handler = async (req, res, next) => {
  try {
    const { id } = v.bookingIDValidator.parse(req.query);
    const existingBooking = await checkIfBookingExists(id);
    const [deletedBooking, roomUpdated] = await Promise.all([
      bookingRepository.deleteBooking(id),
      roomRepository.updateRoom({
        status: "available",
        roomNo: existingBooking.roomNo,
      }),
    ]);

    return res
      .status(httpstatus.OK)
      .json({ deletedBooking, roomUpdated, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const getBookingDetails: Handler = async (req, res, next) => {
  try {
    const { id } = v.bookingIDValidator.parse(req.query);
    const booking = await checkIfBookingExists(id);
    return res.status(httpstatus.OK).json({ booking, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const checkExpiredBookings: Handler = async (req, res, next) => {
  try {
    const bookings = await bookingRepository.getExpiredBookings();
    if (bookings) {
      await bookingRepository.updateBookingStatusesToDone(bookings);
    }
    return res.json({ bookings, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const listBookings: Handler = async (req, res, next) => {
  try {
    const queries = v.listBookingValidator.parse(req.query);
    const { bookings, noOfBookings } = await bookingRepository.listBookings(
      queries
    );
    const maxPageNo = Math.ceil(noOfBookings / queries.limit);
    return res
      .status(httpstatus.OK)
      .json({ bookings, maxPageNo, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

export const bookingHandlers = {
  createBooking,
  updateBooking,
  deleteBooking,
  getBookingDetails,
  listBookings,
  checkExpiredBookings,
  updateBookingAndBookingPaymentStatus,
};
