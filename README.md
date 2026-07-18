# AloCoupon

AloCoupon is a coupon and affiliate offer website with a small Node.js admin API.

## Features

- Public website at `/`
- Partner offer API at `/api/offers`
- Protected admin dashboard at `/admin`
- Admin upload, edit, and delete for coupon/deal data
- Private admin upload, download, and delete for source-code/project files with descriptions
- JSON-backed data files in `data/`

## Run Locally

```powershell
npm install
npm start
```

Open:

- Website: `http://127.0.0.1:3000/`
- Admin: `http://127.0.0.1:3000/admin`

Default local password:

```text
Admin@123456
```

Change this before deploying.

## Check Before Upload

```powershell
npm run check
```

## Data Files

- `data/offers.json` starts empty so real offers can be uploaded from admin.
- `data/projects.json` stores project metadata; uploaded files are stored in `data/project-uploads/`.
- `data/admin-emails.json` controls which emails can log in locally.
- `data/legacy-cms.json` is an isolated, read-only snapshot of an imported legacy
  MariaDB CMS. It does not replace the current offers, settings, or admin data.

## Import A Legacy MySQL Dump

The legacy importer accepts plain `.sql` and compressed `.sql.gz` dumps. It
recreates the old CMS structure and content in a separate JSON snapshot, so the
current website content and functionality remain unchanged.

```powershell
npm run import:legacy -- "D:\path\to\backup.sql.gz"
```

Validate a dump without writing anything:

```powershell
npm run import:legacy -- "D:\path\to\backup.sql.gz" --check
```

Imported tables include categories, stores, offers, deals, posts, pages, menus,
widgets, settings, slugs, feedbacks, and discounts. The importer never edits
`data/offers.json`, `data/site-settings.json`, users, subscribers, or assets.

After import, authenticated admin clients can inspect the isolated snapshot at:

- `GET /api/admin/legacy-cms` for table structure and record counts
- `GET /api/admin/legacy-cms/:table?offset=0&limit=50` for paginated records

Production can override admin emails with:

```text
ADMIN_EMAILS=hn084933@gmail.com,ecorpenglishbtl@gmail.com
```

## Deal Email Newsletter

The homepage newsletter uses double opt-in. Subscribers are stored in `data/subscribers.json`, which is ignored by Git. Publishing a new offer from Admin sends a personalized deal alert to confirmed subscribers.

Configure these production environment variables:

```env
SITE_URL=https://alocoupon.com
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_EMAIL=AloCoupon <deals@alocoupon.com>
NEWSLETTER_SECRET=replace-with-a-long-random-secret
```

Verify the sending domain in Resend before enabling production delivery. Without the Resend variables, local signups are still saved and return a local confirmation link for development testing.

## Deploy To Render

Use a Node.js web service, not static hosting, because `/api/offers` and `/admin` need the server.

Quick path:

1. Push this folder to GitHub.
2. In Render, create a new Web Service from the GitHub repo.
3. Use:
   - Build command: `npm install`
   - Start command: `npm start`
   - Health check path: `/healthz`
4. Add environment variables:
   - `NODE_ENV=production`
   - `HOST=0.0.0.0`
   - `ADMIN_PASSWORD=<your-strong-password>`
   - `ADMIN_EMAILS=hn084933@gmail.com,ecorpenglishbtl@gmail.com`
5. Deploy and open `/healthz` to confirm it returns `{ "ok": true }`.

This repo also includes `render.yaml`, so Render can create the service from the blueprint.

## Important Production Note

On hosts without persistent storage, admin changes saved in `data/offers.json` may reset after redeploys or restarts. For long-term production use, attach persistent storage or move offers to a database.
