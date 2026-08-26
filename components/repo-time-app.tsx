"use client";

/**
 * این فایل رابط تعاملی اصلی Repo Time است.
 * تمام صفحه‌های دیده‌شده در ویدیو از یک پوسته‌ی موبایل‌محور استفاده می‌کنند
 * و روی دسکتاپ به یک پنل مدیریتی عریض تبدیل می‌شوند.
 */

// Hookهای React برای وضعیت، محاسبات و دریافت داده از API وارد می‌شوند.
import { useEffect, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";

// آیکن داخلی پروژه جایگزین وابستگی‌های گرافیکی سنگین است.
import { AppIcon } from "./app-icon";

// داده‌های نمایشی و تنظیمات ثابت رابط از فایل مستقل خوانده می‌شوند.
import { DEMO_WORKSPACE, FEATURE_CARDS, PERSIAN_WEEK_DAYS, TODAY_JALALI, formatPrice } from "../lib/demo-data";

// Typeهای مشترک تضمین می‌کنند داده‌ی API و کارت‌ها شکل یکسانی داشته باشند.
import type { Appointment, Customer, IconName, Service, ViewId, WorkspaceData } from "../lib/types";

// انواع پنجره‌هایی که روی صفحه باز می‌شوند به چند حالت مشخص محدود شده‌اند.
type ModalName = "quick" | "appointment" | "customer" | "service" | "notifications" | null;

// ورودی نام و ایمیل مالک از صفحه‌ی سروری دریافت می‌شود.
interface RepoTimeAppProps {
  userName: string;
  userEmail: string;
}

// متن وضعیت نوبت در یک محل تعریف می‌شود تا در همه‌ی کارت‌ها یکسان بماند.
const STATUS_LABELS: Record<Appointment["status"], string> = {
  confirmed: "تأیید شده",
  pending: "در انتظار",
  done: "انجام شده",
  cancelled: "لغو شده",
};

// اعداد انگلیسی با این تابع به عدد فارسی بدون جداکننده تبدیل می‌شوند.
function faNumber(value: number): string {
  return value.toLocaleString("fa-IR", { useGrouping: false });
}

// این تابع تاریخ و ساعت رکوردهای محلی جدید را به شکل خوانا می‌سازد.
function localTimestamp(): string {
  return `${TODAY_JALALI} - ${new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date())}`;
}

// کامپوننت اصلی تمام مسیرهای داخلی و وضعیت داده را مدیریت می‌کند.
export function RepoTimeApp({ userName, userEmail }: RepoTimeAppProps) {
  // صفحه‌ی آغازین همان داشبورد امکانات ویدیو است.
  const [view, setView] = useState<ViewId>("dashboard");

  // داده‌ی نمونه فوراً نمایش داده می‌شود تا رابط هنگام دریافت API خالی نباشد.
  const [workspace, setWorkspace] = useState<WorkspaceData>(DEMO_WORKSPACE);

  // وضعیت بارگذاری برای نقطه‌ی کوچک همگام‌سازی در Header استفاده می‌شود.
  const [loading, setLoading] = useState(true);

  // پنجره‌های فرم و اعلان از یک State مرکزی کنترل می‌شوند.
  const [modal, setModal] = useState<ModalName>(null);

  // پیام کوتاه موفقیت یا خطا پایین صفحه نشان داده می‌شود.
  const [toast, setToast] = useState("");

  // شناسه مشتری انتخاب‌شده صفحه پرونده همان مشتری را باز می‌کند.
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // عبارت جست‌وجو بین مشتری و خدمت مشترک است.
  const [searchQuery, setSearchQuery] = useState("");

  // در اولین رندر، اطلاعات ذخیره‌شده از D1 دریافت می‌شوند.
  useEffect(() => {
    let active = true;

    // تابع داخلی اجازه می‌دهد هنگام خروج از صفحه پاسخ قدیمی نادیده گرفته شود.
    async function loadWorkspace() {
      try {
        const response = await fetch("/api/workspace", { cache: "no-store" });
        const result = (await response.json()) as { workspace?: WorkspaceData; error?: string };
        if (active && response.ok && result.workspace) setWorkspace(result.workspace);
      } catch {
        // داده‌ی نمایشی از قبل حاضر است؛ قطعی موقت رابط را از کار نمی‌اندازد.
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadWorkspace();
    return () => {
      active = false;
    };
  }, []);

  // پیام Toast پس از زمان کوتاه خودکار پاک می‌شود.
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  // تغییر صفحه، انتخاب پرونده قبلی را پاک و صفحه را به بالا منتقل می‌کند.
  function openView(nextView: ViewId) {
    setSelectedCustomerId(null);
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // این تابع عملیات نوشتن را به API می‌فرستد و پاسخ تازه را در رابط قرار می‌دهد.
  async function performAction(
    action: "createCustomer" | "createService" | "createAppointment" | "sendMessage",
    payload: Record<string, unknown>,
    onOfflineFallback: () => void,
    successMessage: string,
  ) {
    try {
      const response = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, payload }),
      });
      const result = (await response.json()) as { workspace?: WorkspaceData; error?: string };
      if (!response.ok || !result.workspace) throw new Error(result.error ?? "ذخیره انجام نشد");
      setWorkspace(result.workspace);
      setToast(successMessage);
    } catch {
      // در اجرای آفلاین، تغییر داخل مرورگر حفظ می‌شود تا نمونه همچنان قابل امتحان باشد.
      onOfflineFallback();
      setToast(`${successMessage} (حالت نمایشی)`);
    }
  }

  // صفحه‌ی مناسب بر اساس شناسه‌ی View در این محل انتخاب می‌شود.
  let content: ReactNode;
  if (view === "dashboard") {
    content = (
      <DashboardView
        loading={loading}
        openNotifications={() => setModal("notifications")}
        openView={openView}
        stats={workspace.stats}
        userName={userName}
      />
    );
  } else if (view === "calendar") {
    content = (
      <CalendarView
        appointments={workspace.appointments}
        openAppointment={() => setModal("appointment")}
        openServices={() => openView("services")}
        onBack={() => openView("dashboard")}
      />
    );
  } else if (view === "customers") {
    content = (
      <CustomersView
        customers={workspace.customers}
        onAdd={() => setModal("customer")}
        onBack={() => openView("dashboard")}
        onSelect={setSelectedCustomerId}
        selectedCustomerId={selectedCustomerId}
      />
    );
  } else if (view === "messages") {
    content = (
      <MessagesView
        customerCount={workspace.stats.totalCustomers}
        messages={workspace.messages}
        onBack={() => openView("dashboard")}
        onSend={performAction}
      />
    );
  } else if (view === "satisfaction") {
    content = <SatisfactionView onBack={() => openView("dashboard")} reviews={workspace.reviews} />;
  } else if (view === "reports" || view === "accounting") {
    content = <ReportsView onBack={() => openView("dashboard")} stats={workspace.stats} view={view} />;
  } else if (view === "services") {
    content = (
      <ServicesView
        onAdd={() => setModal("service")}
        onBack={() => openView("dashboard")}
        services={workspace.services}
      />
    );
  } else if (view === "profile") {
    content = <ProfileView onBack={() => openView("dashboard")} userEmail={userEmail} userName={userName} />;
  } else if (view === "search") {
    content = (
      <SearchView
        customers={workspace.customers}
        onBack={() => openView("dashboard")}
        onOpenCustomer={(id) => {
          setSelectedCustomerId(id);
          setView("customers");
        }}
        query={searchQuery}
        services={workspace.services}
        setQuery={setSearchQuery}
      />
    );
  } else {
    content = <ToolView onBack={() => openView("dashboard")} openView={openView} view={view} />;
  }

  // خروجی نهایی از پوسته، محتوای صفحه، نوار پایین، Modal و Toast تشکیل می‌شود.
  return (
    <main className="repo-app" dir="rtl">
      <div className="desktop-aura desktop-aura-one" />
      <div className="desktop-aura desktop-aura-two" />

      <section className="app-shell" aria-label="سامانه مدیریت نوبت Repo Time">
        <div className="app-content">{content}</div>

        <BottomNavigation
          activeView={view}
          onOpenQuick={() => setModal("quick")}
          openView={openView}
        />
      </section>

      {modal && (
        <ModalLayer close={() => setModal(null)} title={modalTitle(modal)}>
          {modal === "quick" && (
            <QuickActions
              onChoose={(target) => {
                setModal(target);
              }}
            />
          )}
          {modal === "appointment" && (
            <AppointmentForm
              customers={workspace.customers}
              onCancel={() => setModal(null)}
              onCreate={performAction}
              onDone={() => {
                setModal(null);
                setView("calendar");
              }}
              services={workspace.services}
            />
          )}
          {modal === "customer" && (
            <CustomerForm
              onCancel={() => setModal(null)}
              onCreate={performAction}
              onDone={() => {
                setModal(null);
                setView("customers");
              }}
            />
          )}
          {modal === "service" && (
            <ServiceForm
              onCancel={() => setModal(null)}
              onCreate={performAction}
              onDone={() => setModal(null)}
            />
          )}
          {modal === "notifications" && <Notifications close={() => setModal(null)} />}
        </ModalLayer>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}

// عنوان فارسی هر Modal در Header همان پنجره نشان داده می‌شود.
function modalTitle(modal: Exclude<ModalName, null>): string {
  const titles = {
    quick: "افزودن سریع",
    appointment: "ثبت نوبت",
    customer: "ثبت مشتری",
    service: "افزودن خدمت",
    notifications: "اعلان‌ها",
  };
  return titles[modal];
}

// لوگوی متنی Repo Time با نشان تیک گرادیانی ساخته می‌شود.
function BrandLogo() {
  return (
    <div className="brand-logo" aria-label="Repo Time">
      <span className="brand-mark"><AppIcon name="check" size={15} /></span>
      <span className="brand-copy">
        <strong>REPO TIME</strong>
        <small>BUSINESS PRIME</small>
      </span>
      <span className="version-pill">VER 1.0</span>
    </div>
  );
}

// Header صفحه اصلی، برند، اعلان و تب‌های سطح اول را نمایش می‌دهد.
function DashboardHeader({ loading, openNotifications, openView }: {
  loading: boolean;
  openNotifications: () => void;
  openView: (view: ViewId) => void;
}) {
  return (
    <header className="dashboard-header">
      <div className="header-row">
        <BrandLogo />
        <button className="icon-button notification-button" onClick={openNotifications} type="button">
          <AppIcon name="bell" size={21} />
          <span className={loading ? "sync-dot is-loading" : "sync-dot"} />
          <span className="sr-only">مشاهده اعلان‌ها</span>
        </button>
      </div>
      <nav className="top-tabs" aria-label="بخش‌های اصلی">
        <button className="is-active" type="button">امکانات</button>
        <button onClick={() => openView("club")} type="button">کلاب</button>
        <button onClick={() => openView("support")} type="button">پشتیبانی</button>
        <button onClick={() => openView("accounting")} type="button">درگاه</button>
      </nav>
    </header>
  );
}

// صفحه داشبورد کارت‌های قابلیت و خلاصه حساب را مطابق ویدیو کنار هم می‌چیند.
function DashboardView({ loading, openNotifications, openView, stats, userName }: {
  loading: boolean;
  openNotifications: () => void;
  openView: (view: ViewId) => void;
  stats: WorkspaceData["stats"];
  userName: string;
}) {
  return (
    <div className="dashboard-page">
      <DashboardHeader loading={loading} openNotifications={openNotifications} openView={openView} />

      <section className="promo-banner">
        <div className="promo-art"><AppIcon name="users" size={34} /></div>
        <div>
          <small>ابزار رشد کسب‌وکار</small>
          <h1>لینک دریافت شماره مشتریان</h1>
          <p>یک فرم کوتاه برای تکمیل سریع باشگاه مشتریان بسازید.</p>
        </div>
        <button onClick={() => openView("online-booking")} type="button">ساخت لینک</button>
      </section>

      <section className="owner-card">
        <div className="owner-identity">
          <Avatar name={userName} />
          <div><strong>{userName}</strong><span>مدیر مجموعه</span></div>
        </div>
        <button onClick={() => openView("profile")} type="button">پروفایل <AppIcon name="chevron" size={15} /></button>
      </section>

      <section className="feature-board" aria-label="امکانات سامانه">
        {FEATURE_CARDS.map((feature, index) => (
          <button
            className={feature.wide ? "feature-card is-wide" : "feature-card"}
            key={`${feature.id}-${index}`}
            onClick={() => openView(feature.id)}
            style={{ "--accent": feature.accent } as CSSProperties}
            type="button"
          >
            {feature.badge && <span className="feature-badge">{feature.badge}</span>}
            <span className="feature-icon"><AppIcon name={feature.icon} size={24} /></span>
            <span className="feature-title">{feature.title}</span>
            {feature.metric && (
              <span className="feature-metric">
                {feature.id === "customers" ? faNumber(stats.totalCustomers) : faNumber(stats.todayAppointments)}
              </span>
            )}
            {feature.wide && <MiniTrend color={feature.accent} />}
            <span className="feature-arrow"><AppIcon name="chevron" size={14} /></span>
          </button>
        ))}
      </section>
    </div>
  );
}

// نمودار کوچک کارت‌های گزارش فقط یک نشانه‌ی بصری از روند داده‌هاست.
function MiniTrend({ color }: { color: string }) {
  return (
    <svg className="mini-trend" viewBox="0 0 120 34" role="img" aria-label="روند هفتگی">
      <defs>
        <linearGradient id={`trend-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity=".55" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M1 29 15 25 27 27 42 14 56 21 70 10 84 17 99 6 119 12V34H1Z" fill={`url(#trend-${color.replace("#", "")})`} />
      <path d="M1 29 15 25 27 27 42 14 56 21 70 10 84 17 99 6 119 12" fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

// Header ساده‌ی تمام صفحات داخلی دکمه بازگشت و عنوان را یکسان می‌کند.
function PageHeader({ title, onBack, action }: { title: string; onBack: () => void; action?: ReactNode }) {
  return (
    <header className="page-header">
      <button className="icon-button" onClick={onBack} type="button"><AppIcon name="chevron" size={20} /></button>
      <h1>{title}</h1>
      <div className="page-header-action">{action}</div>
    </header>
  );
}

// صفحه تقویم، نوار میانبر، تقویم ماه و کارت‌های نوبت را نمایش می‌دهد.
function CalendarView({ appointments, openAppointment, openServices, onBack }: {
  appointments: Appointment[];
  openAppointment: () => void;
  openServices: () => void;
  onBack: () => void;
}) {
  const [selectedDay, setSelectedDay] = useState(3);
  const [advanced, setAdvanced] = useState(false);
  const selectedDate = `۱۴۰۵/۰۶/${faNumber(selectedDay).padStart(2, "۰")}`;
  const dayAppointments = appointments.filter((item) => item.appointmentDate === selectedDate);

  return (
    <div className="light-page calendar-page">
      <PageHeader onBack={onBack} title="نوبت‌ها" />

      <div className="segmented-control">
        <button className={!advanced ? "is-active" : ""} onClick={() => setAdvanced(false)} type="button">ساده</button>
        <button className={advanced ? "is-active" : ""} onClick={() => setAdvanced(true)} type="button">پیشرفته + آنلاین</button>
      </div>

      <section className="quick-grid">
        <QuickButton icon="plus" label="ثبت نوبت" onClick={openAppointment} />
        <QuickButton icon="calendar" label="تقویم" onClick={() => setSelectedDay(3)} />
        <QuickButton icon="menu" label="در یک نگاه" onClick={() => undefined} />
        <QuickButton icon="settings" label="تنظیمات" onClick={openServices} />
      </section>

      <section className="month-card">
        <div className="month-title">
          <div><strong>شهریور ۱۴۰۵</strong><span>امروز، سه‌شنبه ۳ شهریور</span></div>
          <span className="calendar-legend"><i /> نوبت فعال</span>
        </div>
        <div className="week-labels">
          {PERSIAN_WEEK_DAYS.map((day) => <span key={day}>{day}</span>)}
        </div>
        <div className="month-days">
          {Array.from({ length: 35 }, (_, index) => {
            const day = index - 2;
            const isValid = day > 0 && day <= 31;
            const hasAppointment = [2, 3, 4, 5, 7, 12, 18, 24].includes(day);
            return (
              <button
                className={`${day === selectedDay ? "is-selected" : ""} ${hasAppointment ? "has-event" : ""}`}
                disabled={!isValid}
                key={index}
                onClick={() => isValid && setSelectedDay(day)}
                type="button"
              >
                {isValid ? faNumber(day) : ""}
              </button>
            );
          })}
        </div>
      </section>

      <section className="day-summary">
        <div className="day-number"><span>{faNumber(selectedDay)}</span><small>شهریور</small></div>
        <div><strong>{faNumber(dayAppointments.length)}</strong><span>نوبت ثبت شده</span></div>
        <div><strong>{formatPrice(dayAppointments.reduce((sum, item) => sum + item.price, 0))}</strong><span>تومان درآمد</span></div>
        <button onClick={openAppointment} type="button"><AppIcon name="plus" size={18} /> ثبت نوبت</button>
      </section>

      <div className="appointment-list">
        {dayAppointments.length > 0 ? dayAppointments.map((appointment) => (
          <AppointmentCard appointment={appointment} key={appointment.id} />
        )) : (
          <EmptyState icon="calendar" title="برای این تاریخ نوبتی ثبت نشده است" text="با دکمه ثبت نوبت، اولین زمان را اضافه کنید." />
        )}
      </div>
    </div>
  );
}

// دکمه‌های مربع بالای تقویم با آیکن و Label ساخته می‌شوند.
function QuickButton({ icon, label, onClick }: { icon: IconName; label: string; onClick: () => void }) {
  return (
    <button className="quick-button" onClick={onClick} type="button">
      <span><AppIcon name={icon} size={21} /></span>
      {label}
    </button>
  );
}

// کارت نوبت، ساعت، مشتری، خدمت، قیمت و وضعیت را در یک ردیف فشرده نشان می‌دهد.
function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <article className={`appointment-card status-${appointment.status}`}>
      <div className="appointment-time"><strong>{appointment.appointmentTime}</strong><span>{STATUS_LABELS[appointment.status]}</span></div>
      <div className="appointment-person"><strong>{appointment.customerName}</strong><span>{appointment.serviceName}</span></div>
      <div className="appointment-price"><strong>{formatPrice(appointment.price)}</strong><span>تومان</span></div>
      <button type="button"><AppIcon name="chevron" size={16} /><span className="sr-only">جزئیات نوبت</span></button>
    </article>
  );
}

// صفحه مشتریان شامل آمار، گروه‌ها، فهرست و نمایش پرونده انتخابی است.
function CustomersView({ customers, onAdd, onBack, onSelect, selectedCustomerId }: {
  customers: Customer[];
  onAdd: () => void;
  onBack: () => void;
  onSelect: (id: string | null) => void;
  selectedCustomerId: string | null;
}) {
  const [tab, setTab] = useState<"customers" | "report" | "manage">("customers");
  const [filter, setFilter] = useState("همه");
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId);

  if (selectedCustomer) {
    return <CustomerProfile customer={selectedCustomer} onBack={() => onSelect(null)} />;
  }

  const filteredCustomers = filter === "همه" ? customers : customers.filter((customer) => customer.groupName === filter);

  return (
    <div className="light-page customers-page">
      <PageHeader onBack={onBack} title="مشتریان" action={<button className="header-text-button" onClick={onAdd} type="button">افزودن +</button>} />

      <nav className="customer-tabs">
        <button onClick={onAdd} type="button"><AppIcon name="plus" size={18} /> افزودن</button>
        <button className={tab === "customers" ? "is-active" : ""} onClick={() => setTab("customers")} type="button"><AppIcon name="users" size={18} /> مشتریان</button>
        <button className={tab === "report" ? "is-active" : ""} onClick={() => setTab("report")} type="button"><AppIcon name="chart" size={18} /> گزارش</button>
        <button className={tab === "manage" ? "is-active" : ""} onClick={() => setTab("manage")} type="button"><AppIcon name="settings" size={18} /> مدیریت</button>
      </nav>

      {tab === "customers" && (
        <>
          <section className="customer-overview">
            <div className="overview-head"><span>مشتری تکمیل‌شده</span><strong>{faNumber(211 + customers.length)}</strong></div>
            <div className="age-chart" aria-label="پراکندگی سنی مشتریان">
              {[28, 47, 79, 51, 34, 20].map((height, index) => (
                <div key={height}><span style={{ height: `${height}%` }} className={index === 2 ? "is-active" : ""} /><small>{["۱۵-", "۲۰-۳۰", "۳۰-۴۰", "۴۰-۵۰", "۵۰-۶۰", "+۶۰"][index]}</small></div>
              ))}
            </div>
          </section>

          <div className="filter-chips">
            {["همه", "مشتریان مهم", "همکاران", "پزشکان", "کارگران"].map((group) => (
              <button className={filter === group ? "is-active" : ""} key={group} onClick={() => setFilter(group)} type="button">{group}</button>
            ))}
          </div>

          <section className="customer-list">
            {filteredCustomers.map((customer) => (
              <button className="customer-row" key={customer.id} onClick={() => onSelect(customer.id)} type="button">
                <Avatar name={customer.name} />
                <span><strong>{customer.name}</strong><small>{customer.mobile} · {customer.groupName}</small></span>
                <AppIcon name="chevron" size={17} />
              </button>
            ))}
          </section>
        </>
      )}

      {tab === "report" && (
        <section className="white-panel">
          <PanelTitle icon="chart" title="گزارش مشتریان" subtitle="ترکیب گروه‌ها و وضعیت تکمیل پرونده" />
          <div className="ring-stat"><strong>{faNumber(87)}٪</strong><span>پرونده کامل</span></div>
          <InfoRow label="همکاران" value={`${faNumber(customers.filter((item) => item.groupName === "همکاران").length)} مشتری`} />
          <InfoRow label="مشتریان مهم" value={`${faNumber(customers.filter((item) => item.groupName === "مشتریان مهم").length)} مشتری`} />
        </section>
      )}

      {tab === "manage" && (
        <section className="stack-list">
          <ActionRow icon="users" title="گروه مشتریان" subtitle="ساخت و ویرایش دسته‌بندی‌ها" />
          <ActionRow icon="link" title="نحوه آشنایی" subtitle="مدیریت کانال جذب مشتری" />
          <ActionRow icon="download" title="استخراج مشتریان" subtitle="دریافت فایل اکسل پرونده‌ها" badge="به‌زودی" />
        </section>
      )}
    </div>
  );
}

// پرونده یک مشتری مشابه صفحه جزئیات ویدیو، آمار و اقدامات سریع را نشان می‌دهد.
function CustomerProfile({ customer, onBack }: { customer: Customer; onBack: () => void }) {
  return (
    <div className="light-page customer-profile-page">
      <PageHeader onBack={onBack} title="پرونده مشتری" action={<button className="icon-button" type="button"><AppIcon name="menu" size={20} /></button>} />
      <section className="profile-hero-card">
        <Avatar name={customer.name} size="large" />
        <div><h2>{customer.name}</h2><p>{customer.mobile}</p></div>
      </section>
      <section className="profile-stat-grid">
        <div><strong>۷</strong><span>نوبت تکمیل</span></div>
        <div><strong>۲</strong><span>نوبت کنسل</span></div>
        <div><strong>۱,۹۰۰,۰۰۰</strong><span>میانگین پرداخت</span></div>
      </section>
      <section className="white-panel profile-details">
        <PanelTitle icon="clock" title="آخرین مراجعه" subtitle={customer.lastVisit || "ثبت نشده"} />
        <InfoRow label="گروه" value={customer.groupName} />
        <InfoRow label="شغل" value={customer.job} />
        <InfoRow label="تولد" value={customer.birthDate || "ثبت نشده"} />
        <InfoRow label="توضیحات پرونده" value={customer.notes || "بدون توضیح"} />
      </section>
      <div className="dual-actions">
        <button className="dark-button" type="button"><AppIcon name="calendar" size={18} /> ثبت نوبت</button>
        <button className="dark-button" type="button"><AppIcon name="ticket" size={18} /> کارت هدیه</button>
      </div>
    </div>
  );
}

// صفحه پیامک دو حالت ایجاد پیام و تاریخچه ارسال را پیاده می‌کند.
function MessagesView({ customerCount, messages, onBack, onSend }: {
  customerCount: number;
  messages: WorkspaceData["messages"];
  onBack: () => void;
  onSend: (
    action: "createCustomer" | "createService" | "createAppointment" | "sendMessage",
    payload: Record<string, unknown>,
    fallback: () => void,
    success: string,
  ) => Promise<void>;
}) {
  const [tab, setTab] = useState<"new" | "history">("new");
  const [body, setBody] = useState("");
  const [recipients, setRecipients] = useState(216);
  const characters = body.length;
  const messageParts = Math.max(1, Math.ceil(characters / 70));

  async function submitMessage() {
    if (!body.trim()) return;
    const localMessage = {
      id: `local-${Date.now()}`,
      body,
      recipients,
      channel: "sms" as const,
      status: "queued" as const,
      createdAt: localTimestamp(),
    };
    await onSend(
      "sendMessage",
      { body, recipients, channel: "sms" },
      () => {
        DEMO_WORKSPACE.messages = [localMessage, ...DEMO_WORKSPACE.messages];
      },
      "پیام در صف ارسال قرار گرفت",
    );
    setBody("");
    setTab("history");
  }

  return (
    <div className="light-page messages-page">
      <PageHeader onBack={onBack} title="پیامک گروهی" />
      <div className="underlined-tabs">
        <button className={tab === "new" ? "is-active" : ""} onClick={() => setTab("new")} type="button">ارسال جدید</button>
        <button className={tab === "history" ? "is-active" : ""} onClick={() => setTab("history")} type="button">لیست ارسال‌ها</button>
      </div>

      {tab === "new" ? (
        <>
          <section className="message-type-grid">
            <button className="is-active" type="button"><AppIcon name="message" size={24} /><strong>پیامک</strong><span>ارسال پیام گروهی</span></button>
            <button type="button"><AppIcon name="check" size={24} /><strong>پیام‌رسان بله</strong><span>کانال جایگزین</span></button>
          </section>

          <section className="composer-card">
            <div className="audience-row"><strong>همه مشتریان</strong><span>{faNumber(customerCount)} نفر</span></div>
            <label className="field-label" htmlFor="sms-body">متن پیامک</label>
            <textarea id="sms-body" onChange={(event) => setBody(event.target.value)} placeholder="متن خود را بنویسید..." value={body} />
            <button className="ready-message" onClick={() => setBody("مشتری عزیز؛ زمان نوبت شما ثبت شد. برای مشاهده جزئیات وارد Repo Time شوید.")} type="button"><AppIcon name="message" size={17} /> پیام‌های آماده</button>
            <div className="counter-row"><span>متن شما: {faNumber(characters)} کاراکتر</span><span>{faNumber(messageParts)} پیامک</span></div>
          </section>

          <section className="calculator-card">
            <h3>محاسبه پیام</h3>
            <InfoRow label="تعداد گیرندگان" value={`${faNumber(recipients)} نفر`} />
            <label className="range-label">تنظیم گیرندگان
              <input max={customerCount} min="1" onChange={(event) => setRecipients(Number(event.target.value))} type="range" value={Math.min(recipients, customerCount)} />
            </label>
            <InfoRow label="هزینه کل" value={`${faNumber(recipients * messageParts)} پیامک`} />
            <div className="balance-pill">موجودی شما: ۲۲۵ پیامک</div>
          </section>

          <section className="rules-card">
            <h3>قوانین ارسال</h3>
            <p>شماره‌های تکراری فقط یک‌بار پیام دریافت می‌کنند.</p>
            <p>پیام‌های نامناسب یا خلاف قوانین مخابرات ارسال نمی‌شوند.</p>
            <p>برای ارسال واقعی، درگاه پیامک باید در تنظیمات سرور متصل شود.</p>
          </section>

          <button className="gradient-button sticky-action" disabled={!body.trim()} onClick={() => void submitMessage()} type="button">
            ارسال پیام
          </button>
        </>
      ) : (
        <section className="message-history">
          {messages.map((message) => (
            <article key={message.id}>
              <span className={`status-dot status-${message.status}`} />
              <div><strong>{message.body}</strong><small>{message.createdAt}</small></div>
              <span>{faNumber(message.recipients)} نفر</span>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

// صفحه رضایت‌سنجی میانگین امتیاز و کارت نظرهای مشتریان را نمایش می‌دهد.
function SatisfactionView({ onBack, reviews }: { onBack: () => void; reviews: WorkspaceData["reviews"] }) {
  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length : 0;
  return (
    <div className="light-page satisfaction-page">
      <PageHeader onBack={onBack} title="رضایت‌سنجی" />
      <div className="underlined-tabs"><button className="is-active" type="button">رضایت‌سنجی</button><button type="button">پیام اتوماتیک</button></div>
      <section className="satisfaction-summary">
        <div><strong>{average.toLocaleString("fa-IR", { maximumFractionDigits: 1 })}</strong><span>از ۵</span></div>
        <div className="stars">★★★★★</div>
        <p>{faNumber(Math.round((average / 5) * 100))}٪ رضایت مشتریان</p>
      </section>
      <h2 className="section-heading">نظرات مشتریان</h2>
      <section className="review-list">
        {reviews.map((review) => (
          <article key={review.id}>
            <div className="review-head"><Avatar name={review.customerName} /><div><strong>{review.customerName}</strong><small>{review.createdAt}</small></div><span>{faNumber(review.score)} ★</span></div>
            <p>{review.comment}</p>
            <div className="review-actions"><button type="button">مشاهده پرونده</button><button className="icon-button" type="button"><AppIcon name="close" size={17} /></button></div>
          </article>
        ))}
      </section>
    </div>
  );
}

// گزارش مالی و گزارش سیستم از یک اسکلت مشترک با محتوای متناسب استفاده می‌کنند.
function ReportsView({ onBack, stats, view }: { onBack: () => void; stats: WorkspaceData["stats"]; view: "reports" | "accounting" }) {
  const financial = view === "accounting";
  return (
    <div className="light-page reports-page">
      <PageHeader onBack={onBack} title={financial ? "حسابداری مالی" : "آمار و گزارش‌ها"} />
      <section className="report-hero">
        <div><small>{financial ? "درآمد این ماه" : "گزارش سیستم"}</small><strong>{financial ? `${formatPrice(stats.incomeThisMonth)} تومان` : "روند ۳۰ روز اخیر"}</strong></div>
        <MiniTrend color={financial ? "#20dd80" : "#5664ff"} />
      </section>
      <section className="report-metrics">
        <div><span>مشتریان</span><strong>{faNumber(stats.totalCustomers)}</strong><small>+۱۲٪</small></div>
        <div><span>نوبت امروز</span><strong>{faNumber(stats.todayAppointments)}</strong><small>فعال</small></div>
        <div><span>موجودی پیامک</span><strong>{faNumber(stats.smsBalance)}</strong><small>پیامک</small></div>
      </section>
      <section className="stack-list">
        <ActionRow icon="users" title="گزارش و تحلیل مشتریان" subtitle="گروه سنی، شغل و مراجعات" />
        <ActionRow icon="return" title="گزارش مصرف پیامک‌ها" subtitle="ارسال، کاراکتر و هزینه" />
        <ActionRow icon="chart" title="گزارش و تحلیل مالی" subtitle="فروش، هزینه و درآمد" />
        <ActionRow icon="ticket" title="گزارش تراکنش‌ها" subtitle="خرید بسته و پرداخت مشتری" />
      </section>
      <section className="transaction-list">
        <h2>{financial ? "تراکنش‌های اخیر" : "رویدادهای اخیر"}</h2>
        {["وقت پیوند محمدی", "فرزانه زنی سعادت", "بهرام طراخی"].map((name, index) => (
          <article key={name}><span className="transaction-icon"><AppIcon name={financial ? "wallet" : "calendar"} size={19} /></span><div><strong>{name}</strong><small>{index + 1} ساعت پیش</small></div><span>{financial ? `+${formatPrice([2300000, 900000, 600000][index])}` : "ثبت نوبت"}</span></article>
        ))}
      </section>
    </div>
  );
}

// صفحه خدمات امکان دیدن خدمات فعال و باز کردن فرم افزودن را فراهم می‌کند.
function ServicesView({ onAdd, onBack, services }: { onAdd: () => void; onBack: () => void; services: Service[] }) {
  return (
    <div className="light-page services-page">
      <PageHeader onBack={onBack} title="خدمات" />
      <button className="gradient-button" onClick={onAdd} type="button"><AppIcon name="plus" size={18} /> افزودن خدمت</button>
      <section className="service-list">
        {services.map((service) => (
          <article key={service.id}>
            <span className="service-color" style={{ background: service.color }} />
            <div><strong>{service.name}</strong><small>{faNumber(service.durationMinutes)} دقیقه</small></div>
            <span>{formatPrice(service.price)} تومان</span>
            <button className="icon-button" type="button"><AppIcon name="settings" size={17} /></button>
          </article>
        ))}
      </section>
      <section className="white-panel">
        <PanelTitle icon="briefcase" title="پرسنل و خدمات‌دهندگان" subtitle="مدیریت شیفت و دسترسی هر همکار" />
        <InfoRow label="مدیر مجموعه" value="دسترسی کامل" />
        <InfoRow label="پشتیبان شیفت عصر" value="تقویم و مشتری" />
      </section>
    </div>
  );
}

// صفحه پروفایل تنظیمات حساب، پیامک، زمان دستگاه و خروج را مانند ویدیو می‌چیند.
function ProfileView({ onBack, userEmail, userName }: { onBack: () => void; userEmail: string; userName: string }) {
  const [newsletter, setNewsletter] = useState(true);
  return (
    <div className="light-page profile-page">
      <PageHeader onBack={onBack} title="پروفایل" />
      <section className="profile-title-card"><Avatar name={userName} size="large" /><div><strong>{userName}</strong><span>{userEmail}</span></div></section>
      <section className="pro-card"><div><small>اشتراک فعال</small><strong>اشتراک PRO</strong></div><span><AppIcon name="diamond" size={25} /></span><button type="button">تمدید اشتراک</button></section>
      <section className="stack-list profile-menu">
        <ActionRow icon="user" title="اطلاعات حساب" subtitle="نام، شماره و مشخصات کسب‌وکار" />
        <ActionRow icon="phone" title="دستگاه‌های متصل" subtitle="۱ دستگاه فعال" />
        <ActionRow icon="settings" title="به‌روزرسانی" subtitle="نسخه ۱.۰" />
      </section>
      <section className="white-panel settings-panel">
        <ToggleRow enabled={newsletter} icon="message" label="پیامک شبانه" onChange={setNewsletter} />
        <InfoRow label="چک کردن زمان دستگاه" value="بررسی" />
        <InfoRow label="تعیین ناحیه زمانی" value="Asia/Tehran" />
        <InfoRow label="پاک کردن کش" value="پاک کردن" />
      </section>
      <button className="danger-button" type="button">خروج از حساب</button>
    </div>
  );
}

// صفحه جست‌وجو نتیجه مشتری و خدمت را به‌صورت زنده فیلتر می‌کند.
function SearchView({ customers, onBack, onOpenCustomer, query, services, setQuery }: {
  customers: Customer[];
  onBack: () => void;
  onOpenCustomer: (id: string) => void;
  query: string;
  services: Service[];
  setQuery: (query: string) => void;
}) {
  const normalized = query.trim().toLowerCase();
  const customerResults = customers.filter((item) => `${item.name} ${item.mobile}`.toLowerCase().includes(normalized));
  const serviceResults = services.filter((item) => item.name.toLowerCase().includes(normalized));
  return (
    <div className="light-page search-page">
      <PageHeader onBack={onBack} title="جست‌وجو" />
      <label className="search-box"><AppIcon name="search" size={20} /><input autoFocus onChange={(event) => setQuery(event.target.value)} placeholder="نام، شماره یا خدمت..." value={query} /></label>
      <h2 className="section-heading">مشتریان یافت‌شده</h2>
      <section className="customer-list">
        {customerResults.map((customer) => (
          <button className="customer-row" key={customer.id} onClick={() => onOpenCustomer(customer.id)} type="button"><Avatar name={customer.name} /><span><strong>{customer.name}</strong><small>{customer.mobile}</small></span><AppIcon name="chevron" size={17} /></button>
        ))}
      </section>
      <h2 className="section-heading">خدمات</h2>
      <section className="service-list compact-list">
        {serviceResults.map((service) => <article key={service.id}><span className="service-color" style={{ background: service.color }} /><div><strong>{service.name}</strong><small>{faNumber(service.durationMinutes)} دقیقه</small></div><span>{formatPrice(service.price)}</span></article>)}
      </section>
    </div>
  );
}

// مشخصات هر ابزار عمومی در این نگاشت قرار دارد تا صفحه‌های هم‌خانواده تکرار نشوند.
const TOOL_CONTENT: Partial<Record<ViewId, { title: string; icon: IconName; intro: string; action: string }>> = {
  "dedicated-number": { title: "شماره اختصاصی", icon: "phone", intro: "با شماره اختصاصی، پیام‌های سامانه با هویت ثابت کسب‌وکار شما ارسال و پاسخ مشتری دریافت می‌شود.", action: "فعال‌سازی شماره" },
  "regional-sms": { title: "پیامک منطقه‌ای", icon: "pin", intro: "مخاطبان محدوده‌ی جغرافیایی دلخواه را بر اساس شهر، جنسیت و بازه سنی هدف بگیرید.", action: "انتخاب محدوده" },
  birthday: { title: "تبریک تولد", icon: "gift", intro: "پیام تبریک مشتریان به‌صورت خودکار در روز یا ساعت انتخابی شما در صف قرار می‌گیرد.", action: "ساخت پیام تولد" },
  "repair-reminder": { title: "یادآوری ترمیم", icon: "bell", intro: "بر اساس خدمت قبلی، زمان مناسب مراجعه بعدی را محاسبه و پیام یادآوری زمان‌بندی کنید.", action: "افزودن یادآوری" },
  "customer-return": { title: "بازگشت مشتری", icon: "return", intro: "مشتریانی را که مدت مشخصی مراجعه نکرده‌اند شناسایی و برای بازگشت آن‌ها پیام هدفمند بسازید.", action: "ساخت کمپین بازگشت" },
  "online-booking": { title: "رزرو نوبت آنلاین", icon: "calendar", intro: "لینک رزرو اختصاصی بسازید تا مشتری بدون تماس، زمان خالی را ببیند و نوبت بگیرد.", action: "کپی لینک رزرو" },
  website: { title: "وب‌سایت اختصاصی", icon: "globe", intro: "صفحه معرفی، خدمات، نمونه‌کار، نظرات و تماس مستقیم کسب‌وکار را یک‌جا منتشر کنید.", action: "مشاهده وب‌سایت" },
  club: { title: "باشگاه مشتریان", icon: "diamond", intro: "امتیاز، سطح وفاداری، کارت هدیه و پیشنهادهای ویژه را برای مشتریان مدیریت کنید.", action: "ساخت جایزه" },
  raffle: { title: "قرعه‌کشی", icon: "ticket", intro: "گروه مشتریان و حداقل تعداد مراجعه را انتخاب کنید تا شرکت‌کنندگان واجد شرایط مشخص شوند.", action: "ایجاد قرعه‌کشی" },
  "sms-packages": { title: "خرید بسته پیامک", icon: "message", intro: "بسته متناسب با حجم پیام‌های یادآوری، گروهی و خدماتی را انتخاب کنید.", action: "مشاهده بسته‌ها" },
  support: { title: "پشتیبانی آنلاین", icon: "message", intro: "سؤال، گزارش خطا یا پیشنهاد خود را برای تیم پشتیبانی Repo Time ارسال کنید.", action: "شروع گفت‌وگو" },
};

// صفحه ابزارهای تک‌منظوره، توضیح، تنظیمات و CTA مخصوص همان ابزار را می‌سازد.
function ToolView({ onBack, openView, view }: { onBack: () => void; openView: (view: ViewId) => void; view: ViewId }) {
  const content = TOOL_CONTENT[view] ?? { title: "امکانات Repo Time", icon: "settings" as IconName, intro: "این بخش برای مدیریت کسب‌وکار طراحی شده است.", action: "ادامه" };
  const [enabled, setEnabled] = useState(true);
  const [copied, setCopied] = useState(false);
  const isPackages = view === "sms-packages";

  return (
    <div className="light-page tool-page">
      <PageHeader onBack={onBack} title={content.title} />
      <section className="tool-hero">
        <span><AppIcon name={content.icon} size={39} /></span>
        <h2>{content.title}</h2>
        <p>{content.intro}</p>
      </section>

      {isPackages ? (
        <section className="package-list">
          {[{ count: 500, price: 299000, discount: 30 }, { count: 1000, price: 399000, discount: 40 }, { count: 2000, price: 690000, discount: 50 }].map((item) => (
            <article key={item.count}><div><strong>{faNumber(item.count)} پیامک {item.count === 500 ? "۱۵ روزه" : "۳۰ روزه"}</strong><span>{faNumber(item.discount)}٪ تخفیف</span></div><p><b>{formatPrice(item.price)}</b> تومان</p><button type="button">فعال‌سازی</button></article>
          ))}
        </section>
      ) : (
        <section className="white-panel tool-form-card">
          {view === "regional-sms" && <><Field label="استان / شهر"><select defaultValue="تهران"><option>تهران</option><option>اصفهان</option><option>شیراز</option><option>تبریز</option></select></Field><Field label="شعاع ارسال"><input defaultValue="۵ کیلومتر" /></Field></>}
          {view === "raffle" && <><Field label="گروه مشتریان"><select><option>همه مشتریان</option><option>مشتریان مهم</option><option>همکاران</option></select></Field><Field label="تعداد برندگان"><input defaultValue="۱" type="number" /></Field></>}
          {view === "online-booking" && <div className="booking-link"><AppIcon name="link" size={20} /><span>repo-time.ir/book/demo</span></div>}
          {view === "birthday" && <Field label="متن پیام تبریک"><textarea defaultValue="تولدت مبارک! برای قدردانی از همراهی شما، یک هدیه ویژه در Repo Time دارید." /></Field>}
          {view === "repair-reminder" && <><Field label="خدمت"><select><option>پیگیری و ترمیم</option><option>خدمت اصلی</option></select></Field><Field label="چند روز بعد؟"><input defaultValue="۳۰" type="number" /></Field></>}
          {view === "customer-return" && <><Field label="آخرین مراجعه"><select><option>۳۰ روز گذشته</option><option>۴۵ روز گذشته</option><option>۶۰ روز گذشته</option></select></Field><Field label="متن پیام"><textarea placeholder="پیام بازگشت مشتری..." /></Field></>}
          {view === "dedicated-number" && <div className="number-status"><span>در انتظار دریافت شناسه</span><strong>۲۰۰۰۲۳۰۱-۰۰۹۳۱۱۲۰۳</strong></div>}
          {view === "club" && <><InfoRow label="مشتریان عضو" value="۲۱۶ نفر" /><InfoRow label="امتیازهای فعال" value="۴,۸۲۰" /></>}
          {view === "website" && <><InfoRow label="دامنه پیشنهادی" value="repo-time.ir/your-brand" /><InfoRow label="وضعیت" value="آماده انتشار" /></>}
          {view === "support" && <><Field label="موضوع"><select><option>پرسش فنی</option><option>پیشنهاد</option><option>گزارش خطا</option></select></Field><Field label="پیام شما"><textarea placeholder="توضیحات را بنویسید..." /></Field></>}
          <ToggleRow enabled={enabled} icon="bell" label="فعال بودن این قابلیت" onChange={setEnabled} />
        </section>
      )}

      {!isPackages && (
        <button className="gradient-button sticky-action" onClick={() => {
          if (view === "reports") openView("reports");
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2200);
        }} type="button">{copied ? "انجام شد ✓" : content.action}</button>
      )}
    </div>
  );
}

// نوار پایین، پنج اقدام اصلی ویدیو را در همه صفحه‌ها در دسترس نگه می‌دارد.
function BottomNavigation({ activeView, onOpenQuick, openView }: { activeView: ViewId; onOpenQuick: () => void; openView: (view: ViewId) => void }) {
  const items: Array<{ view: ViewId; icon: IconName; label: string }> = [
    { view: "profile", icon: "user", label: "پروفایل" },
    { view: "customers", icon: "menu", label: "مشتریان" },
    { view: "search", icon: "search", label: "جست‌وجو" },
    { view: "dashboard", icon: "home", label: "خانه" },
  ];
  return (
    <nav className="bottom-navigation" aria-label="ناوبری اصلی">
      {items.slice(0, 2).map((item) => <NavButton active={activeView === item.view} item={item} key={item.view} onClick={() => openView(item.view)} />)}
      <button className="nav-add" onClick={onOpenQuick} type="button"><AppIcon name="plus" size={24} /><span className="sr-only">افزودن سریع</span></button>
      {items.slice(2).map((item) => <NavButton active={activeView === item.view} item={item} key={item.view} onClick={() => openView(item.view)} />)}
    </nav>
  );
}

// هر دکمه‌ی نوار پایین، وضعیت فعال را برای صفحه‌خوان نیز اعلام می‌کند.
function NavButton({ active, item, onClick }: { active: boolean; item: { icon: IconName; label: string }; onClick: () => void }) {
  return <button aria-current={active ? "page" : undefined} className={active ? "is-active" : ""} onClick={onClick} type="button"><AppIcon name={item.icon} size={22} /><span>{item.label}</span></button>;
}

// لایه Modal پس‌زمینه را تار می‌کند و محتوای فرم را در Bottom Sheet می‌گذارد.
function ModalLayer({ children, close, title }: { children: ReactNode; close: () => void; title: string }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()} role="presentation">
      <section aria-modal="true" className="bottom-sheet" role="dialog">
        <div className="sheet-handle" />
        <header><h2>{title}</h2><button className="icon-button" onClick={close} type="button"><AppIcon name="close" size={19} /><span className="sr-only">بستن</span></button></header>
        <div className="sheet-body">{children}</div>
      </section>
    </div>
  );
}

// منوی افزودن سریع، کاربر را به یکی از سه فرم اصلی هدایت می‌کند.
function QuickActions({ onChoose }: { onChoose: (target: "appointment" | "customer" | "service") => void }) {
  return (
    <div className="quick-actions-list">
      <button onClick={() => onChoose("appointment")} type="button"><span><AppIcon name="calendar" /></span><div><strong>ثبت نوبت</strong><small>زمان جدید برای مشتری</small></div><AppIcon name="chevron" size={17} /></button>
      <button onClick={() => onChoose("customer")} type="button"><span><AppIcon name="user" /></span><div><strong>ثبت مشتری</strong><small>افزودن پرونده جدید</small></div><AppIcon name="chevron" size={17} /></button>
      <button onClick={() => onChoose("service")} type="button"><span><AppIcon name="briefcase" /></span><div><strong>افزودن خدمت</strong><small>مدت و هزینه خدمت</small></div><AppIcon name="chevron" size={17} /></button>
    </div>
  );
}

// فرم ثبت نوبت داده‌های انتخاب‌شده را هم به API و هم fallback محلی می‌دهد.
function AppointmentForm({ customers, onCancel, onCreate, onDone, services }: {
  customers: Customer[];
  onCancel: () => void;
  onCreate: (
    action: "createCustomer" | "createService" | "createAppointment" | "sendMessage",
    payload: Record<string, unknown>,
    fallback: () => void,
    success: string,
  ) => Promise<void>;
  onDone: () => void;
  services: Service[];
}) {
  const [customerId, setCustomerId] = useState(customers[0]?.id ?? "");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(TODAY_JALALI);
  const [time, setTime] = useState("۱۸:۳۵");
  const [notes, setNotes] = useState("");
  const [reminder, setReminder] = useState(true);
  const [followup, setFollowup] = useState(true);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const customer = customers.find((item) => item.id === customerId) ?? customers[0];
    const service = services.find((item) => item.id === serviceId) ?? services[0];
    if (!customer || !service) return;
    const payload = {
      customerId: customer.id,
      customerName: customer.name,
      mobile: customer.mobile,
      serviceId: service.id,
      serviceName: service.name,
      appointmentDate: date,
      appointmentTime: time,
      price: service.price,
      reminderEnabled: reminder,
      followupEnabled: followup,
      notes,
    };
    await onCreate("createAppointment", payload, () => undefined, "نوبت با موفقیت ثبت شد");
    onDone();
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <Field label="انتخاب مشتری"><select onChange={(event) => setCustomerId(event.target.value)} value={customerId}>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}</select></Field>
      <div className="form-grid"><Field label="تاریخ"><input onChange={(event) => setDate(event.target.value)} value={date} /></Field><Field label="ساعت"><input onChange={(event) => setTime(event.target.value)} value={time} /></Field></div>
      <Field label="خدمت"><select onChange={(event) => setServiceId(event.target.value)} value={serviceId}>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></Field>
      <ToggleRow enabled={reminder} icon="message" label="پیامک یادآوری نوبت" onChange={setReminder} />
      <ToggleRow enabled={followup} icon="bell" label="پیامک پیگیری پس از نوبت" onChange={setFollowup} />
      <Field label="توضیحات"><textarea onChange={(event) => setNotes(event.target.value)} placeholder="توضیح اختیاری برای پرونده..." value={notes} /></Field>
      <div className="form-actions"><button className="ghost-button" onClick={onCancel} type="button">انصراف</button><button className="gradient-button" type="submit">ثبت نوبت</button></div>
    </form>
  );
}

// فرم مشتری جدید چهار فیلد اصلی را می‌گیرد و پرونده را می‌سازد.
function CustomerForm({ onCancel, onCreate, onDone }: {
  onCancel: () => void;
  onCreate: (
    action: "createCustomer" | "createService" | "createAppointment" | "sendMessage",
    payload: Record<string, unknown>,
    fallback: () => void,
    success: string,
  ) => Promise<void>;
  onDone: () => void;
}) {
  const [form, setForm] = useState({ name: "", mobile: "", job: "", groupName: "سایر", notes: "" });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.mobile.trim()) return;
    await onCreate("createCustomer", form, () => undefined, "پرونده مشتری ساخته شد");
    onDone();
  }
  return (
    <form className="form-stack" onSubmit={submit}>
      <Field label="نام و نام خانوادگی"><input required onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="مثلاً نگار رضایی" value={form.name} /></Field>
      <Field label="شماره موبایل"><input inputMode="tel" required onChange={(event) => setForm({ ...form, mobile: event.target.value })} placeholder="۰۹۱۲۱۲۳۴۵۶۷" value={form.mobile} /></Field>
      <div className="form-grid"><Field label="شغل"><input onChange={(event) => setForm({ ...form, job: event.target.value })} placeholder="اختیاری" value={form.job} /></Field><Field label="گروه"><select onChange={(event) => setForm({ ...form, groupName: event.target.value })} value={form.groupName}><option>سایر</option><option>مشتریان مهم</option><option>همکاران</option><option>پزشکان</option><option>کارگران</option></select></Field></div>
      <Field label="توضیحات پرونده"><textarea onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="یادداشت داخلی..." value={form.notes} /></Field>
      <div className="form-actions"><button className="ghost-button" onClick={onCancel} type="button">انصراف</button><button className="gradient-button" type="submit">ثبت مشتری</button></div>
    </form>
  );
}

// فرم خدمت جدید نام، مدت، قیمت و رنگ نمایشی را دریافت می‌کند.
function ServiceForm({ onCancel, onCreate, onDone }: {
  onCancel: () => void;
  onCreate: (
    action: "createCustomer" | "createService" | "createAppointment" | "sendMessage",
    payload: Record<string, unknown>,
    fallback: () => void,
    success: string,
  ) => Promise<void>;
  onDone: () => void;
}) {
  const [form, setForm] = useState({ name: "", durationMinutes: 45, price: 0, color: "#7b2cff" });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) return;
    await onCreate("createService", form, () => undefined, "خدمت جدید اضافه شد");
    onDone();
  }
  return (
    <form className="form-stack" onSubmit={submit}>
      <Field label="نام خدمت"><input required onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="عنوان خدمت" value={form.name} /></Field>
      <div className="form-grid"><Field label="مدت (دقیقه)"><input min="5" onChange={(event) => setForm({ ...form, durationMinutes: Number(event.target.value) })} type="number" value={form.durationMinutes} /></Field><Field label="قیمت (تومان)"><input min="0" onChange={(event) => setForm({ ...form, price: Number(event.target.value) })} type="number" value={form.price} /></Field></div>
      <Field label="رنگ کارت"><input onChange={(event) => setForm({ ...form, color: event.target.value })} type="color" value={form.color} /></Field>
      <div className="form-actions"><button className="ghost-button" onClick={onCancel} type="button">انصراف</button><button className="gradient-button" type="submit">افزودن خدمت</button></div>
    </form>
  );
}

// پنجره اعلان‌ها سه رویداد کاربردی اخیر را فهرست می‌کند.
function Notifications({ close }: { close: () => void }) {
  return (
    <div className="notification-list">
      <article><span><AppIcon name="calendar" /></span><div><strong>نوبت جدید ثبت شد</strong><small>امروز، ساعت ۱۸:۳۵</small></div></article>
      <article><span><AppIcon name="message" /></span><div><strong>پیام یادآوری آماده ارسال است</strong><small>۴ پیام در صف</small></div></article>
      <article><span><AppIcon name="star" /></span><div><strong>نظر جدید مشتری</strong><small>امتیاز ۵ از ۵</small></div></article>
      <button className="gradient-button" onClick={close} type="button">متوجه شدم</button>
    </div>
  );
}

// Field یک Label ثابت و کنترل دلخواه فرم را کنار هم قرار می‌دهد.
function Field({ children, label }: { children: ReactNode; label: string }) {
  return <label className="form-field"><span>{label}</span>{children}</label>;
}

// ردیف Toggle برای تنظیمات روشن/خاموش در فرم‌ها استفاده می‌شود.
function ToggleRow({ enabled, icon, label, onChange }: { enabled: boolean; icon: IconName; label: string; onChange: (enabled: boolean) => void }) {
  return (
    <div className="toggle-row"><span className="toggle-icon"><AppIcon name={icon} size={18} /></span><strong>{label}</strong><button aria-pressed={enabled} className={enabled ? "toggle is-on" : "toggle"} onClick={() => onChange(!enabled)} type="button"><span /></button></div>
  );
}

// ردیف اطلاعات برای نمایش عنوان و مقدار در کارت‌های سفید استفاده می‌شود.
function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="info-row"><span>{label}</span><strong>{value}</strong></div>;
}

// عنوان پنل دارای آیکن، تیتر و توضیح کوتاه است.
function PanelTitle({ icon, subtitle, title }: { icon: IconName; subtitle: string; title: string }) {
  return <div className="panel-title"><span><AppIcon name={icon} size={20} /></span><div><strong>{title}</strong><small>{subtitle}</small></div></div>;
}

// ردیف اکشن عمومی در مدیریت مشتری و گزارش‌ها استفاده می‌شود.
function ActionRow({ badge, icon, subtitle, title }: { badge?: string; icon: IconName; subtitle: string; title: string }) {
  return <button className="action-row" type="button"><span><AppIcon name={icon} size={21} /></span><div><strong>{title}</strong><small>{subtitle}</small></div>{badge && <em>{badge}</em>}<AppIcon name="chevron" size={17} /></button>;
}

// Avatar از حرف اول نام استفاده می‌کند و هیچ داده یا تصویر خارجی لازم ندارد.
function Avatar({ name, size = "normal" }: { name: string; size?: "normal" | "large" }) {
  return <span aria-label={`تصویر ${name}`} className={`avatar ${size === "large" ? "is-large" : ""}`}>{name.trim().charAt(0) || "ر"}</span>;
}

// حالت خالی، توضیح می‌دهد چرا لیستی دیده نمی‌شود و قدم بعد چیست.
function EmptyState({ icon, text, title }: { icon: IconName; text: string; title: string }) {
  return <section className="empty-state"><span><AppIcon name={icon} size={42} /></span><strong>{title}</strong><p>{text}</p></section>;
}
