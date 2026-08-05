const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const offersFile = path.join(rootDir, "data", "offers.json");
const outputFile = path.join(rootDir, "data", "trustpilot-reviews.json");

function loadEnvFile() {
  const envFile = path.join(rootDir, ".env");
  if (!fs.existsSync(envFile)) return;
  fs.readFileSync(envFile, "utf8").split(/\r?\n/).forEach((line) => {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  });
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

function truncate(value, maxLength) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1).trim()}…`;
}

async function trustpilotRequest(pathname, apiKey) {
  const response = await fetch(`https://api.trustpilot.com${pathname}`, {
    headers: { apikey: apiKey, Accept: "application/json" },
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Trustpilot HTTP ${response.status}`);
  return response.json();
}

async function syncBusiness(domain, apiKey) {
  const unit = await trustpilotRequest(`/v1/business-units/find?name=${encodeURIComponent(domain)}`, apiKey);
  if (!unit?.id) return null;
  const payload = await trustpilotRequest(`/v1/business-units/${encodeURIComponent(unit.id)}/reviews?perPage=3&orderBy=createdat.desc`, apiKey);
  const reviews = Array.isArray(payload?.reviews) ? payload.reviews : [];
  return {
    domain,
    businessUnitId: unit.id,
    displayName: unit.displayName || domain,
    trustScore: Number(unit.score?.trustScore || unit.score?.stars || 0),
    reviewCount: Number(unit.numberOfReviews?.total || 0),
    profileUrl: `https://www.trustpilot.com/review/${encodeURIComponent(domain)}`,
    updatedAt: new Date().toISOString(),
    reviews: reviews.map((review) => ({
      id: String(review.id || ""),
      stars: Number(review.stars || 0),
      title: truncate(review.title, 100),
      text: truncate(review.text, 240),
      consumer: truncate(review.consumer?.displayName || "Trustpilot reviewer", 80),
      createdAt: review.createdAt || "",
      verified: Boolean(review.isVerified || review.reviewVerificationLevel === "verified"),
      sourceUrl: review.id
        ? `https://www.trustpilot.com/reviews/${encodeURIComponent(review.id)}`
        : `https://www.trustpilot.com/review/${encodeURIComponent(domain)}`,
    })),
  };
}

async function main() {
  loadEnvFile();
  const apiKey = String(process.env.TRUSTPILOT_API_KEY || "").trim();
  if (!apiKey) throw new Error("TRUSTPILOT_API_KEY is required. Add it to .env or the process environment.");
  const offers = JSON.parse(fs.readFileSync(offersFile, "utf8").replace(/^\uFEFF/, ""));
  const domains = [...new Set(offers.map(getOfferHost).filter(Boolean))].sort();
  const results = [];
  let cursor = 0;

  async function worker() {
    while (cursor < domains.length) {
      const index = cursor++;
      const domain = domains[index];
      try {
        const item = await syncBusiness(domain, apiKey);
        if (item) results.push(item);
        console.log(`[${index + 1}/${domains.length}] ${domain}: ${item ? `${item.reviewCount} reviews` : "profile not found"}`);
      } catch (error) {
        console.warn(`[${index + 1}/${domains.length}] ${domain}: ${error.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(2, domains.length) }, worker));
  results.sort((a, b) => b.reviewCount - a.reviewCount || a.displayName.localeCompare(b.displayName));
  fs.writeFileSync(outputFile, `${JSON.stringify(results, null, 2)}\n`);
  console.log(`Saved ${results.length}/${domains.length} Trustpilot business profiles.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
