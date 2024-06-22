import { SQLWrapper, and, asc, count, desc, eq, gte } from "drizzle-orm";
import { ctx } from "../ctx";
import {
  CreateRoomRequest,
  ListRoomParams,
  Search,
  UpdateRoomRequest,
} from "./room.types";
import { db } from "../db/db";

const roomTable = ctx.schema.room;
const roomTypeTable = ctx.schema.roomType;

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

const roomListSearch = (search: Search) => {
  let filterQueries: SQLWrapper[] = [];
  for (let i of search) {
    switch (i.key) {
      case "createdAt":
        filterQueries.push(gte(roomTable.createdAt, i.value.toString()));
      case "status":
        filterQueries.push(eq(roomTable.status, "available"));
      default:
        if (i.key !== "price" && i.key !== "name") {
          filterQueries.push(eq(roomTable[i.key], Number(i.value)));
        }
        if (i.key === "price" || i.key === "name") {
          switch (i.key) {
            case "name":
              filterQueries.push(eq(roomTypeTable.name, i.value.toString()));
            case "price":
              filterQueries.push(eq(roomTypeTable.price, i.value.toString()));
          }
        }
    }
  }
  return filterQueries;
};

const listRooms = async ({
  limit,
  pageNo,
  orderBy,
  searchBy,
  ascOrDesc,
}: ListRoomParams) => {
  let rooms;
  const dbQuery = ctx.db
    .select(roomListValues)
    .from(roomTable)
    .leftJoin(roomTypeTable, eq(roomTypeTable.id, roomTable.typeId));
  if (searchBy) {
    let searchByQuery;
    const filterQueries = roomListSearch(searchBy);
    searchByQuery = dbQuery.where(and(...filterQueries));
    rooms = searchByQuery;
  }

  if (orderBy && rooms) {
    let orderByQuery;
    if (orderBy !== "name" && orderBy !== "price") {
      orderByQuery = rooms.orderBy(
        ascOrDesc === "asc"
          ? asc(roomTable[`${orderBy}`])
          : desc(roomTable[`${orderBy}`])
      );
      rooms = orderByQuery;
    } else {
      orderByQuery = rooms.orderBy(
        ascOrDesc === "asc"
          ? asc(roomTypeTable[`${orderBy}`])
          : desc(roomTypeTable[`${orderBy}`])
      );
      rooms = orderByQuery;
    }
  }
  rooms = (await rooms?.limit(limit).offset((pageNo - 1) * limit)) || [];
  return { rooms, noOfRooms: rooms.length };
};

const getAvailableRooms = async () => {
  const rooms = await ctx.db
    .selectDistinctOn([roomTable.typeId])
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
