import { bookingRepository } from "../booking/booking.repository";
import { ctx } from "../ctx";
import { customerRepository } from "../customer/customer.repository";
import { DuplicateEntryError, NotFoundError } from "../errors";
import { generateAccessToken } from "../middleware/jwt-token";
import { paymentRepository } from "../payment/payment.repository";
import { roomRepository } from "../room/room.repository";
import { checkIfPasswordIsCorrect, hashUserPassword } from "./admin.helpers";
import { adminRepository } from "./admin.repository";
import { v } from "./admin.validators";
import { Handler } from "express";

const { httpstatus } = ctx;

async function checkIfAdminExists(email: string) {
  const existingAdmin = await adminRepository.getAdminDetails(email);
  if (!existingAdmin)
    throw new NotFoundError(`Admin with email ${email} does not exist.`);
  return existingAdmin;
}

const registerAdmin: Handler = async (req, res, next) => {
  try {
    const body = v.registrationValidator.parse(req.body);
    const existingAdmin = await adminRepository.getAdminDetails(body.email);
    if (existingAdmin)
      throw new DuplicateEntryError(
        `Admin with email ${body.email} already exists.`
      );
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
    const existingAdmin = await checkIfAdminExists(email);

    const passwordIsCorrect = await checkIfPasswordIsCorrect(password, email);
    if (!passwordIsCorrect) {
      throw new NotFoundError("User with provided credentials not found.");
    }

    const token = generateAccessToken({
      email: existingAdmin.email,
      id: existingAdmin.id,
      role: "ADMIN",
      firstName: existingAdmin.firstName,
      lastName: existingAdmin.lastName,
      hasCreatedPasswordForAccount: true,
      is_verified: true,
    });
    return res.status(httpstatus.OK).send({ token, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const deleteAdmin: Handler = async (req, res, next) => {
  try {
    const { email } = v.deletionValidator.parse(req.query);
    const existingAdmin = await checkIfAdminExists(email);
    const deletedAdmin = await adminRepository.deleteAdmin(existingAdmin.email);
    if (deletedAdmin) {
      return res.status(httpstatus.OK).send({ deletedAdmin, isSuccess: true });
    }
  } catch (err) {
    next(err);
  }
};

const updateAdmin: Handler = async (req, res, next) => {
  try {
    const body = v.updateValidator.parse(req.body);
    await checkIfAdminExists(body.email);
    const updatedAdmin = await adminRepository.updateAdminDetails(body);
    return res.status(httpstatus.OK).send({ updatedAdmin, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const updateAdminEmail: Handler = async (req, res, next) => {
  try {
    const body = v.updateEmailValidator.parse(req.body);
    await checkIfAdminExists(body.email);
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
  } catch (err) {
    next(err);
  }
};

const updateAdminPassword: Handler = async (req, res, next) => {
  try {
    const body = v.updatePasswordValidator.parse(req.body);
    await checkIfAdminExists(body.email);
    const passwordIsCorrect = await checkIfPasswordIsCorrect(
      body.currentPassword,
      body.email
    );
    if (!passwordIsCorrect) {
      throw new NotFoundError(
        `User with the provided credentials could not be found.`
      );
    }
    const newPasswordHash = hashUserPassword(body.newPassword);
    const updatedAdmin = await adminRepository.changeAdminPassword({
      email: body.email,
      newPassword: newPasswordHash,
    });
    return res.status(httpstatus.OK).send({ updatedAdmin, isSuccess: true });
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
