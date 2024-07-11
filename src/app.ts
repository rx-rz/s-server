import cors, { CorsOptions } from "cors";
import express, {
  Express,
  NextFunction,
  Request,
  Response,
  Router,
} from "express";
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
import { paymentRouter } from "./payment/payment.routes";
import { createServer } from "http";
import morgan from "morgan";
import { verifyRequest } from "./middleware/jwt-token";
import {
  authorizedAccessOnly
} from "./middleware/determine-user-role";
import cookieParser from "cookie-parser";

// Load environment variables from .env file
config({ path: ".env" });

export const app: Express = express();

const corsOptions: CorsOptions = {
  origin: ["http://127.0.0.1:3000", "http://localhost:3000"],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
  exposedHeaders: ["Authorization", "Set-Cookie"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());

// Middleware to parse JSON requests with a size limit of 50mb
app.use(express.json({ limit: "50mb" }));

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: false }));

// Middleware to log HTTP requests
app.use(morgan("dev"));

// Create a new Router instance for API routes
const api = Router();

// Define API routes
app.use("/api/v1", api);

// api.use(verifyRequest);
// api.use(adminAccessOnly);

api.use("/customers", customerRouter);
api.use("/otp", otpRouter);
api.use("/admin", adminRouter);
api.use("/roomtypes", roomTypeRouter);
api.use("/rooms", roomRouter);
api.use("/bookings", bookingRouter);
api.use("/payments", paymentRouter);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const errors = handleErrors(err);
  console.trace(errors); // Log the error stack trace
  console.log({ err: errors.error }); // Log the error
  return res.status(errors.status).json({
    error_type: errors.type,
    error: errors.error,
    isSuccess: false,
    status: errors.status,
  });
});

// Create an HTTP server with the express app
const server = createServer(app);

// Start the server only in development mode. Production mode will be handled soon.
if (process.env.NODE_ENV === "development") {
  server.listen(ENV_VARS.PORT, ENV_VARS.HOST, () => {
    connectToDb(); // Connect to the database
    console.log(
      `\nServer running at http://${ENV_VARS.HOST}:${ENV_VARS.PORT}/. 🚀 \n`
    );
  });
}
