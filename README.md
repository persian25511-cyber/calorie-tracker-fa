# کالری‌شمار روزمره

ردیاب کالری و تغذیهٔ فارسی، موبایلمحور و کاملاً محلی برای غذاهای خانگی ایرانی و واحدهای رایج خانه (کفگیر، کف دست، قاشق غذاخوری، لیوان و …).

**Persian RTL calorie tracker** for Iranian home-cooked meals, built with React + Vite + TypeScript. Fully local-first: all data stays in the browser.

[![CI](https://github.com/persian25511-cyber/calorie-tracker-fa/actions/workflows/ci.yml/badge.svg)](https://github.com/persian25511-cyber/calorie-tracker-fa/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## فارسی

### اجرای محلی

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # تستهای واحد
npm run test:coverage
npm run build
npm run test:coverage
npm run e2e
npm start        # preview روی http://localhost:4173
```

### قابلیتها

- ثبت سریع به فارسی: «دو کفگیر قورمه سبزی و یک کف دست سنگک و نصف لیوان دوغ».
- پارسر آفلاین و قطعی: اعداد فارسی/عربی/انگلیسی، واژههای عددی، نیمهها، ZWNJ و واحدهای سفارشی.
- ۵۱ غذای ایرانی، ویرایش کامل و غذای سفارشی با واحد دلخواه.
- حلقهٔ کالری، میلههای درشت مغذی، وعدهها، نمودار ۷ روزه و اهداف.
- خروجی/بازیابی JSON، PWA نصبپذیر و فونت self-hosted (کارکرد آفلاین).

### مستندات بیشتر

- [راهنمای کاربر](docs/USER_GUIDE.md)
- [ساختار-data و JSON](docs/DATA_SCHEMA.md)
- [نقشهٔ راه](ROADMAP.md)

### GitHub Pages

.github/workflows/pages.yml با `VITE_BASE=/calorie-tracker-fa/` بیلد میسازد و `404.html` را برای SPA اضافه میکند. در تنظیمات مخزن، Pages را روی «GitHub Actions» بگذارید.

### استقرار روی Vercel

1. ریپو را به حساب Vercel متصل کنید: **Add New → Project → Import**.
2. Vite بهطور خودکار شناسایی میشود: Build `npm run build`، Output `dist`.
3. فایل `vercel.json` rewriting لازم برای SPA را اعمال میکند؛ نیازی به تنظیم دستی نیست.
4. متغیرها: فقط `VITE_APP_NAME` اختیاری است (پیشفرض: کالری‌شمار روزمره). هیچ secret لازم نیست.
5. با CLI هم میشود:

```bash
npm install -g vercel
vercel          # preview
vercel --prod   # production
```

### استقرار روی Railway

`railway.json` / `railway.toml` منسوخ اند و سرویسهای جدید نمیتوانند از آنها استفاده کنند. این پروژه از **Infrastructure as Code** در `.railway/railway.ts` استفاده میکند.

1. ریپو را در Railway انتخاب کنید: **New Project → Deploy from GitHub repo**.
2. Railpack دستور build را مییابد. Start Command سرویس:

```bash
npm start
```

3. یا بهصورت IaC (توصیهشده):

```bash
npm install              # railway SDK نصب میشود
npm install -g @railway/cli
railway login
railway link
railway config plan      # پیشنمایش ایمن
railway config apply     # اعمال
```

4. `PORT` توسط Railway تزریق میشود و نیازی به تعریف دستی نیست.
5. Health check مسیر `/` است.

### حریم خصوصی

هیچ دادههای به سرور ارسال نمیشود، هیچ telemetryای وجود ندارد و هیچ کلیدی در مرورگر قرار داده نشده است. مقادیر تغذیهای تقریبیاند و توصیهٔ پزشکی نیستند.

## English

### Local development

```bash
npm install
npm run dev
npm test
npm run build
```

### Docs

- [User guide](docs/USER_GUIDE.md), [data schema](docs/DATA_SCHEMA.md), [roadmap](ROADMAP.md).
- E2E: `npm run e2e` (16 flows, mobile + desktop).

### Deploy to Vercel

Connect the repository at **Add New → Project → Import**. Vite is auto-detected (`npm run build`, output `dist`). The included `vercel.json` adds the required SPA rewrite. The only optional variable is `VITE_APP_NAME`; no secrets are needed. CLI alternative: `vercel` / `vercel --prod`.

### Deploy to Railway

Railway Config as Code (`railway.json`) is deprecated, so this repo ships `.railway/railway.ts` (Infrastructure as Code). Deploy from GitHub, or run `railway login && railway link && railway config apply`. The start command is `npm start` (reads the injected `PORT`) and the health check is `/`. IaC is applied manually with `railway config apply` — a git push does not apply it; alternatively set Build/Start commands in the Railway dashboard. `PORT` is injected by Railway.

See `.railway/README.md` and `.env.example`. Deployment docs: [Vercel/Vite](https://vercel.com/docs/frameworks/frontend/vite), [Railway IaC](https://docs.railway.com/infrastructure-as-code).

### License & disclaimer

MIT. Nutrition values are estimates and are not medical advice. All user data stays in localStorage; there is no backend and no analytics.
