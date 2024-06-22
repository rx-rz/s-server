import { Router } from "express";
import { roomHandlers } from "./room.handlers";
import { roomRoutes } from "../routes";

export const roomRouter = Router();

roomRouter.post(roomRoutes.create_rooms, roomHandlers.createRoom);
roomRouter.patch(roomRoutes.update_rooms, roomHandlers.updateRoom);
roomRouter.get(roomRoutes.list_rooms, roomHandlers.listRooms);
roomRouter.get(roomRoutes.room_details, roomHandlers.getRoomDetails);
roomRouter.delete(roomRoutes.delete_room, roomHandlers.deleteRoom);
roomRouter.get(roomRoutes.get_available_rooms, roomHandlers.getAvailableRooms);
