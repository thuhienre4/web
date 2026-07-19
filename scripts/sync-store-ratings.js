const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const storesFile = path.join(rootDir, "data", "stores.json");
const envFile = path.join(rootDir, ".env");

function loadEnvFile() {
  if (!fs.existsSync(envFile)) return;
  fs.readFileSync(envFile, "utf8").split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  });
}

loadEnvFile();
const googlePlacesApiKey = String(process.env.GOOGLE_PLACES_API_KEY || "").trim();
let googlePlacesDisabledReason = "";
const acceptedTypes = new Set([
  "organization",
  "corporation",
  "localbusiness",
  "store",
  "onlinestore",
  "onlinebusiness",
  "brand",
  "website",
]);

function decodeHtml(value) {
  return String(value || "")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([a-f0-9]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function numberValue(value) {
  const normalized = String(value ?? "").replace(/,/g, "").trim();
  return normalized ? Number(normalized) : 0;
}

function normalizedHost(value) {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; }
}

function findStoreRating(value) {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const rating = findStoreRating(item);
      if (rating) return rating;
    }
    return null;
  }

  const types = (Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]])
    .map((type) => String(type || "").toLowerCase());
  const aggregate = value.aggregateRating;
  if (types.some((type) => acceptedTypes.has(type)) && aggregate && typeof aggregate === "object") {
    const rawValue = numberValue(aggregate.ratingValue);
    const bestRating = numberValue(aggregate.bestRating) || 5;
    const ratingCount = Math.floor(numberValue(aggregate.ratingCount) || numberValue(aggregate.reviewCount));
    if (rawValue > 0 && bestRating > 0 && ratingCount > 0) {
      return {
        ratingValue: Math.round(Math.min(5, Math.max(1, (rawValue / bestRating) * 5)) * 10) / 10,
        ratingCount,
      };
    }
  }

  for (const key of ["@graph", "mainEntity", "itemListElement", "publisher", "provider", "about"]) {
    const rating = findStoreRating(value[key]);
    if (rating) return rating;
  }
  return null;
}

function extractRating(html) {
  for (const match of String(html || "").matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const rating = findStoreRating(JSON.parse(decodeHtml(match[1]).trim()));
      if (rating) return rating;
    } catch {}
  }
  return null;
}

