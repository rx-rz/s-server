export type CreateRoomTypeRequest = {
  name: string;
  price: string;
  roomImageURL?: string[];
};

export type UpdateRoomTypeRequest = {
  currentName: string;
  name?: string;
  price?: string;
  roomImageURLS?: string[];
  imageFileNames?: string[];
};
