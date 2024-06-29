import { Router } from "express";
import { customerHandlers } from "./customer.handlers";
import { customerRoutes } from "../routes";

export const customerRouter = Router();

customerRouter.post(
  customerRoutes.register_customer,
  customerHandlers.registerCustomer
);
customerRouter.post(
  customerRoutes.login_customer,
  customerHandlers.loginCustomer
);

customerRouter.get(
  customerRoutes.get_customer_details,
  customerHandlers.getCustomerDetails
);
customerRouter.get(
  customerRoutes.list_customers,
  customerHandlers.listCustomers
);
customerRouter.delete(
  customerRoutes.delete_customer,
  customerHandlers.deleteCustomer
);
customerRouter.patch(
  customerRoutes.update_customer,
  customerHandlers.updateCustomer
);
customerRouter.patch(
  customerRoutes.update_customer_email,
  customerHandlers.updateCustomerEmail
);
customerRouter.patch(
  customerRoutes.update_customer_refresh_token,
  customerHandlers.updateCustomerRefreshToken
);
customerRouter.patch(
  customerRoutes.update_customer_password,
  customerHandlers.updateCustomerPassword
);
