import { eq } from "drizzle-orm";
import { ctx } from "../ctx";
import {
  CreateRoomRequest,
  ListRoomRequest,
  UpdateRoomRequest,
} from "./room.types";
import { NotFoundError } from "../errors";
import { db } from "../db/db";

const roomTable = ctx.schema.room;
const roomTypeTable = ctx.schema.roomType;
const bookingTable = ctx.schema.booking;

const roomValues = {
  typeId: roomTable.typeId,
  roomNo: roomTable.roomNo,
  isAvailable: roomTable.isAvailable,
  noOfTimesBooked: roomTable.noOfTimesBooked,
  createdAt: roomTable.createdAt,
};

const createRoom = async (request: CreateRoomRequest) => {
  await db.transaction(async (tx) => {
    try {
      for (let i = 0; i < request.noOfRooms; i++) {
        await tx
          .insert(roomTable)
          .values({ ...request })
          .returning(roomValues);
      }
      return `A total of ${request.noOfRooms} with room type ${request.typeId} has been created.`;
    } catch (err) {
      await tx.rollback();
      return;
    }
  });
};

const getRoomDetails = async (roomNo: number, withDetails = false) => {
  if (withDetails) {
    const roomDetails = await ctx.db.query.room.findFirst({
      where: eq(roomTable.roomNo, roomNo),
      with: {
        bookings: true,
        roomType: true,
      }
    }); 
    console.log({roomDetails})
    if (!roomDetails)
      throw new NotFoundError(
        `Room with room number ${roomNo} could not be found.`
      );
    return roomDetails;
  } else {
    const [roomDetails] = await ctx.db
      .select(roomValues)
      .from(roomTable)
      .where(eq(roomTable.roomNo, roomNo));
    if (!roomDetails)
      throw new NotFoundError(
        `Room with room number ${roomNo} could not be found.`
      );
    return roomDetails;
  }
};

const deleteRoom = async (roomNo: number) => {
  await getRoomDetails(roomNo);
  const [deletedRoom] = await ctx.db
    .delete(roomTable)
    .where(eq(roomTable.roomNo, roomNo))
    .returning(roomValues);
  return deletedRoom;
};

const updateRoom = async (request: UpdateRoomRequest) => {
  await getRoomDetails(request.roomNo);
  const [updatedRoom] = await ctx.db
    .update(roomTable)
    .set(request)
    .where(eq(roomTable.roomNo, request.roomNo))
    .returning(roomValues);
  return updatedRoom;
};

const listRooms = async (request: ListRoomRequest) => {
  const rooms = await ctx.db
    .select({ ...roomValues })
    .from(roomTable)
    // .where(and(eq(roomTable.isAvailable, request.isAvailable)))
    .limit(request.noOfEntries || 10)
    .offset((request.pageNo || 0) * 10);
  return rooms;
};

const getTotalNoOfRooms = async () => {
  const rooms = await ctx.db.select().from(roomTable);
  return rooms.length;
};

export const roomRepository = {
  createRoom,
  deleteRoom,
  updateRoom,
  listRooms,
  getRoomDetails,
  getTotalNoOfRooms,
};
