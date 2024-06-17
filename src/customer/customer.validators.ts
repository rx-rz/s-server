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
  password: z
    .string({ invalid_type_error: "Password must be a string" })
    .min(6, { message: "Minimum of 6 characters are allowed" })
    .optional(),
});

const emailValidator = z.object({
  email: z.string({ required_error: "Email is required!" }).email({
    message: "Email input is not a valid email. Please correct and try again.",
  }),
});

const loginValidator = z.object({
  email: z.string({ required_error: "Email is required!" }).email({
    message: "Email input is not a valid email. Please correct and try again",
  }),
  password: z
    .string({
      invalid_type_error: "Password must be a string",
      required_error: "Password is required!",
    })
    .min(6, { message: "Minimum of 6 characters are allowed" }),
});

const updatePasswordValidator = z.object({
  email: z.string({ required_error: "Email is required!" }).email({
    message: "Email input is not a valid email. Please correct and try again.",
  }),
  currentPassword: z
    .string({ required_error: "Current password is required!" })
    .min(6, {
      message: "Password should be a minimum of 6 characters",
    }),
  newPassword: z
    .string({ required_error: "New password is required!" })
    .min(6, {
      message: "Password should be a minimum of 6 characters",
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
  isVerified: z.boolean().optional(),
  email: z.string({ required_error: "Email is required!" }).email({
    message: "Email input is not a valid email. Please correct and try again.",
  }),
  hasCreatedPasswordForAccount: z.boolean().optional(),
});

const updateEmailValidator = z.object({
  email: z.string({ required_error: "Email is required!" }).email({
    message: "Email input is not a valid email. Please correct and try again.",
  }),
  newEmail: z.string({ required_error: "New email is required!" }).email({
    message:
      "New email input is not a valid email. Please correct and try again.",
  }),
  password: z.string({ required_error: "Password is required!" }).min(6, {
    message: "Password should be a minimum of 6 characters",
  }),
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
          "isVerified",
          "createdAt",
        ]),
        value: z.union([z.number(), z.string(), z.boolean()]),
      })
    )
    .optional(),
  orderBy: z
    .enum(["firstName", "lastName", "email", "isVerified", "createdAt"], {
      message:
        'Order By fields can only be "firstName", "lastName", "email", "isVerified" and "createdAt"',
      required_error:
        'Order By fields can only be "firstName", "lastName", "email", "isVerified" and "createdAt"',
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
  updateEmailValidator,
  updatePasswordValidator,
  updateValidator,
  loginValidator,
  listCustomerValidator,
};
