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

export type RoomDetails = {
  createdAt: string | null;
  roomNo: number;
  typeId: number;
  status: "available" | "pending" | "booked" | null;
  noOfTimesBooked: number | null;
  roomType: {
    id: number;
    name: string;
    createdAt: string | null;
    description: string | null;
    rating: string;
    price: string;
    roomImageURLS: string[] | null;
    features: string[] | null;
    imageFileNames: string[] | null;
  };
};

export type RoomListObject = {
  createdAt: string | null;
  roomNo: number;
  typeId: number;
  status: "available" | "pending" | "booked" | null;
  noOfTimesBooked: number | null;
  name: string;
  price: string;
};

export type CreateRoomRequest = {
  typeId: number;
  noOfRooms: number;
};

export type UpdateRoomRequest = {
  roomNo: number;
  typeId?: number;
  status?: "available" | "pending" | "booked";
  noOfTimesBooked?: number;
};

export type Search = {
  key: keyof RoomListObject;
  value: number | string;
}[];

export type ListRoomRequest = {
  limit: number;
  pageNo: number;
  orderBy: keyof RoomListObject;
  searchBy?: Search;
  ascOrDesc: "asc" | "desc";
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
