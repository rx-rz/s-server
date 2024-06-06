import { z } from "zod";

const roomCreationValidator = z.object({
  noOfRooms: z.coerce.number({
    required_error: "No of rooms must be provided",
  }),
  typeId: z.coerce.number({ required_error: "Room type must be provided" }),
});

const roomUpdateValidator = z.object({
  typeId: z.coerce.number({ required_error: "Room type must be provided" }).optional(),
  roomNo: z.coerce.number({ required_error: "Room number must be provided" }),
  status: z.enum(["pending", "booked", "available"]).default("pending").optional(),
});

const roomNoValidator = z.object({
  roomNo: z.coerce.number({ required_error: "Room number must be provided" }),
});

const listRoomValidator = z.object({
  roomNo: z.coerce.number().optional(),
  typeId: z.coerce.number().optional(),
  pageNo: z.coerce.number().optional(),
  noOfEntries: z.coerce.number().optional(),
  noOfTimesBooked: z.coerce.number().optional(),
  isAvailable: z.boolean().optional(),
  createdAt: z.string().optional(),
});
export const v = {
  roomCreationValidator,
  roomUpdateValidator,
  roomNoValidator,
  listRoomValidator,
};
