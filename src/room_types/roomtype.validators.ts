import { z } from "zod";

const createRoomTypeValidator = z.object({
  name: z.string({ required_error: "Room Type value should be provided." }),
  price: z.coerce.string({ required_error: "Price should be provided" }),
});

const roomTypeNameValidator = z.object({
  name: z.string({ required_error: "Room Type value should be provided." }),
});

const updateRoomTypeValidator = z.object({
  newName: z.string({ required_error: "Room Type value should be provided." }).optional(),
  price: z.coerce
    .string({ required_error: "Price should be provided" })
    .optional(),
});

const updateRoomTypeImageURLs = z.object({
  urls: z.array(z.string()),
  imageFileNames: z.array(z.string()),
  name: z.string(),
});
export const v = {
  createRoomTypeValidator,
  roomTypeNameValidator,
  updateRoomTypeValidator,
  updateRoomTypeImageURLs,
};
