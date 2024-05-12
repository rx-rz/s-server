import { Router } from "express";
import { adminHandlers } from "./admin.handlers";

export const adminRouter = Router();

adminRouter.post("/registerAdmin", adminHandlers.registerAdmin);
adminRouter.post("/loginAdmin", adminHandlers.loginAdmin);
adminRouter.delete("/deleteAdmin", adminHandlers.deleteAdmin);
adminRouter.patch("/updateAdmin", adminHandlers.updateAdmin);
adminRouter.patch("/updateAdminEmail", adminHandlers.updateAdminEmail);
adminRouter.patch("/updateAdminPassword", adminHandlers.updateAdminPassword);
