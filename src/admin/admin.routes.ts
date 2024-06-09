import { Router } from "express";
import { adminHandlers } from "./admin.handlers";
import { adminRoutes } from "../routes";

export const adminRouter = Router();

adminRouter.post(adminRoutes.register_admin, adminHandlers.registerAdmin);
adminRouter.post(adminRoutes.login_admin, adminHandlers.loginAdmin);
adminRouter.delete(adminRoutes.delete_admin, adminHandlers.deleteAdmin);
adminRouter.patch(adminRoutes.update_admin, adminHandlers.updateAdmin);
adminRouter.patch(
  adminRoutes.update_admin_email,
  adminHandlers.updateAdminEmail
);
adminRouter.patch(
  adminRoutes.update_admin_password,
  adminHandlers.updateAdminPassword
);
adminRouter.get(
  "/getDashboardDetails",
  adminHandlers.getAdminDashboardOverviewDetails
);
