const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const offersFile = path.join(rootDir, "data", "offers.json");
const outputDir = path.join(rootDir, "assets", "brand-landings");
const manifestFile = path.join(outputDir, "manifest.json");
const requestTimeoutMs = 10000;
const maxImageBytes = 5 * 1024 * 1024;
const canonicalHostAliases = {
  "alertsusa.myshopify.com": "alertsusa.com",
  "referral.displaynow.io": "displaynow.io",
};

function slugify(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "brand";
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
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function readAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return decodeHtml(match?.[1] || match?.[2] || match?.[3] || "");
}

function discoverLandingImages(html, pageUrl) {
  const candidates = [];
  const add = (value, priority) => {
    if (!value || String(value).startsWith("data:")) return;
    try {
      const url = new URL(value, pageUrl);
      if (!["http:", "https:"].includes(url.protocol)) return;
      if (!candidates.some((item) => item.url === url.href)) candidates.push({ url: url.href, priority });
    } catch {}
  };

  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const property = (readAttribute(tag, "property") || readAttribute(tag, "name")).toLowerCase();
    if (property === "og:image" || property === "og:image:secure_url") add(readAttribute(tag, "content"), 100);
    if (property === "twitter:image" || property === "twitter:image:src") add(readAttribute(tag, "content"), 90);
  }

  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const marker = `${readAttribute(tag, "class")} ${readAttribute(tag, "id")} ${readAttribute(tag, "alt")}`;
    if (!/hero|banner|slideshow|featured|masthead/i.test(marker)) continue;
    if (/logo|icon|payment|avatar/i.test(marker)) continue;
    add(readAttribute(tag, "data-src"), 120);
    add(readAttribute(tag, "src"), 115);
    const srcset = readAttribute(tag, "data-srcset") || readAttribute(tag, "srcset");
    if (srcset) {
      const last = srcset.split(",").at(-1)?.trim().split(/\s+/)[0];
      add(last, 125);
    }
  }

  return candidates.sort((a, b) => b.priority - a.priority).map((item) => item.url);
}

async function fetchWithTimeout(url, accept) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AloCouponContentBot/1.0; +https://alocoupon.com)",
        Accept: accept || "text/html,application/xhtml+xml,*/*;q=0.8",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function extensionFromResponse(response, url) {
  const type = String(response.headers.get("content-type") || "").split(";")[0].toLowerCase();
  const types = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
  };
  if (types[type]) return types[type];
  const match = new URL(url).pathname.match(/\.(png|jpe?g|webp|gif|avif)$/i);
  return match ? match[1].toLowerCase().replace("jpeg", "jpg") : "";
}

async function downloadLanding(url, host) {
  const response = await fetchWithTimeout(url, "image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const extension = extensionFromResponse(response, response.url || url);
  if (!extension) throw new Error("unsupported image");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length || bytes.length > maxImageBytes) throw new Error("invalid image size");
  const fileName = `${slugify(host)}.${extension}`;
  fs.writeFileSync(path.join(outputDir, fileName), bytes);
  return `/assets/brand-landings/${fileName}`;
}

async function extractHostLanding(host) {
  const sourceHost = canonicalHostAliases[host] || host;
  for (const origin of [`https://${sourceHost}`, `https://www.${sourceHost}`]) {
    try {
      const response = await fetchWithTimeout(origin);
      if (!response.ok) continue;
      const html = await response.text();
      const candidates = discoverLandingImages(html, response.url || origin);
      for (const candidate of candidates) {
        try {
          return await downloadLanding(candidate, host);
        } catch {}
      }
    } catch {}
  }
  return "";
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const offers = JSON.parse(fs.readFileSync(offersFile, "utf8").replace(/^\uFEFF/, ""));
  const hosts = [...new Set(offers.map(getOfferHost).filter(Boolean))].sort();
  const manifest = {};
  let cursor = 0;

  async function worker() {
    while (cursor < hosts.length) {
      const index = cursor++;
      const host = hosts[index];
      const landing = await extractHostLanding(host);
      if (landing) manifest[host] = landing;
      console.log(`[${index + 1}/${hosts.length}] ${host}: ${landing || "not found"}`);
    }
  }

  await Promise.all(Array.from({ length: Math.min(4, hosts.length) }, worker));
  const ordered = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(manifestFile, `${JSON.stringify(ordered, null, 2)}\n`);
  const active = new Set(["manifest.json", ...Object.values(ordered).map((value) => path.basename(value))]);
  fs.readdirSync(outputDir, { withFileTypes: true }).forEach((entry) => {
    if (entry.isFile() && !active.has(entry.name)) fs.unlinkSync(path.join(outputDir, entry.name));
  });
  console.log(`Saved ${Object.keys(ordered).length}/${hosts.length} landing images.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
