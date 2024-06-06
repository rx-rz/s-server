import { z } from "zod";

const roomCreationValidator = z.object({
  noOfRooms: z.coerce.number({
    required_error: "No of rooms must be provided",
  }),
  typeId: z.coerce.number({ required_error: "Room type must be provided" }),
});

const roomUpdateValidator = z.object({
  typeId: z.coerce
    .number({ required_error: "Room type must be provided" })
    .optional(),
  roomNo: z.coerce.number({ required_error: "Room number must be provided" }),
  status: z
    .enum(["pending", "booked", "available"])
    .default("pending")
    .optional(),
});

const roomNoValidator = z.object({
  roomNo: z.coerce.number({ required_error: "Room number must be provided" }),
});

const listRoomValidator = z.object({
  pageNo: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
  searchBy: z
    .array(
      z.object({
        key: z.enum([
          "createdAt",
          "roomNo",
          "typeId",
          "status",
          "noOfTimesBooked",
          "name",
          "price",
        ]),
        value: z.union([z.number(), z.string()]),
      })
    )
    .optional(),
  orderBy: z
    .enum([
      "createdAt",
      "roomNo",
      "typeId",
      "status",
      "noOfTimesBooked",
      "name",
      "price",
    ])
    .default("roomNo"),
  ascOrDesc: z.enum(["asc", "desc"]).default("asc"),
});
export const v = {
  roomCreationValidator,
  roomUpdateValidator,
  roomNoValidator,
  listRoomValidator,
};
