export type RoomType = {
  id: number;
  name: string;
  description: string | null;
  rating: string;
  price: string;
  roomImageURLS: string[] | null;
  features: string[] | null;
  imageFileNames: string[] | null;
};

export type CreateRoomTypeResponse = {
  roomType: RoomType;
  isSuccess: boolean;
};

export type UpdateRoomTypeResponse = {
  updatedRoomType: RoomType;
  isSuccess: boolean;
};

export type GetRoomTypesResponse = {
  roomTypes: RoomType[];
  isSuccess: boolean;
};

export type GetRoomTypeDetailsResponse = {
  roomTypeDetails: RoomType;
};

export type GetRoomsForRoomTypeResponse = {
  id: number;
  name: string;
  createdAt: string | null;
  description: string | null;
  rating: string;
  price: string;
  roomImageURLS: string[] | null;
  features: string[] | null;
  imageFileNames: string[] | null;
  rooms: {
    roomNo: number;
    status: "available" | "booked" | "pending" | null;
    createdAt: string | null;
    typeId: number;
    noOfTimesBooked: number | null;
  }[];
};


export type DeleteRoomTypeResponse = {
  id: number;
  name: string;
  description: string | null;
  rating: string;
  price: string;
  roomImageURLS: string[] | null;
  features: string[] | null;
  imageFileNames: string[] | null;
}
