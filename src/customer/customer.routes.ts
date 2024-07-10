import { Router } from "express";
import { customerHandlers } from "./customer.handlers";
import { customerRoutes } from "../routes";

export const customerRouter = Router();

customerRouter.post(
  customerRoutes.create_customer,
  customerHandlers.createCustomer
);

customerRouter.get(
  customerRoutes.get_customer_details,
  customerHandlers.getCustomerDetails
);
// customerRouter.patch(
//   customerRoutes.update_customer,
//   customerHandlers.updateCustomer
// )
customerRouter.get(
  customerRoutes.list_customers,
  customerHandlers.listCustomers
);
customerRouter.delete(
  customerRoutes.delete_customer,
  customerHandlers.deleteCustomer
);
