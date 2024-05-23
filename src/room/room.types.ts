export type Room = {
  typeId: number;
  roomNo: number;
  isAvailable: boolean | null;
  noOfTimesBooked: number | null;
  createdAt: Date | null;
};
export type CreateRoomRequest = {
  typeId: number;
  noOfRooms: number;
};

export type UpdateRoomRequest = {
  roomNo: number;
  typeId?: number;
  isAvailable?: boolean;
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
