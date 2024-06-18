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

async function checkIfBookingExists(id: string) {
  const booking = await bookingRepository.getBookingDetails(id);
  if (!booking)
    throw new NotFoundError(`Booking with ID ${id} does not exist.`);
  return booking;
}

const createBooking: Handler = async (req, res, next) => {
  try {
    const bookingRequest = v.createBookingValidator.parse(req.body);
    const room = await checkIfRoomIsAvailable(bookingRequest.roomNo);
    if (!room) {
      throw new DuplicateEntryError(
        `Room(s) with Room Number ${bookingRequest.roomNo} is already booked.`
      );
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
    const booking = await bookingRepository.createBooking(bookingRequest);
    await roomRepository.updateRoom({
      roomNo: bookingRequest.roomNo,
      status: "pending",
    });
    return res.status(httpstatus.CREATED).json({ ...booking, isSuccess: true });
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
      if (body.event === "charge.success") {
        const payment = await paymentRepository.getPaymentDetailsByReference(
          body.data.reference
        );
        if (!payment)
          throw new NotFoundError(
            `Payment with reference ${body.data.reference} does not exist.`
          );
        const existingBooking = await checkIfBookingExists(payment.bookingId);
        await Promise.all([
          bookingRepository.updateBooking({
            id: existingBooking.id,
            status: "active",
          }),
          roomRepository.updateRoom({
            roomNo: Number(existingBooking.roomNo),
            status: "booked",
          }),
          await paymentRepository.updatePayment({
            reference: body.data.reference,
            status: "confirmed",
          }),
        ]);
      }
      //find for charge failure? docs don't mention that
    }
  } catch (err) {
    next(err);
  }
};

const updateBooking: Handler = async (req, res, next) => {
  try {
    const body = v.updateBookingValidator.parse(req.body);
    await checkIfBookingExists(body.id);
    const updatedBooking = await bookingRepository.updateBooking(body);
    return res
      .status(httpstatus.ACCEPTED)
      .json({ updatedBooking, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const deleteBooking: Handler = async (req, res, next) => {
  try {
    const { id } = v.bookingIDValidator.parse(req.query);
    const existingBooking = await checkIfBookingExists(id);
    const deletedBooking = await bookingRepository.deleteBooking(id);
    await roomRepository.updateRoom({
      status: "available",
      roomNo: existingBooking.roomNo,
    });
    return res.status(httpstatus.OK).json({ deletedBooking, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const getBookingDetails: Handler = async (req, res, next) => {
  try {
    const { id } = v.bookingIDValidator.parse(req.query);
    const booking = await bookingRepository.getBookingDetails(id);
    if (!booking)
      throw new NotFoundError(`Booking with ID ${id} does not exist.`);
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
    return res.json({ bookings });
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
