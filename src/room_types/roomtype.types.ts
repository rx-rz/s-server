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
