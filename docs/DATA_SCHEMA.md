# Data schema (v1)

The whole app state lives in `localStorage` under `calorie-tracker:v1` and is validated with Zod (`src/utils/schema.ts`) before loading or importing.

```jsonc
{
  "version": 1,
  "goals": { "kcal": 2000, "protein": 100, "carbs": 260, "fat": 65 },
  "foods": [
    {
      "id": "ghormeh-sabzi",
      "name": "قورمه سبزی",
      "aliases": ["قورمهسبزی"],
      "category": "stew",
      "per100g": { "kcal": 145, "protein": 6, "carbs": 12, "fat": 8.5 },
      "units": [{ "name": "کفگیر", "grams": 180 }],
      "defaultUnit": "کفگیر",
      "source": null
    }
  ],
  "entries": [
    {
      "id": "...",
      "date": "2026-11-22",
      "meal": "ناهار",
      "loggedAt": 1760000000000,
      "items": [
        {
          "foodId": "ghormeh-sabzi",
          "foodName": "قورمه سبزی",
          "quantity": 2,
          "unit": "کفگیر",
          "unitGrams": 180,
          "grams": 360,
          "kcal": 522,
          "protein": 22,
          "carbs": 43,
          "fat": 31
        }
      ]
    }
  ]
}
```

Rules:

- All numbers must be finite; kcal/grams/macros must be non-negative.
- `date` is a local `YYYY-MM-DD` key (never `toISOString()`).
- `meal` is one of the four Persian meal labels.
- `source` is optional; absent means the nutrition values are estimates.
- Backups larger than 5 MB are rejected.
