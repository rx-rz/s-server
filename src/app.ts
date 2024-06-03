import cors from "cors";
import express, { Express, NextFunction, Request, Response } from "express";

import { config } from "dotenv";
import { handleErrors } from "./errors";
import { ENV_VARS } from "../env";
import { connectToDb, db } from "./db/db";

import { customerRouter } from "./customer/customer.routes";
import { otpRouter } from "./otp/otp.routes";
import { adminRouter } from "./admin/admin.routes";
import { roomTypeRouter } from "./room_types/roomtype.routes";
import { roomRouter } from "./room/room.routes";
import { bookingRouter } from "./booking/booking.routes";
import { paymentRouter } from "./payment/payment.routes";
import { Server } from "socket.io";
import { createServer } from "http";
import morgan from "morgan";

config({ path: ".env" });
export const app: Express = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use("/api/v1/customers", customerRouter);
app.use("/api/v1/otp", otpRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/roomtypes", roomTypeRouter);
app.use("/api/v1/rooms", roomRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/payments", paymentRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const errors = handleErrors(err);
  console.trace(errors);
  console.log({ err: errors.error });
  return res
    .status(errors.status)
    .json({ error_type: errors.type, error: errors.error, isSuccess: false });
});

const server = createServer(app);
const io = new Server(server);

if (process.env.NODE_ENV === "development") {
  server.listen(ENV_VARS.PORT, ENV_VARS.HOST, () => {
    connectToDb();
    io.on("connection", (socket) => {
      console.log("a user connected!");
    });
    console.log(
      `\nServer running at http://${ENV_VARS.HOST}:${ENV_VARS.PORT}/. 🚀 \n`
    );
  });
}
