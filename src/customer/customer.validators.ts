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

export const v = {
  registrationValidator,
  emailValidator,
  updateEmailValidator,
  updatePasswordValidator,
  updateValidator,
  loginValidator,
};
