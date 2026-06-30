const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { exec } = require("child_process");

const root = __dirname;
const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(root, "data");
const offersFile = path.join(dataDir, "offers.json");
const adminEmailsFile = path.join(dataDir, "admin-emails.json");
const sessions = new Map();
const isProduction = process.env.NODE_ENV === "production";
const siteUrl = String(process.env.SITE_URL || "https://alocoupon.com").replace(/\/+$/, "");

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

const starterOffers = [];
const starterAdminEmails = ["admin@alocoupon.local"];

function ensureDataFile() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(offersFile)) {
    fs.writeFileSync(offersFile, JSON.stringify(starterOffers, null, 2));
  }
  if (!fs.existsSync(adminEmailsFile)) {
    fs.writeFileSync(adminEmailsFile, JSON.stringify(starterAdminEmails, null, 2));
  }
}

function readOffers() {
  ensureDataFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(offersFile, "utf8"));
    return normalizeOffers(Array.isArray(parsed) ? parsed : starterOffers);
  } catch {
    return normalizeOffers(starterOffers);
  }
}

function writeOffers(offers) {
  ensureDataFile();
  fs.writeFileSync(offersFile, JSON.stringify(normalizeOffers(offers), null, 2));
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function readAllowedAdminEmails() {
  ensureDataFile();
  if (process.env.ADMIN_EMAILS) {
    return process.env.ADMIN_EMAILS.split(",").map(normalizeEmail).filter(Boolean);
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(adminEmailsFile, "utf8"));
    return Array.isArray(parsed) ? parsed.map(normalizeEmail).filter(Boolean) : starterAdminEmails;
  } catch {
    return starterAdminEmails;
  }
}

function isEmailAllowed(email) {
  return readAllowedAdminEmails().includes(normalizeEmail(email));
}

function send(res, status, body, contentType = "text/plain; charset=utf-8", headers = {}) {
  res.writeHead(status, { "Content-Type": contentType, ...headers });
  res.end(body);
}

function sendJson(res, status, payload) {
  send(res, status, JSON.stringify(payload), "application/json; charset=utf-8");
}

function getSafeAffiliateUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

function addAloCouponUtmToAffiliate(value) {
  const safeUrl = getSafeAffiliateUrl(value);
  if (safeUrl === "#") {
    return "#";
  }

  const url = new URL(safeUrl);
  const currentParams = new URLSearchParams(url.search);
  const nextParams = new URLSearchParams();
  nextParams.set("utm_source", currentParams.get("utm_source") || "alocoupon");
  currentParams.delete("utm_source");
  currentParams.forEach((paramValue, key) => {
    nextParams.append(key, paramValue);
  });
  url.search = nextParams.toString();
  return url.href;
}

function getAloCouponTrackingUrl(value) {
  const affiliateUrl = addAloCouponUtmToAffiliate(value);
  if (affiliateUrl === "#") {
    return "#";
  }

  return `/go?utm_source=alocoupon&url=${encodeURIComponent(affiliateUrl)}`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeXml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function cleanBrandName(value) {
  return String(value || "Partner Store")
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "")
    .trim() || "Partner Store";
}

function isUsableCouponCode(code) {
  const normalized = String(code || "").trim().toUpperCase();
  return Boolean(normalized && !["DEAL", "NO CODE", "NO-CODE"].includes(normalized));
}

function getDisplayOfferTitle(offer) {
  const brand = cleanBrandName(offer.brand);
  const discount = String(offer.discount || "").trim();
  const code = String(offer.code || "").trim();
  const review = String(offer.review || offer.title || "").trim();

  if (isUsableCouponCode(code)) {
    return `${brand} Coupon Code ${code}${discount ? ` - ${discount}` : ""}`;
  }

  if (discount) {
    return `${brand} Deal - ${discount}`;
  }

  return review || `${brand} Deal`;
}

function getOfferSummary(offer) {
  const title = String(offer.title || "").trim();
  const review = String(offer.review || "").trim();
  const displayTitle = getDisplayOfferTitle(offer);
  return review && review !== title && review !== displayTitle ? review : title || review || displayTitle;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error("Request body too large"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function parseCookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .map((part) => part.trim().split("="))
      .filter(([key, value]) => key && value)
  );
}

function getAdminSession(req) {
  const token = parseCookies(req).admin_session;
  const session = token && sessions.get(token);
  if (!session) {
    return null;
  }

  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  return session;
}

