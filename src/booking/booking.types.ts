export type CreateBookingRequest = {
  roomNos: number[];
  startDate: Date;
  endDate: Date;
  customerId: string;
};

export type UpdateBookingRequest = {
  id: string;
} & Partial<CreateBookingRequest>;
