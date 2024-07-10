import { ctx } from "../ctx";
import { NotFoundError } from "../errors";
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

const createCustomer: Handler = async (req, res, next) => { 
  try {
    const body = v.registrationValidator.parse(req.body);
    const customer =await checkIfCustomerExists(body.email)
    if(customer){
      return res.status(httpstatus.OK).send({customer, isSuccess: true})
    }else{
      await customerRepository.createCustomer(body)
      return res.status(httpstatus.CREATED).send({ customer, isSuccess: true });
    }
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

export const customerHandlers = {
  createCustomer,
  listCustomers,
  deleteCustomer,
  getCustomerDetails,
};
