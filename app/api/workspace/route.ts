/**
 * API مرکزی Repo Time
 * GET تمام داده‌های لازم داشبورد را می‌خواند و POST عملیات ایجاد مشتری،
 * خدمت، نوبت و پیام را انجام می‌دهد. اطلاعات فقط روی سرور به D1 می‌رسند.
 */

// توابع شرط و مرتب‌سازی Drizzle برای کوئری‌های خوانا وارد می‌شوند.
import { desc, eq } from "drizzle-orm";

// اتصال پایگاه‌داده از یک نقطه‌ی کنترل‌شده دریافت می‌شود.
import { getDb } from "../../../db";

// جدول‌هایی که این API اجازه‌ی خواندن یا نوشتن آن‌ها را دارد وارد می‌شوند.
import { appointments, customers, messages, reviews, services } from "../../../db/schema";

// داده‌ی اولیه باعث می‌شود اولین ورود کاربر با داشبورد خالی روبه‌رو نشود.
import { DEMO_WORKSPACE } from "../../../lib/demo-data";

// نوع پاسخ برای جلوگیری از تفاوت بین API و رابط کاربری استفاده می‌شود.
import type { AppointmentStatus, WorkspaceData } from "../../../lib/types";

// این Route در هر درخواست اجرا می‌شود و خروجی آن نباید در کش عمومی بماند.
export const dynamic = "force-dynamic";

// شکل درخواست‌های POST را به چند عملیات مشخص محدود می‌کنیم.
type WorkspaceAction =
  | { action: "createCustomer"; payload: Record<string, unknown> }
  | { action: "createService"; payload: Record<string, unknown> }
  | { action: "createAppointment"; payload: Record<string, unknown> }
  | { action: "sendMessage"; payload: Record<string, unknown> };

// مقدار متنی را امن و بدون فاصله‌ی اضافی استخراج می‌کنیم.
function readText(payload: Record<string, unknown>, key: string, fallback = ""): string {
  const value = payload[key];
  return typeof value === "string" ? value.trim() : fallback;
}

// مقدار عددی را می‌خوانیم و برای ورودی نامعتبر مقدار جایگزین می‌گذاریم.
function readNumber(payload: Record<string, unknown>, key: string, fallback = 0): number {
  const value = Number(payload[key]);
  return Number.isFinite(value) ? value : fallback;
}

// مقدار بولی فقط وقتی false صریح باشد خاموش می‌شود؛ در غیر این صورت fallback ملاک است.
function readBoolean(payload: Record<string, unknown>, key: string, fallback = false): boolean {
  const value = payload[key];
  return typeof value === "boolean" ? value : fallback;
}

// هویت مالک از Header امن فضای کاری خوانده می‌شود؛ حالت demo برای اجرای محلی است.
function getOwnerKey(request: Request): string {
  return request.headers.get("oai-authenticated-user-email")?.toLowerCase() ?? "demo@repo-time.local";
}

// برای حفظ حریم خصوصی، شماره‌های واقعی در پاسخ عمومی ماسک می‌شوند.
function maskMobile(mobile: string): string {
  if (mobile.includes("•") || mobile.length < 8) return mobile;
  return `${mobile.slice(0, 4)}•••${mobile.slice(-3)}`;
}

// در اولین استفاده، چند رکورد آموزشی مخصوص همان مالک وارد پایگاه‌داده می‌شوند.
async function seedWorkspace(ownerKey: string) {
  const db = getDb();

  // وجود یک مشتری کافی است تا بفهمیم اطلاعات اولیه قبلاً اضافه شده‌اند.
  const existingCustomers = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.ownerKey, ownerKey))
    .limit(1);

  // اگر داده وجود دارد، بدون تغییر پایگاه‌داده از تابع خارج می‌شویم.
  if (existingCustomers.length > 0) return;

  // مشتریان نمونه با ownerKey جاری وارد می‌شوند تا داده‌های کاربران مخلوط نشوند.
  await db.insert(customers).values(
    DEMO_WORKSPACE.customers.map((customer) => ({ ...customer, ownerKey })),
  );

  // خدمات نمونه برای فرم ثبت نوبت ساخته می‌شوند.
  await db.insert(services).values(
    DEMO_WORKSPACE.services.map((service) => ({ ...service, ownerKey })),
  );

  // نوبت‌های نمونه، تقویم اولین ورود را قابل بررسی می‌کنند.
  await db.insert(appointments).values(
    DEMO_WORKSPACE.appointments.map((appointment) => ({ ...appointment, ownerKey })),
  );

  // دو پیام نمونه برای تاریخچه‌ی سامانه پیامک اضافه می‌شوند.
  await db.insert(messages).values(
    DEMO_WORKSPACE.messages.map((message) => ({ ...message, ownerKey })),
  );

  // نظرهای نمونه برای نمودار رضایت‌سنجی ثبت می‌شوند.
  await db.insert(reviews).values(
    DEMO_WORKSPACE.reviews.map((review) => ({ ...review, ownerKey })),
  );
}

