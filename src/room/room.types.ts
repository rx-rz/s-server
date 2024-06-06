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

export type CreateRoomRequest = {
  typeId: number;
  noOfRooms: number;
};

export type UpdateRoomRequest = {
  roomNo: number;
  typeId?: number;
  status?: "available" | "pending" | "booked" 
  noOfTimesBooked?: number;
};

export type ListRoomRequest = {
  roomNo?: number;
  typeId?: number;
  pageNo?: number;
  noOfEntries?: number;
  noOfTimesBooked?: number;
  status: "available" | "pending" | "booked" | null;
  createdAt?: string;
};
