const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const offersFile = path.join(rootDir, "data", "offers.json");
const outputDir = path.join(rootDir, "assets", "product-images");
const manifestFile = path.join(outputDir, "manifest.json");
const requestTimeoutMs = 12000;
const maxImageBytes = 5 * 1024 * 1024;
const canonicalHostAliases = {
  "alertsusa.myshopify.com": "alertsusa.com",
  "referral.displaynow.io": "displaynow.io",
};
const ignoredWords = new Set([
  "a", "an", "and", "at", "code", "coupon", "deal", "discount", "for", "free", "from",
  "in", "off", "offer", "on", "only", "sale", "shipping", "storewide", "the", "to", "up",
  "use", "with", "your", "com", "www",
]);

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
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripHtml(value) {
  return decodeHtml(String(value || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
}

function readAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return decodeHtml(match?.[1] || match?.[2] || match?.[3] || "");
}

function absoluteImageUrl(value, pageUrl) {
  let source = Array.isArray(value) ? value[0] : value;
  if (source && typeof source === "object") source = source.url || source.src || source.contentUrl;
  if (!source || String(source).startsWith("data:")) return "";
  try {
    const url = new URL(String(source).replace(/^\/\//, "https://"), pageUrl);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function isLikelyProductImage(url, marker = "") {
  const text = `${url} ${marker}`.toLowerCase();
  return Boolean(url) && !/logo|favicon|icon|sprite|payment|badge|avatar|banner|hero|placeholder|tracking/.test(text);
}

function addProduct(products, seen, title, image, pageUrl) {
  const cleanTitle = stripHtml(title);
  const cleanImage = absoluteImageUrl(image, pageUrl);
  if (!cleanTitle || cleanTitle.length < 3 || !isLikelyProductImage(cleanImage, cleanTitle)) return;
  const key = cleanImage.split("?")[0];
  if (seen.has(key)) return;
  seen.add(key);
  products.push({ title: cleanTitle, image: cleanImage });
}

function collectJsonLdProducts(value, products, seen, pageUrl) {
  if (!value) return;
  if (Array.isArray(value)) {
    value.forEach((item) => collectJsonLdProducts(item, products, seen, pageUrl));
    return;
  }
  if (typeof value !== "object") return;
  const types = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
  if (types.some((type) => String(type || "").toLowerCase() === "product")) {
    addProduct(products, seen, value.name || value.headline, value.image || value.thumbnailUrl, pageUrl);
  }
  Object.values(value).forEach((child) => {
    if (child && typeof child === "object") collectJsonLdProducts(child, products, seen, pageUrl);
  });
}

function discoverHtmlProducts(html, pageUrl) {
  const products = [];
  const seen = new Set();
  for (const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      collectJsonLdProducts(JSON.parse(match[1].trim()), products, seen, pageUrl);
    } catch {}
  }
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const marker = `${readAttribute(tag, "class")} ${readAttribute(tag, "id")}`;
    const title = readAttribute(tag, "alt") || readAttribute(tag, "title");
    if (!/product|card|collection|grid|item|thumbnail/i.test(marker) || !title) continue;
    const srcset = readAttribute(tag, "data-srcset") || readAttribute(tag, "srcset");
    const srcsetUrl = srcset ? srcset.split(",").at(-1)?.trim().split(/\s+/)[0] : "";
    addProduct(products, seen, title, srcsetUrl || readAttribute(tag, "data-src") || readAttribute(tag, "src"), pageUrl);
  }
  return products.slice(0, 100);
}

async function fetchWithTimeout(url, accept) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AloCouponCatalogBot/1.0; +https://alocoupon.com)",
        Accept: accept || "text/html,application/xhtml+xml,*/*;q=0.8",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function discoverShopifyProducts(origin) {
  try {
    const response = await fetchWithTimeout(`${origin}/products.json?limit=100`, "application/json,text/plain,*/*");
    if (!response.ok || !String(response.headers.get("content-type") || "").includes("json")) return [];
    const payload = await response.json();
    return (Array.isArray(payload.products) ? payload.products : []).map((product) => ({
      title: stripHtml(product.title),
      image: absoluteImageUrl(product.image?.src || product.images?.[0]?.src || product.images?.[0], response.url),
    })).filter((product) => product.title && isLikelyProductImage(product.image, product.title));
  } catch {
    return [];
  }
}

async function discoverHostProducts(host) {
  const sourceHost = canonicalHostAliases[host] || host;
  for (const origin of [`https://${sourceHost}`, `https://www.${sourceHost}`]) {
    const shopify = await discoverShopifyProducts(origin);
    if (shopify.length) return shopify;
    try {
      const response = await fetchWithTimeout(origin);
      if (!response.ok) continue;
      const products = discoverHtmlProducts(await response.text(), response.url || origin);
      if (products.length) return products;
    } catch {}
  }
  return [];
}

function words(value) {
  return new Set(String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").split(/\s+/)
    .filter((word) => word.length > 2 && !ignoredWords.has(word) && !/^\d+$/.test(word)));
}

function matchScore(offer, product) {
  const offerWords = words(`${offer.title} ${offer.review || ""}`);
  const productWords = words(product.title);
  let common = 0;
  productWords.forEach((word) => { if (offerWords.has(word)) common += 1; });
  return common / Math.max(2, productWords.size);
}

function chooseProduct(offer, products, index) {
  let best = null;
  let bestScore = 0;
  products.forEach((product) => {
    const score = matchScore(offer, product);
    if (score > bestScore) {
      best = product;
      bestScore = score;
    }
  });
  return bestScore >= 0.3 ? best : products[index % products.length];
}

function extensionFromResponse(response, url) {
  const type = String(response.headers.get("content-type") || "").split(";")[0].toLowerCase();
  const types = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };
  if (types[type]) return types[type];
  const match = new URL(url).pathname.match(/\.(png|jpe?g|webp|gif|avif)$/i);
  return match ? match[1].toLowerCase().replace("jpeg", "jpg") : "";
}

async function downloadProduct(url, cache) {
  if (cache.has(url)) return cache.get(url);
  const promise = (async () => {
    const response = await fetchWithTimeout(url, "image/avif,image/webp,image/png,image/jpeg,image/*,*/*;q=0.8");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const extension = extensionFromResponse(response, response.url || url);
    if (!extension) throw new Error("unsupported image");
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length || bytes.length > maxImageBytes) throw new Error("invalid image size");
    const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 16);
    const fileName = `product-${hash}.${extension}`;
    fs.writeFileSync(path.join(outputDir, fileName), bytes);
    return `/assets/product-images/${fileName}`;
  })();
  cache.set(url, promise);
  return promise;
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  const offers = JSON.parse(fs.readFileSync(offersFile, "utf8").replace(/^\uFEFF/, ""));
  const groups = new Map();
  offers.forEach((offer) => {
    const host = getOfferHost(offer);
    if (!host) return;
    if (!groups.has(host)) groups.set(host, []);
    groups.get(host).push(offer);
  });
  const hosts = [...groups.keys()].sort();
  const manifest = {};
  const downloadCache = new Map();
  let cursor = 0;

  async function worker() {
    while (cursor < hosts.length) {
      const position = cursor++;
      const host = hosts[position];
      const hostOffers = groups.get(host);
      const products = await discoverHostProducts(host);
      let saved = 0;
      for (let index = 0; index < hostOffers.length && products.length; index += 1) {
        const offer = hostOffers[index];
        const product = chooseProduct(offer, products, index);
        try {
          manifest[offer.id] = await downloadProduct(product.image, downloadCache);
          saved += 1;
        } catch {}
      }
      console.log(`[${position + 1}/${hosts.length}] ${host}: ${products.length} products, ${saved}/${hostOffers.length} offers`);
    }
  }

  await Promise.all(Array.from({ length: Math.min(4, hosts.length) }, worker));
  const ordered = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(manifestFile, `${JSON.stringify(ordered, null, 2)}\n`);
  const active = new Set(["manifest.json", ...Object.values(ordered).map((value) => path.basename(value))]);
  fs.readdirSync(outputDir, { withFileTypes: true }).forEach((entry) => {
    if (entry.isFile() && !active.has(entry.name)) fs.unlinkSync(path.join(outputDir, entry.name));
  });
  console.log(`Saved product images for ${Object.keys(ordered).length}/${offers.length} offers (${downloadCache.size} source images).`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
