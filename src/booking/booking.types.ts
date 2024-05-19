export type CreateBookingRequest = {
  roomNo: number;
  startDate: Date;
  endDate: Date;
  customerId: string;
  createdAt: Date;
};

export type UpdateBookingRequest = {
  id: string;
} & Partial<CreateBookingRequest>;
