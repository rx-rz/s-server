export type CreateRoomResponse = {
  message: string;
  isSuccess: boolean;
};

export type Room = {
  typeId: number;
  roomNo: number;
  status: "available" | "pending" | "booked" | null;
  noOfTimesBooked: number | null;
  createdAt: string | null;
  name: string | null;
  price: string | null;
};

export type GetRoomDetailsResponse = {
  room: Room;
  isSuccess: boolean;
};

export type GetAvailableRoomsResponse = {
  availableRooms: Room[];
  isSuccess: boolean;
};

export type ListRoomsResponse = {
  rooms: {
    typeId: number;
    roomNo: number;
    status: "available" | "booked" | "pending" | null;
    noOfTimesBooked: number | null;
    createdAt: string | null;
    name: string | null;
    price: string | null;
  }[];
  maxPageNo: number;
  isSuccess: boolean;
};

export type UpdateRoomResponse = {
  roomUpdated: {
    createdAt: string | null;
    roomNo: number;
    typeId: number;
    status: "available" | "pending" | "booked" | null;
    noOfTimesBooked: number | null;
  };
  isSuccess: boolean;
};

export type DeleteRoomResponse = {
  roomDeleted: {
    createdAt: string | null;
    roomNo: number;
    typeId: number;
    status: "available" | "pending" | "booked" | null;
    noOfTimesBooked: number | null;
  };
  isSuccess: boolean;
};
