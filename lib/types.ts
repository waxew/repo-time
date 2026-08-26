/**
 * این فایل قراردادهای داده‌ای مشترک پروژه را نگه می‌دارد.
 * جدا بودن Typeها باعث می‌شود رابط کاربری، API و داده‌های نمونه
 * همگی دقیقاً از یک شکل داده استفاده کنند و خطاهای تایپی زودتر دیده شوند.
 */

// شناسه‌ی هر صفحه داخلی برنامه را محدود می‌کنیم تا مسیر اشتباه ساخته نشود.
export type ViewId =
  | "dashboard"
  | "calendar"
  | "customers"
  | "messages"
  | "dedicated-number"
  | "regional-sms"
  | "birthday"
  | "satisfaction"
  | "repair-reminder"
  | "customer-return"
  | "online-booking"
  | "website"
  | "club"
  | "raffle"
  | "accounting"
  | "reports"
  | "sms-packages"
  | "services"
  | "profile"
  | "support"
  | "search";

// وضعیت‌های قابل انتخاب برای یک نوبت در تقویم تعریف می‌شوند.
export type AppointmentStatus = "confirmed" | "pending" | "done" | "cancelled";

// اطلاعاتی که برای نمایش و پرونده‌ی هر مشتری لازم است.
export interface Customer {
  id: string;
  name: string;
  mobile: string;
  job: string;
  groupName: string;
  birthDate: string;
  lastVisit: string;
  notes: string;
  createdAt: string;
}

// هر خدمت قابل رزرو با مدت، قیمت و رنگ مشخص نمایش داده می‌شود.
export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  color: string;
  active: boolean;
}

// این ساختار تمام جزئیات لازم برای کارت نوبت و فرم ثبت را نگه می‌دارد.
export interface Appointment {
  id: string;
  customerId: string | null;
  customerName: string;
  mobile: string;
  serviceId: string | null;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  status: AppointmentStatus;
  price: number;
  reminderEnabled: boolean;
  followupEnabled: boolean;
  notes: string;
  createdAt: string;
}

// سوابق پیام‌های ساخته‌شده یا ارسال‌شده در این قالب قرار می‌گیرند.
export interface MessageRecord {
  id: string;
  body: string;
  recipients: number;
  channel: "sms" | "bale" | "system";
  status: "draft" | "queued" | "sent";
  createdAt: string;
}

// نظر ثبت‌شده‌ی مشتری برای صفحه رضایت‌سنجی استفاده می‌شود.
export interface Review {
  id: string;
  customerName: string;
  score: number;
  comment: string;
  createdAt: string;
}

// اعداد خلاصه‌ای که در داشبورد و گزارش پیامکی نشان داده می‌شوند.
export interface WorkspaceStats {
  totalCustomers: number;
  totalAppointments: number;
  todayAppointments: number;
  smsBalance: number;
  incomeThisMonth: number;
}

// پاسخ کامل API که یک‌بار رابط کاربری را با داده‌های لازم پر می‌کند.
export interface WorkspaceData {
  customers: Customer[];
  services: Service[];
  appointments: Appointment[];
  messages: MessageRecord[];
  reviews: Review[];
  stats: WorkspaceStats;
}

// نام آیکن‌ها فقط به گزینه‌های پشتیبانی‌شده در کامپوننت آیکن محدود می‌شود.
export type IconName =
  | "home"
  | "calendar"
  | "users"
  | "message"
  | "megaphone"
  | "phone"
  | "pin"
  | "gift"
  | "smile"
  | "bell"
  | "return"
  | "globe"
  | "diamond"
  | "ticket"
  | "wallet"
  | "chart"
  | "settings"
  | "search"
  | "plus"
  | "user"
  | "book"
  | "briefcase"
  | "clock"
  | "check"
  | "close"
  | "chevron"
  | "menu"
  | "send"
  | "star"
  | "link"
  | "download";

// اطلاعات لازم برای ساخت کارت‌های امکانات صفحه اصلی.
export interface FeatureCard {
  id: ViewId;
  title: string;
  icon: IconName;
  accent: string;
  badge?: string;
  metric?: string;
  wide?: boolean;
}
