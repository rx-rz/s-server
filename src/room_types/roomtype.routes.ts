import { Router } from "express";
import { roomTypeHandlers } from "./roomtype.handlers";
import { roomTypeRoutes } from "../routes";

export const roomTypeRouter = Router();
roomTypeRouter.post(
  roomTypeRoutes.create_room_type,

  roomTypeHandlers.createRoomType
);
roomTypeRouter.delete(
  roomTypeRoutes.delete_room_type,
  roomTypeHandlers.deleteRoomType
);
roomTypeRouter.get(
  roomTypeRoutes.get_room_types,
  roomTypeHandlers.getRoomTypes
);

roomTypeRouter.get(
  roomTypeRoutes.get_room_types_for_homepage,
  roomTypeHandlers.getRoomTypesForHomePage
);

roomTypeRouter.patch(
  roomTypeRoutes.update_room_type,
  roomTypeHandlers.updateRoomType
);
roomTypeRouter.get(
  roomTypeRoutes.room_type_details,
  roomTypeHandlers.getRoomTypeDetails
);
roomTypeRouter.get(
  roomTypeRoutes.rooms_for_room_type,
  roomTypeHandlers.getRoomsForRoomType
);
roomTypeRouter.patch(
  roomTypeRoutes.upload_room_type_images,
  roomTypeHandlers.uploadImagesForRoomType
);
