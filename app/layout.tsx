/**
 * Layout ریشه، Metadata و تنظیم راست‌به‌چپ همه‌ی صفحه‌ها را یک‌بار تعریف می‌کند.
 */

// نوع Metadata کمک می‌کند نام فیلدهای SEO اشتباه نوشته نشوند.
import type { Metadata } from "next";

// استایل سراسری در ریشه وارد می‌شود تا تمام مسیرها طراحی یکسان داشته باشند.
import "./globals.css";

// عنوان و توضیح در تب مرورگر، موتور جست‌وجو و اشتراک‌گذاری استفاده می‌شوند.
export const metadata: Metadata = {
  title: "Repo Time | مدیریت نوبت و مشتری",
  description: "سامانه فارسی مدیریت نوبت، تقویم، مشتریان، خدمات، پیامک و گزارش کسب‌وکار.",
  applicationName: "Repo Time",
  keywords: ["نوبت دهی", "مدیریت مشتری", "CRM", "پیامک یادآوری", "Repo Time"],
  openGraph: {
    title: "Repo Time | مدیریت نوبت و مشتری",
    description: "تقویم، پرونده مشتری، پیامک و گزارش‌های کسب‌وکار در یک پنل فارسی.",
    locale: "fa_IR",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

// نوع Props اعلام می‌کند Layout دقیقاً یک مجموعه Child رندر می‌کند.
interface RootLayoutProps {
  children: React.ReactNode;
}

// HTML فارسی و RTL باعث می‌شود ترتیب متن و کنترل‌ها از ابتدا درست باشد.
export default function RootLayout({ children }: Readonly<RootLayoutProps>) {
  return (
    <html dir="rtl" lang="fa">
      <body>{children}</body>
    </html>
  );
}
