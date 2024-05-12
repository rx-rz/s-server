import { ctx } from "../ctx";
import { NotFoundError } from "../errors";
import { generateAccessToken } from "../middleware/jwt-token";
import { checkIfPasswordIsCorrect, hashUserPassword } from "./customer.helpers";
import { customerRepository } from "./customer.repository";
import { v } from "./customer.validators";
import e, { Handler } from "express";

const { httpstatus } = ctx;

const registerCustomer: Handler = async (req, res, next) => {
  try {
    const body = v.registrationValidator.parse(req.body);
    if (body.password) {
      body.password = hashUserPassword(body.password);
    }
    const user = await customerRepository.register(body);
    return res.status(httpstatus.CREATED).send({ user, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const loginCustomer: Handler = async (req, res, next) => {
  try {
    const { email, password } = v.loginValidator.parse(req.body);
    const passwordIsCorrect = await checkIfPasswordIsCorrect(password, email);
    if (!passwordIsCorrect) {
      throw new NotFoundError("User with provided credentials not found.");
    }
    const customerDetails = await customerRepository.getCustomerDetails(email);
    const token = generateAccessToken({
      email: customerDetails.email,
      id: customerDetails.id,
      role: "CUSTOMER",
    });
    return res.status(httpstatus.OK).send({ customerDetails, token, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const listCustomers: Handler = async (req, res, next) => {
  try {
    const users = await customerRepository.listCustomer();
    return res.status(httpstatus.OK).send({ users, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

const deleteCustomer: Handler = async (req, res, next) => {
  try {
    const { email } = v.deletionValidator.parse(req.query);
    const customerExists = await customerRepository.getCustomerDetails(email);
    if (customerExists) {
      const deletedCustomer = await customerRepository.deleteCustomer({
        email,
      });
      if (deletedCustomer) {
        return res
          .status(httpstatus.OK)
          .send({ deletedCustomer, isSuccess: true });
      }
    }
  } catch (err) {
    next(err);
  }
};

const updateCustomer: Handler = async (req, res, next) => {
  try {
    const body = v.updateValidator.parse(req.body);
    const customerExists = await customerRepository.getCustomerDetails(
      body.email
    );
    if (customerExists) {
      const updatedCustomer = await customerRepository.updateCustomer(body);
      return res
        .status(httpstatus.OK)
        .send({ updatedCustomer, isSuccess: true });
    }
  } catch (err) {
    next(err);
  }
};

const updateCustomerEmail: Handler = async (req, res, next) => {
  try {
    const body = v.updateEmailValidator.parse(req.body);
    const customerExists = await customerRepository.getCustomerDetails(
      body.email
    );
    if (customerExists) {
      const passwordIsCorrect = await checkIfPasswordIsCorrect(
        body.password,
        body.email
      );
      if (!passwordIsCorrect) {
        throw new NotFoundError(
          `User with the provided credentials could not be found.`
        );
      }
      const updatedCustomer = await customerRepository.updateCustomerEmail(
        body
      );
      return res
        .status(httpstatus.OK)
        .send({ updatedCustomer, isSuccess: true });
    }
  } catch (err) {
    next(err);
  }
};

const updateCustomerPassword: Handler = async (req, res, next) => {
  try {
    const body = v.updatePasswordValidator.parse(req.body);
    const customerExists = await customerRepository.getCustomerDetails(
      body.email
    );
    if (customerExists) {
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
      const updatedCustomer = await customerRepository.updateCustomerPassword({
        ...body,
        newPassword,
      });
      return res
        .status(httpstatus.OK)
        .send({ updatedCustomer, isSuccess: true });
    }
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
