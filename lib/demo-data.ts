/**
 * داده‌های نمونه فقط برای اولین نمایش رابط و حالت آفلاین استفاده می‌شوند.
 * در نسخه‌ی منتشرشده، API همین شکل داده را از پایگاه‌داده D1 برمی‌گرداند.
 */

// نوع‌های مشترک را وارد می‌کنیم تا داده‌ی نمونه نیز از قرارداد پروژه پیروی کند.
import type { FeatureCard, WorkspaceData } from "./types";

// تاریخ نمایشی پروژه مطابق روز ساخت این نسخه و با قالب شمسی نگهداری می‌شود.
export const TODAY_JALALI = "۱۴۰۵/۰۶/۰۳";

// نام روزهای هفته برای ردیف تقویم استفاده می‌شود.
export const PERSIAN_WEEK_DAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

// کارت‌های صفحه امکانات دقیقاً مسیرهای اصلی مشاهده‌شده در ویدیو را پوشش می‌دهند.
export const FEATURE_CARDS: FeatureCard[] = [
  { id: "calendar", title: "نوبت‌دهی", icon: "book", accent: "#14c77a", metric: "۴" },
  { id: "customers", title: "پرونده مشتری", icon: "users", accent: "#16c7d9", metric: "۲۱۶" },
  { id: "messages", title: "سامانه پیامک", icon: "megaphone", accent: "#ff6a20" },
  { id: "messages", title: "دریافت پیام", icon: "message", accent: "#c7ef25" },
  { id: "regional-sms", title: "پیامک منطقه‌ای", icon: "pin", accent: "#b371ff", badge: "NEW" },
  { id: "dedicated-number", title: "شماره اختصاصی", icon: "phone", accent: "#5f62ff" },
  { id: "satisfaction", title: "رضایت‌سنجی", icon: "smile", accent: "#ffd62e" },
  { id: "birthday", title: "تبریک تولد", icon: "gift", accent: "#fb127d" },
  { id: "customer-return", title: "بازگشت مشتری", icon: "return", accent: "#7f20ff" },
  { id: "repair-reminder", title: "یادآوری ترمیم", icon: "bell", accent: "#ff3b31" },
  { id: "website", title: "سایت اختصاصی", icon: "globe", accent: "#2e91ff", badge: "PRO" },
  { id: "online-booking", title: "رزرو نوبت آنلاین", icon: "calendar", accent: "#16e59d", badge: "PRO" },
  { id: "raffle", title: "قرعه‌کشی", icon: "ticket", accent: "#d557ff" },
  { id: "club", title: "باشگاه مشتریان", icon: "diamond", accent: "#ff335e" },
  { id: "accounting", title: "حسابداری مالی", icon: "wallet", accent: "#25db71", wide: true },
  { id: "reports", title: "گزارش سیستم", icon: "chart", accent: "#4b5dff", wide: true },
  { id: "services", title: "پرسنل و خدمات", icon: "briefcase", accent: "#ff754d" },
  { id: "sms-packages", title: "بسته پیامکی", icon: "message", accent: "#00d28a" },
];

