import { eq } from "drizzle-orm";
import { ctx } from "../ctx";

type CreateNotificationRequest = {
  type:
    | "booking_made"
    | "booking_failed"
    | "payment_made"
    | "payment_failed"
    | "room_available";
  associatedID: string;
};

const notificationTable = ctx.schema.notifications;
const notificationValues = {
  id: notificationTable.id,
  type: notificationTable.type,
  associatedID: notificationTable.associatedID,
};
const createNotification = async (request: CreateNotificationRequest) => {
  const [notification] = await ctx.db
    .insert(notificationTable)
    .values(request)
    .returning(notificationValues);
  return notification;
};

const deleteNotification = async (id: string) => {
  const deletedNotification = await ctx.db
    .delete(notificationTable)
    .where(eq(notificationTable.id, id));
  return deletedNotification;
};

export const notificationRepository = {
  createNotification,
  deleteNotification,
};
