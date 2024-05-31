import { NotFoundError } from "../errors";
import { roomRepository } from "../room/room.repository";
import { roomTypeRepository } from "../room_types/roomtype.repository";

export const checkIfRoomsAreAvailable = async (roomNos: number[]) => {
  let unavailableRooms: number[] = [];
  const rooms = await roomRepository.fetchRoomsByProvidedRoomNumbers(roomNos);
  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].status !== "available") {
      unavailableRooms.push(rooms[i].roomNo);
    }
  }
  return unavailableRooms;
};

export const checkBookingPrice = async (roomNos: number[]) => {
  let price = 0;
  const rooms = await roomRepository.fetchRoomsByProvidedRoomNumbers(roomNos);
  for (let i = 0; i < rooms.length; i++) {
    price += Number(rooms[i].roomType.price);
  }
  return price;
};