function isAuthenticated(req) {
  return Boolean(getAdminSession(req));
}

function normalizeOfferType(value) {
  const type = String(value || "").trim().toLowerCase();
  if (["promo", "promotion", "promotion-code", "promotion_code"].includes(type)) {
    return "promotion";
  }
  return ["code", "deal"].includes(type) ? type : "code";
}

function normalizeOfferDate(value, fallbackIndex = 0) {
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toISOString();
  }

  return new Date(Date.now() - fallbackIndex).toISOString();
}

function createOfferId() {
  return `offer_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
}

function normalizeOfferId(offer, fallbackIndex = 0) {
  const id = String(offer.id || "").trim();
  if (id) {
    return id;
  }

  const source = [
    offer.brand,
    offer.title,
    offer.link,
    offer.createdAt,
    fallbackIndex,
  ].join("|");
  return `offer_${crypto.createHash("sha1").update(source).digest("hex").slice(0, 12)}`;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getOfferDealSlug(offer) {
  const base = slugify([offer.brand, offer.title].filter(Boolean).join(" ")) || "deal";
  const id = slugify(offer.id) || slugify(offer.link);
  return `${base}-${id}`;
}

function getOfferDealPath(offer) {
  return `/deal/${getOfferDealSlug(offer)}`;
}

function getAbsoluteUrl(pathname = "/") {
  return `${siteUrl}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function getSitemapLastmod(value) {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function sitemapUrl(pathname, lastmod, priority = "0.7") {
  return [
    "  <url>",
    `    <loc>${escapeXml(getAbsoluteUrl(pathname))}</loc>`,
    `    <lastmod>${escapeXml(getSitemapLastmod(lastmod))}</lastmod>`,
    "    <changefreq>daily</changefreq>",
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

function sitemapXml() {
  const offers = readOffers();
  const urls = [
    sitemapUrl("/", Date.now(), "1.0"),
    ...offers.map((offer) => sitemapUrl(getOfferDealPath(offer), offer.createdAt, "0.8")),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;
}

function robotsTxt() {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /admin",
    "Disallow: /api/",
    `Sitemap: ${siteUrl}/sitemap.xml`,
    "",
  ].join("\n");
}

function getRssDate(value) {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
}

function rssXml() {
  const offers = readOffers().slice(0, 50);
  const items = offers
    .map((offer) => {
      const pathName = getOfferDealPath(offer);
      const title = [offer.brand, offer.title].filter(Boolean).join(" - ") || "AloCoupon Deal";
      const description = offer.review || offer.discount || "Latest coupon and affiliate deal from AloCoupon.";

      return [
        "    <item>",
        `      <title>${escapeXml(title)}</title>`,
        `      <link>${escapeXml(getAbsoluteUrl(pathName))}</link>`,
        `      <guid isPermaLink="true">${escapeXml(getAbsoluteUrl(pathName))}</guid>`,
        `      <description>${escapeXml(description)}</description>`,
        `      <category>${escapeXml(offer.category || "Coupon")}</category>`,
        `      <pubDate>${escapeXml(getRssDate(offer.createdAt))}</pubDate>`,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>AloCoupon Latest Deals</title>
    <link>${escapeXml(getAbsoluteUrl("/"))}</link>
    <description>Latest coupon codes, affiliate deals, store reviews, and product promotions from AloCoupon.</description>
    <language>en-us</language>
    <lastBuildDate>${escapeXml(getRssDate(Date.now()))}</lastBuildDate>
${items}
  </channel>
</rss>
`;
}

function jsonLdScript(payload) {
  return `<script type="application/ld+json">${JSON.stringify(payload).replaceAll("</", "<\\/")}</script>`;
}

function dealStructuredData(offer) {
  const dealPath = getOfferDealPath(offer);
  const dealUrl = getAbsoluteUrl(dealPath);
  const title = getDisplayOfferTitle(offer);
  const description = getOfferSummary(offer) || "Review this coupon offer before visiting the partner website.";
  const validThrough = offer.expiryDate || offer.expiresAt || undefined;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": "AloCoupon",
        "url": getAbsoluteUrl("/"),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${dealUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": getAbsoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": offer.category || "Deals",
            "item": dealUrl,
          },
        ],
      },
      {
        "@type": "Article",
        "@id": `${dealUrl}#article`,
        "headline": title,
        "description": description,
        "datePublished": getSitemapLastmod(offer.createdAt),
        "dateModified": getSitemapLastmod(offer.updatedAt || offer.createdAt),
        "mainEntityOfPage": dealUrl,
        "publisher": {
          "@id": `${siteUrl}/#organization`,
        },
      },
      {
        "@type": "Offer",
        "@id": `${dealUrl}#offer`,
        "name": title,
        "description": description,
        "url": dealUrl,
        "category": offer.category || "Coupon",
        "availability": "https://schema.org/InStock",
        ...(validThrough ? { "validThrough": validThrough } : {}),
        "seller": {
          "@type": "Organization",
          "name": cleanBrandName(offer.brand),
        },
      },
    ],
  };
}

function normalizeOffers(offers) {
  return offers
    .map((offer, index) => ({
      ...offer,
      id: normalizeOfferId(offer, index),
      type: normalizeOfferType(offer.type),
      createdAt: normalizeOfferDate(offer.createdAt, index),
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function sanitizeOffer(input) {
  const offer = {
    id: String(input.id || "").trim() || createOfferId(),
    brand: String(input.brand || "").trim(),
    title: String(input.title || "").trim(),
    type: normalizeOfferType(input.type),
    code: String(input.code || "").trim().toUpperCase(),
    discount: String(input.discount || "").trim(),
    link: String(input.link || "").trim(),
    category: String(input.category || "").trim(),
    expiry: String(input.expiry || "").trim(),
    review: String(input.review || "").trim(),
    createdAt: new Date().toISOString(),
  };

  if (!offer.code) {
    offer.type = "deal";
  }

  const url = new URL(offer.link);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Affiliate link must use http or https.");
  }
  offer.link = url.href;

  for (const field of ["brand", "title", "discount", "category", "review"]) {
    if (!offer[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  return offer;
}

function sanitizeUpdatedOffer(input, existingOffer) {
  return {
    ...sanitizeOffer({ ...input, id: existingOffer.id }),
    createdAt: existingOffer.createdAt,
  };
}

function findOfferByDealSlug(slug) {
  const normalizedSlug = slugify(slug);
  return readOffers().find((offer) => {
    return getOfferDealSlug(offer) === normalizedSlug || slugify(offer.id) === normalizedSlug;
  });
}

function timingSafePasswordMatches(value) {
  const expected = Buffer.from(adminPassword);
  const actual = Buffer.from(String(value || ""));
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function loginPage(error = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AloCoupon Admin Login</title>
  <link rel="stylesheet" href="/styles.css" />
</head>
<body>
  <main class="section admin-section" style="display:block; min-height:100vh;">
    <div class="container admin-layout">
      <div class="admin-copy">
        <p class="eyebrow">Protected admin</p>
        <h2>AloCoupon Admin Login</h2>
        <p>Enter an allowed admin email and password to upload affiliate reviews and coupon codes. The public website cannot access this form.</p>
      </div>
      <form class="admin-form" method="post" action="/api/login">
        ${error ? `<p style="color:#b42318; font-weight:900; margin:0;">${error}</p>` : ""}
        <label>
          Admin email
          <input name="email" type="email" autocomplete="username" placeholder="admin@alocoupon.local" required autofocus />
        </label>
        <label>
          Password
          <input name="password" type="password" autocomplete="current-password" required />
        </label>
        <button class="button button-primary" type="submit">Login</button>
      </form>
    </div>
  </main>
</body>
</html>`;
}

function adminPage(adminEmail = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AloCoupon Secure Admin</title>
  <link rel="stylesheet" href="/styles.css" />
</head>
<body class="admin-mode">
  <main>
    <section class="section admin-section" style="display:block;">
      <div class="container admin-layout">
        <div class="admin-copy">
          <p class="eyebrow">Secure affiliate workspace</p>
          <h2>Admin Deal & Coupon Upload</h2>
          <p>This page is protected by a server session. Only admins can publish product promotions into Deals Of Today and the public deal search.</p>
          <div class="admin-stats"><span><strong id="offer-count">0</strong> Published offers</span><span>Signed in: ${escapeHtml(adminEmail)}</span></div>
          <p><a class="button button-outline" href="/" style="color:#fff;border-color:rgba(255,255,255,.36);">View Public Site</a></p>
        </div>
        <form class="admin-form" id="secure-offer-form">
          <input name="id" type="hidden" />
          <label>Partner / Brand <input name="brand" type="text" placeholder="Example: HeyGen" required /></label>
          <label>Promotion title <input name="title" type="text" placeholder="Example: Get 20% Off Pro Plan" required /></label>
          <div class="form-row">
            <label>Offer type
              <select name="type">
                <option value="code">Coupon Code</option>
                <option value="promotion">Promotion Code</option>
                <option value="deal">Deal</option>
              </select>
            </label>
            <label>Code / Promotion code <input name="code" type="text" placeholder="SAVE20, optional for Deal" /></label>
          </div>
          <div class="form-row">
            <label>Discount <input name="discount" type="text" placeholder="20% Off" required /></label>
            <label>Expiry note <input name="expiry" type="text" placeholder="Ends this month" /></label>
          </div>
          <label>Affiliate link <input name="link" type="url" placeholder="https://partner-site.com/?ref=..." required /></label>
          <div class="form-row">
            <label>Catalog / Category
              <select name="category">
                <option>AI</option><option>Software</option><option>Ecommerce</option><option>Fashion</option><option>Travel</option><option>Hosting</option><option>Electronics</option><option>Beauty</option><option>Food</option><option>Health</option><option>Finance</option><option>Other</option>
              </select>
            </label>
            <label>Custom catalog <input name="customCategory" type="text" placeholder="Optional: Water Systems, WordPress..." /></label>
          </div>
          <label>Promotion summary <textarea name="review" rows="4" placeholder="Short product promotion details shown in deal search..." required></textarea></label>
          <button class="button button-primary" type="submit" id="save-offer-btn">Publish To Deals</button>
          <button class="button button-outline" id="cancel-edit-btn" type="button" hidden>Cancel Edit</button>
          <button class="button button-outline" id="logout-btn" type="button">Logout</button>
        </form>
      </div>
    </section>
    <section class="section container">
      <div class="section-title"><h2>Published Partner Reviews & Coupons</h2></div>
      <div class="admin-offer-grid" id="admin-offer-list"></div>
    </section>
  </main>
  <div class="toast" role="status" aria-live="polite"></div>
  <script>
    const form = document.querySelector("#secure-offer-form");
    const list = document.querySelector("#admin-offer-list");
    const count = document.querySelector("#offer-count");
    const toast = document.querySelector(".toast");
    const saveButton = document.querySelector("#save-offer-btn");
    const cancelEditButton = document.querySelector("#cancel-edit-btn");
    let currentOffers = [];

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2400);
    }

    function escapeHtml(value) {
      return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
    }

    function getSafeAffiliateUrl(value) {
      try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
      } catch {
        return "#";
      }
    }

    function addAloCouponUtmToAffiliate(value) {
      const safeUrl = getSafeAffiliateUrl(value);
      if (safeUrl === "#") return "#";
      const url = new URL(safeUrl);
      const currentParams = new URLSearchParams(url.search);
      const nextParams = new URLSearchParams();
      nextParams.set("utm_source", currentParams.get("utm_source") || "alocoupon");
      currentParams.delete("utm_source");
      currentParams.forEach((paramValue, key) => {
        nextParams.append(key, paramValue);
      });
      url.search = nextParams.toString();
      return url.href;
    }

    function getAloCouponTrackingUrl(value) {
      const affiliateUrl = addAloCouponUtmToAffiliate(value);
      if (affiliateUrl === "#") return "#";
      return \`\${window.location.origin}/go?utm_source=alocoupon&url=\${encodeURIComponent(affiliateUrl)}\`;
    }

    function getAloCouponAffiliateUrl(value) {
      return getAloCouponTrackingUrl(value);
    }

    function resetFormMode() {
      form.reset();
      form.elements.id.value = "";
      saveButton.textContent = "Publish To Deals";
      cancelEditButton.hidden = true;
    }

    function getPayload() {
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.category = (payload.customCategory || payload.category || "").trim();
      delete payload.customCategory;
      return payload;
    }

    function fillForm(offer) {
      form.elements.id.value = offer.id || "";
      form.elements.brand.value = offer.brand || "";
      form.elements.title.value = offer.title || "";
      form.elements.type.value = offer.type || "code";
      form.elements.code.value = offer.code || "";
      form.elements.discount.value = offer.discount || "";
      form.elements.expiry.value = offer.expiry || "";
      form.elements.link.value = offer.link || "";
      form.elements.review.value = offer.review || "";
      const option = Array.from(form.elements.category.options).find((item) => item.value === offer.category);
      form.elements.category.value = option ? offer.category : "Other";
      form.elements.customCategory.value = option ? "" : (offer.category || "");
      saveButton.textContent = "Save Changes";
      cancelEditButton.hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    async function loadOffers() {
      const res = await fetch("/api/offers");
      const offers = await res.json();
      currentOffers = Array.isArray(offers) ? offers : [];
      count.textContent = offers.length;
      list.innerHTML = offers.length ? offers.map((offer) => \`
        <article class="admin-offer-card">
          <div class="admin-offer-top">
            <div><p class="store-name">\${escapeHtml(offer.brand)}</p><h3>\${escapeHtml(offer.title)}</h3></div>
            <span class="coupon-pill">\${escapeHtml(offer.discount)}</span>
          </div>
          <p>\${escapeHtml(offer.review)}</p>
          <div class="admin-offer-meta"><span>\${escapeHtml(offer.type || "code")}</span><span>\${escapeHtml(offer.category)}</span><span>\${escapeHtml(offer.expiry || "No expiry note")}</span><span>\${escapeHtml(offer.code || "No code")}</span><span>\${escapeHtml(new Date(offer.createdAt || Date.now()).toLocaleString())}</span></div>
          <div class="admin-offer-actions">
            <button class="button button-outline edit-offer-btn" type="button" data-id="\${escapeHtml(offer.id)}">Edit</button>
            <button class="button button-outline delete-offer-btn" type="button" data-id="\${escapeHtml(offer.id)}">Delete</button>
            <a class="product-link" href="\${escapeHtml(getAloCouponAffiliateUrl(offer.link))}" target="_blank" rel="sponsored noopener">Visit Affiliate Link</a>
          </div>
        </article>\`
      ).join("") : \`<p class="admin-empty-state">No offers yet. Upload real partner data from the form above.</p>\`;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = getPayload();
      const isEdit = Boolean(payload.id);
      const res = await fetch(isEdit ? \`/api/offers/\${encodeURIComponent(payload.id)}\` : "/api/offers", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Upload failed" }));
        showToast(error.error || "Upload failed");
        return;
      }
      resetFormMode();
      await loadOffers();
      showToast(isEdit ? "Offer updated." : "Offer published securely.");
    });

    cancelEditButton.addEventListener("click", resetFormMode);

    list.addEventListener("click", async (event) => {
      const editButton = event.target.closest(".edit-offer-btn");
      const deleteButton = event.target.closest(".delete-offer-btn");

      if (editButton) {
        const offer = currentOffers.find((item) => item.id === editButton.dataset.id);
        if (offer) fillForm(offer);
        return;
      }

      if (!deleteButton) {
        return;
      }

      const offer = currentOffers.find((item) => item.id === deleteButton.dataset.id);
      if (!offer || !confirm(\`Delete "\${offer.title}"?\`)) {
        return;
      }

      const res = await fetch(\`/api/offers/\${encodeURIComponent(offer.id)}\`, { method: "DELETE" });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: "Delete failed" }));
        showToast(error.error || "Delete failed");
        return;
      }

      if (form.elements.id.value === offer.id) {
        resetFormMode();
      }
      await loadOffers();
      showToast("Offer deleted.");
    });

    document.querySelector("#logout-btn").addEventListener("click", async () => {
      await fetch("/api/logout", { method: "POST" });
      location.href = "/admin";
    });

    loadOffers();
  </script>
</body>
</html>`;
}

async function handleLogin(req, res) {
  const body = await readBody(req);
  const params = new URLSearchParams(body);
  const email = normalizeEmail(params.get("email"));

  if (!isEmailAllowed(email)) {
    send(res, 403, loginPage("This email is not allowed to access admin."), "text/html; charset=utf-8");
    return;
  }

  if (!timingSafePasswordMatches(params.get("password"))) {
    send(res, 401, loginPage("Wrong password."), "text/html; charset=utf-8");
    return;
  }

  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { email, expiresAt: Date.now() + 1000 * 60 * 60 * 8 });
  send(res, 302, "", "text/plain; charset=utf-8", {
    "Location": "/admin",
    "Set-Cookie": `admin_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${isProduction ? "; Secure" : ""}`,
  });
}

function serveStatic(req, res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(root, safePath));

  if (!filePath.startsWith(root) || filePath.startsWith(dataDir)) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stat) => {
    if (statError || !stat.isFile()) {
      send(res, 404, "Not found");
      return;
    }

    res.writeHead(200, {
      "Content-Type": types[path.extname(filePath).toLowerCase()] || "application/octet-stream",
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

function handleAffiliateRedirect(url, res) {
  const pathTarget = url.pathname.startsWith("/go/")
    ? `https://${url.pathname.slice("/go/".length)}${url.search}`
    : "";
  const target = addAloCouponUtmToAffiliate(url.searchParams.get("url") || pathTarget);
  if (target === "#") {
    send(res, 400, "Invalid affiliate link");
    return;
  }

  send(res, 302, "", "text/plain; charset=utf-8", {
    "Location": target,
    "Referrer-Policy": "origin-when-cross-origin",
  });
}

function dealPage(offer) {
  const affiliateLink = getSafeAffiliateUrl(offer.link);
  const brand = escapeHtml(cleanBrandName(offer.brand));
  const title = escapeHtml(getDisplayOfferTitle(offer));
  const discount = escapeHtml(offer.discount || "Best Deal");
  const category = escapeHtml(offer.category || "Deal");
  const expiry = escapeHtml(offer.expiry || "Limited time");
  const review = escapeHtml(getOfferSummary(offer) || "Review this offer before visiting the partner website.");
  const code = escapeHtml(offer.code || "No code needed");
  const hasCode = Boolean(String(offer.code || "").trim());
  const safeAffiliateLink = escapeHtml(affiliateLink);
  const dealUrl = escapeHtml(getAbsoluteUrl(getOfferDealPath(offer)));
  const structuredData = jsonLdScript(dealStructuredData(offer));

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="index, follow" />
  <title>${title} | AloCoupon</title>
  <meta name="description" content="${review}" />
  <link rel="canonical" href="${dealUrl}" />
  <link rel="alternate" type="application/rss+xml" title="AloCoupon Latest Deals" href="${escapeHtml(getAbsoluteUrl("/rss.xml"))}" />
  ${structuredData}
  <link rel="stylesheet" href="/styles.css" />
  <style>
    body { background: #f4fbf8; color: #1f2937; font-family: Arial, sans-serif; margin: 0; }
    .deal-landing { margin: 0 auto; max-width: 960px; padding: 48px 20px; }
    .deal-landing-card { background: #fff; border-radius: 12px; box-shadow: 0 20px 50px rgba(31, 41, 55, .12); display: grid; gap: 24px; grid-template-columns: 220px 1fr; padding: 28px; }
    .deal-landing-badge { align-items: center; background: #1f2a44; border-radius: 10px; color: #fff; display: flex; flex-direction: column; font-weight: 800; justify-content: center; min-height: 180px; text-align: center; }
    .deal-landing-badge span { color: #6ee7b7; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; }
    .deal-landing-badge strong { font-size: 30px; }
    .deal-landing h1 { font-size: 34px; line-height: 1.1; margin: 8px 0 14px; }
    .deal-landing-meta { color: #64748b; display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 18px; }
    .deal-landing-meta span { background: #eef8f2; border-radius: 999px; padding: 7px 11px; }
    .deal-landing-code { background: #f8fafc; border: 1px dashed #94a3b8; border-radius: 8px; display: inline-block; font-weight: 800; margin: 12px 0 18px; padding: 10px 14px; }
    .deal-landing-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px; }
    .deal-landing-actions a { background: #21b573; border-radius: 8px; color: #fff; font-weight: 800; padding: 13px 18px; text-decoration: none; }
    .deal-landing-actions a.secondary { background: #e7f7ef; color: #0f8f5d; }
    @media (max-width: 720px) { .deal-landing-card { grid-template-columns: 1fr; } .deal-landing h1 { font-size: 28px; } }
  </style>
</head>
<body>
  <main class="deal-landing">
    <section class="deal-landing-card">
      <div class="deal-landing-badge">
        <span>${category}</span>
        <strong>${discount}</strong>
      </div>
      <div>
        <p class="store-name">${brand}</p>
        <h1>${title}</h1>
        <div class="deal-landing-meta">
          <span>${expiry}</span>
          <span>${hasCode ? "Coupon code available" : "Affiliate deal"}</span>
        </div>
        <p>${review}</p>
        <div class="deal-landing-code">${code}</div>
        <div class="deal-landing-actions">
          <a href="${safeAffiliateLink}" rel="sponsored noopener">Open Affiliate Link</a>
          <a class="secondary" href="/">Back to AloCoupon</a>
        </div>
      </div>
    </section>
  </main>
</body>
</html>`;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${host}:${port}`);

    if (req.method === "GET" && (url.pathname === "/go" || url.pathname.startsWith("/go/"))) {
      handleAffiliateRedirect(url, res);
      return;
    }

    const dealMatch = url.pathname.match(/^\/deal\/([^/]+)$/);
    if (req.method === "GET" && dealMatch) {
      const offer = findOfferByDealSlug(decodeURIComponent(dealMatch[1]));
      if (!offer) {
        send(res, 404, "Deal not found");
        return;
      }

      send(res, 200, dealPage(offer), "text/html; charset=utf-8");
      return;
    }

    if (req.method === "GET" && url.pathname === "/healthz") {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && url.pathname === "/sitemap.xml") {
      send(res, 200, sitemapXml(), "application/xml; charset=utf-8");
      return;
    }

    if (req.method === "GET" && url.pathname === "/robots.txt") {
      send(res, 200, robotsTxt(), "text/plain; charset=utf-8");
      return;
    }

    if (req.method === "GET" && url.pathname === "/rss.xml") {
      send(res, 200, rssXml(), "application/rss+xml; charset=utf-8");
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/offers") {
      sendJson(res, 200, readOffers());
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/offers") {
      if (!isAuthenticated(req)) {
        sendJson(res, 401, { error: "Admin login required." });
        return;
      }

      const payload = JSON.parse(await readBody(req));
      const offer = sanitizeOffer(payload);
      const offers = readOffers();
      writeOffers([offer, ...offers]);
      sendJson(res, 201, offer);
      return;
    }

    const offerMatch = url.pathname.match(/^\/api\/offers\/([^/]+)$/);
    if (offerMatch && (req.method === "PUT" || req.method === "DELETE")) {
      if (!isAuthenticated(req)) {
        sendJson(res, 401, { error: "Admin login required." });
        return;
      }

      const offerId = decodeURIComponent(offerMatch[1]);
      const offers = readOffers();
      const index = offers.findIndex((offer) => offer.id === offerId);
      if (index === -1) {
        sendJson(res, 404, { error: "Offer not found." });
        return;
      }

      if (req.method === "DELETE") {
        const [deleted] = offers.splice(index, 1);
        writeOffers(offers);
        sendJson(res, 200, deleted);
        return;
      }

      const payload = JSON.parse(await readBody(req));
      const updatedOffer = sanitizeUpdatedOffer(payload, offers[index]);
      offers[index] = updatedOffer;
      writeOffers(offers);
      sendJson(res, 200, updatedOffer);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/login") {
      await handleLogin(req, res);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/logout") {
      const token = parseCookies(req).admin_session;
      if (token) sessions.delete(token);
      send(res, 204, "", "text/plain; charset=utf-8", {
        "Set-Cookie": `admin_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${isProduction ? "; Secure" : ""}`,
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/admin") {
      const adminSession = getAdminSession(req);
      send(res, 200, adminSession ? adminPage(adminSession.email) : loginPage(), "text/html; charset=utf-8");
      return;
    }

    if (req.method === "GET" || req.method === "HEAD") {
      serveStatic(req, res, decodeURIComponent(url.pathname));
      return;
    }

    send(res, 405, "Method not allowed");
  } catch (error) {
    sendJson(res, 400, { error: error.message || "Bad request" });
  }
});

server.listen(port, host, () => {
  const displayHost = host === "0.0.0.0" ? "127.0.0.1" : host;
  const publicUrl = `http://${displayHost}:${port}/`;
  const adminUrl = `http://${displayHost}:${port}/admin`;
  console.log(`Website dang chay tai: ${publicUrl}`);
  console.log(`Trang quan tri bao mat: ${adminUrl}`);
  console.log(`Mat khau mac dinh: ${adminPassword}`);
  console.log("Nen doi mat khau bang bien moi truong ADMIN_PASSWORD truoc khi dung that.");
  console.log("Giu cua so nay mo. Bam Ctrl+C de tat server.");
  if (process.env.OPEN_BROWSER === "1" && process.platform === "win32") {
    exec(`start "" "${publicUrl}"`);
  }
});

server.on("error", (error) => {
  console.error("Khong the chay server.");
  console.error(error.message);
  process.exit(1);
});