// این تابع رکوردهای چند جدول را به پاسخ واحد مناسب رابط کاربری تبدیل می‌کند.
async function readWorkspace(ownerKey: string): Promise<WorkspaceData> {
  const db = getDb();

  // درخواست‌ها مستقل‌اند؛ اجرای هم‌زمان زمان پاسخ را کمتر می‌کند.
  const [customerRows, serviceRows, appointmentRows, messageRows, reviewRows] = await Promise.all([
    db.select().from(customers).where(eq(customers.ownerKey, ownerKey)).orderBy(desc(customers.createdAt)),
    db.select().from(services).where(eq(services.ownerKey, ownerKey)).orderBy(services.name),
    db.select().from(appointments).where(eq(appointments.ownerKey, ownerKey)).orderBy(desc(appointments.appointmentDate), appointments.appointmentTime),
    db.select().from(messages).where(eq(messages.ownerKey, ownerKey)).orderBy(desc(messages.createdAt)),
    db.select().from(reviews).where(eq(reviews.ownerKey, ownerKey)).orderBy(desc(reviews.createdAt)),
  ]);

  // مبلغ ماه از جمع نوبت‌های لغونشده محاسبه می‌شود.
  const incomeThisMonth = appointmentRows
    .filter((appointment) => appointment.status !== "cancelled")
    .reduce((total, appointment) => total + appointment.price, 0);

  // پاسخ نهایی با فیلدهای دقیق WorkspaceData ساخته می‌شود.
  return {
    customers: customerRows.map((customer) => ({
      id: customer.id,
      name: customer.name,
      mobile: maskMobile(customer.mobile),
      job: customer.job,
      groupName: customer.groupName,
      birthDate: customer.birthDate,
      lastVisit: customer.lastVisit,
      notes: customer.notes,
      createdAt: customer.createdAt,
    })),
    services: serviceRows,
    appointments: appointmentRows.map((appointment) => ({
      ...appointment,
      mobile: maskMobile(appointment.mobile),
      status: appointment.status as AppointmentStatus,
    })),
    messages: messageRows.map((message) => ({
      ...message,
      channel: message.channel as "sms" | "bale" | "system",
      status: message.status as "draft" | "queued" | "sent",
    })),
    reviews: reviewRows,
    stats: {
      // اعداد پایه‌ی ویدیو حفظ می‌شوند و رکوردهای جدید به آن‌ها اضافه می‌شوند.
      totalCustomers: 211 + customerRows.length,
      totalAppointments: 408 + appointmentRows.length,
      todayAppointments: appointmentRows.filter((item) => item.appointmentDate === "۱۴۰۵/۰۶/۰۳").length,
      smsBalance: 225,
      incomeThisMonth,
    },
  };
}

// خطای جدول مهاجرت‌نشده به پیام قابل‌فهم برای توسعه‌دهنده تبدیل می‌شود.
function toApiError(error: unknown): string {
  const message = error instanceof Error ? error.message : "خطای ناشناخته";
  if (message.includes("no such table")) {
    return "جدول‌های D1 هنوز ساخته نشده‌اند؛ migration پروژه را روی محیط میزبان اعمال کنید.";
  }
  return message;
}

// GET هنگام باز شدن برنامه، داده‌های کامل همان مالک را برمی‌گرداند.
export async function GET(request: Request) {
  try {
    const ownerKey = getOwnerKey(request);
    await seedWorkspace(ownerKey);
    return Response.json({ workspace: await readWorkspace(ownerKey) });
  } catch (error) {
    return Response.json({ error: toApiError(error) }, { status: 500 });
  }
}

