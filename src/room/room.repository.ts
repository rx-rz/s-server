import {
  SQLWrapper,
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  like,
  sql,
} from "drizzle-orm";
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
  const getRoomDetails = await ctx.db.query.room.findFirst({
    where: eq(roomTable.roomNo, roomNo),
    with: {
      bookings: true,
      roomType: true,
    },
  });
  return getRoomDetails;
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
        break;
      case "status":
        filterQueries.push(
          eq(
            roomTable.status,
            i.value.toString() as "available" | "pending" | "booked"
          )
        );
        break;
      default:
        if (i.key !== "price" && i.key !== "name") {
          filterQueries.push(eq(roomTable[i.key], Number(i.value)));
          break;
        }
        if (i.key === "price" || i.key === "name") {
          switch (i.key) {
            case "name":
              filterQueries.push(eq(roomTypeTable.name, i.value.toString()));
              break;
            case "price":
              filterQueries.push(eq(roomTypeTable.price, i.value.toString()));
              break;
          }
        }
    }
  }
  return filterQueries;
};

const buildRoomListQuery = (search: Search) => {
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

// const listRooms = async ({
//   limit,
//   pageNo,
//   orderBy,
//   searchBy,
//   ascOrDesc,
// }: ListRoomParams) => {
//   let rooms;
//   let roomList = [];
//   const dbQuery = ctx.db
//     .select(roomListValues)
//     .from(roomTable)
//     .leftJoin(roomTypeTable, eq(roomTypeTable.id, roomTable.typeId));

//   if (searchBy) {
//     let searchByQuery;
//     const filterQueries = roomListSearch(searchBy);
//     searchByQuery = dbQuery.where(and(...filterQueries));
//     if (orderBy) {
//       if (orderBy !== "name" && orderBy !== "price") {
//         roomList = await searchByQuery;
//         rooms =
//           (await searchByQuery
//             .orderBy(
//               ascOrDesc === "asc"
//                 ? asc(roomTable[`${orderBy}`])
//                 : desc(roomTable[`${orderBy}`])
//             )
//             .limit(limit)
//             .offset((pageNo - 1) * limit)) || [];
//       } else {
//         roomList = await searchByQuery;
//         rooms =
//           (await searchByQuery
//             .orderBy(
//               ascOrDesc === "asc"
//                 ? asc(roomTypeTable[`${orderBy}`])
//                 : desc(roomTypeTable[`${orderBy}`])
//             )
//             .limit(limit)
//             .offset((pageNo - 1) * limit)) || [];
//       }
//     } else {
//       roomList = await searchByQuery;
//       rooms =
//         (await searchByQuery.limit(limit).offset((pageNo - 1) * limit)) || [];
//     }
//   } else {
//     roomList = await dbQuery;
//     rooms = (await dbQuery.limit(limit).offset((pageNo - 1) * limit)) || [];
//   }
//   return { rooms, noOfRooms: roomList.length };
// };

const listRooms = async ({
  limit,
  pageNo,
  orderBy,
  searchBy,
  ascOrDesc,
}: ListRoomParams) => {
  let query;
  query = ctx.db
    .select(roomListValues)
    .from(roomTable)
    .leftJoin(roomTypeTable, eq(roomTypeTable.id, roomTable.typeId));

  if (searchBy) {
    const filterCondition = buildRoomListQuery(searchBy);
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
