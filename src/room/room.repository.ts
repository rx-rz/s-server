import {
  SQLWrapper,
  and,
  asc,
  count,
  desc,
  eq,
  gte,
} from "drizzle-orm";
import { ctx } from "../ctx";
import { db } from "../db/db";
import { CreateRoomRequest, ListRoomRequest, Search, UpdateRoomRequest } from "../types/room.types";

const roomTable = ctx.schema.room;
const roomTypeTable = ctx.schema.roomType;
const bookingTable = ctx.schema.booking;

const roomValues = {
  typeId: roomTable.typeId,
  roomNo: roomTable.roomNo,
  status: roomTable.status,
  noOfTimesBooked: roomTable.noOfTimesBooked,
  createdAt: roomTable.createdAt,
};

const roomListValues = {
  typeId: roomTable.typeId,
  roomNo: roomTable.roomNo,
  status: roomTable.status,
  noOfTimesBooked: roomTable.noOfTimesBooked,
  createdAt: roomTable.createdAt,
  name: roomTypeTable.name,
  price: roomTypeTable.price,
  description: roomTypeTable.description
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
      return `A total of ${request.noOfRooms} have been created.`;
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
      bookings: true,
      roomType: true,
    },
  });
  return roomDetails;
};

const updateRoom = async (request: UpdateRoomRequest) => {
  await getRoomDetails(request.roomNo);
  const [roomUpdated] = await ctx.db
    .update(roomTable)
    .set(request)
    .where(eq(roomTable.roomNo, request.roomNo))
    .returning(roomValues);
  return roomUpdated;
};

const buildRoomListSearchQuery = (search: Search) => {
  const filterQueries: SQLWrapper[] = [];
  for (const { key, value } of search) {
    switch (key) {
      case "createdAt":
        filterQueries.push(gte(roomTable.createdAt, value.toString()));
        break;
      case "status":
        filterQueries.push(
          eq(
            roomTable.status,
            value.toString() as "available" | "pending" | "booked"
          )
        );
        break;
      case "name":
        filterQueries.push(eq(roomTypeTable.name, value.toString()));
        break;
      case "price":
        filterQueries.push(eq(roomTypeTable.price, value.toString()));
        break;
      default:
        filterQueries.push(eq(roomTable[key], Number(value)));
    }
  }

  return and(...filterQueries);
};

const listRooms = async ({
  limit,
  pageNo,
  orderBy,
  searchBy,
  ascOrDesc,
}: ListRoomRequest) => {
  let query;
  
  query = ctx.db
    .select(roomListValues)
    .from(roomTable)
    .leftJoin(roomTypeTable, eq(roomTypeTable.id, roomTable.typeId));

  if (searchBy) {
    const filterCondition = buildRoomListSearchQuery(searchBy);
    if (filterCondition) {
      query = query.where(filterCondition);
    }
  }

  if (orderBy) {
    const orderColumn =
      orderBy === "name" || orderBy === "price"
        ? roomTypeTable[orderBy]
        : roomTable[orderBy];
    query = query.orderBy(
      ascOrDesc === "asc" ? asc(orderColumn) : desc(orderColumn)
    );
  }
  const noOfRooms = (await query).length;
  const rooms = await query.limit(limit).offset((pageNo - 1) * limit);
  return { noOfRooms, rooms };
};

const getAvailableRooms = async () => {
  const rooms = await ctx.db
    .selectDistinctOn([roomTable.typeId], roomListValues)
    .from(roomTable)
    .leftJoin(roomTypeTable, eq(roomTable.typeId, roomTypeTable.id))
    .where(eq(roomTable.status, "available"));
  return rooms;
};

const getNoOfAvailableRooms = async () => {
  const [rooms] = await ctx.db
    .select({ count: count() })
    .from(roomTable)
    .where(eq(roomTable.status, "available"));
  return rooms.count;
};

const deleteRoom = async (roomNo: number) => {
  await getRoomDetails(roomNo);
  const [roomDeleted] = await ctx.db
    .delete(roomTable)
    .where(eq(roomTable.roomNo, roomNo))
    .returning(roomValues);
  return roomDeleted;
};

export const roomRepository = {
  createRoom,
  deleteRoom,
  updateRoom,
  listRooms,
  getRoomDetails,
  getNoOfAvailableRooms,
  getAvailableRooms,
};
