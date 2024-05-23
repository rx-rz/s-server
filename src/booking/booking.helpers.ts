import { NotFoundError } from "../errors";
import { roomRepository } from "../room/room.repository";

export const checkIfRoomsAreAvailable = async (roomNos: number[]) => {
  let unavailableRooms: number[] = [];
  const rooms = await roomRepository.fetchRoomsByProvidedRoomNumbers(roomNos);
  for (let i = 0; i < rooms.length; i++) {
    if (rooms[i].isAvailable === false) {
      unavailableRooms.push(rooms[i].roomNo);
    }
  }
  return unavailableRooms;
};
