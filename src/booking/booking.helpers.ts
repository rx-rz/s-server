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
  const diffInMilliseconds = Math.abs(date2.getTime() - date1.getTime());
  const diffInDays = Math.ceil(diffInMilliseconds / (1000 * 3600 * 24));
  return diffInDays;
};

export const checkIfRoomIsAvailable = async (roomNo: number) => {
  const room = await roomRepository.getRoomDetails(roomNo);
  if (room && room.status !== "available") {
    return false;
  }
  return room;
};
