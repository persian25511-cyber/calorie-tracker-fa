export type Macro = {
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export type FoodCategory =
  | 'stew'
  | 'rice_bread'
  | 'kebab_protein'
  | 'breakfast'
  | 'dairy'
  | 'drink'
  | 'snack'
  | 'soup'
  | 'custom'

export type FoodUnit = {
  /** Display name, e.g. «کفگیر» */
  name: string
  /** Weight in grams of one household unit */
  grams: number
  /** Alternate spellings accepted by the parser */
  aliases?: string[]
}

export type Food = {
  id: string
  name: string
  aliases: string[]
  category: FoodCategory
  per100g: Macro
  units: FoodUnit[]
  defaultUnit: string
  isCustom?: boolean
  /** Reference for the nutrition values; absent means an unverified estimate. */
  source?: string
  confidence?: 'estimate' | 'reference'
}

export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  stew: 'خورشت و غذای پخته',
  rice_bread: 'برنج و نان',
  kebab_protein: 'کباب و پروتئین',
  breakfast: 'صبحانه',
  dairy: 'لبنیات',
  drink: 'نوشیدنی',
  snack: 'میوه و تنقلات',
  soup: 'آش و سوپ',
  custom: 'غذاهای من',
}

const m = (kcal: number, protein: number, carbs: number, fat: number): Macro => ({ kcal, protein, carbs, fat })
const u = (name: string, grams: number, aliases: string[] = []): FoodUnit => ({ name, grams, aliases })

