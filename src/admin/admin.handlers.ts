import { ENV_VARS } from "../../env";
import { bookingRepository } from "../booking/booking.repository";
import { ctx } from "../ctx";
import { customerRepository } from "../customer/customer.repository";
import { DuplicateEntryError, NotFoundError } from "../errors";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../middleware/jwt-token";
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
        `Admin with provided email already exists.`
      );
    if (body.password) {
      body.password = hashUserPassword(body.password);
    }
    const refreshToken = generateRefreshToken(body.email);
    await adminRepository.register({ ...body, refreshToken });
    return res
      .status(httpstatus.CREATED)
      .send({ message: "Account created", isSuccess: true });
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
      isVerified: existingAdmin.isVerified,
    });
    const refreshToken = await adminRepository.getRefreshToken(email);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: ENV_VARS.NODE_ENV === "production" ? true : false,
    });
    return res.status(httpstatus.OK).send({ token, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const deleteAdmin: Handler = async (req, res, next) => {
  try {
    const { email } = v.emailValidator.parse(req.query);
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

const updateAdminRefreshToken: Handler = async (req, res, next) => {
  const { refreshToken } = req.cookies;
  const { email } = v.emailValidator.parse(req.body);
  try {
    if (!refreshToken) {
      return res
        .status(httpstatus.UNAUTHORIZED)
        .json({ message: "Refresh token required", isSuccess: false });
    }
    const admin = await checkIfAdminExists(email);
    const newRefreshToken = generateRefreshToken(email);
    await adminRepository.updateRefreshToken(admin.email, newRefreshToken);
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: ENV_VARS.NODE_ENV === "production" ? true : false,
    });
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
    const [
      bookingsPerMonth,
      lastFiveCustomers,
      lastFivePayments,
      totalProfit,
      noOfAvailableRooms,
    ] = await Promise.all([
      bookingRepository.getBookingsForAdminDashboard(),
      customerRepository.getLastFiveCustomers(),
      paymentRepository.getLastFivePayments(),
      paymentRepository.getTotalProfit(),
      roomRepository.getNoOfAvailableRooms(),
    ]);
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
  updateAdminRefreshToken,
  loginAdmin,
};