function findYotpoAppKeys(html) {
  const keys = [];
  const add = (value) => {
    const key = String(value || "").trim();
    if (/^[a-z0-9_-]{10,100}$/i.test(key) && !keys.includes(key)) keys.push(key);
  };
  const patterns = [
    /staticw\d*\.yotpo\.com\/([a-z0-9_-]{10,100})\/widget\.js/gi,
    /data-appkey\s*=\s*["']([a-z0-9_-]{10,100})["']/gi,
    /["'](?:app_key|appKey|yotpo_app_key)["']\s*[:=]\s*["']([a-z0-9_-]{10,100})["']/gi,
  ];
  patterns.forEach((pattern) => {
    for (const match of String(html || "").matchAll(pattern)) add(match[1]);
  });
  return keys.slice(0, 3);
}

function detectReviewProviders(html) {
  const source = String(html || "").toLowerCase();
  const providers = [
    ["yotpo", /yotpo/],
    ["judge.me", /judge\.me|\bjdgm[-_.]/],
    ["reviews.io", /reviews\.io|reviews\.co\.uk/],
    ["stamped", /stamped\.io|stamped-main-badge/],
    ["okendo", /okendo\.io|oke-reviews|okereviews/],
    ["loox", /loox\.io|loox-rating|looxreviews/],
    ["bazaarvoice", /bazaarvoice|\bbvapi\b/],
    ["powerreviews", /powerreviews/],
    ["shopper-approved", /shopperapproved|shopper-approved/],
  ];
  return providers.filter(([, pattern]) => pattern.test(source)).map(([name]) => name);
}

function findJudgeMeCredentials(html) {
  const source = String(html || "");
  const firstMatch = (patterns) => {
    for (const pattern of patterns) {
      const value = source.match(pattern)?.[1];
      if (value) return decodeHtml(value).trim();
    }
    return "";
  };
  const shopDomain = firstMatch([
    /(?:window\.)?jdgmShopDomain\s*=\s*["']([^"']+)["']/i,
    /["'](?:shop_domain|shopDomain|jdgm_shop_domain)["']\s*[:=]\s*["']([^"']+)["']/i,
    /[?&]shop_domain=([^&"']+)/i,
  ]).toLowerCase();
  const publicToken = firstMatch([
    /(?:window\.)?jdgmPublicToken\s*=\s*["']([a-z0-9_-]{10,200})["']/i,
    /["'](?:public_token|publicToken|jdgm_public_token)["']\s*[:=]\s*["']([a-z0-9_-]{10,200})["']/i,
    /[?&]public_token=([a-z0-9_-]{10,200})/i,
  ]);
  const platform = firstMatch([
    /(?:window\.)?jdgmPlatform\s*=\s*["']([a-z0-9_-]+)["']/i,
    /["'](?:shop_platform|platform)["']\s*[:=]\s*["'](shopify|woocommerce|bigcommerce)["']/i,
  ]).toLowerCase() || "shopify";
  if (!/^[a-z0-9.-]+$/i.test(shopDomain) || !/^[a-z0-9_-]{10,200}$/i.test(publicToken)) return null;
  return { shopDomain, publicToken, platform: /^(shopify|woocommerce|bigcommerce)$/.test(platform) ? platform : "shopify" };
}

function findJudgeMeSummary(value) {
  if (!value || typeof value !== "object") return null;
  const containers = [value, value.data, value.widgets].filter((item) => item && typeof item === "object");
  for (const item of containers) {
    const ratingValue = numberValue(item.all_reviews_rating ?? item.allReviewsRating);
    const ratingCount = Math.floor(numberValue(item.all_reviews_count ?? item.allReviewsCount));
    if (ratingValue > 0 && ratingValue <= 5 && ratingCount > 0) return { ratingValue: Math.round(ratingValue * 10) / 10, ratingCount };
  }
  const serialized = JSON.stringify(value);
  const ratingValue = numberValue(serialized.match(/(?:all[_-]reviews[_-]rating|average[_-]rating)[^0-9]{0,30}(\d(?:\.\d+)?)/i)?.[1]);
  const ratingCount = Math.floor(numberValue(serialized.match(/(?:all[_-]reviews[_-]count|review[_-]count)[^0-9]{0,30}(\d[\d,]*)/i)?.[1]));
  return ratingValue > 0 && ratingValue <= 5 && ratingCount > 0 ? { ratingValue: Math.round(ratingValue * 10) / 10, ratingCount } : null;
}

async function fetchJudgeMeShopRating(html, signal) {
  const credentials = findJudgeMeCredentials(html);
  if (!credentials) return null;
  const endpoint = new URL(`https://cache.judge.me/widgets/${encodeURIComponent(credentials.platform)}/${encodeURIComponent(credentials.shopDomain)}`);
  endpoint.searchParams.set("public_token", credentials.publicToken);
  endpoint.searchParams.set("all_reviews_rating", "1");
  endpoint.searchParams.set("all_reviews_count", "1");
  const response = await fetch(endpoint, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) return null;
  return findJudgeMeSummary(await response.json());
}

async function fetchGooglePlacesRating(store, merchantUrl, signal) {
  if (!googlePlacesApiKey || googlePlacesDisabledReason) return null;
  const expectedHost = normalizedHost(merchantUrl || store.sourceUrl);
  if (!expectedHost) return null;
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": googlePlacesApiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.websiteUri,places.rating,places.userRatingCount,places.googleMapsUri",
    },
    body: JSON.stringify({ textQuery: `${store.name} ${expectedHost}`, languageCode: "en", maxResultCount: 5 }),
  });
  if (!response.ok) {
    googlePlacesDisabledReason = `HTTP ${response.status}`;
    console.warn(`Google Places disabled for this run: ${googlePlacesDisabledReason}`);
    return null;
  }
  const payload = await response.json();
  const matches = (Array.isArray(payload?.places) ? payload.places : [])
    .filter((place) => normalizedHost(place.websiteUri) === expectedHost && numberValue(place.rating) > 0 && numberValue(place.userRatingCount) > 0)
    .sort((a, b) => numberValue(b.userRatingCount) - numberValue(a.userRatingCount));
  const place = matches[0];
  if (!place) return null;
  return {
    ratingValue: Math.round(Math.min(5, numberValue(place.rating)) * 10) / 10,
    ratingCount: Math.floor(numberValue(place.userRatingCount)),
    sourceUrl: String(place.googleMapsUri || ""),
  };
}

async function fetchYotpoSiteRating(html, signal) {
  for (const appKey of findYotpoAppKeys(html)) {
    try {
      const endpoint = `https://api-cdn.yotpo.com/v1/widget/${encodeURIComponent(appKey)}/products/yotpo_site_reviews/reviews.json?per_page=1&page=1`;
      const response = await fetch(endpoint, { signal, headers: { Accept: "application/json" } });
      if (!response.ok) continue;
      const payload = await response.json();
      const bottomline = payload?.response?.bottomline || {};
      const ratingValue = numberValue(bottomline.average_score);
      const ratingCount = Math.floor(numberValue(bottomline.total_review) || numberValue(bottomline.total_reviews));
      if (ratingValue > 0 && ratingValue <= 5 && ratingCount > 0) {
        return { ratingValue: Math.round(ratingValue * 10) / 10, ratingCount };
      }
    } catch (error) {
      if (error.name === "AbortError") throw error;
    }
  }
  return null;
}

async function fetchStoreRating(store) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);
  try {
    const source = new URL(store.sourceUrl);
    const urls = [...new Set([source.href, source.origin + "/"] )];
    let lastError = null;
    for (const requestUrl of urls) {
      try {
        const response = await fetch(requestUrl, {
          redirect: "follow",
          signal: controller.signal,
          headers: {
            Accept: "text/html,application/xhtml+xml",
            "User-Agent": "Mozilla/5.0 (compatible; AloCouponRatingBot/1.0; +https://alocoupon.com)",
          },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const contentType = String(response.headers.get("content-type") || "").toLowerCase();
        if (!contentType.includes("html")) throw new Error("response is not HTML");
        const html = await response.text();
        const structuredRating = extractRating(html);
        const providers = detectReviewProviders(html);
        const judgeMeCredentialsFound = Boolean(findJudgeMeCredentials(html));
        if (structuredRating) return { rating: structuredRating, source: "store-jsonld", providers, judgeMeCredentialsFound, finalUrl: response.url || requestUrl };
        const yotpoRating = await fetchYotpoSiteRating(html, controller.signal);
        if (yotpoRating) return { rating: yotpoRating, source: "yotpo-site-reviews", providers, judgeMeCredentialsFound, finalUrl: response.url || requestUrl };
        const judgeMeRating = await fetchJudgeMeShopRating(html, controller.signal);
        if (judgeMeRating) return { rating: judgeMeRating, source: "judgeme-shop-reviews", providers, judgeMeCredentialsFound, finalUrl: response.url || requestUrl };
        const googleRating = await fetchGooglePlacesRating(store, response.url || requestUrl, controller.signal);
        return { rating: googleRating, source: googleRating ? "google-places" : "", providers, judgeMeCredentialsFound, finalUrl: googleRating?.sourceUrl || response.url || requestUrl };
      } catch (error) {
        lastError = error;
      }
    }
    const googleRating = await fetchGooglePlacesRating(store, store.sourceUrl, controller.signal);
    if (googleRating) return { rating: googleRating, source: "google-places", providers: [], judgeMeCredentialsFound: false, finalUrl: googleRating.sourceUrl };
    throw lastError || new Error("website could not be loaded");
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const stores = JSON.parse(fs.readFileSync(storesFile, "utf8").replace(/^\uFEFF/, ""));
  const candidates = stores.filter((store) => store && !store.deleted && store.sourceUrl);
  const found = [];
  const providerStores = new Map();
  const judgeMeCredentialStores = [];
  let cursor = 0;

  async function worker() {
    while (cursor < candidates.length) {
      const index = cursor++;
      const store = candidates[index];
      try {
        const result = await fetchStoreRating(store);
        (result.providers || []).forEach((provider) => {
          const names = providerStores.get(provider) || [];
          names.push(store.name);
          providerStores.set(provider, names);
        });
        if (result.judgeMeCredentialsFound) judgeMeCredentialStores.push(store.name);
        if (result.rating) {
          store.ratingValue = result.rating.ratingValue;
          store.ratingCount = result.rating.ratingCount;
          store.ratingSource = result.source;
          store.ratingSourceUrl = result.finalUrl;
          store.ratingUpdatedAt = new Date().toISOString();
          found.push(store);
          console.log(`[${index + 1}/${candidates.length}] ${store.name}: ${store.ratingValue}/5 from ${store.ratingCount} votes`);
        } else {
          if (["store-jsonld", "yotpo-site-reviews", "judgeme-shop-reviews", "google-places"].includes(store.ratingSource)) {
            store.ratingValue = 0;
            store.ratingCount = 0;
            store.ratingSource = "";
            store.ratingSourceUrl = "";
            store.ratingUpdatedAt = "";
          }
          console.log(`[${index + 1}/${candidates.length}] ${store.name}: no verified Store rating`);
        }
      } catch (error) {
        console.warn(`[${index + 1}/${candidates.length}] ${store.name}: ${error.name === "AbortError" ? "timeout" : error.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(4, candidates.length) }, worker));
  fs.writeFileSync(storesFile, `${JSON.stringify(stores, null, 2)}\n`);
  found.sort((a, b) => b.ratingCount - a.ratingCount || b.ratingValue - a.ratingValue);
  console.log(`Synced ${candidates.length} stores; ${found.length} publish a valid Store AggregateRating.`);
  [...providerStores.entries()].sort((a, b) => b[1].length - a[1].length).forEach(([provider, names]) => {
    console.log(`PROVIDER ${provider}: ${names.length} store(s) - ${names.join(", ")}`);
  });
  console.log(`JUDGEME_PUBLIC_CREDENTIALS=${judgeMeCredentialStores.length}`);
  console.log(`GOOGLE_PLACES=${googlePlacesApiKey ? (googlePlacesDisabledReason ? `disabled-${googlePlacesDisabledReason.replace(/\s+/g, "-")}` : "enabled") : "disabled-no-key"}`);
  if (found[0]) console.log(`PREVIEW_STORE=${found[0].slug}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
