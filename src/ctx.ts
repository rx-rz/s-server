import { Transporter, createTransport } from "nodemailer";
import { db } from "./db/db";
import { dbSchema, dbSchemaType } from "./db/schema";
import { StatusCodes } from "http-status-codes";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { ENV_VARS } from "../env";
import { Paystack } from "paystack-sdk";

export interface Context {
  db: typeof db;
  schema: dbSchemaType;
  httpstatus: typeof StatusCodes;
  transporter: Transporter<SMTPTransport.SentMessageInfo>;
  paystack: Paystack;
}

const paystack = new Paystack(ENV_VARS.PAYMENT_SECRET_KEY);
const transporter = createTransport({
  host: ENV_VARS.SMTPHOST,
  port: ENV_VARS.SMTPPORT,
  secure: false,
  auth: {
    user: ENV_VARS.SMTPUSER,
    pass: ENV_VARS.SMTPPASS,
  },
});

export const httpstatus = StatusCodes;

const createContext = (): Context => {
  return {
    db: db,
    schema: dbSchema,
    httpstatus,
    transporter,
    paystack,
  };
};

//application wide context object to
//prevent having to initialize objects everywhere.
export const ctx = createContext();
