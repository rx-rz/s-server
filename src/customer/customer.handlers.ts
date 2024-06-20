import { generateRefreshToken } from "../admin/admin.helpers";
import { ctx } from "../ctx";
import { DuplicateEntryError, NotFoundError } from "../errors";
import { generateAccessToken } from "../middleware/jwt-token";
import { checkIfPasswordIsCorrect, hashUserPassword } from "./customer.helpers";
import { customerRepository } from "./customer.repository";
import { v } from "./customer.validators";
import { Handler } from "express";
const { httpstatus } = ctx;

async function checkIfCustomerExists(email: string) {
  const existingCustomer = await customerRepository.getCustomerDetails(email);
  if (!existingCustomer)
    throw new NotFoundError(`Customer with email ${email} does not exist.`);
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
        `Customer with email ${body.email} already exists.`
      );
    }
    const refreshToken = generateRefreshToken();
    await customerRepository.register({ ...body, refreshToken });
    return res
      .status(httpstatus.CREATED)
      .send({ message: "Account created.", isSuccess: true });
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
      is_verified: existingCustomer.isVerified,
      role: "CUSTOMER",
      hasCreatedPasswordForAccount:
        existingCustomer.hasCreatedPasswordForAccount,
      firstName: existingCustomer.firstName,
      lastName: existingCustomer.lastName,
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

const deleteCustomer: Handler = async (req, res, next) => {
  try {
    const { email } = v.emailValidator.parse(req.query);
    await checkIfCustomerExists(email);
    const deletedCustomer = await customerRepository.deleteCustomer({
      email,
    });
    return res.status(httpstatus.OK).send({ deletedCustomer, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const updateCustomer: Handler = async (req, res, next) => {
  try {
    const body = v.updateValidator.parse(req.body);
    await checkIfCustomerExists(body.email);
    const updatedCustomer = await customerRepository.updateCustomer(body);
    return res.status(httpstatus.OK).send({ updatedCustomer, isSuccess: true });
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
    const updatedCustomer = await customerRepository.updateCustomerEmail(body);
    return res.status(httpstatus.OK).send({ updatedCustomer, isSuccess: true });
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
    const updatedCustomer = await customerRepository.updateCustomerPassword({
      ...body,
      newPassword: newPasswordHash,
    });
    return res.status(httpstatus.OK).send({ updatedCustomer, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

export const customerHandlers = {
  registerCustomer,
  listCustomers,
  deleteCustomer,
  updateCustomer,
  updateCustomerEmail,
  updateCustomerPassword,
  loginCustomer,
};
