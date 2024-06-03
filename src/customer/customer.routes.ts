import { Router } from "express";
import { customerHandlers } from "./customer.handlers";
import { verifyToken } from "../middleware/jwt-token";

export const customerRouter = Router();

customerRouter.post("/registerCustomer", customerHandlers.registerCustomer);
customerRouter.post("/loginCustomer", customerHandlers.loginCustomer);
customerRouter.get(
  "/listCustomers",
  // verifyToken,
  customerHandlers.listCustomers
);
customerRouter.delete(
  "/deleteCustomer",
  verifyToken,
  customerHandlers.deleteCustomer
);
customerRouter.patch(
  "/updateCustomer",
  verifyToken,
  customerHandlers.updateCustomer
);
customerRouter.patch(
  "/updateCustomerEmail",
  customerHandlers.updateCustomerEmail
);
customerRouter.patch(
  "/updateCustomerPassword",
  customerHandlers.updateCustomerPassword
);
