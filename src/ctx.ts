import { Transporter, createTransport } from "nodemailer";
import { db } from "./db/db";
import { dbSchema, dbSchemaType } from "./db/schema";
import { StatusCodes } from "http-status-codes";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { ENV_VARS } from "../env";
import { RequestOptions } from "https";

export interface Context {
  db: typeof db;
  schema: dbSchemaType;
  httpstatus: typeof StatusCodes;
  transporter: Transporter<SMTPTransport.SentMessageInfo>;
  paystackoptions: RequestOptions;
}
const paystackoptions: RequestOptions = {
  hostname: "api.paystack.co",
  port: 443,
  headers: {
    Authorization: `Bearer sk_test_9531278a130b021948de24b3fd08bcfddf5ae2a6`,
    "Content-Type": "application/json",
  },
};

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
    paystackoptions,
  };
};

export const ctx = createContext();
