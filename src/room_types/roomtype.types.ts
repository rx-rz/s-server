export type CreateRoomTypeRequest = {
  name: string;
  price: string;
  roomImageURLS?: string[];
};

export type UpdateRoomTypeRequest = {
  currentName: string;
  name?: string;
  price?: string;
  roomImageURLS?: string[];
};
