export type RoomType = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  roomImageURLS: string[] | null;
  features: string[] | null;
  imageFileNames: string[] | null;
};
export type CreateRoomTypeRequest = {
  name: string;
  price: string;
  features: string[];
  description: string;
};

export type UpdateRoomTypeRequest = {
  currentName: string;
  name?: string;
  price?: string;
  description?: string;
  features?: string[];
  roomImageURLS?: string[];
  imageFileNames?: string[];
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
  roomsForRoomType: {
    id: number;
    name: string;
    createdAt: string | null;
    description: string | null;
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
  isSuccess: boolean;
};

export type DeleteRoomTypeResponse = {
  id: number;
  name: string;
  description: string | null;
  price: string;
  roomImageURLS: string[] | null;
  features: string[] | null;
  imageFileNames: string[] | null;
};
