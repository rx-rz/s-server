import { ctx } from "../ctx";

export const initializePaystackTransaction = async ({
  email,
  amount,
  callback_url,
}: {
  email: string;
  amount: string;
  callback_url: string;
}) => {
  const res = await ctx.paystack.transaction.initialize({
    email,
    amount,
    callback_url,
  });
  console.log(res.data, res.status);
  return { data: res.data, noError: res.status };
};
