/**
 * آیکن‌های ساده‌ی پروژه در یک فایل نگهداری می‌شوند تا وابستگی گرافیکی اضافه
 * نداشته باشیم و رنگ هر آیکن از کارت والد به ارث برسد.
 */

// نوع نام آیکن را از قرارداد مرکزی دریافت می‌کنیم.
import type { IconName } from "../lib/types";

// ورودی‌های کامپوننت، نام آیکن و اندازه‌ی اختیاری آن هستند.
interface AppIconProps {
  name: IconName;
  size?: number;
  className?: string;
}

// برای هر نام، مسیر یا شکل SVG متناظر بازگردانده می‌شود.
function IconPaths({ name }: { name: IconName }) {
  switch (name) {
    case "home":
      return <><path d="m3 10 9-7 9 7"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-7h6v7"/></>;
    case "calendar":
      return <><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/></>;
    case "users":
      return <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>;
    case "message":
      return <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>;
    case "megaphone":
      return <><path d="m3 11 18-5v12L3 13Z"/><path d="M11.6 16 13 21H7l-1.3-6.5"/></>;
    case "phone":
      return <><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4"/></>;
    case "pin":
      return <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>;
    case "gift":
      return <><rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18M12 8H7.5a2.5 2.5 0 1 1 2.1-3.85L12 8Zm0 0h4.5a2.5 2.5 0 1 0-2.1-3.85L12 8Z"/></>;
    case "smile":
      return <><circle cx="12" cy="12" r="9"/><path d="M8 10h.01M16 10h.01M8 15s1.5 2 4 2 4-2 4-2"/></>;
    case "bell":
      return <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>;
    case "return":
      return <><path d="m9 14-5-5 5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v2"/></>;
    case "globe":
      return <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>;
    case "diamond":
      return <><path d="m3 8 4-5h10l4 5-9 13Z"/><path d="m3 8 9 4 9-4M7 3l5 9 5-9"/></>;
    case "ticket":
      return <path d="M3 7a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-3a2 2 0 0 0 0-4Z"/>;
    case "wallet":
      return <><path d="M3 6a3 3 0 0 1 3-3h12v5H6a3 3 0 0 1 0-6"/><path d="M3 6v12a3 3 0 0 0 3 3h15V8H6"/><path d="M16 14h2"/></>;
    case "chart":
      return <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>;
    case "settings":
      return <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21h-4v-.09A1.7 1.7 0 0 0 9 19.35a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.63 15 1.7 1.7 0 0 0 3.08 14H3v-4h.09A1.7 1.7 0 0 0 4.65 9a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.63 1.7 1.7 0 0 0 10 3.08V3h4v.09A1.7 1.7 0 0 0 15 4.65a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.37 9 1.7 1.7 0 0 0 20.92 10H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></>;
    case "search":
      return <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>;
    case "plus":
      return <path d="M12 5v14M5 12h14"/>;
    case "user":
      return <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>;
    case "book":
      return <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5Z"/><path d="M4 6.5v13M8 8h8"/></>;
    case "briefcase":
      return <><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2"/></>;
    case "clock":
      return <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>;
    case "check":
      return <path d="m5 12 4 4L19 6"/>;
    case "close":
      return <path d="M6 6l12 12M18 6 6 18"/>;
    case "chevron":
      return <path d="m9 18 6-6-6-6"/>;
    case "menu":
      return <path d="M4 6h16M4 12h16M4 18h16"/>;
    case "send":
      return <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>;
    case "star":
      return <path d="m12 2 3 6 6.5 1-4.75 4.6 1.1 6.4L12 17l-5.85 3 1.1-6.4L2.5 9 9 8Z"/>;
    case "link":
      return <><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/></>;
    case "download":
      return <><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></>;
    default:
      return <circle cx="12" cy="12" r="8"/>;
  }
}

// کامپوننت نهایی یک SVG دسترس‌پذیر و هماهنگ با اندازه‌ی درخواستی می‌سازد.
export function AppIcon({ name, size = 22, className }: AppIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.9"
      viewBox="0 0 24 24"
      width={size}
    >
      <IconPaths name={name} />
    </svg>
  );
}
