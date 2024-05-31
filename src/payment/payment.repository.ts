import { eq } from "drizzle-orm";
import { ctx } from "../ctx";
import { CreatePaymentRequest, UpdatePaymentStatus } from "./payment.types";

const paymentTable = ctx.schema.payment;
const paymentValues = {
  id: paymentTable.id,
  paymentReference: paymentTable.reference,
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

const getPaymentDetailsByReference = async (reference: string) => {
  const paymentDetails = await ctx.db.query.payment.findFirst({
    where: eq(paymentTable.reference, reference),
    with: {
      booking: true,
    },
  });
  return paymentDetails;
};
export const paymentRepository = {
  createPayment,
  deletePayment,
  getPaymentDetailsByReference,
  getPaymentDetails,
};
