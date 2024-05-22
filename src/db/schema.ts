import { relations } from "drizzle-orm";

import {
  boolean,
  index,
  integer,
  pgTable,
  decimal,
  timestamp,
  uuid,
  varchar,
  text,
  serial,
  bigint,
  primaryKey,
} from "drizzle-orm/pg-core";

export const admin = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 30 }).notNull(),
  lastName: varchar("last_name", { length: 30 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customer = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: varchar("first_name", { length: 30 }).notNull(),
    lastName: varchar("last_name", { length: 30 }).notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow(),
    hasCreatedPasswordForAccount: boolean(
      "has_created_password_for_account"
    ).default(false),
    isVerified: boolean("is_verified").default(false),
  },
  (table) => {
    return {
      email_idx: index("email_idx").on(table.email),
    };
  }
);

export const customerRelation = relations(customer, ({ many }) => {
  return {
    bookings: many(booking, { relationName: "customer" }),
    payments: many(payment),
  };
});

export const room = pgTable(
  "rooms",
  {
    roomNo: serial("roomNo").unique().primaryKey(),
    typeId: integer("type_id")
      .notNull()
      .references(() => roomType.id, { onDelete: "cascade" }),
    isAvailable: boolean("is_available").default(true),
    noOfTimesBooked: integer("no_of_times_booked").default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      roomtypeid_idx: index("roomtypeid_idx").on(table.typeId),
    };
  }
);

export const roomRelation = relations(room, ({ one, many }) => {
  return {
    roomType: one(roomType, {
      fields: [room.typeId],
      references: [roomType.id],
      relationName: "roomType",
    }),
    roomsToBooking: many(roomsToBooking),
  };
});

export const roomType = pgTable("room_types", {
  id: serial("id").primaryKey(),
  rating: decimal("rating", { precision: 10, scale: 2 })
    .notNull()
    .default("0.0"),
  name: varchar("name", { length: 50 }).notNull().unique(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  roomImageURLS: text("room_image_url").array(),
  description: text("description"),
  features: text("features").array(),
  imageFileNames: text("room_image_name").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const roomTypeRelation = relations(roomType, ({ many }) => {
  return {
    rooms: many(room, { relationName: "roomType" }),
  };
});

export const payment = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  customerId: uuid("customer_id")
    .references(() => customer.id, {
      onDelete: "cascade",
    })
    .notNull(),
  bookingId: uuid("booking_id").references(() => booking.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
});

export const paymentRelation = relations(payment, ({ one, many }) => {
  return {
    customer: one(customer, {
      fields: [payment.customerId],
      references: [customer.id],
    }),
    booking: one(booking, {
      fields: [payment.bookingId],
      references: [booking.id],
    }),
  };
});

export const booking = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: uuid("customer_id")
    .references(() => customer.id, { onDelete: "no action" })
    .notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookingRelation = relations(booking, ({ one, many }) => {
  return {
    roomsToBooking: many(roomsToBooking),
    customers: one(customer, {
      fields: [booking.customerId],
      references: [customer.id],
      relationName: "customer",
    }),
  };
});

export const userOtps = pgTable("user_otps", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 100 }).notNull(),
  otp: integer("otp").notNull(),
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
});

export const roomsToBooking = pgTable(
  "rooms_to_booking",
  {
    roomNo: integer("room_no")
      .notNull()
      .references(() => room.roomNo, { onDelete: "cascade" }),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => booking.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.roomNo, t.bookingId] }),
  })
);

export const roomsToBookingRelation = relations(roomsToBooking, ({ one }) => ({
  room: one(room, {
    fields: [roomsToBooking.roomNo],
    references: [room.roomNo],
  }),
  booking: one(booking, {
    fields: [roomsToBooking.bookingId],
    references: [booking.id],
  }),
}));

export const dbSchema = {
  customer,
  customerRelation,
  room,
  roomRelation,
  roomType,
  roomTypeRelation,
  payment,
  paymentRelation,
  booking,
  bookingRelation,
  roomsToBooking,
  roomsToBookingRelation,
  admin,
  userOtps,
};
export type dbSchemaType = typeof dbSchema;
