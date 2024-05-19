export type CreateRoomRequest = {
  typeId: number;
  noOfRooms: number;
};

export type UpdateRoomRequest = {
  roomNo: number;
  typeId: number;
};

export type ListRoomRequest = {
  roomNo?: number;
  typeId?: number;
  pageNo?: number;
  noOfEntries?: number;
  noOfTimesBooked?: number;
  isAvailable?: boolean;
  createdAt?: string;
};
