# AloCoupon Google Sheet Template

Use `google-sheet-deals-template.xlsx` or `google-sheet-deals-template.csv` to create the Google Sheet that will feed automatic deal publishing.

## Required columns

| Column | Required | Example | Notes |
|---|---:|---|---|
| brand | Yes | Jessie Boutique | Store or brand name shown on the site. |
| title | Yes | Jessie Boutique Coupon Code JESSIE20 - 15% OFF | Public deal title. |
| type | Yes | code | Use `code` for coupon codes or `deal` for no-code offers. |
| code | No | JESSIE20 | Leave blank for `deal` rows. |
| discount | Yes | 15% OFF | Main discount badge. |
| link | Yes | https://example.com/?rfsn=... | Your affiliate link. Must start with `http` or `https`. |
| category | Yes | Fashion | Used for category filters and highlight colors. |
| expiry | No | Limited time | Optional expiry text or date. |
| review | Yes | 15% Off Storewide | Short description displayed on deal cards. |
| status | Yes | published | Use `published` to sync to the website. Use `draft` to keep hidden. |

## Suggested categories

- Fashion
- Software
- Health & Wellness
- Beauty & Spa
- Home Goods
- Pets
- Safety & Emergency
- Gifts

## Google Sheets setup

1. Import the `.xlsx` or `.csv` into Google Sheets.
2. Rename the tab to `Deals`.
3. Keep the first row as headers.
4. Add new offers from row 2 down.
5. Set `status` to `published` only when the offer should appear on the website.

Recommended API range:

```text
Deals!A2:J
```

