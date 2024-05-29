import { eq } from "drizzle-orm";
import { ctx } from "../ctx";
import { CreatePaymentRequest, UpdatePaymentStatus } from "./payment.types";

const paymentTable = ctx.schema.payment;
const paymentValues = {
  id: paymentTable.id,
  paymentReference: paymentTable.reference,
  status: paymentTable.status,
  amount: paymentTable.amount,
  customerId: paymentTable.customerId,
  createdAt: paymentTable.createdAt,
  bookingId: paymentTable.bookingId,
};
const createPayment = async (request: CreatePaymentRequest) => {
  const [payment] = await ctx.db
    .insert(paymentTable)
    .values(request)
    .returning(paymentValues);
  return payment;
};

const updatePaymentStatus = async (request: UpdatePaymentStatus) => {
  const [updatedPayment] = await ctx.db
    .update(paymentTable)
    .set(request)
    .where(eq(paymentTable.reference, request.reference))
    .returning(paymentValues);
  return updatedPayment;
};

const deletePayment = async (id: string) => {
  const [deletedPayment] = await ctx.db
    .delete(paymentTable)
    .where(eq(paymentTable.id, id))
    .returning(paymentValues);
  return deletedPayment;
};

const getPaymentDetails = async (id: string) => {
  const paymentDetails = await ctx.db.query.payment.findFirst({
    where: eq(paymentTable.id, id),
    with: {
      booking: true,
      customer: true,
    },
  });
  return paymentDetails;
};

export const paymentRepository = {
  createPayment,
  updatePaymentStatus,
  deletePayment,
  getPaymentDetails,
};
