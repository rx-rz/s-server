export type Admin = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean | null;
};
export type RegisterAdminResponse = {
  message: string;
  isSuccess: boolean;
};

export type LoginAdminResponse = {
  token: string;
  isSuccess: boolean;
};

export type DeleteAdminResponse = {
  adminDeleted: Admin;
  isSuccess: boolean;
};

export type ListAdminsResponse = {
  admins: Admin[];
  isSuccess: boolean;
};

export type UpdateAdminResponse = {
  adminUpdated: Admin;
  isSuccess: boolean;
};

export type UpdateAdminEmailResponse = UpdateAdminResponse;
export type UpdateAdminPasswordResponse = UpdateAdminResponse;
export type updateAdminRefreshToken = { isSuccess: true };
export type AdminDashboardOverviewDetails = {
  bookingsPerMonth: { name: string; value: number }[];
  lastFiveCustomers: {
    firstName: string;
    lastName: string;
    email: string;
    id: string;
    isVerified: boolean | null;
    refreshToken: string;
    hasCreatedPasswordForAccount: boolean | null;
    createdAt: string | null;
  }[];
  lastFivePayments: {
    id: string;
    paymentReference: string;
    amount: string;
    customerId: string;
    createdAt: string | null;
    bookingId: string;
  }[];
  noOfAvailableRooms: number;
  totalProfit: number;
  isSuccess: boolean;
};
