import cors from "cors";
import morgan from "morgan";
import express, { Express, NextFunction, Request, Response } from "express";

import { config } from "dotenv";
import { handleErrors } from "./errors";
import { ENV_VARS } from "../env";
import { connectToDb } from "./db/db";

import { customerRouter } from "./customer/customer.routes";
import { otpRouter } from "./otp/otp.routes";
import { adminRouter } from "./admin/admin.routes";
import { roomTypeRouter } from "./room_types/roomtype.routes";
import { roomRouter } from "./room/room.routes";
import { bookingRouter } from "./booking/booking.routes";

config({ path: ".env" });
export const app: Express = express();
app.use(cors());
app.use(express.json({limit: "50mb"}));

app.use(express.urlencoded({ extended: false }));
app.use(morgan("tiny"));

app.use("/api/v1/customers", customerRouter);
app.use("/api/v1/otp", otpRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/roomtypes", roomTypeRouter);
app.use("/api/v1/rooms", roomRouter);
app.use("/api/v1/bookings", bookingRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const errors = handleErrors(err);
  console.trace(errors);
  return res
    .status(errors.status)
    .json({ error_type: errors.type, error: errors.error, isSuccess: false });
});

app.listen(ENV_VARS.PORT, ENV_VARS.HOST, () => {
  connectToDb();
  process.on("uncaughtException", (err) => {
    const errors = handleErrors(err);
    console.error({ error_type: errors.type, error: errors.error });
    process.exit(1);
  });
  process.on("SIGTERM", (err) => {
    console.error(err);
    process.exit(1);
  });

  console.log(
    `\nServer running at http://${ENV_VARS.HOST}:${ENV_VARS.PORT}/. 🚀 \n`
  );
});
