const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const offersFile = path.join(rootDir, "data", "offers.json");
const outputDir = path.join(rootDir, "assets", "brand-logos");
const manifestFile = path.join(outputDir, "manifest.json");
const maxImageBytes = 2 * 1024 * 1024;
const requestTimeoutMs = 9000;
const canonicalHostAliases = {
  "alertsusa.myshopify.com": "alertsusa.com",
  "referral.displaynow.io": "displaynow.io",
};
const officialLogoUrls = {
  "alertsusa.myshopify.com": "https://cdn.shopify.com/s/files/1/0598/6661/1852/files/logo2026trans_09450d7b-eb95-41d1-8cc7-2c48eafe3e13.png",
  "distritomax.com": "https://www.distritomax.com/cdn/shop/files/Recurso_1logo_pgina_488x250.png?v=1735669887",
  "jessieboutique.com": "https://jessieboutique.com/cdn/shop/files/JBB_120x@2x.png?v=1613525734",
  "referral.displaynow.io": "https://cdn.prod.website-files.com/65df0b653a88d02378f9e6c1/6646f12c8268cc28afe12b2f_brandLogo.svg",
};

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "brand";
}

function normalizeHost(value) {
  return String(value || "").trim().toLowerCase().replace(/^www\./, "");
}

function getOfferHost(offer) {
  try {
    return normalizeHost(new URL(offer.link).hostname);
  } catch {
    return normalizeHost(offer.brand);
  }
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function readAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return decodeHtml(match?.[1] || match?.[2] || match?.[3] || "");
}

function discoverLogoUrls(html, pageUrl) {
  const urls = [];
  const add = (value) => {
    if (!value) return;
    try {
      const resolved = new URL(value, pageUrl);
      if (["http:", "https:"].includes(resolved.protocol) && !urls.includes(resolved.href)) urls.push(resolved.href);
    } catch {}
  };

  for (const tag of html.match(/<(?:img|source)\b[^>]*>/gi) || []) {
    const marker = `${readAttribute(tag, "class")} ${readAttribute(tag, "id")}`;
    if (!/logo|site-brand|header-brand/i.test(marker)) continue;
    if (/slider|client|partner|payment|product/i.test(marker)) continue;
    add(readAttribute(tag, "data-src"));
    add(readAttribute(tag, "base-src"));
    add(readAttribute(tag, "src"));
    const srcset = readAttribute(tag, "data-srcset") || readAttribute(tag, "srcset");
    if (srcset && !srcset.startsWith("data:")) add(srcset.split(",")[0].trim().split(/\s+/)[0]);
  }

  const jsonLogoPatterns = [
    /"logo"\s*:\s*"([^"]+)"/gi,
    /"logo"\s*:\s*\{[^{}]*"url"\s*:\s*"([^"]+)"/gi,
  ];
  jsonLogoPatterns.forEach((pattern) => {
    for (const match of html.matchAll(pattern)) add(match[1].replace(/\\\//g, "/"));
  });

  for (const tag of html.match(/<link\b[^>]*>/gi) || []) {
    const rel = readAttribute(tag, "rel").toLowerCase();
    if (rel.includes("icon")) add(readAttribute(tag, "href"));
  }

  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const property = (readAttribute(tag, "property") || readAttribute(tag, "name")).toLowerCase();
    if (["og:logo", "twitter:image:src"].includes(property)) add(readAttribute(tag, "content"));
  }

  return urls;
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AloCouponLogoBot/1.0; +https://alocoupon.com)",
        Accept: options.accept || "text/html,application/xhtml+xml,image/avif,image/webp,image/png,image/*,*/*;q=0.8",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function extensionFromType(contentType, url) {
  const normalized = String(contentType || "").split(";")[0].trim().toLowerCase();
  const byType = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/svg+xml": "svg",
    "image/x-icon": "ico",
    "image/vnd.microsoft.icon": "ico",
    "image/avif": "avif",
  };
  if (byType[normalized]) return byType[normalized];
  const match = new URL(url).pathname.match(/\.(png|jpe?g|webp|gif|svg|ico|avif)$/i);
  return match ? match[1].toLowerCase().replace("jpeg", "jpg") : "";
}

async function downloadLogo(url, host) {
  const response = await fetchWithTimeout(url, { accept: "image/avif,image/webp,image/png,image/svg+xml,image/*,*/*;q=0.8" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const contentType = response.headers.get("content-type") || "";
  const extension = extensionFromType(contentType, response.url || url);
  if (!extension || (!contentType.startsWith("image/") && extension !== "svg")) throw new Error("not an image");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length || bytes.length > maxImageBytes) throw new Error("invalid image size");
  const fileName = `${slugify(host)}.${extension}`;
  fs.writeFileSync(path.join(outputDir, fileName), bytes);
  return `/assets/brand-logos/${fileName}`;
}

async function extractHostLogo(host) {
  const sourceHost = canonicalHostAliases[host] || host;
  const origins = [`https://${sourceHost}`, `https://www.${sourceHost}`];
  const candidates = [];
  if (officialLogoUrls[host]) candidates.push(officialLogoUrls[host]);

  for (const origin of origins) {
    try {
      const response = await fetchWithTimeout(origin);
      if (!response.ok) continue;
      const html = await response.text();
      discoverLogoUrls(html, response.url || origin).forEach((url) => {
        if (!candidates.includes(url)) candidates.push(url);
      });
      const finalOrigin = new URL(response.url || origin).origin;
      ["/apple-touch-icon.png", "/favicon-32x32.png", "/favicon.ico"].forEach((pathname) => {
        const url = new URL(pathname, finalOrigin).href;
        if (!candidates.includes(url)) candidates.push(url);
      });
      break;
    } catch {}
  }

  candidates.push(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(sourceHost)}&sz=128`);
  for (const candidate of candidates) {
    try {
      return await downloadLogo(candidate, host);
    } catch {}
  }
  return "";
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const offers = JSON.parse(fs.readFileSync(offersFile, "utf8").replace(/^\uFEFF/, ""));
  const hosts = [...new Set(offers.map(getOfferHost).filter(Boolean))].sort();
  const manifest = fs.existsSync(manifestFile)
    ? JSON.parse(fs.readFileSync(manifestFile, "utf8"))
    : {};
  let cursor = 0;

  async function worker() {
    while (cursor < hosts.length) {
      const host = hosts[cursor++];
      process.stdout.write(`[${cursor}/${hosts.length}] ${host}: `);
      const logo = await extractHostLogo(host);
      if (logo) {
        manifest[host] = logo;
        process.stdout.write(`${logo}\n`);
      } else {
        process.stdout.write("not found\n");
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(4, hosts.length) }, worker));
  const orderedManifest = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(manifestFile, `${JSON.stringify(orderedManifest, null, 2)}\n`);
  const activeFiles = new Set([
    "manifest.json",
    ...Object.values(orderedManifest).map((value) => path.basename(value)),
  ]);
  fs.readdirSync(outputDir, { withFileTypes: true }).forEach((entry) => {
    if (entry.isFile() && !activeFiles.has(entry.name)) fs.unlinkSync(path.join(outputDir, entry.name));
  });
  console.log(`Saved ${Object.keys(orderedManifest).length}/${hosts.length} brand logos.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
