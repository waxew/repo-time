/**
 * مدل پایگاه‌داده Repo Time
 * این جدول‌ها در Cloudflare D1 ساخته می‌شوند و اطلاعات هر مالک کسب‌وکار
 * با ستون owner_key از اطلاعات سایر کاربران جدا می‌شود.
 */

// تابع sql برای مقدار پیش‌فرض زمان و سازنده‌های جدول SQLite وارد می‌شوند.
import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// جدول مشتریان، اطلاعات پرونده و آخرین مراجعه را نگه می‌دارد.
export const customers = sqliteTable(
  "customers",
  {
    id: text("id").primaryKey(),
    ownerKey: text("owner_key").notNull(),
    name: text("name").notNull(),
    mobile: text("mobile").notNull(),
    job: text("job").notNull().default(""),
    groupName: text("group_name").notNull().default("سایر"),
    birthDate: text("birth_date").notNull().default(""),
    lastVisit: text("last_visit").notNull().default(""),
    notes: text("notes").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  // این ایندکس فهرست مشتریان هر مالک را سریع‌تر پیدا می‌کند.
  (table) => [index("customers_owner_idx").on(table.ownerKey)],
);

// جدول خدمات، عنوان، مدت و مبلغ هر خدمت قابل رزرو را ذخیره می‌کند.
export const services = sqliteTable(
  "services",
  {
    id: text("id").primaryKey(),
    ownerKey: text("owner_key").notNull(),
    name: text("name").notNull(),
    durationMinutes: integer("duration_minutes").notNull().default(30),
    price: integer("price").notNull().default(0),
    color: text("color").notNull().default("#7b2cff"),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
  },
  // جست‌وجوی خدمات متعلق به هر مالک با این ایندکس انجام می‌شود.
  (table) => [index("services_owner_idx").on(table.ownerKey)],
);

// جدول نوبت‌ها رابطه‌ی مشتری، خدمت، تاریخ، ساعت و وضعیت را نگه می‌دارد.
export const appointments = sqliteTable(
  "appointments",
  {
    id: text("id").primaryKey(),
    ownerKey: text("owner_key").notNull(),
    customerId: text("customer_id"),
    customerName: text("customer_name").notNull(),
    mobile: text("mobile").notNull().default(""),
    serviceId: text("service_id"),
    serviceName: text("service_name").notNull(),
    appointmentDate: text("appointment_date").notNull(),
    appointmentTime: text("appointment_time").notNull(),
    status: text("status").notNull().default("confirmed"),
    price: integer("price").notNull().default(0),
    reminderEnabled: integer("reminder_enabled", { mode: "boolean" }).notNull().default(true),
    followupEnabled: integer("followup_enabled", { mode: "boolean" }).notNull().default(false),
    notes: text("notes").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  // ترکیب مالک و تاریخ، فیلتر تقویم روزانه را بهینه می‌کند.
  (table) => [index("appointments_owner_date_idx").on(table.ownerKey, table.appointmentDate)],
);

// جدول پیام‌ها تاریخچه‌ی صف پیامک، بله و پیام‌های سیستمی را نگه می‌دارد.
export const messages = sqliteTable(
  "messages",
  {
    id: text("id").primaryKey(),
    ownerKey: text("owner_key").notNull(),
    body: text("body").notNull(),
    recipients: integer("recipients").notNull().default(0),
    channel: text("channel").notNull().default("sms"),
    status: text("status").notNull().default("queued"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  // تاریخچه‌ی پیام‌های هر مالک از طریق این ایندکس خوانده می‌شود.
  (table) => [index("messages_owner_idx").on(table.ownerKey)],
);

// جدول نظرها امتیاز و متن رضایت مشتری را برای گزارش‌ها ذخیره می‌کند.
export const reviews = sqliteTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    ownerKey: text("owner_key").notNull(),
    customerName: text("customer_name").notNull(),
    score: integer("score").notNull().default(5),
    comment: text("comment").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  // این ایندکس خواندن رضایت‌های هر کسب‌وکار را سریع‌تر می‌کند.
  (table) => [index("reviews_owner_idx").on(table.ownerKey)],
);
