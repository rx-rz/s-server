import { eq } from "drizzle-orm";
import { ctx } from "../ctx";
import { CreateRoomTypeRequest, UpdateRoomTypeRequest } from "../types/roomtype.types";
const roomTypeTable = ctx.schema.roomType;

const roomTypeValues = {
  name: roomTypeTable.name,
  price: roomTypeTable.price,
  roomImageURLS: roomTypeTable.roomImageURLS,
  imageFileNames: roomTypeTable.imageFileNames,
  id: roomTypeTable.id,
  features: roomTypeTable.features,
  description: roomTypeTable.description,
};

const createRoomType = async (request: CreateRoomTypeRequest) => {
  const [roomType] = await ctx.db
    .insert(roomTypeTable)
    .values(request)
    .returning(roomTypeValues);
  return roomType;
};

const getRoomTypeDetails = async (name: string) => {
  const [getRoomDetails] = await ctx.db
    .select(roomTypeValues)
    .from(roomTypeTable)
    .where(eq(roomTypeTable.name, name));
  return getRoomDetails;
};

const getRoomTypeDetailsByID = async (id: number) => {
  const [getRoomDetails] = await ctx.db
    .select(roomTypeValues)
    .from(roomTypeTable)
    .where(eq(roomTypeTable.id, id));
  return getRoomDetails;
};

const deleteRoomType = async (name: string) => {
  const [roomTypeDeleted] = await ctx.db
    .delete(roomTypeTable)
    .where(eq(roomTypeTable.name, name))
    .returning(roomTypeValues);
  return roomTypeDeleted;
};

const updateRoomType = async (request: UpdateRoomTypeRequest) => {
  const { currentName, ...values } = request;
  const [roomTypeUpdated] = await ctx.db
    .update(roomTypeTable)
    .set(values)
    .where(eq(roomTypeTable.name, currentName))
    .returning(roomTypeValues);
  return roomTypeUpdated;
};

const getRoomTypes = async () => {
  const roomTypes = await ctx.db.select(roomTypeValues).from(roomTypeTable);
  return roomTypes;
};

const getRoomTypesForHomePage = async () => {
  const roomTypes = await ctx.db.select(roomTypeValues).from(roomTypeTable).limit(4);
  return roomTypes;
}

const getRoomsForRoomType = async (name: string) => {
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
  getRoomTypesForHomePage,
  deleteRoomType,
  getRoomTypeDetails,
  getRoomTypeDetailsByID,
  createRoomType,
  getRoomTypes,
  getRoomsForRoomType,
};
