/**
 * این فایل تنها در سمت سرور اجرا می‌شود و اتصال امن D1 را می‌سازد.
 * متمرکز بودن اتصال، دسترسی پراکنده و ناامن به Binding را حذف می‌کند.
 */

// env همان متغیرهای امنی است که Cloudflare هنگام اجرا تزریق می‌کند.
import { env } from "cloudflare:workers";

// Drizzle دستورات TypeScript را به کوئری‌های امن SQLite تبدیل می‌کند.
import { drizzle } from "drizzle-orm/d1";

// تمام جدول‌ها برای Type-safe شدن کوئری‌ها به اتصال معرفی می‌شوند.
import * as schema from "./schema";

// این تابع در Routeهای API فراخوانی می‌شود و اتصال آماده را برمی‌گرداند.
export function getDb() {
  // نبودن DB یعنی Binding در محیط اجرا تعریف نشده و ادامه دادن امن نیست.
  if (!env.DB) {
    // پیام خطا دقیقاً محل تنظیم Binding را به توسعه‌دهنده نشان می‌دهد.
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Set the `d1` field in .openai/hosting.json to `DB` or let your control plane inject the real binding values before using the database."
    );
  }

  // اتصال Drizzle با Binding واقعی و مدل جدول‌های پروژه ساخته می‌شود.
  return drizzle(env.DB, { schema });
}
