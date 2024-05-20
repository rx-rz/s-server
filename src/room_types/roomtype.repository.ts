import { eq } from "drizzle-orm";
import { ctx } from "../ctx";
import { DuplicateEntryError, NotFoundError } from "../errors";
import { CreateRoomTypeRequest, UpdateRoomTypeRequest } from "./roomtype.types";
const roomTypeTable = ctx.schema.roomType;

const roomTypeValues = {
  name: roomTypeTable.name,
  price: roomTypeTable.price,
  roomImageURLS: roomTypeTable.roomImageURLS,
  id: roomTypeTable.id,
  rating: roomTypeTable.rating,
};
const createRoomType = async (request: CreateRoomTypeRequest) => {
  const roomTypeExists = await getRoomTypeDetails(request.name, false);
  if (roomTypeExists)
    throw new DuplicateEntryError(
      `Room type with name ${request.name} already exists.`
    );
  const [roomType] = await ctx.db
    .insert(roomTypeTable)
    .values(request)
    .returning(roomTypeValues);
  return roomType;
};

const getRoomTypeDetails = async (name: string, isRequired = true) => {
  const [roomDetails] = await ctx.db
    .select(roomTypeValues)
    .from(roomTypeTable)
    .where(eq(roomTypeTable.name, name));
  if (isRequired && !roomDetails)
    throw new NotFoundError(
      `Room type with the particular name '${name}' does not exist.`
    );
  return roomDetails;
};

const deleteRoomType = async (name: string) => {
  await getRoomTypeDetails(name);
  const [deletedRoomType] = await ctx.db
    .delete(roomTypeTable)
    .where(eq(roomTypeTable.name, name))
    .returning(roomTypeValues);
  return deletedRoomType;
};

const updateRoomType = async (request: UpdateRoomTypeRequest) => {
  const { currentName, ...values } = request;
  const [updatedRoomType] = await ctx.db
    .update(roomTypeTable)
    .set(values)
    .where(eq(roomTypeTable.name, currentName))
    .returning(roomTypeValues);
  return updatedRoomType;
};

const getPossibleRoomTypes = async () => {
  const roomTypes = await ctx.db
    .selectDistinct({ name: roomTypeTable.name, id: roomTypeTable.id })
    .from(roomTypeTable);
  return roomTypes;
};

const getRoomsForRoomType = async (name: string) => {
  await getRoomTypeDetails(name);
  const roomtypeRooms = await ctx.db.query.roomType.findFirst({
    where: eq(roomTypeTable.name, name),
    with: {
      rooms: true,
    },
  });
  return roomtypeRooms;
};
export const roomTypeRepository = {
  updateRoomType,
  deleteRoomType,
  getRoomTypeDetails,
  createRoomType,
  getPossibleRoomTypes,
  getRoomsForRoomType,
};