// POST تنها چهار عملیات نوشتنی کنترل‌شده را می‌پذیرد.
export async function POST(request: Request) {
  try {
    const ownerKey = getOwnerKey(request);
    const body = (await request.json()) as WorkspaceAction;
    const payload = body.payload ?? {};
    const db = getDb();

    // ایجاد مشتری جدید پس از بررسی نام و شماره انجام می‌شود.
    if (body.action === "createCustomer") {
      const name = readText(payload, "name");
      const mobile = readText(payload, "mobile");
      if (!name || !mobile) {
        return Response.json({ error: "نام و شماره موبایل الزامی است." }, { status: 400 });
      }
      await db.insert(customers).values({
        id: crypto.randomUUID(),
        ownerKey,
        name,
        mobile,
        job: readText(payload, "job", "ثبت نشده"),
        groupName: readText(payload, "groupName", "سایر"),
        birthDate: readText(payload, "birthDate"),
        lastVisit: readText(payload, "lastVisit", "۱۴۰۵/۰۶/۰۳"),
        notes: readText(payload, "notes"),
      });
    }

    // ایجاد خدمت، مدت و مبلغ را به عدد معتبر تبدیل می‌کند.
    if (body.action === "createService") {
      const name = readText(payload, "name");
      if (!name) {
        return Response.json({ error: "نام خدمت الزامی است." }, { status: 400 });
      }
      await db.insert(services).values({
        id: crypto.randomUUID(),
        ownerKey,
        name,
        durationMinutes: readNumber(payload, "durationMinutes", 30),
        price: readNumber(payload, "price", 0),
        color: readText(payload, "color", "#7b2cff"),
        active: true,
      });
    }

    // ایجاد نوبت نیازمند مشتری، خدمت، تاریخ و ساعت است.
    if (body.action === "createAppointment") {
      const customerName = readText(payload, "customerName");
      const serviceName = readText(payload, "serviceName");
      const appointmentDate = readText(payload, "appointmentDate");
      const appointmentTime = readText(payload, "appointmentTime");
      if (!customerName || !serviceName || !appointmentDate || !appointmentTime) {
        return Response.json({ error: "مشتری، خدمت، تاریخ و ساعت نوبت الزامی است." }, { status: 400 });
      }
      await db.insert(appointments).values({
        id: crypto.randomUUID(),
        ownerKey,
        customerId: readText(payload, "customerId") || null,
        customerName,
        mobile: readText(payload, "mobile"),
        serviceId: readText(payload, "serviceId") || null,
        serviceName,
        appointmentDate,
        appointmentTime,
        status: "confirmed",
        price: readNumber(payload, "price", 0),
        reminderEnabled: readBoolean(payload, "reminderEnabled", true),
        followupEnabled: readBoolean(payload, "followupEnabled", false),
        notes: readText(payload, "notes"),
      });
    }

    // پیام پس از محاسبه تعداد گیرندگان در صف ثبت می‌شود؛ اتصال Provider مرحله‌ی بعدی است.
    if (body.action === "sendMessage") {
      const messageBody = readText(payload, "body");
      if (!messageBody) {
        return Response.json({ error: "متن پیام نمی‌تواند خالی باشد." }, { status: 400 });
      }
      await db.insert(messages).values({
        id: crypto.randomUUID(),
        ownerKey,
        body: messageBody,
        recipients: readNumber(payload, "recipients", 1),
        channel: readText(payload, "channel", "sms"),
        status: "queued",
      });
    }

    // نام عملیات ناشناخته رد می‌شود تا هیچ نوشتن ناخواسته‌ای انجام نشود.
    if (!["createCustomer", "createService", "createAppointment", "sendMessage"].includes(body.action)) {
      return Response.json({ error: "عملیات درخواستی پشتیبانی نمی‌شود." }, { status: 400 });
    }

    // بعد از هر تغییر، نسخه‌ی تازه‌ی Workspace به رابط بازگردانده می‌شود.
    return Response.json({ workspace: await readWorkspace(ownerKey) }, { status: 201 });
  } catch (error) {
    return Response.json({ error: toApiError(error) }, { status: 500 });
  }
}
