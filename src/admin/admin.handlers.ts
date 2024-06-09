import { bookingRepository } from "../booking/booking.repository";
import { ctx } from "../ctx";
import { customerRepository } from "../customer/customer.repository";
import { NotFoundError } from "../errors";
import { generateAccessToken } from "../middleware/jwt-token";
import { paymentRepository } from "../payment/payment.repository";
import { roomRepository } from "../room/room.repository";
import { checkIfPasswordIsCorrect, hashUserPassword } from "./admin.helpers";
import { adminRepository } from "./admin.repository";
import { v } from "./admin.validators";
import { Handler } from "express";

const { httpstatus } = ctx;

const registerAdmin: Handler = async (req, res, next) => {
  try {
    const body = v.registrationValidator.parse(req.body);
    if (body.password) {
      body.password = hashUserPassword(body.password);
    }
    const admin = await adminRepository.register(body);
    return res.status(httpstatus.CREATED).send({ admin, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const loginAdmin: Handler = async (req, res, next) => {
  try {
    const { email, password } = v.loginValidator.parse(req.body);
    const passwordIsCorrect = await checkIfPasswordIsCorrect(password, email);
    if (!passwordIsCorrect) {
      throw new NotFoundError("User with provided credentials not found.");
    }
    const adminDetails = await adminRepository.getAdminDetails(email);
    // const token = generateAccessToken({
    //   email: adminDetails.email,
    //   id: adminDetails.id,
    //   role: "ADMIN",
    //   firstName: adminDetails.firstName,
    //   lastName: adminDetails.lastName,

    // });
    return res.status(httpstatus.OK).send({ adminDetails, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const deleteAdmin: Handler = async (req, res, next) => {
  try {
    const { email } = v.deletionValidator.parse(req.query);
    const adminExists = await adminRepository.getAdminDetails(email);
    if (adminExists) {
      const deletedAdmin = await adminRepository.deleteAdmin(email);
      if (deletedAdmin) {
        return res
          .status(httpstatus.OK)
          .send({ deletedAdmin, isSuccess: true });
      }
    }
  } catch (err) {
    next(err);
  }
};

const updateAdmin: Handler = async (req, res, next) => {
  try {
    const body = v.updateValidator.parse(req.body);
    const adminExists = await adminRepository.getAdminDetails(body.email);
    if (adminExists) {
      const updatedAdmin = await adminRepository.updateAdminDetails(body);
      return res.status(httpstatus.OK).send({ updatedAdmin, isSuccess: true });
    }
  } catch (err) {
    next(err);
  }
};

const updateAdminEmail: Handler = async (req, res, next) => {
  try {
    const body = v.updateEmailValidator.parse(req.body);
    const adminExists = await adminRepository.getAdminDetails(body.email);
    if (adminExists) {
      const passwordIsCorrect = await checkIfPasswordIsCorrect(
        body.password,
        body.email
      );
      if (!passwordIsCorrect) {
        throw new NotFoundError(
          `User with the provided credentials could not be found.`
        );
      }
      const updatedAdmin = await adminRepository.changeAdminEmail(body);
      return res.status(httpstatus.OK).send({ updatedAdmin, isSuccess: true });
    }
  } catch (err) {
    next(err);
  }
};

const updateAdminPassword: Handler = async (req, res, next) => {
  try {
    const body = v.updatePasswordValidator.parse(req.body);
    const adminExists = await adminRepository.getAdminDetails(body.email);
    if (adminExists) {
      const passwordIsCorrect = await checkIfPasswordIsCorrect(
        body.currentPassword,
        body.email
      );
      if (!passwordIsCorrect) {
        throw new NotFoundError(
          `User with the provided credentials could not be found.`
        );
      }
      const newPassword = hashUserPassword(body.newPassword);
      const updatedAdmin = await adminRepository.changeAdminPassword({
        email: body.email,
        newPassword,
      });
      return res.status(httpstatus.OK).send({ updatedAdmin, isSuccess: true });
    }
  } catch (err) {
    next(err);
  }
};

const getAdminDashboardOverviewDetails: Handler = async (req, res, next) => {
  try {
    const bookingsPerMonth =
      await bookingRepository.getBookingsForAdminDashboard();
    const lastFiveCustomers = await customerRepository.getLastFiveCustomers();
    const lastFivePayments = await paymentRepository.getLastFivePayments();
    const totalProfit = await paymentRepository.getTotalProfit();
    const noOfAvailableRooms = await roomRepository.getNoOfAvailableRooms();
    return res.status(httpstatus.OK).json({
      bookingsPerMonth,
      lastFiveCustomers,
      lastFivePayments,
      noOfAvailableRooms,
      totalProfit,
    });
  } catch (err) {
    next(err);
  }
};

export const adminHandlers = {
  registerAdmin,
  deleteAdmin,
  updateAdmin,
  updateAdminEmail,
  updateAdminPassword,
  getAdminDashboardOverviewDetails,
  loginAdmin,
};