const BASE_FOODS: Food[] = [
  // ── Stews & main dishes ───────────────────────────────────────────
  {
    id: 'ghormeh-sabzi', name: 'قورمه سبزی', aliases: ['قورمهسبزی', 'قورمه', 'گورمه سبزی'],
    category: 'stew', per100g: m(145, 6, 12, 8.5),
    units: [u('کفگیر', 180), u('کاسه', 220), u('قاشق غذاخوری', 20)],
    defaultUnit: 'کفگیر',
  },
  {
    id: 'gheimeh', name: 'قیمه', aliases: ['قیمه پلو', 'گیمه'],
    category: 'stew', per100g: m(135, 6.5, 14, 6),
    units: [u('کفگیر', 180), u('کاسه', 220)],
    defaultUnit: 'کفگیر',
  },
  {
    id: 'fesenjan', name: 'فسنجان', aliases: ['فسنجون'],
    category: 'stew', per100g: m(230, 6, 12, 18),
    units: [u('کفگیر', 160), u('کاسه', 200)],
    defaultUnit: 'کفگیر',
  },
  {
    id: 'gheimeh-bademjan', name: 'قیمه بادمجان', aliases: ['قیمهبادمجان'],
    category: 'stew', per100g: m(150, 5, 13, 9),
    units: [u('کفگیر', 180), u('کاسه', 220)],
    defaultUnit: 'کفگیر',
  },
  {
    id: 'khorosh-karafs', name: 'خورشت کرفس', aliases: ['خورش کرفس'],
    category: 'stew', per100g: m(140, 5, 11, 9),
    units: [u('کفگیر', 180), u('کاسه', 220)],
    defaultUnit: 'کفگیر',
  },
  {
    id: 'zershk-polo', name: 'زرشک پلو با مرغ', aliases: ['زرشک پلو', 'زرشکپلو', 'مرغ زرشک'],
    category: 'stew', per100g: m(165, 9, 22, 4.5),
    units: [u('کفگیر', 200), u('کاسه', 250)],
    defaultUnit: 'کفگیر',
  },
  {
    id: 'baghla-polo', name: 'باقلا پلو', aliases: ['باقلاپلو'],
    category: 'stew', per100g: m(175, 8, 27, 4),
    units: [u('کفگیر', 200), u('کاسه', 240)],
    defaultUnit: 'کفگیر',
  },
  {
    id: 'macaroni', name: 'ماکارونی', aliases: ['ماکارoni', 'پاستا'],
    category: 'stew', per100g: m(160, 6, 25, 4),
    units: [u('کفگیر', 200), u('کاسه', 250)],
    defaultUnit: 'کفگیر',
  },
  {
    id: 'kashk-bademjan', name: 'کشک بادمجان', aliases: ['کشکبادمجان'],
    category: 'stew', per100g: m(120, 5, 9, 8),
    units: [u('کفگیر', 160), u('کاسه', 200)],
    defaultUnit: 'کفگیر',
  },
  {
    id: 'mirza-ghasemi', name: 'میرزا قاسمی', aliases: ['میرزاقاسمی'],
    category: 'stew', per100g: m(130, 7, 10, 8),
    units: [u('کفگیر', 160), u('کاسه', 200)],
    defaultUnit: 'کفگیر',
  },
  {
    id: 'kookoo-sabzi', name: 'کوکو سبزی', aliases: ['کوکوسبزی'],
    category: 'stew', per100g: m(180, 7, 8, 14),
    units: [u('تکه', 60), u('کفگیر', 150)],
    defaultUnit: 'تکه',
  },
  {
    id: 'kookoo-sibzamini', name: 'کوکو سیبزمینی', aliases: ['کوکو سیب زمینی'],
    category: 'stew', per100g: m(170, 6, 15, 10),
    units: [u('تکه', 60)],
    defaultUnit: 'تکه',
  },
  {
    id: 'omlet', name: 'املت', aliases: ['اوملت', 'amlat'],
    category: 'breakfast', per100g: m(160, 9, 3, 13),
    units: [u('کاسه', 180), u('قاشق غذاخوری', 25)],
    defaultUnit: 'کاسه',
  },
  {
    id: 'nimmroo', name: 'نیمرو', aliases: ['نیم رو', 'تخم مرغ نیمرو'],
    category: 'breakfast', per100g: m(140, 9, 1, 11),
    units: [u('عدد', 100), u('قاشق غذاخوری', 15)],
    defaultUnit: 'عدد',
  },
  {
    id: 'dolmeh', name: 'دلمه برگ مو', aliases: ['دلمه'],
    category: 'stew', per100g: m(150, 5, 18, 7),
    units: [u('عدد', 80)],
    defaultUnit: 'عدد',
  },

  // ── Kebab & protein ───────────────────────────────────────────────
  {
    id: 'joojeh-kabab', name: 'جوجه کباب', aliases: ['جوجهکباب', 'جوجه', 'کباب جوجه'],
    category: 'kebab_protein', per100g: m(185, 25, 2, 9),
    units: [u('سیخ', 90), u('عدد', 90)],
    defaultUnit: 'سیخ',
  },
  {
    id: 'kabab-kobideh', name: 'کباب کوبیده', aliases: ['کباب کوبید', 'کوبیده'],
    category: 'kebab_protein', per100g: m(250, 20, 3, 18),
    units: [u('سیخ', 110), u('تکه', 55)],
    defaultUnit: 'سیخ',
  },
  {
    id: 'kabab-barg', name: 'کباب برگ', aliases: ['کباب برگ مرغ'],
    category: 'kebab_protein', per100g: m(230, 26, 2, 13),
    units: [u('سیخ', 120)],
    defaultUnit: 'سیخ',
  },
  {
    id: 'chicken-breast', name: 'سینه مرغ گریل', aliases: ['سینه مرغ', 'مرغ گریل', 'مرغ پخته'],
    category: 'kebab_protein', per100g: m(165, 31, 0, 3.6),
    units: [u('تکه', 100), u('عدد', 150)],
    defaultUnit: 'تکه',
  },

  // ── Rice & bread ──────────────────────────────────────────────────
  {
    id: 'brinj-kateh', name: 'برنج کته', aliases: ['کته', 'برنج'],
    category: 'rice_bread', per100g: m(135, 2.6, 28, 0.4),
    units: [u('کفگیر', 170), u('قاشق غذاخوری', 15), u('کاسه', 220)],
    defaultUnit: 'کفگیر',
  },
  {
    id: 'brinj-abkesh', name: 'برنج آبکش', aliases: ['برنج آب کش', 'آبکش'],
    category: 'rice_bread', per100g: m(130, 2.4, 28, 0.3),
    units: [u('کفگیر', 170), u('کاسه', 220)],
    defaultUnit: 'کفگیر',
  },
  {
    id: 'nan-sangak', name: 'نان سنگک', aliases: ['سنگک'],
    category: 'rice_bread', per100g: m(250, 8, 48, 2.5),
    units: [u('کف دست', 45), u('تکه', 30)],
    defaultUnit: 'کف دست',
  },
  {
    id: 'nan-barbri', name: 'نان بربری', aliases: ['بربری'],
    category: 'rice_bread', per100g: m(265, 8, 50, 3),
    units: [u('کف دست', 50), u('تکه', 30)],
    defaultUnit: 'کف دست',
  },
  {
    id: 'nan-lavash', name: 'نان لواش', aliases: ['لواش'],
    category: 'rice_bread', per100g: m(240, 7, 50, 1.5),
    units: [u('کف دست', 35), u('برگ', 35)],
    defaultUnit: 'کف دست',
  },
  {
    id: 'nan-taftan', name: 'نان تافتون', aliases: ['تافتون'],
    category: 'rice_bread', per100g: m(255, 8, 49, 3),
    units: [u('کف دست', 40), u('تکه', 30)],
    defaultUnit: 'کف دست',
  },
  {
    id: 'nan-test', name: 'نان تست', aliases: ['تست', 'نان تست برش'],
    category: 'rice_bread', per100g: m(265, 9, 49, 3.5),
    units: [u('برش', 25)],
    defaultUnit: 'برش',
  },

  // ── Soups & porridge ──────────────────────────────────────────────
  {
    id: 'ash-reshteh', name: 'آش رشته', aliases: ['آشرشته', 'رشته آش'],
    category: 'soup', per100g: m(85, 3, 12, 2.5),
    units: [u('کاسه', 300), u('پیاله', 250)],
    defaultUnit: 'کاسه',
  },
  {
    id: 'ash-shaleh', name: 'آش شله', aliases: ['آش شله قلمکار', 'شله'],
    category: 'soup', per100g: m(95, 4, 13, 3),
    units: [u('کاسه', 300), u('پیاله', 250)],
    defaultUnit: 'کاسه',
  },
  {
    id: 'ash-dogh', name: 'آش دوغ', aliases: ['آشدوغ'],
    category: 'soup', per100g: m(70, 3, 9, 2.5),
    units: [u('کاسه', 300)],
    defaultUnit: 'کاسه',
  },
  {
    id: 'soup-joo', name: 'سوپ جو', aliases: ['شوربا', 'سوپ'],
    category: 'soup', per100g: m(55, 2.5, 8, 1.2),
    units: [u('کاسه', 300)],
    defaultUnit: 'کاسه',
  },

  // ── Breakfast, dairy & drinks ─────────────────────────────────────
  {
    id: 'egg-boiled', name: 'تخم مرغ آبپز', aliases: ['تخم مرغ', 'تخممرغ', 'تخم مرغ آب پز'],
    category: 'breakfast', per100g: m(155, 13, 1.1, 11),
    units: [u('عدد', 55)],
    defaultUnit: 'عدد',
  },
  {
    id: 'white-cheese', name: 'پنیر سفید', aliases: ['پنیر', 'پنیر سفید تبریز'],
    category: 'dairy', per100g: m(265, 17, 2, 20),
    units: [u('تکه', 30), u('قاشق غذاخوری', 15)],
    defaultUnit: 'تکه',
  },
  {
    id: 'yogurt', name: 'ماست', aliases: ['ماست ساده'],
    category: 'dairy', per100g: m(61, 3.5, 4.8, 3.3),
    units: [u('کاسه', 200), u('لیوان', 200), u('قاشق غذاخوری', 15)],
    defaultUnit: 'کاسه',
  },
  {
    id: 'yogurt-thick', name: 'ماست چکیده', aliases: ['ماست چکیده', 'ماست یونانی'],
    category: 'dairy', per100g: m(120, 8, 4, 9),
    units: [u('قاشق غذاخوری', 20), u('کاسه', 180)],
    defaultUnit: 'قاشق غذاخوری',
  },
  {
    id: 'doogh', name: 'دوغ', aliases: ['دوغ ساده', 'دوغ نمکی'],
    category: 'drink', per100g: m(32, 1, 4, 1),
    units: [u('لیوان', 250), u('پیاله', 200)],
    defaultUnit: 'لیوان',
  },
  {
    id: 'milk', name: 'شیر', aliases: ['شیر ساده'],
    category: 'drink', per100g: m(61, 3.2, 4.8, 3.3),
    units: [u('لیوان', 250)],
    defaultUnit: 'لیوان',
  },
  {
    id: 'sweet-tea', name: 'چای شیرین', aliases: ['چای', 'چای قند'],
    category: 'drink', per100g: m(30, 0, 7.5, 0),
    units: [u('لیوان', 200), u('استکان', 100)],
    defaultUnit: 'لیوان',
  },
  {
    id: 'plain-tea', name: 'چای ساده', aliases: ['چای بی شیرینی'],
    category: 'drink', per100g: m(2, 0, 0.5, 0),
    units: [u('لیوان', 200), u('استکان', 100)],
    defaultUnit: 'لیوان',
  },

  // ── Snacks, nuts, fruit & fats ────────────────────────────────────
  {
    id: 'walnut', name: 'گردو', aliases: [],
    category: 'snack', per100g: m(654, 15, 14, 65),
    units: [u('عدد', 5), u('قاشق غذاخوری', 8)],
    defaultUnit: 'عدد',
  },
  {
    id: 'almond', name: 'بادام', aliases: [],
    category: 'snack', per100g: m(579, 21, 22, 50),
    units: [u('مشت', 25), u('عدد', 1.2), u('قاشق غذاخوری', 10)],
    defaultUnit: 'مشت',
  },
  {
    id: 'pistachio', name: 'پسته', aliases: [],
    category: 'snack', per100g: m(560, 20, 28, 45),
    units: [u('قاشق غذاخوری', 10), u('مشت', 25)],
    defaultUnit: 'قاشق غذاخوری',
  },
  {
    id: 'butter', name: 'کره', aliases: ['کره حیوانی'],
    category: 'breakfast', per100g: m(717, 0.9, 0.1, 81),
    units: [u('قاشق غذاخوری', 14), u('قاشق چایخوری', 5)],
    defaultUnit: 'قاشق غذاخوری',
  },
  {
    id: 'honey', name: 'عسل', aliases: ['عسل طبیعی'],
    category: 'breakfast', per100g: m(304, 0.3, 82, 0),
    units: [u('قاشق غذاخوری', 21), u('قاشق چایخوری', 7)],
    defaultUnit: 'قاشق غذاخوری',
  },
  {
    id: 'date', name: 'خرما', aliases: ['خرمالو'],
    category: 'snack', per100g: m(282, 2.5, 75, 0.4),
    units: [u('عدد', 12)],
    defaultUnit: 'عدد',
  },
  {
    id: 'apple', name: 'سیب', aliases: [],
    category: 'snack', per100g: m(52, 0.3, 14, 0.2),
    units: [u('عدد', 180)],
    defaultUnit: 'عدد',
  },
  {
    id: 'banana', name: 'موز', aliases: [],
    category: 'snack', per100g: m(89, 1.1, 23, 0.3),
    units: [u('عدد', 120)],
    defaultUnit: 'عدد',
  },
  {
    id: 'cucumber', name: 'خیار', aliases: ['خیار تازه'],
    category: 'snack', per100g: m(15, 0.7, 3.6, 0.1),
    units: [u('عدد', 200)],
    defaultUnit: 'عدد',
  },
  {
    id: 'tomato', name: 'گوجه فرنگی', aliases: ['گوجه', 'گوجهفرنگی'],
    category: 'snack', per100g: m(18, 0.9, 3.9, 0.2),
    units: [u('عدد', 150)],
    defaultUnit: 'عدد',
  },
  {
    id: 'shirazi-salad', name: 'سالاد شیرازی', aliases: ['سالاد'],
    category: 'snack', per100g: m(25, 1, 5, 0.2),
    units: [u('کاسه', 200)],
    defaultUnit: 'کاسه',
  },
  {
    id: 'kabab-torsh', name: 'کباب ترش', aliases: ['کباب ترش شمالی'],
    category: 'kebab_protein', per100g: m(200, 22, 4, 11),
    units: [u('سیخ', 100)],
    defaultUnit: 'سیخ',
  },
  {
    id: 'nokhodi', name: 'نخودچی', aliases: ['نخود چی'],
    category: 'snack', per100g: m(530, 18, 28, 38),
    units: [u('قاشق غذاخوری', 10), u('مشت', 25)],
    defaultUnit: 'قاشق غذاخوری',
  },
]

