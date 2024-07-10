import { z } from "zod";

const registrationValidator = z.object({
  firstName: z
    .string({
      required_error: "First name is required!",
      invalid_type_error: "First name can only be a string!",
    })
    .max(30, { message: "First name should be a maximum of 30 characters." }),
  lastName: z
    .string({
      required_error: "Last name is required!",
      invalid_type_error: "Last name can only be a string!",
    })
    .max(30, { message: "Last name should be a maximum of 30 characters." }),
  email: z.string({ required_error: "Email is required!" }).email({
    message: "Email input is not a valid email. Please correct and try again",
  }),
  zip: z.string().max(10),
  phoneNo: z.string().max(50),
  address: z.string(),
});

const emailValidator = z.object({
  email: z.string({ required_error: "Email is required!" }).email({
    message: "Email input is not a valid email. Please correct and try again.",
  }),
});

const updateValidator = z.object({
  firstName: z
    .string()
    .max(30, { message: "First name should be a maximum of 30 characters." })
    .optional(),
  lastName: z
    .string()
    .max(30, { message: "Last name should be a maximum of 30 characters." })
    .optional(),
  email: z.string({ required_error: "Email is required!" }).email({
    message: "Email input is not a valid email. Please correct and try again.",
  }),
  zip: z.string().max(10).optional(),
  phoneNo: z.string().max(50).optional(),
  address: z.string().optional(),
});



const listCustomerValidator = z.object({
  pageNo: z.coerce
    .number()
    .min(1, { message: "Page number cannot be less than 1" })
    .default(1),
  limit: z.coerce
    .number()
    .min(1, { message: "Limit cannot be less than 1" })
    .default(10),
  searchBy: z
    .array(
      z.object({
        key: z.enum([
          "firstName",
          "lastName",
          "email",
          "createdAt",
        ]),
        value: z.union([z.number(), z.string(), z.boolean()]),
      })
    )
    .optional(),
  orderBy: z
    .enum(["firstName", "lastName", "email", "createdAt"], {
      message:
        'Order By fields can only be "firstName", "lastName", "email" and "createdAt"',
      required_error:
        'Order By fields can only be "firstName", "lastName", "email" and "createdAt"',
    })
    .default("createdAt"),
  ascOrDesc: z
    .enum(["asc", "desc"], {
      message: 'can only be of values "asc" or "desc"',
      required_error: 'can only be of values "asc" or "desc"',
    })
    .default("asc"),
});

export const v = {
  registrationValidator,
  emailValidator,
  updateValidator,
  listCustomerValidator,
};
