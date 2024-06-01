import { NotFoundError } from "../errors";
import { roomRepository } from "../room/room.repository";
import { roomTypeRepository } from "../room_types/roomtype.repository";

export const getNoOfDays = ({
  startDate,
  endDate,
}: {
  startDate: string;
  endDate: string;
}) => {
  const date1 = new Date(startDate);
  const date2 = new Date(endDate);
  const diffInMilliseconds = Math.abs(
    date2.getTime() - date1.getTime()
  );
  const diffInDays = Math.ceil(diffInMilliseconds / (1000 * 3600 * 24));
  return diffInDays;
};

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

export const checkBookingPrice = async (
  roomNos: number[],
  noOfDays: number
) => {
  let price = 0;
  const rooms = await roomRepository.fetchRoomsByProvidedRoomNumbers(roomNos);
  for (let i = 0; i < rooms.length; i++) {
    price += (Number(rooms[i].roomType.price) * noOfDays);
  }
  return price;
};
