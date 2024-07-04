import { desc, eq, sum } from "drizzle-orm";
import { ctx } from "../ctx";
import { CreatePaymentRequest, UpdatePaymentStatus } from "./payment.types";

const paymentTable = ctx.schema.payment;

const paymentValues = {
  id: paymentTable.id,
  paymentReference: paymentTable.reference,
  amount: paymentTable.amount,
  customerEmail: paymentTable.customerEmail,
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
  const [paymentDeleted] = await ctx.db
    .delete(paymentTable)
    .where(eq(paymentTable.id, id))
    .returning(paymentValues);
  return paymentDeleted;
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

const updatePayment = async ({
  reference,
  payedAt,
  status,
}: UpdatePaymentStatus) => {
  const [paymentUpdated] = await ctx.db
    .update(paymentTable)
    .set({
      status,
      payedAt,
    })
    .where(eq(paymentTable.reference, reference))
    .returning(paymentValues);
  return paymentUpdated;
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

const getLastFivePayments = async () => {
  const payments = await ctx.db
    .select(paymentValues)
    .from(paymentTable)
    .orderBy(desc(paymentTable.createdAt))
    .limit(5);
  return payments;
};

const getTotalProfit = async () => {
  const [sumOfPayments] = await ctx.db
    .select({ profit: sum(paymentTable.amount) })
    .from(paymentTable);
  return sumOfPayments.profit;
};

export const paymentRepository = {
  createPayment,
  deletePayment,
  getPaymentDetailsByReference,
  // getPaymentDetailsByBookingID,
  getPaymentDetails,
  getLastFivePayments,
  updatePayment,
  getTotalProfit,
};
