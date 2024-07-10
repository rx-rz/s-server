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
import { checkIfPasswordIsCorrect, hashAValue } from "./admin.helpers";
import { adminRepository } from "./admin.repository";
import { v } from "./admin.validators";
import { Handler } from "express";

const { httpstatus } = ctx;

export async function checkIfAdminExists(email: string) {
  const existingAdmin = await adminRepository.getAdminDetails(email);
  if (!existingAdmin)
    throw new NotFoundError(`Admin with provided email does not exist.`);
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
      //set the password provided in the body to a hashed one
      body.password = hashAValue(body.password);
    }
    const refreshToken = hashAValue(generateRefreshToken(body.email));
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
      firstName: existingAdmin.firstName,
      lastName: existingAdmin.lastName,
      isVerified: existingAdmin.isVerified,
    });

    const newRefreshToken = hashAValue(generateRefreshToken(email));
    // rotate refresh token
    await adminRepository.updateRefreshToken(email, newRefreshToken);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: ENV_VARS.NODE_ENV === "production" ? true : false,
      path: "/",
      maxAge: 10 * 24 * 60 * 60 * 1000,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: ENV_VARS.NODE_ENV === "production" ? true : false,
      path: "/",
      maxAge: 10 * 60 * 1000,
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
    const adminDeleted = await adminRepository.deleteAdmin(existingAdmin.email);
    if (adminDeleted) {
      return res.status(httpstatus.OK).send({ adminDeleted, isSuccess: true });
    }
  } catch (err) {
    next(err);
  }
};

const listAdmins: Handler = async (req, res, next) => {
  try {
    const admins = await adminRepository.listAdmins();
    return res.status(httpstatus.OK).json({ admins, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const updateAdmin: Handler = async (req, res, next) => {
  try {
    const body = v.updateValidator.parse(req.body);
    await checkIfAdminExists(body.email);
    const adminUpdated = await adminRepository.updateAdminDetails(body);
    return res.status(httpstatus.OK).send({ adminUpdated, isSuccess: true });
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
    const adminUpdated = await adminRepository.updateAdminEmail(body);
    return res.status(httpstatus.OK).send({ adminUpdated, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const updateAdminRefreshToken: Handler = async (req, res, next) => {
  const refreshToken = req.headers["cookie"];
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
    return res.status(httpstatus.OK).json({ isSuccess: true });
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
    const newPasswordHash = hashAValue(body.newPassword);
    const adminUpdated = await adminRepository.updateAdminPassword({
      email: body.email,
      newPassword: newPasswordHash,
    });
    return res.status(httpstatus.OK).send({ adminUpdated, isSuccess: true });
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
      isSuccess: true,
    });
  } catch (err) {
    next(err);
  }
};

export const adminHandlers = {
  registerAdmin,
  deleteAdmin,
  updateAdmin,
  listAdmins,
  updateAdminEmail,
  updateAdminPassword,
  getAdminDashboardOverviewDetails,
  updateAdminRefreshToken,
  loginAdmin,
};
