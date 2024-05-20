import { Router } from "express";
import { roomTypeHandlers } from "./roomtype.handlers";

export const roomTypeRouter = Router();
roomTypeRouter.post("/createRoomType", roomTypeHandlers.createRoomType);
roomTypeRouter.delete("/deleteRoomType", roomTypeHandlers.deleteRoomType);
roomTypeRouter.get(
  "/getPossibleRoomTypes",
  roomTypeHandlers.listPossibleRoomTypes
);
roomTypeRouter.patch("/updateRoomType", roomTypeHandlers.updateRoomType);
roomTypeRouter.patch(
  "/addRoomImageURLs",
  roomTypeHandlers.addRoomImageURLSToRoom
);
roomTypeRouter.get("/roomTypeDetails", roomTypeHandlers.getRoomTypeDetails);
