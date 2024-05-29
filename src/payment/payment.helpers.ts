import { ctx } from "../ctx";

export const initializePaystackTransaction = async ({
  email,
  amount,
}: {
  email: string;
  amount: string;
}) => {
  const body = {
    email,
    amount,
  };

  const res = await ctx.paystack.transaction.initialize({
    email,
    amount,
  });
  return { data: res.data, noError: res.status };
};