/* Additional everyday Iranian foods (sources are curated later in phase 2). */
const EXTRA_FOODS: Food[] = [
  {
    id: 'alo-esfenaj', name: 'خورشت آلو اسفناج', aliases: ['آلو اسفناج', 'خورشت آلو'],
    category: 'stew', per100g: m(140, 6, 12, 9), units: [u('کفگیر', 180), u('کاسه', 220)], defaultUnit: 'کفگیر',
  },
  {
    id: 'morgh-alo', name: 'خورشت مرغ و آلو', aliases: ['خورشت آلو', 'مرغ و آلو'],
    category: 'stew', per100g: m(160, 9, 13, 8), units: [u('کفگیر', 180)], defaultUnit: 'کفگیر',
  },
  {
    id: 'gheimeh-nokhodi', name: 'قیمه نخودی', aliases: ['قیمه نخود'],
    category: 'stew', per100g: m(150, 7, 16, 6), units: [u('کفگیر', 180)], defaultUnit: 'کفگیر',
  },
  {
    id: 'shooid-polo', name: 'شوید پلو', aliases: ['شویدپلو'],
    category: 'stew', per100g: m(170, 8, 25, 5), units: [u('کفگیر', 200)], defaultUnit: 'کفگیر',
  },
  {
    id: 'abgoosht', name: 'آبگوشت', aliases: ['آب گوشت'],
    category: 'soup', per100g: m(95, 6, 8, 4), units: [u('کاسه', 300), u('پیاله', 250)], defaultUnit: 'کاسه',
  },
  {
    id: 'halim', name: 'حلیم', aliases: [],
    category: 'breakfast', per100g: m(130, 7, 18, 3), units: [u('کاسه', 300)], defaultUnit: 'کاسه',
  },
  {
    id: 'shir-berenj', name: 'شیر برنج', aliases: ['شیربرنج'],
    category: 'breakfast', per100g: m(110, 3, 18, 3), units: [u('کاسه', 250)], defaultUnit: 'کاسه',
  },
  {
    id: 'ferni', name: 'فرنی', aliases: [],
    category: 'breakfast', per100g: m(90, 3, 14, 2), units: [u('کاسه', 200)], defaultUnit: 'کاسه',
  },
  {
    id: 'kabab-chenjeh', name: 'کباب چنجه', aliases: ['چنجه'],
    category: 'kebab_protein', per100g: m(240, 24, 2, 15), units: [u('سیخ', 120)], defaultUnit: 'سیخ',
  },
  {
    id: 'kabab-shishlik', name: 'کباب شیشلیک', aliases: ['شیشلیک'],
    category: 'kebab_protein', per100g: m(260, 22, 2, 18), units: [u('سیخ', 150)], defaultUnit: 'سیخ',
  },
  {
    id: 'morgh-shekampor', name: 'مرغ شکمپر', aliases: ['مرغ شکم پر'],
    category: 'kebab_protein', per100g: m(190, 18, 10, 10), units: [u('تکه', 120)], defaultUnit: 'تکه',
  },
  {
    id: 'mahi-kabab', name: 'ماهی کباب', aliases: ['کباب ماهی'],
    category: 'kebab_protein', per100g: m(180, 22, 1, 9), units: [u('تکه', 120)], defaultUnit: 'تکه',
  },
  {
    id: 'migu-kabab', name: 'میگو کباب', aliases: ['کباب میگو'],
    category: 'kebab_protein', per100g: m(150, 24, 1, 5), units: [u('سیخ', 80)], defaultUnit: 'سیخ',
  },
  {
    id: 'kabab-kobideh-morgh', name: 'کباب کوبیده مرغ', aliases: ['کوبیده مرغ'],
    category: 'kebab_protein', per100g: m(200, 24, 2, 11), units: [u('سیخ', 100)], defaultUnit: 'سیخ',
  },
  {
    id: 'berenj-zafarani', name: 'برنج زعفرانی', aliases: ['برنج زعفرونی'],
    category: 'rice_bread', per100g: m(140, 2.6, 29, 0.5), units: [u('کفگیر', 170), u('کاسه', 220)], defaultUnit: 'کفگیر',
  },
  {
    id: 'nan-shirmal', name: 'نان شیرمال', aliases: ['شیرمال'],
    category: 'rice_bread', per100g: m(320, 8, 45, 13), units: [u('کف دست', 40)], defaultUnit: 'کف دست',
  },
  {
    id: 'nan-nokhodi', name: 'نان نخودی', aliases: [],
    category: 'rice_bread', per100g: m(280, 9, 46, 8), units: [u('کف دست', 40)], defaultUnit: 'کف دست',
  },
  {
    id: 'nan-joo', name: 'نان جو', aliases: [],
    category: 'rice_bread', per100g: m(250, 9, 45, 3), units: [u('کف دست', 45)], defaultUnit: 'کف دست',
  },
  {
    id: 'jam', name: 'مربا', aliases: ['مربای خانگی'],
    category: 'breakfast', per100g: m(250, 0.5, 65, 0), units: [u('قاشق غذاخوری', 20)], defaultUnit: 'قاشق غذاخوری',
  },
  {
    id: 'shereh', name: 'شیره انگور', aliases: ['شیره'],
    category: 'breakfast', per100g: m(300, 0, 75, 0), units: [u('قاشق غذاخوری', 20)], defaultUnit: 'قاشق غذاخوری',
  },
  {
    id: 'anjir-khoshk', name: 'انجیر خشک', aliases: ['انجیر'],
    category: 'snack', per100g: m(260, 3, 65, 1), units: [u('عدد', 15)], defaultUnit: 'عدد',
  },
  {
    id: 'keshmesh', name: 'کشمش', aliases: [],
    category: 'snack', per100g: m(300, 2, 79, 0.5), units: [u('قاشق غذاخوری', 12)], defaultUnit: 'قاشق غذاخوری',
  },
  {
    id: 'fandogh', name: 'فندق', aliases: [],
    category: 'snack', per100g: m(628, 15, 17, 61), units: [u('مشت', 25)], defaultUnit: 'مشت',
  },
  {
    id: 'takhm-kadoo', name: 'تخم کدو', aliases: [],
    category: 'snack', per100g: m(550, 19, 10, 49), units: [u('قاشق غذاخوری', 10)], defaultUnit: 'قاشق غذاخوری',
  },
  {
    id: 'golab', name: 'گلاب', aliases: [],
    category: 'drink', per100g: m(2, 0, 0.5, 0), units: [u('لیوان', 200)], defaultUnit: 'لیوان',
  },
  {
    id: 'noshabeh', name: 'نوشابه', aliases: [],
    category: 'drink', per100g: m(42, 0, 10.6, 0), units: [u('لیوان', 250)], defaultUnit: 'لیوان',
  },
  {
    id: 'ab-miveh', name: 'آبمیوه طبیعی', aliases: ['آب میوه'],
    category: 'drink', per100g: m(45, 0.5, 11, 0.1), units: [u('لیوان', 250)], defaultUnit: 'لیوان',
  },
  {
    id: 'panir-khamehi', name: 'پنیر خامهای', aliases: ['پنیر خامه ای'],
    category: 'dairy', per100g: m(250, 7, 3, 24), units: [u('قاشق غذاخوری', 18)], defaultUnit: 'قاشق غذاخوری',
  },
  {
    id: 'khameh', name: 'خامه', aliases: [],
    category: 'dairy', per100g: m(340, 2, 3, 36), units: [u('قاشق غذاخوری', 15)], defaultUnit: 'قاشق غذاخوری',
  },
  {
    id: 'khiaarshoor', name: 'خیارشور', aliases: [],
    category: 'snack', per100g: m(20, 1, 3, 0.2), units: [u('عدد', 30)], defaultUnit: 'عدد',
  },
  {
    id: 'salad-fasl', name: 'سالاد فصل', aliases: [],
    category: 'snack', per100g: m(30, 1, 6, 0.2), units: [u('کاسه', 200)], defaultUnit: 'کاسه',
  },
]

export const IRANIAN_FOODS: Food[] = [...BASE_FOODS, ...EXTRA_FOODS]

export const DEFAULT_GOALS = {
  kcal: 2000,
  protein: 100,
  carbs: 260,
  fat: 65,
}
