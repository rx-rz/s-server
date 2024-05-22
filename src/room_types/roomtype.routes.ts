import { Router } from "express";
import { roomTypeHandlers } from "./roomtype.handlers";

export const roomTypeRouter = Router();
roomTypeRouter.post("/createRoomType", roomTypeHandlers.createRoomType);
roomTypeRouter.delete("/deleteRoomType", roomTypeHandlers.deleteRoomType);
roomTypeRouter.get(
  "/getRoomTypes",
  roomTypeHandlers.getRoomTypes,
);
roomTypeRouter.patch("/updateRoomType", roomTypeHandlers.updateRoomType);
roomTypeRouter.get("/roomTypeDetails", roomTypeHandlers.getRoomTypeDetails);
roomTypeRouter.get("/roomsForRoomType", roomTypeHandlers.getRoomsForRoomType);
