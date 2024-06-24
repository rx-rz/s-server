import { eq } from "drizzle-orm";
import { ctx } from "../ctx";

type CreateNotificationRequest = {
  type:
    | "booking_made"
    | "booking_cancelled"
    | "booking_updated"
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

const listNotifications = async ({ limit }: { limit: number }) => {
  const notifications = await ctx.db
    .select()
    .from(notificationTable)
    .limit(limit || 10);
  return notifications;
};

export const notificationRepository = {
  createNotification,
  deleteNotification,
  listNotifications
};
