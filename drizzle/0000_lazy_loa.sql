-- این Migration به‌صورت خودکار از db/schema.ts تولید شده است.
-- جدول زیر همه نوبت‌ها و وضعیت یادآوری آن‌ها را نگه می‌دارد.
CREATE TABLE `appointments` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_key` text NOT NULL,
	`customer_id` text,
	`customer_name` text NOT NULL,
	`mobile` text DEFAULT '' NOT NULL,
	`service_id` text,
	`service_name` text NOT NULL,
	`appointment_date` text NOT NULL,
	`appointment_time` text NOT NULL,
	`status` text DEFAULT 'confirmed' NOT NULL,
	`price` integer DEFAULT 0 NOT NULL,
	`reminder_enabled` integer DEFAULT true NOT NULL,
	`followup_enabled` integer DEFAULT false NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
-- این ایندکس جست‌وجوی تقویم هر مالک در یک تاریخ مشخص را سریع می‌کند.
CREATE INDEX `appointments_owner_date_idx` ON `appointments` (`owner_key`,`appointment_date`);--> statement-breakpoint
-- جدول مشتریان، اطلاعات اصلی پرونده را نگه می‌دارد.
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_key` text NOT NULL,
	`name` text NOT NULL,
	`mobile` text NOT NULL,
	`job` text DEFAULT '' NOT NULL,
	`group_name` text DEFAULT 'سایر' NOT NULL,
	`birth_date` text DEFAULT '' NOT NULL,
	`last_visit` text DEFAULT '' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
-- این ایندکس فهرست مشتریان یک مالک را بهینه می‌کند.
CREATE INDEX `customers_owner_idx` ON `customers` (`owner_key`);--> statement-breakpoint
-- جدول پیام‌ها سوابق صف و ارسال پیامک را ثبت می‌کند.
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_key` text NOT NULL,
	`body` text NOT NULL,
	`recipients` integer DEFAULT 0 NOT NULL,
	`channel` text DEFAULT 'sms' NOT NULL,
	`status` text DEFAULT 'queued' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
-- این ایندکس تاریخچه پیام مالک جاری را سریع‌تر می‌خواند.
CREATE INDEX `messages_owner_idx` ON `messages` (`owner_key`);--> statement-breakpoint
-- جدول نظرها برای گزارش رضایت مشتری ساخته می‌شود.
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_key` text NOT NULL,
	`customer_name` text NOT NULL,
	`score` integer DEFAULT 5 NOT NULL,
	`comment` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
-- این ایندکس نظرهای مربوط به یک کسب‌وکار را جدا می‌کند.
CREATE INDEX `reviews_owner_idx` ON `reviews` (`owner_key`);--> statement-breakpoint
-- جدول خدمات مدت، قیمت و رنگ کارت هر خدمت را ذخیره می‌کند.
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_key` text NOT NULL,
	`name` text NOT NULL,
	`duration_minutes` integer DEFAULT 30 NOT NULL,
	`price` integer DEFAULT 0 NOT NULL,
	`color` text DEFAULT '#7b2cff' NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
-- این ایندکس خدمات هر مالک را با هزینه کمتر پیدا می‌کند.
CREATE INDEX `services_owner_idx` ON `services` (`owner_key`);
