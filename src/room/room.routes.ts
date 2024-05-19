import { Router } from "express";
import { roomHandlers } from "./room.handlers";

export const roomRouter = Router();
roomRouter.post("/createRooms", roomHandlers.createRoom);
roomRouter.patch("/updateRoom", roomHandlers.updateRoom);
roomRouter.get("/listRooms", roomHandlers.listRooms);
roomRouter.get("/roomDetails", roomHandlers.getRoomDetails);
roomRouter.delete("/deleteRoom", roomHandlers.deleteRoom);
