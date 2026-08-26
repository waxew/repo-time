/**
 * این صفحه‌ی سروری نقطه ورود وب‌سایت است.
 * اطلاعات اختیاری کاربر را از Header امن می‌گیرد و رابط تعاملی را اجرا می‌کند.
 */

// headers فقط در سرور اجرا می‌شود و اطلاعات احراز هویت را به مرورگر لو نمی‌دهد.
import { headers } from "next/headers";

// رابط اصلی به‌صورت Client Component وارد می‌شود تا فرم‌ها و منوها تعاملی باشند.
import { RepoTimeApp } from "../components/repo-time-app";

// چون نام کاربر در هر درخواست متفاوت است، صفحه باید پویا رندر شود.
export const dynamic = "force-dynamic";

// تابع اصلی اطلاعات امن را می‌خواند و مقدارهای نمایشی مناسب را انتخاب می‌کند.
export default async function Home() {
  // Headerهای همان درخواست جاری دریافت می‌شوند.
  const requestHeaders = await headers();

  // ایمیل ممکن است در اجرای عمومی یا محلی وجود نداشته باشد.
  const email = requestHeaders.get("oai-authenticated-user-email") ?? "owner@repo-time.local";

  // نام کامل توسط میزبان Percent-encoded فرستاده می‌شود.
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");

  // فقط وقتی Encoding معتبر است رشته Decode می‌شود.
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") === "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  // در نبود نام واقعی، نام دوستانه‌ی نمونه برای نسخه نمایشی استفاده می‌شود.
  const displayName = fullName?.trim() || "سارا رضایی";

  // رابط با نام و ایمیل همین کاربر رندر می‌شود.
  return <RepoTimeApp userEmail={email} userName={displayName} />;
}
