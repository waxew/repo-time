/**
 * این تست Artifact نهایی را بدون شبیه‌سازی ناقص Cloudflare بررسی می‌کند.
 * Worker دارای Import مخصوص cloudflare: است؛ بنابراین اجرای مستقیم آن با Node معتبر نیست.
 */

// ابزار Assert برای مقایسه، fs برای خواندن خروجی و Test برای تعریف سناریو وارد می‌شوند.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// تست اول حضور فایل Worker، برند و تابع Fetch را در خروجی کنترل می‌کند.
test("builds a branded Cloudflare Worker", async () => {
  // فایل ورودی نهایی Server که میزبان اجرا می‌کند خوانده می‌شود.
  const workerSource = await readFile(new URL("../dist/server/index.js", import.meta.url), "utf8");

  // نام محصول باید همراه Bundle باشد تا Starter فراموش‌شده منتشر نشود.
  assert.match(workerSource, /Repo Time|REPO TIME/);

  // Worker نهایی باید مسیر Fetch قابل فراخوانی داشته باشد.
  assert.match(workerSource, /fetch/);
});

// تست دوم مطمئن می‌شود Migration D1 همراه Artifact بسته‌بندی شده است.
test("packages the D1 binding and migrations", async () => {
  // Manifest خروجی دقیقاً همان تنظیمات Hosting نسخه Buildشده است.
  const manifestText = await readFile(new URL("../dist/.openai/hosting.json", import.meta.url), "utf8");
  const manifest = JSON.parse(manifestText);

  // نام Binding باید DB باشد تا API در Production پایگاه‌داده را پیدا کند.
  assert.equal(manifest.d1, "DB");

  // فایل Migration نشان می‌دهد جدول‌های پروژه همراه نسخه منتشر می‌شوند.
  const migration = await readFile(new URL("../dist/.openai/drizzle/0000_lazy_loa.sql", import.meta.url), "utf8");
  assert.match(migration, /CREATE TABLE `appointments`/);
  assert.match(migration, /CREATE TABLE `customers`/);
});
