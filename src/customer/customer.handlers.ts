import { ENV_VARS } from "../../env";
import { ctx } from "../ctx";
import { DuplicateEntryError, NotFoundError } from "../errors";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../middleware/jwt-token";
import { checkIfPasswordIsCorrect, hashUserPassword } from "./customer.helpers";
import { customerRepository } from "./customer.repository";
import { v } from "./customer.validators";
import { Handler } from "express";
const { httpstatus } = ctx;

export async function checkIfCustomerExists(email: string) {
  const existingCustomer = await customerRepository.getCustomerDetails(email);
  if (!existingCustomer)
    throw new NotFoundError(`Customer with provided email does not exist.`);
  return existingCustomer;
}

const registerCustomer: Handler = async (req, res, next) => {
  try {
    const body = v.registrationValidator.parse(req.body);
    if (body.password) {
      body.password = hashUserPassword(body.password);
    }
    const customerDetails = await customerRepository.getCustomerDetails(
      body.email
    );
    if (customerDetails) {
      throw new DuplicateEntryError(
        `Customer with provided email already exists.`
      );
    }
    const refreshToken = generateRefreshToken(body.email);
    await customerRepository.register({ ...body, refreshToken });
    return res
      .status(httpstatus.CREATED)
      .send({ message: "Account created", isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const loginCustomer: Handler = async (req, res, next) => {
  try {
    const { email, password } = v.loginValidator.parse(req.body);
    const existingCustomer = await checkIfCustomerExists(email);
    const passwordIsCorrect = await checkIfPasswordIsCorrect(password, email);
    if (!passwordIsCorrect) {
      throw new NotFoundError("Incorrect email or password.");
    }
    const token = generateAccessToken({
      email: existingCustomer.email,
      id: existingCustomer.id,
      isVerified: existingCustomer.isVerified,
      role: "CUSTOMER",
      firstName: existingCustomer.firstName,
      lastName: existingCustomer.lastName,
    });
    const refreshToken = await customerRepository.getRefreshToken(email);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: ENV_VARS.NODE_ENV === "production" ? true : false,
    });
    return res.status(httpstatus.OK).send({ token, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const listCustomers: Handler = async (req, res, next) => {
  try {
    const queries = v.listCustomerValidator.parse(req.query);
    const { customers, noOfCustomers } = await customerRepository.listCustomer(
      queries
    );
    const maxPageNo = Math.ceil(noOfCustomers / queries.limit);
    return res
      .status(httpstatus.OK)
      .send({ customers, noOfCustomers, maxPageNo, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const getCustomerDetails: Handler = async (req, res, next) => {
  try {
    const { email } = v.emailValidator.parse(req.query);
    const customer =
      await customerRepository.getCustomerWithBookingAndPaymentDetails(email);
    return res.status(httpstatus.OK).json({ customer, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const deleteCustomer: Handler = async (req, res, next) => {
  try {
    const { email } = v.emailValidator.parse(req.query);
    await checkIfCustomerExists(email);
    const customerDeleted = await customerRepository.deleteCustomer(email);
    return res.status(httpstatus.OK).send({ customerDeleted, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const updateCustomer: Handler = async (req, res, next) => {
  try {
    const body = v.updateValidator.parse(req.body);
    await checkIfCustomerExists(body.email);
    const customerUpdated = await customerRepository.updateCustomer(body);
    return res.status(httpstatus.OK).send({ customerUpdated, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const updateCustomerRefreshToken: Handler = async (req, res, next) => {
  const refreshToken = req.headers["cookie"];
  const { email } = v.emailValidator.parse(req.body);
  try {
    if (!refreshToken) {
      return res
        .status(httpstatus.UNAUTHORIZED)
        .json({ message: "Refresh token required", isSuccess: false });
    }
    const customer = await checkIfCustomerExists(email);
    const newRefreshToken = generateRefreshToken(email);
    await customerRepository.updateRefreshToken({
      email: customer.email,
      refreshToken: newRefreshToken,
    });
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: ENV_VARS.NODE_ENV === "production" ? true : false,
    });
  } catch (err) {
    next(err);
  }
};

const updateCustomerEmail: Handler = async (req, res, next) => {
  try {
    const body = v.updateEmailValidator.parse(req.body);
    await checkIfCustomerExists(body.email);
    const passwordIsCorrect = await checkIfPasswordIsCorrect(
      body.password,
      body.email
    );
    if (!passwordIsCorrect) {
      throw new NotFoundError(
        `User with the provided credentials could not be found.`
      );
    }
    const customerUpdated = await customerRepository.updateCustomerEmail(body);
    return res.status(httpstatus.OK).send({ customerUpdated, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const updateCustomerPassword: Handler = async (req, res, next) => {
  try {
    const body = v.updatePasswordValidator.parse(req.body);

    await checkIfCustomerExists(body.email);
    const passwordIsCorrect = await checkIfPasswordIsCorrect(
      body.currentPassword,
      body.email
    );
    if (!passwordIsCorrect) {
      throw new NotFoundError(`Invalid email or password.`);
    }
    const newPasswordHash = hashUserPassword(body.newPassword);
    const customerUpdated = await customerRepository.updateCustomerPassword({
      ...body,
      newPassword: newPasswordHash,
    });
    return res.status(httpstatus.OK).send({ customerUpdated, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

export const customerHandlers = {
  registerCustomer,
  listCustomers,
  deleteCustomer,
  updateCustomerRefreshToken,
  updateCustomer,
  updateCustomerEmail,
  updateCustomerPassword,
  getCustomerDetails,
  loginCustomer,
};
