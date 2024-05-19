import { Handler } from "express";
import { v } from "./booking.validators";
import { bookingRepository } from "./booking.repository";
import { httpstatus } from "../ctx";

const createBooking: Handler = async (req, res, next) => {
  try {
    const bookingRequest = v.createBookingValidator.parse(req.body);
    const booking = await bookingRepository.createBooking(bookingRequest);
    return res.status(httpstatus.CREATED).json({ booking, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const updateBooking: Handler = async (req, res, next) => {
  try {
    const bookingRequest = v.updateBookingValidator.parse(req.body);
    const updatedBooking = await bookingRepository.updateBooking(
      bookingRequest
    );
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
    const deletedBooking = await bookingRepository.deleteBooking(id);
    return res.status(httpstatus.OK).json({ deletedBooking, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const getBookingDetails: Handler = async (req, res, next) => {
  try {
    const { id } = v.bookingIDValidator.parse(req.query);
    const booking = await bookingRepository.getBookingDetails(id);
    return res.status(httpstatus.OK).json({ booking, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const listBookings: Handler = async (req, res, next) => {
  try {
    const bookings = await bookingRepository.listBookings();
    return res.status(httpstatus.OK).json({bookings, isSuccess: true});
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
};
