export type Room = {
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

export type ListRoomParams = {
  limit: number;
  pageNo: number;
  orderBy: keyof RoomListObject;
  searchBy?: Search;
  ascOrDesc: "asc" | "desc"
};