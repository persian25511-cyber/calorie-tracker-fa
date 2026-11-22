# مشارکت / Contributing

1. `npm install` سپس `npm run dev`.
2. قبل از ارسال PR: `npm run lint`، `npm test`، `npm run build` همگی باید سبز باشند.
3. تستهای پارسر را در `src/utils/persianFoodParser.test.ts` و تستهای رابط را کنار کامپوننتها قرار دهید.
4. تمام اعداد نمایشی را از `fa()` عبور دهید؛ از `toISOString()` برای کلید تاریخ استفاده نکنید.
5. تغییرات بانک غذاها را با منبع تغذیهای مستند کنید.
6. پیام کامیتها از الگوی `type: description` پیروی کند.

English: keep PRs small, run the three checks above, and preserve strict RTL/Persian numeral conventions.
