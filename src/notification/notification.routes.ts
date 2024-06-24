import { Router } from "express";
import { notificationHandlers } from "./notification.handlers";
import { notificationRoutes } from "../routes";

export const notificationRouter = Router();
notificationRouter.get(
  notificationRoutes.list_notifications,
  notificationHandlers.listNotifications
);
notificationRouter.get(
  notificationRoutes.delete_notification,
  notificationHandlers.deleteNotifications
);