// این آبجکت در اولین رندر، قبل از رسیدن پاسخ شبکه، صفحه را زنده نگه می‌دارد.
export const DEMO_WORKSPACE: WorkspaceData = {
  customers: [
    {
      id: "customer-anahita",
      name: "مشتری نمونه ۱",
      mobile: "—",
      job: "طراح گرافیک",
      groupName: "همکاران",
      birthDate: "۱۳۷۶/۰۵/۲۳",
      lastVisit: "۱۴۰۵/۰۵/۲۸",
      notes: "داده نمایشی",
      createdAt: "۱۴۰۵/۰۱/۱۲",
    },
    {
      id: "customer-sahar",
      name: "مشتری نمونه ۲",
      mobile: "—",
      job: "مدرس",
      groupName: "مشتریان مهم",
      birthDate: "۱۳۷۴/۰۸/۱۶",
      lastVisit: "۱۴۰۵/۰۵/۳۰",
      notes: "داده نمایشی",
      createdAt: "۱۴۰۴/۱۱/۰۳",
    },
    {
      id: "customer-arisaan",
      name: "مشتری نمونه ۳",
      mobile: "—",
      job: "مدیر فروش",
      groupName: "کارگران",
      birthDate: "۱۳۷۱/۰۳/۰۹",
      lastVisit: "۱۴۰۵/۰۵/۲۰",
      notes: "داده نمایشی",
      createdAt: "۱۴۰۴/۰۹/۲۱",
    },
    {
      id: "customer-shima",
      name: "مشتری نمونه ۴",
      mobile: "—",
      job: "پزشک",
      groupName: "پزشکان",
      birthDate: "۱۳۶۹/۱۰/۰۲",
      lastVisit: "۱۴۰۵/۰۴/۱۱",
      notes: "داده نمایشی",
      createdAt: "۱۴۰۴/۰۷/۱۴",
    },
    {
      id: "customer-afarin",
      name: "مشتری نمونه ۵",
      mobile: "—",
      job: "آرایشگر",
      groupName: "همکاران",
      birthDate: "۱۳۷۸/۱۲/۱۸",
      lastVisit: "۱۴۰۵/۰۵/۲۹",
      notes: "داده نمایشی",
      createdAt: "۱۴۰۵/۰۲/۰۵",
    },
  ],
  services: [
    { id: "service-consult", name: "مشاوره تخصصی", durationMinutes: 45, price: 900000, color: "#7b2cff", active: true },
    { id: "service-main", name: "خدمت اصلی", durationMinutes: 60, price: 2300000, color: "#ec078b", active: true },
    { id: "service-followup", name: "پیگیری و ترمیم", durationMinutes: 30, price: 600000, color: "#20bd83", active: true },
  ],
  appointments: [
    {
      id: "appointment-1",
      customerId: "customer-anahita",
      customerName: "مشتری نمونه ۱",
      mobile: "—",
      serviceId: "service-main",
      serviceName: "خدمت اصلی",
      appointmentDate: TODAY_JALALI,
      appointmentTime: "۰۸:۰۰",
      status: "confirmed",
      price: 2300000,
      reminderEnabled: true,
      followupEnabled: true,
      notes: "مراجعه اول وقت",
      createdAt: "۱۴۰۵/۰۶/۰۱",
    },
    {
      id: "appointment-2",
      customerId: "customer-sahar",
      customerName: "مشتری نمونه ۲",
      mobile: "—",
      serviceId: "service-consult",
      serviceName: "مشاوره تخصصی",
      appointmentDate: TODAY_JALALI,
      appointmentTime: "۱۶:۰۰",
      status: "confirmed",
      price: 900000,
      reminderEnabled: true,
      followupEnabled: false,
      notes: "فرم پیش از مراجعه تکمیل شود",
      createdAt: "۱۴۰۵/۰۶/۰۱",
    },
    {
      id: "appointment-3",
      customerId: "customer-arisaan",
      customerName: "مشتری نمونه ۳",
      mobile: "—",
      serviceId: "service-followup",
      serviceName: "پیگیری و ترمیم",
      appointmentDate: TODAY_JALALI,
      appointmentTime: "۱۷:۳۰",
      status: "pending",
      price: 600000,
      reminderEnabled: true,
      followupEnabled: true,
      notes: "نیازمند تأیید نهایی",
      createdAt: "۱۴۰۵/۰۶/۰۲",
    },
    {
      id: "appointment-4",
      customerId: "customer-shima",
      customerName: "مشتری نمونه ۴",
      mobile: "—",
      serviceId: "service-main",
      serviceName: "خدمت اصلی",
      appointmentDate: "۱۴۰۵/۰۶/۰۴",
      appointmentTime: "۱۴:۱۵",
      status: "confirmed",
      price: 2300000,
      reminderEnabled: true,
      followupEnabled: true,
      notes: "مراجعه دوم",
      createdAt: "۱۴۰۵/۰۶/۰۲",
    },
  ],
  messages: [
    {
      id: "message-1",
      body: "متن پیام نمونه",
      recipients: 1,
      channel: "sms",
      status: "sent",
      createdAt: "۱۴۰۵/۰۶/۰۲ - ۲۰:۵۹",
    },
    {
      id: "message-2",
      body: "متن پیام نمونه",
      recipients: 216,
      channel: "sms",
      status: "queued",
      createdAt: "۱۴۰۵/۰۶/۰۱ - ۱۸:۳۰",
    },
  ],
  reviews: [
    {
      id: "review-1",
      customerName: "کاربر نمونه ۱",
      score: 5,
      comment: "نظر نمایشی",
      createdAt: "۱۴۰۵/۰۵/۲۹",
    },
    {
      id: "review-2",
      customerName: "کاربر نمونه ۲",
      score: 4,
      comment: "نظر نمایشی",
      createdAt: "۱۴۰۵/۰۵/۲۶",
    },
  ],
  stats: {
    totalCustomers: 216,
    totalAppointments: 412,
    todayAppointments: 4,
    smsBalance: 225,
    incomeThisMonth: 18900000,
  },
};

// این تابع برای نمایش مبالغ به‌شکل خوانای فارسی استفاده می‌شود.
export function formatPrice(value: number): string {
  return new Intl.NumberFormat("fa-IR").format(value);
}
