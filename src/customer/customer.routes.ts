import { Router } from "express";
import { customerHandlers } from "./customer.handlers";

export const customerRouter = Router();

customerRouter.post("/registerCustomer", customerHandlers.registerCustomer);
customerRouter.post("/loginCustomer", customerHandlers.loginCustomer);
customerRouter.get("/listCustomers", customerHandlers.listCustomers);
customerRouter.delete("/deleteCustomer", customerHandlers.deleteCustomer);
customerRouter.patch("/updateCustomer", customerHandlers.updateCustomer);
customerRouter.patch(
  "/updateCustomerEmail",
  customerHandlers.updateCustomerEmail
);
customerRouter.patch(
  "/updateCustomerPassword",
  customerHandlers.updateCustomerPassword
);
