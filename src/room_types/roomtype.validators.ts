import { z } from "zod";

const createRoomTypeValidator = z.object({
  name: z.string({ required_error: "Room Type value should be provided." }),
  price: z.coerce.string({ required_error: "Price should be provided" }),
  roomImageURLS: z.array(z.string()).optional(),
});

const roomTypeNameValidator = z.object({
  name: z.string({ required_error: "Room Type value should be provided." }),
});

const updateRoomTypeValidator = z.object({
  newName: z.string({ required_error: "Room Type value should be provided." }),
  price: z.coerce
    .string({ required_error: "Price should be provided" })
    .optional(),
  roomImageURLS: z.array(z.string()).optional(),
});
export const v = {
  createRoomTypeValidator,
  roomTypeNameValidator,
  updateRoomTypeValidator,
};
