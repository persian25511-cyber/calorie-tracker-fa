import { expect, test } from '@playwright/test'

const INPUT = 'غذاهای خورده شده را به فارسی بنویسید'
const SENTENCE = 'دو کفگیر قورمه سبزی و یک کف دست سنگک'

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('calorie-tracker:onboarded', '1'))
  await page.goto('/')
})

async function logAcceptanceSentence(page: import('@playwright/test').Page) {
  await page.getByLabel(INPUT).fill(SENTENCE)
  await expect(page.getByText('قورمه سبزی', { exact: true })).toBeVisible()
  await expect(page.getByText('نان سنگک', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'ناهار' }).click()
  await page.getByRole('button', { name: /ثبت وعده/ }).click()
  await expect(page.getByText(/۶۳۵/).first()).toBeVisible()
}

test('قفل: ثبت جملهٔ نمونه و بهروزرسانی حلقه', async ({ page }) => {
  await logAcceptanceSentence(page)
  await expect(page.getByText(/قورمه سبزی · نان سنگک/)).toBeVisible()
})

test('پایداری دادهها پس از بارگذاری مجدد', async ({ page }) => {
  await logAcceptanceSentence(page)
  await page.reload()
  await expect.poll(async () => page.evaluate(() => {
    const raw = localStorage.getItem('calorie-tracker:v1')
    if (!raw) return 0
    return JSON.parse(raw).entries.reduce((s: number, e: { items: { kcal: number }[] }) =>
      s + e.items.reduce((a, i) => a + i.kcal, 0), 0)
  })).toBe(635)
  await expect(page.getByText(/قورمه سبزی · نان سنگک/)).toBeVisible()
})

test('تنظیم مقدار و حذف آیتم پیش از ثبت', async ({ page }) => {
  await page.getByLabel(INPUT).fill(SENTENCE)
  await page.getByRole('button', { name: /افزایش قورمه سبزی/ }).click()
  await expect(page.getByText(/جمع: ۸۹۶/)).toBeVisible()
  await page.getByRole('button', { name: /حذف نان سنگک/ }).click()
  await expect(page.getByText(/جمع: ۷۸۳/)).toBeVisible()
})

test('غذای سفارشی با واحد سفارشی قابل ثبت است', async ({ page }) => {
  await page.getByRole('button', { name: /بانک غذاها/ }).click()
  await page.getByRole('button', { name: /غذای جدید/ }).click()
  await page.getByPlaceholder('مثلاً: خورشت مخصوص مادربزرگ').fill('سوپ مخصوص من')
  const nums = page.locator('input[type=number]')
  await nums.nth(0).fill('120')
  await nums.nth(4).fill('150')
  await page.getByPlaceholder('نام واحد (مثلاً کفگیر)').fill('کاسه کوچک')
  await page.getByRole('button', { name: 'ذخیره غذا' }).click()
  await expect(page.getByText('سوپ مخصوص من', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /ثبت روزانه/ }).click()
  await page.getByLabel(INPUT).fill('یک کاسه کوچک سوپ مخصوص من')
  await expect(page.getByText('سوپ مخصوص من', { exact: true })).toBeVisible()
  await expect(page.getByText('جمع: ۱۸۰ کیلوکالری')).toBeVisible()
})

test('ویرایش وعده و بازگردانی حذف', async ({ page }) => {
  await logAcceptanceSentence(page)
  await page.getByRole('button', { name: /ویرایش/ }).first().click()
  await expect(page.getByRole('dialog', { name: 'ویرایش وعده' })).toBeVisible()
  await page.getByRole('button', { name: /افزایش قورمه سبزی/ }).click()
  await page.getByRole('button', { name: /ذخیره تغییرات/ }).click()
  await expect(page.getByText(/۸۹۶/).first()).toBeVisible()
  await page.getByRole('button', { name: 'حذف وعده' }).click()
  await page.getByRole('button', { name: 'بازگردانی' }).click()
  await expect(page.getByText(/قورمه سبزی · نان سنگک/)).toBeVisible()
})

test('ناوبری تاریخ و تقویم جلالی', async ({ page }) => {
  const date = page.getByLabel('انتخاب تاریخ')
  const before = await date.inputValue()
  await page.getByRole('button', { name: 'روز قبل' }).click()
  await expect(date).not.toHaveValue(before)
  await page.getByRole('button', { name: 'امروز' }).click()
  await expect(date).toHaveValue(before)
})

test('نمودار هفتگی و تغییر بازه به ۳۰ روز', async ({ page }) => {
  await page.getByRole('button', { name: /روند هفتگی/ }).click()
  await expect(page.getByText(/ترکیب درشت مغذی/)).toBeVisible()
  await page.getByRole('button', { name: /۳۰ روز/ }).click()
  await expect(page.getByRole('button', { name: /۳۰ روز/ })).toHaveAttribute('aria-pressed', 'true')
})

test('ویرایش اهداف در تنظیمات و ذخیرهٔ محلی', async ({ page }) => {
  await page.getByRole('button', { name: /تنظیمات/ }).click()
  const field = page.locator('input[inputmode="numeric"]').first()
  await field.fill('۲۲۰۰')
  await expect.poll(async () => page.evaluate(() => {
    const raw = localStorage.getItem('calorie-tracker:v1')
    return raw ? JSON.parse(raw).goals.kcal : 0
  })).toBe(2200)
})
