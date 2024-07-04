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
  pgEnum,
} from "drizzle-orm/pg-core";

export const admin = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 30 }).notNull(),
  lastName: varchar("last_name", { length: 30 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  password: text("password").notNull(),
  refreshToken: text("refresh_token").unique().notNull(),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  isVerified: boolean("is_verified").default(false),
});

export const customer = pgTable(
  "customers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: varchar("first_name", { length: 30 }).notNull(),
    lastName: varchar("last_name", { length: 30 }).notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    password: text("password"),
    refreshToken: text("refresh_token").unique().notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    phoneNo: varchar("phone_number", { length: 50 }),
    address: text("address"),
    zip: varchar("zip", { length: 10 }),
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

export const roomStatusEnum = pgEnum("room_status", [
  "available",
  "pending",
  "booked",
]);

export const room = pgTable(
  "rooms",
  {
    roomNo: serial("roomNo").unique().primaryKey(),
    typeId: integer("type_id")
      .notNull()
      .references(() => roomType.id, { onDelete: "cascade" }),
    status: roomStatusEnum("status").default("available"),
    noOfTimesBooked: integer("no_of_times_booked").default(0),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
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
    bookings: many(booking),
    payments: many(payment),
  };
});

export const roomType = pgTable(
  "room_types",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull().unique(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    roomImageURLS: text("room_image_url").array(),
    description: text("description"),
    features: text("features").array(),
    imageFileNames: text("room_image_name").array(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => {
    return {
      name_idx: index("name_idx").on(table.name),
    };
  }
);

export const roomTypeRelation = relations(roomType, ({ many }) => {
  return {
    rooms: many(room, { relationName: "roomType" }),
  };
});

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "confirmed",
  "failed",
]);

export const payment = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    payedAt: timestamp("payed_at", { mode: "string" }),
    status: paymentStatusEnum("payment_status").notNull().default("pending"),
    roomNo: integer("roomNo")
      .references(() => room.roomNo)
      .notNull(),
    customerEmail: varchar("customer_email", {length: 255})
      .references(() => customer.email, {
        onDelete: "cascade",
      })
      .notNull(),
    reference: text("reference").notNull().unique(),
    bookingId: uuid("booking_id")
      .references(() => booking.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .unique()
      .notNull(),
  },
  (table) => {
    return {
      reference_idx: index("reference_idx").on(table.reference),
    };
  }
);

export const paymentRelation = relations(payment, ({ one, many }) => {
  return {
    customer: one(customer, {
      fields: [payment.customerEmail],
      references: [customer.email],
    }),
    booking: one(booking, {
      fields: [payment.bookingId],
      references: [booking.id],
    }),
    room: one(room, {
      fields: [payment.roomNo],
      references: [room.roomNo],
    }),
  };
});

export const bookingstatusEnum = pgEnum("booking_status", [
  "active",
  "cancelled",
  "done",
  "pending",
]);

export const booking = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerEmail: varchar("customer_email", { length: 255 })
      .references(() => customer.email, { onDelete: "no action" })
      .notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    roomNo: integer("roomNo")
      .references(() => room.roomNo, {
        onDelete: "cascade",
        onUpdate: "cascade",
      })
      .notNull(),
    startDate: timestamp("start_date", { mode: "string" }).notNull(),
    endDate: timestamp("end_date", { mode: "string" }).notNull(),
    status: bookingstatusEnum("booking_status").notNull().default("pending"),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => {
    return {
      customer_email_idx: index("customer_email_idx").on(table.customerEmail),
    };
  }
);

export const bookingRelation = relations(booking, ({ one, many }) => {
  return {
    room: one(room, {
      fields: [booking.roomNo],
      references: [room.roomNo],
      relationName: "room",
    }),
    customers: one(customer, {
      fields: [booking.customerEmail],
      references: [customer.email],
      relationName: "customer",
    }),
  };
});

export const userOtpsEnum = pgEnum("user_role", ["admin", "customer"]);

export const userOtps = pgTable("user_otps", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 100 }).notNull(),
  otp: integer("otp").notNull(),
  role: userOtpsEnum("role").default("customer"),
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
});

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
  bookingstatusEnum,
  admin,
  userOtps,
};

export type dbSchemaType = typeof dbSchema;
