import { eq } from "drizzle-orm";
import { ctx } from "../ctx";
import {
  CreateRoomRequest,
  ListRoomRequest,
  Room,
  UpdateRoomRequest,
} from "./room.types";
import { db } from "../db/db";

const roomTable = ctx.schema.room;

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

const getRoomDetails = async (roomNo: number) => {
  const roomDetails = await ctx.db.query.room.findFirst({
    where: eq(roomTable.roomNo, roomNo),
    with: {
      roomsToBooking: true,
      roomType: true,
    },
  });
  return roomDetails;
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
  return rooms;
};

const deleteRoom = async (roomNo: number) => {
  await getRoomDetails(roomNo);
  const [deletedRoom] = await ctx.db
    .delete(roomTable)
    .where(eq(roomTable.roomNo, roomNo))
    .returning(roomValues);
  return deletedRoom;
};

const getTotalNoOfRooms = async () => {
  const rooms = await ctx.db.select().from(roomTable);
  return rooms.length;
};

const fetchRoomsByProvidedRoomNumbers = async (roomNos: number[]) => {
  let rooms: Room[] | null = [];
  await db.transaction(async (tx) => {
    try {
      for (let i = 0; i < roomNos.length; i++) {
        const [room] = await tx
          .select(roomValues)
          .from(roomTable)
          .where(eq(roomTable.roomNo, roomNos[i]));
        rooms.push(room);
      }
    } catch (err) {
      tx.rollback();
    }
  });
  return rooms;
};

export const roomRepository = {
  createRoom,
  deleteRoom,
  updateRoom,
  listRooms,
  getRoomDetails,
  getTotalNoOfRooms,
  fetchRoomsByProvidedRoomNumbers,
};
