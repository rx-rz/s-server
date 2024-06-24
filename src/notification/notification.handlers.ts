import { Handler } from "express";
import { notificationRepository } from "./notification.repository";
import { httpstatus } from "../ctx";
import { v } from "./notification.validators";

const listNotifications: Handler = async (req, res, next) => {
  try {
    const notifications = await notificationRepository.listNotifications({
      limit: 10,
    });
    return res.status(httpstatus.OK).json({ notifications, isSucccess: true });
  } catch (err) {
    next(err);
  }
};

const deleteNotifications: Handler = async (req, res, next) => {
  try {
    const { id } = v.notificationIDValidator.parse(req.query);
    const notificationDeleted = await notificationRepository.deleteNotification(
      id
    );
    return res
      .status(httpstatus.OK)
      .json({ notificationDeleted, isSuccess: true });
  } catch (err) {
    next(err);
  }
};

export const notificationHandlers = {
  listNotifications,
  deleteNotifications,
};
