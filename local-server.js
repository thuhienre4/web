const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const dns = require("dns").promises;
const net = require("net");
const { exec } = require("child_process");

const root = __dirname;
const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const storesFileName = 'stores.json';
const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123456";
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(root, "data");
const storesFile = path.join(dataDir, storesFileName);
const offersFile = path.join(dataDir, "offers.json");
const projectsFile = path.join(dataDir, "projects.json");
const trustpilotReviewsFile = path.join(dataDir, "trustpilot-reviews.json");
const projectUploadsDir = path.join(dataDir, "project-uploads");
const offerAssetsDir = path.join(dataDir, "offer-assets");
const siteSettingsFile = path.join(dataDir, "site-settings.json");
const adminUsersFile = path.join(dataDir, "admin-users.json");
const adminCategoriesFile = path.join(dataDir, "admin-categories.json");
const subscribersFile = path.join(dataDir, "subscribers.json");
const rootSeedOffersFile = path.join(root, "seed-offers.json");
const seedOffersFile = path.join(root, "data", "seed-offers.json");
const bundledOffersFile = path.join(root, "data", "offers.json");
const adminEmailsFile = path.join(dataDir, "admin-emails.json");
const sessions = new Map();
const isProduction = process.env.NODE_ENV === "production";
const siteUrl = String(process.env.SITE_URL || "https://alocoupon.com").replace(/\/+$/, "");
const resendApiKey = String(process.env.RESEND_API_KEY || "").trim();
const resendFromEmail = String(process.env.RESEND_FROM_EMAIL || "").trim();
const newsletterSecret = String(process.env.NEWSLETTER_SECRET || adminPassword);
const newsletterRateLimits = new Map();

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
};

function readJsonArrayFile(filePath, fallback = []) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, ""));
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

const embeddedStarterOffers = [
    {
        "id":  "offer_f155cf5e4f8c",
        "brand":  "planetbeauty.com",
        "title":  "Planet Beauty Coupon Code TINA20 - 20% OFF",
        "type":  "code",
        "code":  "TINA20",
        "discount":  "20% OFF",
        "link":  "https://www.planetbeauty.com/?rfsn=9153456.f34e43",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at Planet Beauty",
        "createdAt":  "2026-07-08T03:28:21.4234478Z"
    },
    {
        "id":  "offer_c6580512c7f3",
        "brand":  "planetbeauty.com",
        "title":  "Planet Beauty Coupon Code WEB20 - 20% OFF",
        "type":  "code",
        "code":  "WEB20",
        "discount":  "20% OFF",
        "link":  "https://www.planetbeauty.com/?rfsn=9153456.f34e44",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at Planet Beauty",
        "createdAt":  "2026-07-08T03:28:20.4234478Z"
    },
    {
        "id":  "offer_8ec84793e92e",
        "brand":  "planetbeauty.com",
        "title":  "Planet Beauty Coupon Code PBGO20 - 20% OFF",
        "type":  "code",
        "code":  "PBGO20",
        "discount":  "20% OFF",
        "link":  "https://www.planetbeauty.com/?rfsn=9153456.f34e45",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at Planet Beauty",
        "createdAt":  "2026-07-08T03:28:19.4234478Z"
    },
    {
        "id":  "offer_ee2cdacdee8c",
        "brand":  "planetbeauty.com",
        "title":  "Planet Beauty Coupon Code WEB15 - 15% OFF",
        "type":  "code",
        "code":  "WEB15",
        "discount":  "15% OFF",
        "link":  "https://www.planetbeauty.com/?rfsn=9153456.f34e46",
        "category":  "Other",
        "expiry":  "",
        "review":  "15% Off Storewide at Planet Beauty",
        "createdAt":  "2026-07-08T03:28:18.4234478Z"
    },
    {
        "id":  "offer_31a00826d3ef",
        "brand":  "planetbeauty.com",
        "title":  "Planet Beauty Coupon Code PBGO10 - 10% OFF",
        "type":  "code",
        "code":  "PBGO10",
        "discount":  "10% OFF",
        "link":  "https://www.planetbeauty.com/?rfsn=9153456.f34e47",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Planet Beauty",
        "createdAt":  "2026-07-08T03:28:17.4234478Z"
    },
    {
        "id":  "offer_ecf86a757de2",
        "brand":  "planetbeauty.com",
        "title":  "Planet Beauty Deal - Free shipping",
        "type":  "deal",
        "code":  "",
        "discount":  "Free shipping",
        "link":  "https://www.planetbeauty.com/?rfsn=9153456.f34e48",
        "category":  "Other",
        "expiry":  "",
        "review":  "Planet Beauty offers free standard shipping on most orders, which is automatically applied during checkout.",
        "createdAt":  "2026-07-08T03:28:16.4234478Z"
    },
    {
        "id":  "offer_3485df06cb5d",
        "brand":  "distritomax.com",
        "title":  "Distrito Max Coupon Code TEQUEREMOSMUCHO - 20% OFF",
        "type":  "code",
        "code":  "TEQUEREMOSMUCHO",
        "discount":  "20% OFF",
        "link":  "https://distritomax.com/?rfsn=9153509.6d6bb5\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153509.6d6bb5",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide",
        "createdAt":  "2026-07-08T03:28:15.4234478Z"
    },
    {
        "id":  "offer_044ec8e55c14",
        "brand":  "distritomax.com",
        "title":  "Distrito Max Coupon Code SIO5DM - 5% OFF",
        "type":  "code",
        "code":  "SIO5DM",
        "discount":  "5% OFF",
        "link":  "https://distritomax.com/?rfsn=9153509.6d6bb5\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153509.6d6bb6",
        "category":  "Other",
        "expiry":  "",
        "review":  "5% Off Storewide",
        "createdAt":  "2026-07-08T03:28:14.4234478Z"
    },
    {
        "id":  "offer_d0d6adf616d2",
        "brand":  "distritomax.com",
        "title":  "Distrito Max Coupon Code PREVENTAGOD - 20% OFF",
        "type":  "code",
        "code":  "PREVENTAGOD",
        "discount":  "20% OFF",
        "link":  "https://distritomax.com/?rfsn=9153509.6d6bb5\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153509.6d6bb7",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Rokimoto",
        "createdAt":  "2026-07-08T03:28:13.4234478Z"
    },
    {
        "id":  "offer_55ee2fc5175b",
        "brand":  "distritomax.com",
        "title":  "Distrito Max Coupon Code KUESKINUEVO - 15% OFF",
        "type":  "code",
        "code":  "KUESKINUEVO",
        "discount":  "15% OFF",
        "link":  "https://distritomax.com/?rfsn=9153509.6d6bb5\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153509.6d6bb8",
        "category":  "Other",
        "expiry":  "",
        "review":  "15% Off (Storewide) (Minimum Order: $300) at Distrito Max",
        "createdAt":  "2026-07-08T03:28:12.4234478Z"
    },
    {
        "id":  "offer_c635611c9dac",
        "brand":  "distritomax.com",
        "title":  "Distrito Max Coupon Code KUESKI10 - 10% OFF",
        "type":  "code",
        "code":  "KUESKI10",
        "discount":  "10% OFF",
        "link":  "https://distritomax.com/?rfsn=9153509.6d6bb5\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153509.6d6bb9",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide (Minimum Order: $3000) Kueski Payment Method at Distrito Max",
        "createdAt":  "2026-07-08T03:28:11.4234478Z"
    },
    {
        "id":  "offer_b34d2eae0bae",
        "brand":  "distritomax.com",
        "title":  "Distrito Max Deal - 81% OFF",
        "type":  "deal",
        "code":  "",
        "discount":  "81% OFF",
        "link":  "https://distritomax.com/?rfsn=9153509.6d6bb5\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153509.6d6bb10",
        "category":  "Other",
        "expiry":  "",
        "review":  "Save up to 81% Off on Distrito Max clearance items with deep discounts on select styles and discontinued products. Browse the clearance section for best available deals.",
        "createdAt":  "2026-07-08T03:28:10.4234478Z"
    },
    {
        "id":  "offer_2813ad790fc2",
        "brand":  "distritomax.com",
        "title":  "Distrito Max Deal - Free shipping",
        "type":  "deal",
        "code":  "",
        "discount":  "Free shipping",
        "link":  "https://distritomax.com/?rfsn=9153509.6d6bb5\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153509.6d6bb11",
        "category":  "Other",
        "expiry":  "",
        "review":  "Distrito Max offers free standard shipping on most orders, which is automatically applied during checkout.",
        "createdAt":  "2026-07-08T03:28:09.4234478Z"
    },
    {
        "id":  "offer_e5c2f3cfac82",
        "brand":  "distritomax.com",
        "title":  "Distrito Max Deal - 82% OFF",
        "type":  "deal",
        "code":  "",
        "discount":  "82% OFF",
        "link":  "https://distritomax.com/?rfsn=9153509.6d6bb5\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153509.6d6bb12",
        "category":  "Other",
        "expiry":  "",
        "review":  "Shop Super Liquidaciones on Sale and Save Up to 82% Off at Distrito Max",
        "createdAt":  "2026-07-08T03:28:08.4234478Z"
    },
    {
        "id":  "offer_9dbe399d8548",
        "brand":  "distritomax.com",
        "title":  "Distrito Max Deal - 84% OFF",
        "type":  "deal",
        "code":  "",
        "discount":  "84% OFF",
        "link":  "https://distritomax.com/?rfsn=9153509.6d6bb5\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153509.6d6bb13",
        "category":  "Other",
        "expiry":  "",
        "review":  "Shop Funko on Sale and Save Up to 84% Off at Distrito Max",
        "createdAt":  "2026-07-08T03:28:07.4234478Z"
    },
    {
        "id":  "offer_5a1b73110782",
        "brand":  "buythermopro.com",
        "title":  "ThermoPro Deal - Only $39.99",
        "type":  "deal",
        "code":  "",
        "discount":  "Only $39.99",
        "link":  "https://temppro.com/?rfsn=9153515.29f39d\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153515.29f39d",
        "category":  "Other",
        "expiry":  "",
        "review":  "Only $39.99 with TempPro TP620",
        "createdAt":  "2026-07-08T03:28:06.4234478Z"
    },
    {
        "id":  "offer_0b71494b6e99",
        "brand":  "buythermopro.com",
        "title":  "ThermoPro Deal - Only $22.99",
        "type":  "deal",
        "code":  "",
        "discount":  "Only $22.99",
        "link":  "https://temppro.com/?rfsn=9153515.29f39d\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153515.29f39d",
        "category":  "Other",
        "expiry":  "",
        "review":  "Only $22.99 with TempPro TP717",
        "createdAt":  "2026-07-08T03:28:05.4234478Z"
    },
    {
        "id":  "offer_50094770148b",
        "brand":  "buythermopro.com",
        "title":  "ThermoPro Deal - Only $99.99",
        "type":  "deal",
        "code":  "",
        "discount":  "Only $99.99",
        "link":  "https://temppro.com/?rfsn=9153515.29f39d\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153515.29f39d",
        "category":  "Other",
        "expiry":  "",
        "review":  "Only $99.99 with TempSpike Plus TP970 \u0026 TempPro APG710 2-Packs \u0026 TempPro AGT700",
        "createdAt":  "2026-07-08T03:28:04.4234478Z"
    },
    {
        "id":  "offer_36ccf80686de",
        "brand":  "mobilepixels.us",
        "title":  "Mobile Pixels Inc Coupon Code NEWMP - 10% OFF",
        "type":  "code",
        "code":  "NEWMP",
        "discount":  "10% OFF",
        "link":  "https://www.mobilepixels.us/?rfsn=9153575.d774c4c",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide (Minimum Order: $60) at Mobile Pixels",
        "createdAt":  "2026-07-08T03:28:03.4234478Z"
    },
    {
        "id":  "offer_bb0b69449789",
        "brand":  "mobilepixels.us",
        "title":  "Mobile Pixels Inc Coupon Code BACK10 - 10% OFF",
        "type":  "code",
        "code":  "BACK10",
        "discount":  "10% OFF",
        "link":  "https://www.mobilepixels.us/?rfsn=9153575.d774c4c",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Mobile Pixels",
        "createdAt":  "2026-07-08T03:28:02.4234478Z"
    },
    {
        "id":  "offer_884884597b6e",
        "brand":  "mobilepixels.us",
        "title":  "Mobile Pixels Inc Coupon Code MPBEANS5 - 5% OFF",
        "type":  "code",
        "code":  "MPBEANS5",
        "discount":  "5% OFF",
        "link":  "https://www.mobilepixels.us/?rfsn=9153575.d774c4c",
        "category":  "Other",
        "expiry":  "",
        "review":  "5% Off Storewide at Mobile Pixels",
        "createdAt":  "2026-07-08T03:28:01.4234478Z"
    },
    {
        "id":  "offer_544a8b19c669",
        "brand":  "mobilepixels.us",
        "title":  "Mobile Pixels Inc Coupon Code CABLEFREE - 10% OFF",
        "type":  "code",
        "code":  "CABLEFREE",
        "discount":  "10% OFF",
        "link":  "https://www.mobilepixels.us/?rfsn=9153575.d774c4c",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Select Items at Mobile Pixels",
        "createdAt":  "2026-07-08T03:28:00.4234478Z"
    },
    {
        "id":  "offer_70a57673e001",
        "brand":  "mobilepixels.us",
        "title":  "Mobile Pixels Inc Coupon Code MPSHARE - 10% OFF",
        "type":  "code",
        "code":  "MPSHARE",
        "discount":  "10% OFF",
        "link":  "https://www.mobilepixels.us/?rfsn=9153575.d774c4c",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Mobile Pixels",
        "createdAt":  "2026-07-08T03:27:59.4234478Z"
    },
    {
        "id":  "offer_e1494b1d05cf",
        "brand":  "mobilepixels.us",
        "title":  "Mobile Pixels Inc Deal - 56% OFF",
        "type":  "deal",
        "code":  "",
        "discount":  "56% OFF",
        "link":  "https://www.mobilepixels.us/?rfsn=9153575.d774c4c",
        "category":  "Other",
        "expiry":  "",
        "review":  "Save up to 56% Off on Mobile Pixels clearance items with deep discounts on select styles and discontinued products. Browse the clearance section for best available deals.",
        "createdAt":  "2026-07-08T03:27:58.4234478Z"
    },
    {
        "id":  "offer_9d8e990ae3ef",
        "brand":  "mobilepixels.us",
        "title":  "Mobile Pixels Inc Deal - Free shiping",
        "type":  "deal",
        "code":  "",
        "discount":  "Free shiping",
        "link":  "https://www.mobilepixels.us/?rfsn=9153575.d774c4c",
        "category":  "Other",
        "expiry":  "",
        "review":  "Mobile Pixels offers free standard shipping on most orders, which is automatically applied during checkout",
        "createdAt":  "2026-07-08T03:27:57.4234478Z"
    },
    {
        "id":  "offer_b25d8d1ba26e",
        "brand":  "mobilepixels.us",
        "title":  "Mobile Pixels Inc Deal - $20% off",
        "type":  "deal",
        "code":  "",
        "discount":  "$20% off",
        "link":  "https://www.mobilepixels.us/?rfsn=9153575.d774c4c",
        "category":  "Other",
        "expiry":  "",
        "review":  "Save up to $20 Off with Mobile Pixels loyalty program rewards including points on purchases, member-exclusive discounts, and special perks. Join the program to unlock savings.",
        "createdAt":  "2026-07-08T03:27:56.4234478Z"
    },
    {
        "id":  "offer_0e0b87c63133",
        "brand":  "mypaintbynumbers.com",
        "title":  "My Paint by Numbers Coupon Code REPLACEMENT10 - $10% off",
        "type":  "code",
        "code":  "REPLACEMENT10",
        "discount":  "$10% off",
        "link":  "https://www.mypaintbynumbers.com/?rfsn=9153576.f30ce9\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153576.f30ce9",
        "category":  "Other",
        "expiry":  "",
        "review":  "$10 Off Storewide (minimum Order $20) at My Paint by Numbers",
        "createdAt":  "2026-07-08T03:27:55.4234478Z"
    },
    {
        "id":  "offer_99e8adf0829c",
        "brand":  "mypaintbynumbers.com",
        "title":  "My Paint by Numbers Coupon Code PRELUV25 - 30% OFF",
        "type":  "code",
        "code":  "PRELUV25",
        "discount":  "30% OFF",
        "link":  "https://www.mypaintbynumbers.com/?rfsn=9153576.f30ce9\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153576.f30ce10",
        "category":  "Other",
        "expiry":  "",
        "review":  "30% Off Storewide at My Paint by Numbers",
        "createdAt":  "2026-07-08T03:27:54.4234478Z"
    },
    {
        "id":  "offer_7a67d9cb88e3",
        "brand":  "mypaintbynumbers.com",
        "title":  "My Paint by Numbers Coupon Code SUMMER2018 - 25% OFF",
        "type":  "code",
        "code":  "SUMMER2018",
        "discount":  "25% OFF",
        "link":  "https://www.mypaintbynumbers.com/?rfsn=9153576.f30ce9\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153576.f30ce11",
        "category":  "Other",
        "expiry":  "",
        "review":  "25% Off Storewide at My Paint by Numbers",
        "createdAt":  "2026-07-08T03:27:53.4234478Z"
    },
    {
        "id":  "offer_027283706d83",
        "brand":  "mypaintbynumbers.com",
        "title":  "My Paint by Numbers Coupon Code FAMILY25 - 25% OFF",
        "type":  "code",
        "code":  "FAMILY25",
        "discount":  "25% OFF",
        "link":  "https://www.mypaintbynumbers.com/?rfsn=9153576.f30ce9\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153576.f30ce12",
        "category":  "Other",
        "expiry":  "",
        "review":  "25% Off Storewide at My Paint by Numbers",
        "createdAt":  "2026-07-08T03:27:52.4234478Z"
    },
    {
        "id":  "offer_f071182214a1",
        "brand":  "mypaintbynumbers.com",
        "title":  "My Paint by Numbers Coupon Code PBN20 - 20% OFF",
        "type":  "code",
        "code":  "PBN20",
        "discount":  "20% OFF",
        "link":  "https://www.mypaintbynumbers.com/?rfsn=9153576.f30ce9\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153576.f30ce13",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at My Paint by Numbers",
        "createdAt":  "2026-07-08T03:27:51.4234478Z"
    },
    {
        "id":  "offer_72c5ad7cf360",
        "brand":  "mypaintbynumbers.com",
        "title":  "My Paint by Numbers Deal - 25% OFF",
        "type":  "deal",
        "code":  "",
        "discount":  "25% OFF",
        "link":  "https://www.mypaintbynumbers.com/?rfsn=9153576.f30ce9\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153576.f30ce14",
        "category":  "Other",
        "expiry":  "",
        "review":  "Save up to 25% Off with My Paint by Numbers loyalty program rewards including points on purchases, member-exclusive discounts, and special perks. Join the program to unlock savings.",
        "createdAt":  "2026-07-08T03:27:50.4234478Z"
    },
    {
        "id":  "offer_c460c3c4fb50",
        "brand":  "mypaintbynumbers.com",
        "title":  "My Paint by Numbers Deal - Free shiping",
        "type":  "deal",
        "code":  "",
        "discount":  "Free shiping",
        "link":  "https://www.mypaintbynumbers.com/?rfsn=9153576.f30ce9\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153576.f30ce15",
        "category":  "Other",
        "expiry":  "",
        "review":  "My Paint by Numbers offers free standard shipping on most orders, which is automatically applied during checkout.",
        "createdAt":  "2026-07-08T03:27:49.4234478Z"
    },
    {
        "id":  "offer_8d8ca62136d4",
        "brand":  "tomtoc.com",
        "title":  "tomtoc Coupon Code THISISE20 - 20% OFF",
        "type":  "code",
        "code":  "THISISE20",
        "discount":  "20% OFF",
        "link":  "https://www.tomtoc.com/?rfsn=9153663.f6c8e33\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153663.f6c8e33",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Select Items at Tomtoc",
        "createdAt":  "2026-07-08T03:27:48.4234478Z"
    },
    {
        "id":  "offer_2d635c439e5f",
        "brand":  "tomtoc.com",
        "title":  "tomtoc Coupon Code TOMTOCAARON20 - 20% OFF",
        "type":  "code",
        "code":  "TOMTOCAARON20",
        "discount":  "20% OFF",
        "link":  "https://www.tomtoc.com/?rfsn=9153663.f6c8e33\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153663.f6c8e34",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Aviator T37 Travel Crossbody at Tomtoc",
        "createdAt":  "2026-07-08T03:27:47.4234478Z"
    },
    {
        "id":  "offer_01aafd8eba4e",
        "brand":  "tomtoc.com",
        "title":  "tomtoc Coupon Code JON10 - 15% OFF",
        "type":  "code",
        "code":  "JON10",
        "discount":  "15% OFF",
        "link":  "https://www.tomtoc.com/?rfsn=9153663.f6c8e33\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153663.f6c8e35",
        "category":  "Other",
        "expiry":  "",
        "review":  "15% Off Select Items at Tomtoc",
        "createdAt":  "2026-07-08T03:27:46.4234478Z"
    },
    {
        "id":  "offer_7f3df76406ae",
        "brand":  "tomtoc.com",
        "title":  "tomtoc Coupon Code ALEXIS - 12% OFF",
        "type":  "code",
        "code":  "ALEXIS",
        "discount":  "12% OFF",
        "link":  "https://www.tomtoc.com/?rfsn=9153663.f6c8e33\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153663.f6c8e36",
        "category":  "Other",
        "expiry":  "",
        "review":  "12% Off Select Items at Tomtoc",
        "createdAt":  "2026-07-08T03:27:45.4234478Z"
    },
    {
        "id":  "offer_6b1c03606d60",
        "brand":  "tomtoc.com",
        "title":  "tomtoc Coupon Code MATT - 10% OFF",
        "type":  "code",
        "code":  "MATT",
        "discount":  "10% OFF",
        "link":  "https://www.tomtoc.com/?rfsn=9153663.f6c8e33\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153663.f6c8e37",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Select Items at Tomtoc",
        "createdAt":  "2026-07-08T03:27:44.4234478Z"
    },
    {
        "id":  "offer_e0c5cc71ac4a",
        "brand":  "tomtoc.com",
        "title":  "tomtoc Deal - 10% OFF",
        "type":  "deal",
        "code":  "",
        "discount":  "10% OFF",
        "link":  "https://www.tomtoc.com/?rfsn=9153663.f6c8e33\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153663.f6c8e38",
        "category":  "Other",
        "expiry":  "",
        "review":  "Tomtoc offers a 10% Off discount when you sign up for their newsletter. You\u0027ll receive email-only deals, early sale access, and special promotions directly to your inbox. This offer was last confirmed by our team on November 23, 2025.",
        "createdAt":  "2026-07-08T03:27:43.4234478Z"
    },
    {
        "id":  "offer_d4f21d3199ad",
        "brand":  "tomtoc.com",
        "title":  "tomtoc Deal - Free shiping",
        "type":  "deal",
        "code":  "",
        "discount":  "Free shiping",
        "link":  "https://www.tomtoc.com/?rfsn=9153663.f6c8e33\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153663.f6c8e39",
        "category":  "Other",
        "expiry":  "",
        "review":  "Tomtoc offers free standard shipping on most orders, which is automatically applied during checkout.",
        "createdAt":  "2026-07-08T03:27:42.4234478Z"
    },
    {
        "id":  "offer_08340fe4d5bb",
        "brand":  "lifecykel.com",
        "title":  "Lifecykel Coupon Code LEL9620 - 10% OFF",
        "type":  "code",
        "code":  "LEL9620",
        "discount":  "10% OFF",
        "link":  "https://www.lifecykel.com/?rfsn=9153690.f9129c\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153690.f9129c",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Life Cykel Asia",
        "createdAt":  "2026-07-08T03:27:41.4234478Z"
    },
    {
        "id":  "offer_2d551acb0aef",
        "brand":  "lifecykel.com",
        "title":  "Lifecykel Coupon Code PRELUV - 10% OFF",
        "type":  "code",
        "code":  "PRELUV",
        "discount":  "10% OFF",
        "link":  "https://www.lifecykel.com/?rfsn=9153690.f9129c\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153690.f9129c",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Life Cykel Asia",
        "createdAt":  "2026-07-08T03:27:40.4234478Z"
    },
    {
        "id":  "offer_355719c24dfc",
        "brand":  "lifecykel.com",
        "title":  "Lifecykel Coupon Code ALBE10 - 10% OFF",
        "type":  "code",
        "code":  "ALBE10",
        "discount":  "10% OFF",
        "link":  "https://www.lifecykel.com/?rfsn=9153690.f9129c\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153690.f9129c",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Life Cykel Asia",
        "createdAt":  "2026-07-08T03:27:39.4234478Z"
    },
    {
        "id":  "offer_3bfabe24e3d1",
        "brand":  "lifecykel.com",
        "title":  "Lifecykel Coupon Code HAERDIN10 - 10% OFF",
        "type":  "code",
        "code":  "HAERDIN10",
        "discount":  "10% OFF",
        "link":  "https://www.lifecykel.com/?rfsn=9153690.f9129c\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153690.f9129c",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Life Cykel Asia",
        "createdAt":  "2026-07-08T03:27:38.4234478Z"
    },
    {
        "id":  "offer_fde6ec8dbd56",
        "brand":  "lifecykel.com",
        "title":  "Lifecykel Coupon Code 1OTW - 10% OFF",
        "type":  "code",
        "code":  "1OTW",
        "discount":  "10% OFF",
        "link":  "https://www.lifecykel.com/?rfsn=9153690.f9129c\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153690.f9129c",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Life Cykel Asia",
        "createdAt":  "2026-07-08T03:27:37.4234478Z"
    },
    {
        "id":  "offer_cbd9858143b1",
        "brand":  "3rdrockessentials.com",
        "title":  "3rd Rock Essentials Coupon Code VIPROCK - 20% OFF",
        "type":  "code",
        "code":  "VIPROCK",
        "discount":  "20% OFF",
        "link":  "https://3rdrockessentials.com/discounts/COPER28?rfsn=9153716.e8137a\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153716.e8137a",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at 3rd Rock Essentials",
        "createdAt":  "2026-07-08T03:27:36.4234478Z"
    },
    {
        "id":  "offer_1d068763e410",
        "brand":  "3rdrockessentials.com",
        "title":  "3rd Rock Essentials Coupon Code 10UNIQUE - 20% OFF",
        "type":  "code",
        "code":  "10UNIQUE",
        "discount":  "20% OFF",
        "link":  "https://3rdrockessentials.com/discounts/COPER28?rfsn=9153716.e8137a\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153716.e8137a",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at 3rd Rock Essentials",
        "createdAt":  "2026-07-08T03:27:35.4234478Z"
    },
    {
        "id":  "offer_859ab8b2902d",
        "brand":  "3rdrockessentials.com",
        "title":  "3rd Rock Essentials Coupon Code DPF20 - 20% OFF",
        "type":  "code",
        "code":  "DPF20",
        "discount":  "20% OFF",
        "link":  "https://3rdrockessentials.com/discounts/COPER28?rfsn=9153716.e8137a\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153716.e8137a",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at 3rd Rock Essentials",
        "createdAt":  "2026-07-08T03:27:34.4234478Z"
    },
    {
        "id":  "offer_c54d286b7003",
        "brand":  "3rdrockessentials.com",
        "title":  "3rd Rock Essentials Coupon Code 10OFF - 20% OFF",
        "type":  "code",
        "code":  "10OFF",
        "discount":  "20% OFF",
        "link":  "https://3rdrockessentials.com/discounts/COPER28?rfsn=9153716.e8137a\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153716.e8137a",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at 3rd Rock Essentials",
        "createdAt":  "2026-07-08T03:27:33.4234478Z"
    },
    {
        "id":  "offer_aec46f324800",
        "brand":  "3rdrockessentials.com",
        "title":  "3rd Rock Essentials Coupon Code BUYNOW20 - 20% OFF",
        "type":  "code",
        "code":  "BUYNOW20",
        "discount":  "20% OFF",
        "link":  "https://3rdrockessentials.com/discounts/COPER28?rfsn=9153716.e8137a\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153716.e8137a",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at 3rd Rock Essentials",
        "createdAt":  "2026-07-08T03:27:32.4234478Z"
    },
    {
        "id":  "offer_4c05c9a1505a",
        "brand":  "3rdrockessentials.com",
        "title":  "3rd Rock Essentials Deal - 20% OFF",
        "type":  "deal",
        "code":  "",
        "discount":  "20% OFF",
        "link":  "https://3rdrockessentials.com/discounts/COPER28?rfsn=9153716.e8137a\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153716.e8137a",
        "category":  "Other",
        "expiry":  "",
        "review":  "Save up to 20% Off on 3rd Rock Essentials clearance items with deep discounts on select styles and discontinued products. Browse the clearance section for best available deals.",
        "createdAt":  "2026-07-08T03:27:31.4234478Z"
    },
    {
        "id":  "offer_5b7f70266c80",
        "brand":  "3rdrockessentials.com",
        "title":  "3rd Rock Essentials Deal - Free shiping",
        "type":  "deal",
        "code":  "",
        "discount":  "Free shiping",
        "link":  "https://3rdrockessentials.com/discounts/COPER28?rfsn=9153716.e8137a\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153716.e8137a",
        "category":  "Other",
        "expiry":  "",
        "review":  "3rd Rock Essentials offers free standard shipping on most orders, which is automatically applied during checkout.",
        "createdAt":  "2026-07-08T03:27:30.4234478Z"
    },
    {
        "id":  "offer_a02c03f20bc9",
        "brand":  "recycledfirefighter.myshopify.com",
        "title":  "Recycled Firefighter Coupon Code FIRST20OFF - 20% OFF",
        "type":  "code",
        "code":  "FIRST20OFF",
        "discount":  "20% OFF",
        "link":  "https://recycledfirefighter.myshopify.com/?rfsn=9153817.d32233\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153817.d32233",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at Recycled Firefighter",
        "createdAt":  "2026-07-08T03:27:29.4234478Z"
    },
    {
        "id":  "offer_e34b2ef4f33b",
        "brand":  "recycledfirefighter.myshopify.com",
        "title":  "Recycled Firefighter Coupon Code GEARUPJUNE - 20% OFF",
        "type":  "code",
        "code":  "GEARUPJUNE",
        "discount":  "20% OFF",
        "link":  "https://recycledfirefighter.myshopify.com/?rfsn=9153817.d32233\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153817.d32233",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at Recycled Firefighter",
        "createdAt":  "2026-07-08T03:27:28.4234478Z"
    },
    {
        "id":  "offer_777f74a5498c",
        "brand":  "recycledfirefighter.myshopify.com",
        "title":  "Recycled Firefighter Coupon Code WELCOME10 - 10% OFF",
        "type":  "code",
        "code":  "WELCOME10",
        "discount":  "10% OFF",
        "link":  "https://recycledfirefighter.myshopify.com/?rfsn=9153817.d32233\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153817.d32233",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Recycled Firefighter",
        "createdAt":  "2026-07-08T03:27:27.4234478Z"
    },
    {
        "id":  "offer_3d357db0106f",
        "brand":  "recycledfirefighter.myshopify.com",
        "title":  "Recycled Firefighter Coupon Code ITSBACK!10 - 10% OFF",
        "type":  "code",
        "code":  "ITSBACK!10",
        "discount":  "10% OFF",
        "link":  "https://recycledfirefighter.myshopify.com/?rfsn=9153817.d32233\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153817.d32233",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Recycled Firefighter",
        "createdAt":  "2026-07-08T03:27:26.4234478Z"
    },
    {
        "id":  "offer_42d8637b0819",
        "brand":  "recycledfirefighter.myshopify.com",
        "title":  "Recycled Firefighter Coupon Code 15OFF - $15% OFF",
        "type":  "code",
        "code":  "15OFF",
        "discount":  "$15% OFF",
        "link":  "https://recycledfirefighter.myshopify.com/?rfsn=9153817.d32233\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153817.d32233",
        "category":  "Other",
        "expiry":  "",
        "review":  "$15 Off Storewide at Recycled Firefighter",
        "createdAt":  "2026-07-08T03:27:25.4234478Z"
    },
    {
        "id":  "offer_bf274c5ffb70",
        "brand":  "happybears.ca",
        "title":  "Happy Bears Edibles Deal - Only $36.00",
        "type":  "deal",
        "code":  "",
        "discount":  "Only $36.00",
        "link":  "https://www.happybears.ca/?rfsn=9153820.3d9c46\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153820.3d9c46",
        "category":  "Other",
        "expiry":  "",
        "review":  "Only $36.00 With Apple Cider Vinegar CBD Capsules (30 Capsules)",
        "createdAt":  "2026-07-08T03:27:24.4234478Z"
    },
    {
        "id":  "offer_cd29edcca4ab",
        "brand":  "happybears.ca",
        "title":  "Happy Bears Edibles Deal - Only $99.99",
        "type":  "deal",
        "code":  "",
        "discount":  "Only $99.99",
        "link":  "https://www.happybears.ca/?rfsn=9153820.3d9c46\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153820.3d9c46",
        "category":  "Other",
        "expiry":  "",
        "review":  "Only $99.99 With CBD LIBIDO BOOSTER CAPSULES 300MG",
        "createdAt":  "2026-07-08T03:27:23.4234478Z"
    },
    {
        "id":  "offer_ee0688f467d1",
        "brand":  "free-spirit-shop.com",
        "title":  "Free Spirit Shop Coupon Code LABORDAY2025 - 25% OFF",
        "type":  "code",
        "code":  "LABORDAY2025",
        "discount":  "25% OFF",
        "link":  "https://www.free-spirit-shop.com/?rfsn=9153851.89e9ce1\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153851.89e9ce1",
        "category":  "Other",
        "expiry":  "",
        "review":  "25% Off Storewide at Free Spirit Shop",
        "createdAt":  "2026-07-08T03:27:22.4234478Z"
    },
    {
        "id":  "offer_2f7e5ce913d9",
        "brand":  "free-spirit-shop.com",
        "title":  "Free Spirit Shop Coupon Code DAD2026 - 20% OFF",
        "type":  "code",
        "code":  "DAD2026",
        "discount":  "20% OFF",
        "link":  "https://www.free-spirit-shop.com/?rfsn=9153851.89e9ce1\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153851.89e9ce2",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off (Storewide) (Minimum Order: $40) at Free Spirit Shop",
        "createdAt":  "2026-07-08T03:27:21.4234478Z"
    },
    {
        "id":  "offer_b49b92a9abaa",
        "brand":  "free-spirit-shop.com",
        "title":  "Free Spirit Shop Coupon Code EARLYBIRD20 - 20% OFF",
        "type":  "code",
        "code":  "EARLYBIRD20",
        "discount":  "20% OFF",
        "link":  "https://www.free-spirit-shop.com/?rfsn=9153851.89e9ce1\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153851.89e9ce3",
        "category":  "Other",
        "expiry":  "",
        "review":  "0% Off Storewide (minimum Order $70) at Free Spirit Shop",
        "createdAt":  "2026-07-08T03:27:20.4234478Z"
    },
    {
        "id":  "offer_134b29d85cef",
        "brand":  "free-spirit-shop.com",
        "title":  "Free Spirit Shop Coupon Code HOLIDAYNOW - 20% OFF",
        "type":  "code",
        "code":  "HOLIDAYNOW",
        "discount":  "20% OFF",
        "link":  "https://www.free-spirit-shop.com/?rfsn=9153851.89e9ce1\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153851.89e9ce4",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide (Minimum Order: $80) at Free Spirit Shop",
        "createdAt":  "2026-07-08T03:27:19.4234478Z"
    },
    {
        "id":  "offer_79638a4bc3e7",
        "brand":  "free-spirit-shop.com",
        "title":  "Free Spirit Shop Coupon Code NEWYEAR2026 - 20% OFF",
        "type":  "code",
        "code":  "NEWYEAR2026",
        "discount":  "20% OFF",
        "link":  "https://www.free-spirit-shop.com/?rfsn=9153851.89e9ce1\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153851.89e9ce5",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at Free Spirit Shop",
        "createdAt":  "2026-07-08T03:27:18.4234478Z"
    },
    {
        "id":  "offer_9db2d104febb",
        "brand":  "free-spirit-shop.com",
        "title":  "Free Spirit Shop Deal - Free shiping",
        "type":  "deal",
        "code":  "",
        "discount":  "Free shiping",
        "link":  "https://www.free-spirit-shop.com/?rfsn=9153851.89e9ce1\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153851.89e9ce6",
        "category":  "Other",
        "expiry":  "",
        "review":  "Free Spirit Shop offers free standard shipping on most orders, which is automatically applied during checkout.",
        "createdAt":  "2026-07-08T03:27:17.4234478Z"
    },
    {
        "id":  "offer_6bd77ab5b507",
        "brand":  "protechallergies.com",
        "title":  "Protech Allergies Deal - Only $297.50",
        "type":  "deal",
        "code":  "",
        "discount":  "Only $297.50",
        "link":  "https://protechallergies.com/?rfsn=9166521.5c10831",
        "category":  "Other",
        "expiry":  "",
        "review":  "Only $297.50 With P8000 Humidifier 4 in 1",
        "createdAt":  "2026-07-08T03:27:16.4234478Z"
    },
    {
        "id":  "offer_66bb3e7d8471",
        "brand":  "protechallergies.com",
        "title":  "Protech Allergies Deal - Only $340.00",
        "type":  "deal",
        "code":  "",
        "discount":  "Only $340.00",
        "link":  "https://protechallergies.com/?rfsn=9166521.5c10832",
        "category":  "Other",
        "expiry":  "",
        "review":  "Only $340.00 With ESSENCIA Dehumidifier - 100 pints/day - 5.5 L",
        "createdAt":  "2026-07-08T03:27:15.4234478Z"
    },
    {
        "id":  "offer_a245203990d9",
        "brand":  "proudpatriots.com",
        "title":  "Proud Patriots Coupon Code PEN10 - 25% OFF",
        "type":  "code",
        "code":  "PEN10",
        "discount":  "25% OFF",
        "link":  "https://proudpatriots.com/?rfsn=9166733.a66b03\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9166733.a66b03",
        "category":  "Other",
        "expiry":  "",
        "review":  "25% Off Storewide at Proud Patriots",
        "createdAt":  "2026-07-08T03:27:14.4234478Z"
    },
    {
        "id":  "offer_f5d9954ee18c",
        "brand":  "proudpatriots.com",
        "title":  "Proud Patriots Coupon Code PATRIOT20 - 20% OFF",
        "type":  "code",
        "code":  "PATRIOT20",
        "discount":  "20% OFF",
        "link":  "https://proudpatriots.com/?rfsn=9166733.a66b03\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9166733.a66b04",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at Proud Patriots",
        "createdAt":  "2026-07-08T03:27:13.4234478Z"
    },
    {
        "id":  "offer_e94069c9820f",
        "brand":  "proudpatriots.com",
        "title":  "Proud Patriots Coupon Code PATRIOT15 - 15% OFF",
        "type":  "code",
        "code":  "PATRIOT15",
        "discount":  "15% OFF",
        "link":  "https://proudpatriots.com/?rfsn=9166733.a66b03\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9166733.a66b05",
        "category":  "Other",
        "expiry":  "",
        "review":  "15% Off Storewide at Proud Patriots",
        "createdAt":  "2026-07-08T03:27:12.4234478Z"
    },
    {
        "id":  "offer_76ed1fdda264",
        "brand":  "proudpatriots.com",
        "title":  "Proud Patriots Coupon Code NEWPATRIOT15 - 15% OFF",
        "type":  "code",
        "code":  "NEWPATRIOT15",
        "discount":  "15% OFF",
        "link":  "https://proudpatriots.com/?rfsn=9166733.a66b03\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9166733.a66b06",
        "category":  "Other",
        "expiry":  "",
        "review":  "15% Off Storewide at Proud Patriots",
        "createdAt":  "2026-07-08T03:27:11.4234478Z"
    },
    {
        "id":  "offer_a550178563b5",
        "brand":  "proudpatriots.com",
        "title":  "Proud Patriots Coupon Code TAKE10 - 10% OFF",
        "type":  "code",
        "code":  "TAKE10",
        "discount":  "10% OFF",
        "link":  "https://proudpatriots.com/?rfsn=9166733.a66b03\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9166733.a66b07",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Proud Patriots",
        "createdAt":  "2026-07-08T03:27:10.4234478Z"
    },
    {
        "id":  "offer_681ae68a89b1",
        "brand":  "chewrevitabite.com",
        "title":  "RevitaBite Coupon Code WELCOME30 - 30% OFF",
        "type":  "code",
        "code":  "WELCOME30",
        "discount":  "30% OFF",
        "link":  "https://chewrevitabite.com/?rfsn=9166805.528131\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9166805.528131",
        "category":  "Other",
        "expiry":  "",
        "review":  "30% Off Storewide at RevitaBite",
        "createdAt":  "2026-07-08T03:27:09.4234478Z"
    },
    {
        "id":  "offer_c1bf3f745f94",
        "brand":  "chewrevitabite.com",
        "title":  "RevitaBite Coupon Code AYURELLE - 25% OFF",
        "type":  "code",
        "code":  "AYURELLE",
        "discount":  "25% OFF",
        "link":  "https://chewrevitabite.com/?rfsn=9166805.528131\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9166805.528132",
        "category":  "Other",
        "expiry":  "",
        "review":  "25% Off Storewide at RevitaBite",
        "createdAt":  "2026-07-08T03:27:08.4234478Z"
    },
    {
        "id":  "offer_b33537905d70",
        "brand":  "chewrevitabite.com",
        "title":  "RevitaBite Coupon Code WELCOME20 - 20% OFF",
        "type":  "code",
        "code":  "WELCOME20",
        "discount":  "20% OFF",
        "link":  "https://chewrevitabite.com/?rfsn=9166805.528131\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9166805.528133",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at RevitaBite",
        "createdAt":  "2026-07-08T03:27:07.4234478Z"
    },
    {
        "id":  "offer_0c7b02066c24",
        "brand":  "cloversgarden.com",
        "title":  "Clovers Garden Coupon Code CLOVERS10 - 22% OFF",
        "type":  "code",
        "code":  "CLOVERS10",
        "discount":  "22% OFF",
        "link":  "https://cloversgarden.com/?rfsn=9166935.064e7a7",
        "category":  "Other",
        "expiry":  "",
        "review":  "22% Off Storewide at Clovers Garden",
        "createdAt":  "2026-07-08T03:27:06.4234478Z"
    },
    {
        "id":  "offer_e81562e3ab07",
        "brand":  "cloversgarden.com",
        "title":  "Clovers Garden Coupon Code DISCOUNT10 - 10% OFF",
        "type":  "code",
        "code":  "DISCOUNT10",
        "discount":  "10% OFF",
        "link":  "https://cloversgarden.com/?rfsn=9166935.064e7a8",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Clovers Garden",
        "createdAt":  "2026-07-08T03:27:05.4234478Z"
    },
    {
        "id":  "offer_3022c8730643",
        "brand":  "cloversgarden.com",
        "title":  "Clovers Garden Coupon Code CARLOSCHIRINO1 - 10% OFF",
        "type":  "code",
        "code":  "CARLOSCHIRINO1",
        "discount":  "10% OFF",
        "link":  "https://cloversgarden.com/?rfsn=9166935.064e7a9",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Clovers Garden",
        "createdAt":  "2026-07-08T03:27:04.4234478Z"
    },
    {
        "id":  "offer_1124a24c339b",
        "brand":  "cloversgarden.com",
        "title":  "Clovers Garden Coupon Code GARDEN45 - 10% OFF",
        "type":  "code",
        "code":  "GARDEN45",
        "discount":  "10% OFF",
        "link":  "https://cloversgarden.com/?rfsn=9166935.064e7a10",
        "category":  "Other",
        "expiry":  "",
        "review":  "0% Off Storewide at Clovers Garden",
        "createdAt":  "2026-07-08T03:27:03.4234478Z"
    },
    {
        "id":  "offer_0a6c07aeb363",
        "brand":  "cloversgarden.com",
        "title":  "Clovers Garden Coupon Code HILOT96 - 10% OFF",
        "type":  "code",
        "code":  "HILOT96",
        "discount":  "10% OFF",
        "link":  "https://cloversgarden.com/?rfsn=9166935.064e7a11",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Clovers Garden",
        "createdAt":  "2026-07-08T03:27:02.4234478Z"
    },
    {
        "id":  "offer_41f25cfd157a",
        "brand":  "ussotan.com",
        "title":  "Lusso Tan Coupon Code PLANETSDEAL - 22% OFF",
        "type":  "code",
        "code":  "PLANETSDEAL",
        "discount":  "22% OFF",
        "link":  "https://lussotan.com/?rfsn=9167023.bbe69c\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9167023.bbe69c",
        "category":  "Other",
        "expiry":  "",
        "review":  "22% Off Storewide at Lusso Tan",
        "createdAt":  "2026-07-08T03:27:01.4234478Z"
    },
    {
        "id":  "offer_4cddd32b3346",
        "brand":  "ussotan.com",
        "title":  "Lusso Tan Coupon Code CHARISSEL - 20% OFF",
        "type":  "code",
        "code":  "CHARISSEL",
        "discount":  "20% OFF",
        "link":  "https://lussotan.com/?rfsn=9167023.bbe69c\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9167023.bbe69c",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at Lusso Tan",
        "createdAt":  "2026-07-08T03:27:00.4234478Z"
    },
    {
        "id":  "offer_f3e5d8760fca",
        "brand":  "ussotan.com",
        "title":  "Lusso Tan Coupon Code DANIEL - 20% OFF",
        "type":  "code",
        "code":  "DANIEL",
        "discount":  "20% OFF",
        "link":  "https://lussotan.com/?rfsn=9167023.bbe69c\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9167023.bbe69c",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at Lusso Tan",
        "createdAt":  "2026-07-08T03:26:59.4234478Z"
    },
    {
        "id":  "offer_25a2c1919472",
        "brand":  "ussotan.com",
        "title":  "Lusso Tan Coupon Code MANUEL - 20% OFF",
        "type":  "code",
        "code":  "MANUEL",
        "discount":  "20% OFF",
        "link":  "https://lussotan.com/?rfsn=9167023.bbe69c\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9167023.bbe69c",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at Lusso Tan",
        "createdAt":  "2026-07-08T03:26:58.4234478Z"
    },
    {
        "id":  "offer_df813d9b367f",
        "brand":  "ussotan.com",
        "title":  "Lusso Tan Coupon Code MARELYS-LT - 20% OFF",
        "type":  "code",
        "code":  "MARELYS-LT",
        "discount":  "20% OFF",
        "link":  "https://lussotan.com/?rfsn=9167023.bbe69c\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9167023.bbe69c",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at Lusso Tan",
        "createdAt":  "2026-07-08T03:26:57.4234478Z"
    },
    {
        "id":  "offer_9a938ab92866",
        "brand":  "ussotan.com",
        "title":  "Lusso Tan Deal - FREESHIPING",
        "type":  "deal",
        "code":  "",
        "discount":  "FREESHIPING",
        "link":  "https://lussotan.com/?rfsn=9167023.bbe69c\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9167023.bbe69c",
        "category":  "Other",
        "expiry":  "",
        "review":  "Lusso Tan offers free standard shipping on most orders, which is automatically applied during checkout.",
        "createdAt":  "2026-07-08T03:26:56.4234478Z"
    },
    {
        "id":  "offer_41a7071a3302",
        "brand":  "lumna.com",
        "title":  "LUMNA Deal - Only $99.00 USD",
        "type":  "deal",
        "code":  "",
        "discount":  "Only $99.00 USD",
        "link":  "https://lumna.com/?rfsn=9167070.4267c4",
        "category":  "Other",
        "expiry":  "",
        "review":  "Only $99.00 With Sweet Relief - Natural \u0026 Immediate Pain Relief",
        "createdAt":  "2026-07-08T03:26:55.4234478Z"
    },
    {
        "id":  "offer_19ef295e6059",
        "brand":  "lumna.com",
        "title":  "LUMNA Deal - Only $ 69.00 USD",
        "type":  "deal",
        "code":  "",
        "discount":  "Only $ 69.00 USD",
        "link":  "https://lumna.com/?rfsn=9167070.4267c5",
        "category":  "Other",
        "expiry":  "",
        "review":  "Only $ 69.00 USD With Calm \u0026 Uplifted - Ease Stress, Enjoy Sleep",
        "createdAt":  "2026-07-08T03:26:54.4234478Z"
    },
    {
        "id":  "offer_6de843a5aaaf",
        "brand":  "apolosign.com",
        "title":  "Apolosign Coupon Code WELCOME26 - $30% OFF",
        "type":  "code",
        "code":  "WELCOME26",
        "discount":  "$30% OFF",
        "link":  "https://www.apolosign.com/?rfsn=9167095.4e0f6c\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9167095.4e0f6c",
        "category":  "Other",
        "expiry":  "",
        "review":  "$30 Off Storewide at ApoloSign",
        "createdAt":  "2026-07-08T03:26:53.4234478Z"
    },
    {
        "id":  "offer_07f305492f93",
        "brand":  "apolosign.com",
        "title":  "Apolosign Coupon Code STOCKSPROM - $30% OFF",
        "type":  "code",
        "code":  "STOCKSPROM",
        "discount":  "$30% OFF",
        "link":  "https://www.apolosign.com/?rfsn=9167095.4e0f6c\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9167095.4e0f6c",
        "category":  "Other",
        "expiry":  "",
        "review":  "$30 Off Storewide at ApoloSign",
        "createdAt":  "2026-07-08T03:26:52.4234478Z"
    },
    {
        "id":  "offer_f742d209324c",
        "brand":  "apolosign.com",
        "title":  "Apolosign Coupon Code AFFAWIN - $30% OFF",
        "type":  "code",
        "code":  "AFFAWIN",
        "discount":  "$30% OFF",
        "link":  "https://www.apolosign.com/?rfsn=9167095.4e0f6c\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9167095.4e0f6c",
        "category":  "Other",
        "expiry":  "",
        "review":  "$30 Off Storewide (minimum Order $200) at ApoloSign",
        "createdAt":  "2026-07-08T03:26:51.4234478Z"
    },
    {
        "id":  "offer_4cd91d784746",
        "brand":  "apolosign.com",
        "title":  "Apolosign Coupon Code AFFIMP - $30% OFF",
        "type":  "code",
        "code":  "AFFIMP",
        "discount":  "$30% OFF",
        "link":  "https://www.apolosign.com/?rfsn=9167095.4e0f6c\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9167095.4e0f6c",
        "category":  "Other",
        "expiry":  "",
        "review":  "$30 Off Storewide (Minimum Order: $200) at ApoloSign",
        "createdAt":  "2026-07-08T03:26:50.4234478Z"
    },
    {
        "id":  "offer_84ca49ce8ad3",
        "brand":  "apolosign.com",
        "title":  "Apolosign Coupon Code ONLYGYORGI - 8% OFF",
        "type":  "code",
        "code":  "ONLYGYORGI",
        "discount":  "8% OFF",
        "link":  "https://www.apolosign.com/?rfsn=9167095.4e0f6c\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9167095.4e0f6c",
        "category":  "Other",
        "expiry":  "",
        "review":  "8% Off Storewide at ApoloSign",
        "createdAt":  "2026-07-08T03:26:49.4234478Z"
    },
    {
        "id":  "offer_af495d8ecbd0",
        "brand":  "yourtrainingbase.com",
        "title":  "YourTrainingBase \u0026 The URL dr Deal - Only $7.99",
        "type":  "deal",
        "code":  "",
        "discount":  "Only $7.99",
        "link":  "https://yourtrainingbase.com/?rfsn=9167098.98f270",
        "category":  "Other",
        "expiry":  "",
        "review":  "Only $7.99 With Advanced Problem-Solving: How to Reframe Problems",
        "createdAt":  "2026-07-08T03:26:48.4234478Z"
    },
    {
        "id":  "offer_94ef834b84d0",
        "brand":  "yourtrainingbase.com",
        "title":  "YourTrainingBase \u0026 The URL dr Deal - Only $ 5.99",
        "type":  "deal",
        "code":  "",
        "discount":  "Only $ 5.99",
        "link":  "https://yourtrainingbase.com/?rfsn=9167098.98f271",
        "category":  "Other",
        "expiry":  "",
        "review":  "Only $ 5.99 With Advanced Problem-Solving: Differences Between Divergent and Convergent Thinking",
        "createdAt":  "2026-07-08T03:26:47.4234478Z"
    },
    {
        "id":  "offer_0a58a877b4af",
        "brand":  "lisamaree.co",
        "title":  "Lisa Maree Coupon Code DFL - 10% OFF",
        "type":  "code",
        "code":  "DFL",
        "discount":  "10% OFF",
        "link":  "https://lisamaree.co/?rfsn=9168067.43f8f3c",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Lisa Maree",
        "createdAt":  "2026-07-08T03:26:46.4234478Z"
    },
    {
        "id":  "offer_a588e486c4db",
        "brand":  "lisamaree.co",
        "title":  "Lisa Maree Coupon Code LM10 - 10% OFF",
        "type":  "code",
        "code":  "LM10",
        "discount":  "10% OFF",
        "link":  "https://lisamaree.co/?rfsn=9168067.43f8f3c",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Lisa Maree",
        "createdAt":  "2026-07-08T03:26:45.4234478Z"
    },
    {
        "id":  "offer_1773e9c99335",
        "brand":  "lisamaree.co",
        "title":  "Lisa Maree Coupon Code SIMPLYCODES10 - 10% OFF",
        "type":  "code",
        "code":  "SIMPLYCODES10",
        "discount":  "10% OFF",
        "link":  "https://lisamaree.co/?rfsn=9168067.43f8f3c",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Lisa Maree",
        "createdAt":  "2026-07-08T03:26:44.4234478Z"
    },
    {
        "id":  "offer_f7d32d30af66",
        "brand":  "lisamaree.co",
        "title":  "Lisa Maree Coupon Code GIFT10 - 10% OFF",
        "type":  "code",
        "code":  "GIFT10",
        "discount":  "10% OFF",
        "link":  "https://lisamaree.co/?rfsn=9168067.43f8f3c",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Lisa Maree",
        "createdAt":  "2026-07-08T03:26:43.4234478Z"
    },
    {
        "id":  "offer_892628304cf1",
        "brand":  "lisamaree.co",
        "title":  "Lisa Maree Coupon Code ADBER - 10% OFF",
        "type":  "code",
        "code":  "ADBER",
        "discount":  "10% OFF",
        "link":  "https://lisamaree.co/?rfsn=9168067.43f8f3c",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Lisa Maree",
        "createdAt":  "2026-07-08T03:26:42.4234478Z"
    },
    {
        "id":  "offer_cd3957f6f745",
        "brand":  "naturalshilajit.com",
        "title":  "Healthy Nutrition Group Ltda Deal - Only $88",
        "type":  "deal",
        "code":  "",
        "discount":  "Only $88",
        "link":  "https://naturalshilajit.com/?rfsn=9168086.d8df4d0",
        "category":  "Other",
        "expiry":  "",
        "review":  "Only $88 With Dailly Boost",
        "createdAt":  "2026-07-08T03:26:41.4234478Z"
    },
    {
        "id":  "offer_6658579e2060",
        "brand":  "naturalshilajit.com",
        "title":  "Healthy Nutrition Group Ltda Deal - Only $49",
        "type":  "deal",
        "code":  "",
        "discount":  "Only $49",
        "link":  "https://naturalshilajit.com/?rfsn=9168086.d8df4d1",
        "category":  "Other",
        "expiry":  "",
        "review":  "Only $49 With One time purchase",
        "createdAt":  "2026-07-08T03:26:40.4234478Z"
    },
    {
        "id":  "offer_c472cdc0c11d",
        "brand":  "bpisports.com",
        "title":  "BPI Sports Coupon Code BPISAVE - 15% offf",
        "type":  "code",
        "code":  "BPISAVE",
        "discount":  "15% offf",
        "link":  "https://bpisports.com/?rfsn=9168122.1c31dd\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168122.1c31dd",
        "category":  "Other",
        "expiry":  "",
        "review":  "15% Off Storewide at BPI Sports",
        "createdAt":  "2026-07-08T03:26:39.4234478Z"
    },
    {
        "id":  "offer_a5682b0c6e36",
        "brand":  "bpisports.com",
        "title":  "BPI Sports Coupon Code NICE - 15% offf",
        "type":  "code",
        "code":  "NICE",
        "discount":  "15% offf",
        "link":  "https://bpisports.com/?rfsn=9168122.1c31dd\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168122.1c31dd",
        "category":  "Other",
        "expiry":  "",
        "review":  "15% Off Storewide at BPI Sports",
        "createdAt":  "2026-07-08T03:26:38.4234478Z"
    },
    {
        "id":  "offer_086923c2eff0",
        "brand":  "bpisports.com",
        "title":  "BPI Sports Coupon Code BONUS15 - 15% offf",
        "type":  "code",
        "code":  "BONUS15",
        "discount":  "15% offf",
        "link":  "https://bpisports.com/?rfsn=9168122.1c31dd\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168122.1c31dd",
        "category":  "Other",
        "expiry":  "",
        "review":  "15% Off Storewide at BPI Sports",
        "createdAt":  "2026-07-08T03:26:37.4234478Z"
    },
    {
        "id":  "offer_be5138c1501c",
        "brand":  "bpisports.com",
        "title":  "BPI Sports Coupon Code TPDEALS - 15% offf",
        "type":  "code",
        "code":  "TPDEALS",
        "discount":  "15% offf",
        "link":  "https://bpisports.com/?rfsn=9168122.1c31dd\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168122.1c31dd",
        "category":  "Other",
        "expiry":  "",
        "review":  "15% Off Storewide at BPI Sports",
        "createdAt":  "2026-07-08T03:26:36.4234478Z"
    },
    {
        "id":  "offer_81f56a23294f",
        "brand":  "bpisports.com",
        "title":  "BPI Sports Coupon Code MPB - 15% offf",
        "type":  "code",
        "code":  "MPB",
        "discount":  "15% offf",
        "link":  "https://bpisports.com/?rfsn=9168122.1c31dd\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168122.1c31dd",
        "category":  "Other",
        "expiry":  "",
        "review":  "15% Off Storewide at BPI Sports",
        "createdAt":  "2026-07-08T03:26:35.4234478Z"
    },
    {
        "id":  "offer_e06907eb65f4",
        "brand":  "bpisports.com",
        "title":  "BPI Sports Deal - 10% OFF",
        "type":  "deal",
        "code":  "",
        "discount":  "10% OFF",
        "link":  "https://bpisports.com/?rfsn=9168122.1c31dd\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168122.1c31dd",
        "category":  "Other",
        "expiry":  "",
        "review":  "BPI Sports offers a 10% Off discount when you sign up for their newsletter. You\u0027ll receive email-only deals, early sale access, and special promotions directly to your inbox. This offer was last confirmed by our team on December 2, 2025.",
        "createdAt":  "2026-07-08T03:26:34.4234478Z"
    },
    {
        "id":  "offer_f4bada7f0189",
        "brand":  "bpisports.com",
        "title":  "BPI Sports Deal - FREE SHIPING",
        "type":  "deal",
        "code":  "",
        "discount":  "FREE SHIPING",
        "link":  "https://bpisports.com/?rfsn=9168122.1c31dd\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168122.1c31dd",
        "category":  "Other",
        "expiry":  "",
        "review":  "BPI Sports offers free standard shipping on most orders, which is automatically applied during checkout.",
        "createdAt":  "2026-07-08T03:26:33.4234478Z"
    },
    {
        "id":  "offer_5be7cfddee25",
        "brand":  "the-electricianz.com",
        "title":  "The Electricianz Coupon Code TPDEALS - 30%OFF",
        "type":  "code",
        "code":  "TPDEALS",
        "discount":  "30%OFF",
        "link":  "https://www.the-electricianz.com/?rfsn=9168135.9e69ea",
        "category":  "Other",
        "expiry":  "",
        "review":  "30% Off Storewide at The Electricianz",
        "createdAt":  "2026-07-08T03:26:32.4234478Z"
    },
    {
        "id":  "offer_38086bf1d375",
        "brand":  "the-electricianz.com",
        "title":  "The Electricianz Coupon Code DENIDOLD - 30%OFF",
        "type":  "code",
        "code":  "DENIDOLD",
        "discount":  "30%OFF",
        "link":  "https://www.the-electricianz.com/?rfsn=9168135.9e69ea",
        "category":  "Other",
        "expiry":  "",
        "review":  "30% Off Storewide at The Electricianz",
        "createdAt":  "2026-07-08T03:26:31.4234478Z"
    },
    {
        "id":  "offer_1d7ca5f94111",
        "brand":  "the-electricianz.com",
        "title":  "The Electricianz Coupon Code WATCHIN - 30%OFF",
        "type":  "code",
        "code":  "WATCHIN",
        "discount":  "30%OFF",
        "link":  "https://www.the-electricianz.com/?rfsn=9168135.9e69ea",
        "category":  "Other",
        "expiry":  "",
        "review":  "30% Off Storewide at The Electricianz",
        "createdAt":  "2026-07-08T03:26:30.4234478Z"
    },
    {
        "id":  "offer_730332d10e96",
        "brand":  "the-electricianz.com",
        "title":  "The Electricianz Coupon Code GRASSPINK_COM - 30%OFF",
        "type":  "code",
        "code":  "GRASSPINK_COM",
        "discount":  "30%OFF",
        "link":  "https://www.the-electricianz.com/?rfsn=9168135.9e69ea",
        "category":  "Other",
        "expiry":  "",
        "review":  "30% Off Storewide at The Electricianz",
        "createdAt":  "2026-07-08T03:26:29.4234478Z"
    },
    {
        "id":  "offer_960218558fc0",
        "brand":  "the-electricianz.com",
        "title":  "The Electricianz Coupon Code CINETRAITS - 30%OFF",
        "type":  "code",
        "code":  "CINETRAITS",
        "discount":  "30%OFF",
        "link":  "https://www.the-electricianz.com/?rfsn=9168135.9e69ea",
        "category":  "Other",
        "expiry":  "",
        "review":  "30% Off Storewide at The Electricianz",
        "createdAt":  "2026-07-08T03:26:28.4234478Z"
    },
    {
        "id":  "offer_f3bf5f87cdb8",
        "brand":  "postpartumpantyparty.com",
        "title":  "Postpartum Panty Party Coupon Code 2025MAMA - 20% OFF",
        "type":  "code",
        "code":  "2025MAMA",
        "discount":  "20% OFF",
        "link":  "https://postpartumpantyparty.com/?rfsn=9180262.3df8f9",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at Postpartum Panty Party",
        "createdAt":  "2026-07-08T03:26:27.4234478Z"
    },
    {
        "id":  "offer_c5f1f03790e3",
        "brand":  "postpartumpantyparty.com",
        "title":  "Postpartum Panty Party Coupon Code VMMC7DK2 - 15% OFF",
        "type":  "code",
        "code":  "VMMC7DK2",
        "discount":  "15% OFF",
        "link":  "https://postpartumpantyparty.com/?rfsn=9180262.3df8f10",
        "category":  "Other",
        "expiry":  "",
        "review":  "15% Off Storewide at Postpartum Panty Party",
        "createdAt":  "2026-07-08T03:26:26.4234478Z"
    },
    {
        "id":  "offer_5f1a75fdff3e",
        "brand":  "postpartumpantyparty.com",
        "title":  "Postpartum Panty Party Coupon Code GNSHX4S7 - 15% OFF",
        "type":  "code",
        "code":  "GNSHX4S7",
        "discount":  "15% OFF",
        "link":  "https://postpartumpantyparty.com/?rfsn=9180262.3df8f11",
        "category":  "Other",
        "expiry":  "",
        "review":  "15% Off Storewide at Postpartum Panty Party",
        "createdAt":  "2026-07-08T03:26:25.4234478Z"
    },
    {
        "id":  "offer_8b9bfe7a55ad",
        "brand":  "postpartumpantyparty.com",
        "title":  "Postpartum Panty Party Coupon Code 2MW8LTL6 - 15% OFF",
        "type":  "code",
        "code":  "2MW8LTL6",
        "discount":  "15% OFF",
        "link":  "https://postpartumpantyparty.com/?rfsn=9180262.3df8f12",
        "category":  "Other",
        "expiry":  "",
        "review":  "15% Off Storewide at Postpartum Panty Party",
        "createdAt":  "2026-07-08T03:26:24.4234478Z"
    },
    {
        "id":  "offer_c9fe9acc56a8",
        "brand":  "postpartumpantyparty.com",
        "title":  "Postpartum Panty Party Coupon Code SIMPLYCODES10 - 10% OFF",
        "type":  "code",
        "code":  "SIMPLYCODES10",
        "discount":  "10% OFF",
        "link":  "https://postpartumpantyparty.com/?rfsn=9180262.3df8f13",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Postpartum Panty Party",
        "createdAt":  "2026-07-08T03:26:23.4234478Z"
    },
    {
        "id":  "offer_6da31b20f497",
        "brand":  "arterra-pet-sciences.myshopify.com",
        "title":  "Arterra Pet Coupon Code BIOHACK35 - 35% OFF",
        "type":  "code",
        "code":  "BIOHACK35",
        "discount":  "35% OFF",
        "link":  "https://arterra-pet-sciences.myshopify.com/?rfsn=9168194.bfb6db\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168194.bfb6db",
        "category":  "Other",
        "expiry":  "",
        "review":  "35% Off Storewide at Arterra Pet",
        "createdAt":  "2026-07-08T03:26:22.4234478Z"
    },
    {
        "id":  "offer_8929a8c13534",
        "brand":  "arterra-pet-sciences.myshopify.com",
        "title":  "Arterra Pet Coupon Code FREETOOTHPASTE - 10% OFF",
        "type":  "code",
        "code":  "FREETOOTHPASTE",
        "discount":  "10% OFF",
        "link":  "https://arterra-pet-sciences.myshopify.com/?rfsn=9168194.bfb6db\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168194.bfb6db",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Arterra Pet",
        "createdAt":  "2026-07-08T03:26:21.4234478Z"
    },
    {
        "id":  "offer_bd9a9c493fb0",
        "brand":  "arterra-pet-sciences.myshopify.com",
        "title":  "Arterra Pet Coupon Code DONTPAYFULL30 - 10% OFF",
        "type":  "code",
        "code":  "DONTPAYFULL30",
        "discount":  "10% OFF",
        "link":  "https://arterra-pet-sciences.myshopify.com/?rfsn=9168194.bfb6db\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168194.bfb6db",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Arterra Pet",
        "createdAt":  "2026-07-08T03:26:20.4234478Z"
    },
    {
        "id":  "offer_956348a24a0a",
        "brand":  "arterra-pet-sciences.myshopify.com",
        "title":  "Arterra Pet Coupon Code THANKYOU10 - 10% OFF",
        "type":  "code",
        "code":  "THANKYOU10",
        "discount":  "10% OFF",
        "link":  "https://arterra-pet-sciences.myshopify.com/?rfsn=9168194.bfb6db\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168194.bfb6db",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Arterra Pet",
        "createdAt":  "2026-07-08T03:26:19.4234478Z"
    },
    {
        "id":  "offer_712917652d65",
        "brand":  "arterra-pet-sciences.myshopify.com",
        "title":  "Arterra Pet Coupon Code ARTERRA30 - 30% OFF",
        "type":  "code",
        "code":  "ARTERRA30",
        "discount":  "30% OFF",
        "link":  "https://arterra-pet-sciences.myshopify.com/?rfsn=9168194.bfb6db\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168194.bfb6db",
        "category":  "Other",
        "expiry":  "",
        "review":  "30% Off First Months Subscription at Arterra Pet",
        "createdAt":  "2026-07-08T03:26:18.4234478Z"
    },
    {
        "id":  "offer_947689079aad",
        "brand":  "shellwatersystems.com",
        "title":  "SHELL WATER SYSTEMS Coupon Code IRISH - 22%OFF",
        "type":  "code",
        "code":  "IRISH",
        "discount":  "22%OFF",
        "link":  "https://shellwatersystems.com/?rfsn=9168253.74ee0e",
        "category":  "Other",
        "expiry":  "",
        "review":  "22% Off Select Items at Shell Water Systems",
        "createdAt":  "2026-07-08T03:26:17.4234478Z"
    },
    {
        "id":  "offer_64d2e20fabc7",
        "brand":  "shellwatersystems.com",
        "title":  "SHELL WATER SYSTEMS Coupon Code LOVE - 14% OFF",
        "type":  "code",
        "code":  "LOVE",
        "discount":  "14% OFF",
        "link":  "https://shellwatersystems.com/?rfsn=9168253.74ee0e",
        "category":  "Other",
        "expiry":  "",
        "review":  "14% Off Storewide at Shell Water Systems",
        "createdAt":  "2026-07-08T03:26:16.4234478Z"
    },
    {
        "id":  "offer_877aade65506",
        "brand":  "shellwatersystems.com",
        "title":  "SHELL WATER SYSTEMS Coupon Code NEWYEAR - 26% OFF",
        "type":  "code",
        "code":  "NEWYEAR",
        "discount":  "26% OFF",
        "link":  "https://shellwatersystems.com/?rfsn=9168253.74ee0e",
        "category":  "Other",
        "expiry":  "",
        "review":  "26% Off at Shell Water Systems",
        "createdAt":  "2026-07-08T03:26:15.4234478Z"
    },
    {
        "id":  "offer_b30c7c79b522",
        "brand":  "shellwatersystems.com",
        "title":  "SHELL WATER SYSTEMS Coupon Code WINTER - 20% OFF",
        "type":  "code",
        "code":  "WINTER",
        "discount":  "20% OFF",
        "link":  "https://shellwatersystems.com/?rfsn=9168253.74ee0e",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Reverse Osmosis Systems at Shell Water Systems",
        "createdAt":  "2026-07-08T03:26:14.4234478Z"
    },
    {
        "id":  "offer_e5ae19ef342d",
        "brand":  "shellwatersystems.com",
        "title":  "SHELL WATER SYSTEMS Coupon Code FRIDAY - 22% OFF",
        "type":  "code",
        "code":  "FRIDAY",
        "discount":  "22% OFF",
        "link":  "https://shellwatersystems.com/?rfsn=9168253.74ee0e",
        "category":  "Other",
        "expiry":  "",
        "review":  "22% Off Off Combo Systems at Shell Water Systems",
        "createdAt":  "2026-07-08T03:26:13.4234478Z"
    },
    {
        "id":  "offer_937a1b521e90",
        "brand":  "shellwatersystems.com",
        "title":  "SHELL WATER SYSTEMS Deal - 5% OFF",
        "type":  "deal",
        "code":  "",
        "discount":  "5% OFF",
        "link":  "https://shellwatersystems.com/?rfsn=9168253.74ee0e",
        "category":  "Other",
        "expiry":  "",
        "review":  "Shell Water Systems offers a 5% Off discount when you sign up for their newsletter. You\u0027ll receive email-only deals, early sale access, and special promotions directly to your inbox. This offer was last confirmed by our team on September 10, 2025.",
        "createdAt":  "2026-07-08T03:26:12.4234478Z"
    },
    {
        "id":  "offer_d67c5e26f7f2",
        "brand":  "tours.arigatojapan.co.jp",
        "title":  "Arigato Travel Deal - Only Y26.400",
        "type":  "deal",
        "code":  "",
        "discount":  "Only Y26.400",
        "link":  "https://tours.arigatojapan.co.jp/?rfsn=9168260.25f4c3",
        "category":  "Other",
        "expiry":  "",
        "review":  "Only Y26.400 With Best of Shibuya food tuor evening",
        "createdAt":  "2026-07-08T03:26:11.4234478Z"
    },
    {
        "id":  "offer_5ec240d07e66",
        "brand":  "tours.arigatojapan.co.jp",
        "title":  "Arigato Travel Deal - Only Y26.400",
        "type":  "deal",
        "code":  "",
        "discount":  "Only Y26.400",
        "link":  "https://tours.arigatojapan.co.jp/?rfsn=9168260.25f4c4",
        "category":  "Other",
        "expiry":  "",
        "review":  "Only Y26.400 With Hidden gem food tuor evening",
        "createdAt":  "2026-07-08T03:26:10.4234478Z"
    },
    {
        "id":  "offer_52e0a4c8b983",
        "brand":  "tours.arigatojapan.co.jp",
        "title":  "Arigato Travel Deal - Only Y26.400",
        "type":  "deal",
        "code":  "",
        "discount":  "Only Y26.400",
        "link":  "https://tours.arigatojapan.co.jp/?rfsn=9181508.b229e10",
        "category":  "Other",
        "expiry":  "",
        "review":  "Only Y26.400 With Hidden gem food tuor evening",
        "createdAt":  "2026-07-08T03:26:09.4234478Z"
    },
    {
        "id":  "offer_5bc0bd0c3e5f",
        "brand":  "bandelettes.com",
        "title":  "BANDELETTES Coupon Code PLDEALS - 25% OFF",
        "type":  "code",
        "code":  "PLDEALS",
        "discount":  "25% OFF",
        "link":  "https://www.bandelettes.com/?rfsn=9168263.20ddaaa\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168263.20ddaaa",
        "category":  "Other",
        "expiry":  "",
        "review":  "25% Off Storewide at Bandelettes",
        "createdAt":  "2026-07-08T03:26:08.4234478Z"
    },
    {
        "id":  "offer_86dcc8c81353",
        "brand":  "bandelettes.com",
        "title":  "BANDELETTES Coupon Code PRELUV20 - 20% OFF",
        "type":  "code",
        "code":  "PRELUV20",
        "discount":  "20% OFF",
        "link":  "https://www.bandelettes.com/?rfsn=9168263.20ddaaa\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168263.20ddaaa",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at Bandelettes",
        "createdAt":  "2026-07-08T03:26:07.4234478Z"
    },
    {
        "id":  "offer_851e327e0514",
        "brand":  "bandelettes.com",
        "title":  "BANDELETTES Coupon Code DUTCH - 20% OFF",
        "type":  "code",
        "code":  "DUTCH",
        "discount":  "20% OFF",
        "link":  "https://www.bandelettes.com/?rfsn=9168263.20ddaaa\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168263.20ddaaa",
        "category":  "Other",
        "expiry":  "",
        "review":  "20% Off Storewide at Bandelettes",
        "createdAt":  "2026-07-08T03:26:06.4234478Z"
    },
    {
        "id":  "offer_3a39c413f819",
        "brand":  "bandelettes.com",
        "title":  "BANDELETTES Coupon Code BANDELETTES15 - 15% OFF",
        "type":  "code",
        "code":  "BANDELETTES15",
        "discount":  "15% OFF",
        "link":  "https://www.bandelettes.com/?rfsn=9168263.20ddaaa\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168263.20ddaaa",
        "category":  "Other",
        "expiry":  "",
        "review":  "15% Off Storewide at Bandelettes",
        "createdAt":  "2026-07-08T03:26:05.4234478Z"
    },
    {
        "id":  "offer_6b837709293e",
        "brand":  "bandelettes.com",
        "title":  "BANDELETTES Coupon Code TPDEALS - 10% OFF",
        "type":  "code",
        "code":  "TPDEALS",
        "discount":  "10% OFF",
        "link":  "https://www.bandelettes.com/?rfsn=9168263.20ddaaa\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168263.20ddaaa",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Storewide at Bandelettes",
        "createdAt":  "2026-07-08T03:26:04.4234478Z"
    },
    {
        "id":  "offer_9e215e4eafa4",
        "brand":  "bandelettes.com",
        "title":  "BANDELETTES Deal - FREE SHIPING",
        "type":  "deal",
        "code":  "",
        "discount":  "FREE SHIPING",
        "link":  "https://www.bandelettes.com/?rfsn=9168263.20ddaaa\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168263.20ddaaa",
        "category":  "Other",
        "expiry":  "",
        "review":  "Bandelettes offers free standard shipping on most orders, which is automatically applied during checkout.",
        "createdAt":  "2026-07-08T03:26:03.4234478Z"
    },
    {
        "id":  "offer_8e0b1a502c8e",
        "brand":  "888lots.com",
        "title":  "888 Lots Coupon Code FIRST-ORDER-DISCOUNT - Free gift",
        "type":  "code",
        "code":  "FIRST-ORDER-DISCOUNT",
        "discount":  "Free gift",
        "link":  "https://888lots.com/?rfsn=9168272.88313f1",
        "category":  "Other",
        "expiry":  "",
        "review":  "Free Gift Get up to 60 Off on Your First Order When Sign Up at 888 Lots",
        "createdAt":  "2026-07-08T03:26:02.4234478Z"
    },
    {
        "id":  "offer_736e6904af36",
        "brand":  "nextupcomedy.com",
        "title":  "NextUp Comedy Coupon Code TREATS10 - $10% OFF",
        "type":  "code",
        "code":  "TREATS10",
        "discount":  "$10% OFF",
        "link":  "https://nextupcomedy.com/?rfsn=9168285.d8789e",
        "category":  "Other",
        "expiry":  "",
        "review":  "$10 Off Storewide (members Only) at NextUp Comedy",
        "createdAt":  "2026-07-08T03:26:01.4234478Z"
    },
    {
        "id":  "offer_1e85bec0766b",
        "brand":  "nextupcomedy.com",
        "title":  "NextUp Comedy Coupon Code ALLKILLA - 10% OFF",
        "type":  "code",
        "code":  "ALLKILLA",
        "discount":  "10% OFF",
        "link":  "https://nextupcomedy.com/?rfsn=9168285.d8789e",
        "category":  "Other",
        "expiry":  "",
        "review":  "10% Off Membership at NextUp Comedy",
        "createdAt":  "2026-07-08T03:26:00.4234478Z"
    },
    {
        "id":  "offer_320502dd9b5a",
        "brand":  "nextupcomedy.com",
        "title":  "NextUp Comedy Coupon Code AWARD5 - $5 OFF",
        "type":  "code",
        "code":  "AWARD5",
        "discount":  "$5 OFF",
        "link":  "https://nextupcomedy.com/?rfsn=9168285.d8789e",
        "category":  "Other",
        "expiry":  "",
        "review":  "$5 Off Access All Shows 1 Year Pass (Members Only) at NextUp Comedy",
        "createdAt":  "2026-07-08T03:25:59.4234478Z"
    },
    {
        "id":  "offer_0619fbf3ca33",
        "brand":  "nextupcomedy.com",
        "title":  "NextUp Comedy Coupon Code RIA30 - Free gift",
        "type":  "code",
        "code":  "RIA30",
        "discount":  "Free gift",
        "link":  "https://nextupcomedy.com/?rfsn=9168285.d8789e",
        "category":  "Other",
        "expiry":  "",
        "review":  "Free Gift Annual Plan at NextUp Comedy",
        "createdAt":  "2026-07-08T03:25:58.4234478Z"
    },
    {
        "id":  "offer_dd9192ae0901",
        "brand":  "nextupcomedy.com",
        "title":  "NextUp Comedy Coupon Code ABANDONED-CART-29390598-593DFDC2A6E3 - 30% OFF",
        "type":  "code",
        "code":  "ABANDONED-CART-29390598-593DFDC2A6E3",
        "discount":  "30% OFF",
        "link":  "https://nextupcomedy.com/?rfsn=9168285.d8789e",
        "category":  "Other",
        "expiry":  "",
        "review":  "30% Off Yearly Pass 4 Months Free at NextUp Comedy",
        "createdAt":  "2026-07-08T03:25:57.4234478Z"
    },
    {
        "id":  "offer_a8c9051d1994",
        "brand":  "tmgindustrial.ca",
        "title":  "TMG Product Supplies Deal - Only $8,099.00 CAD",
        "type":  "deal",
        "code":  "",
        "discount":  "Only $8,099.00 CAD",
        "link":  "https://tmgindustrial.ca/?rfsn=9168321.07ae61\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168321.07ae61",
        "category":  "Other",
        "expiry":  "",
        "review":  "Only $8,099.00 CAD With 20\u0027 x 30\u0027 Metal Garage Shed, 9\u0027 High Double Front Doors, 13\u0027 Peak, 600 Sq-Ft TMG-MS2030",
        "createdAt":  "2026-07-08T03:25:56.4234478Z"
    },
    {
        "id":  "offer_5a6f04b6b19e",
        "brand":  "tmgindustrial.ca",
        "title":  "TMG Product Supplies Deal - Only $1,899.00 CAD",
        "type":  "deal",
        "code":  "",
        "discount":  "Only $1,899.00 CAD",
        "link":  "https://tmgindustrial.ca/?rfsn=9168321.07ae61\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9168321.07ae62",
        "category":  "Other",
        "expiry":  "",
        "review":  "Only $1,899.00 CAD With 12\u0027 x 30\u0027 Tunnel Greenhouse Grow Tent w/6 Mil Clear EVA Plastic Film, Cold Frame, Hand Crank Roll-Up Sides, Peak Ceiling Roof, TMG-GH1230",
        "createdAt":  "2026-07-08T03:25:55.4234478Z"
    },
    {
        "id":  "offer_a7f3ca96c2a3",
        "brand":  "Jessie Boutique.com",
        "title":  "Jessie Boutique Coupon Code JESSIE15 - 15% OFF",
        "type":  "code",
        "code":  "JESSIE15",
        "discount":  "15% OFF",
        "link":  "https://www.jessieboutique.com/?rfsn=9151398.8746e51",
        "category":  "Fashion",
        "expiry":  "",
        "review":  "15% Off Storewide at Jessie Boutique",
        "createdAt":  "2026-06-30T00:59:00.0000000Z"
    },
    {
        "id":  "offer_e763c2783a5e",
        "brand":  "Jessie Boutique.com",
        "title":  "Jessie Boutique Coupon Code SAVE15 - 15% OFF",
        "type":  "code",
        "code":  "SAVE15",
        "discount":  "15% OFF",
        "link":  "https://www.jessieboutique.com/?rfsn=9151398.8746e51",
        "category":  "Fashion",
        "expiry":  "",
        "review":  "15% Off Storewide at Jessie Boutique",
        "createdAt":  "2026-06-30T00:58:00.0000000Z"
    },
    {
        "id":  "offer_a74af3a5aaf8",
        "brand":  "Jessie Boutique.com",
        "title":  "Jessie Boutique Coupon Code Vip40 - 40% OFF",
        "type":  "code",
        "code":  "Vip40",
        "discount":  "40% OFF",
        "link":  "https://www.jessieboutique.com/?rfsn=9151398.8746e52",
        "category":  "Fashion",
        "expiry":  "",
        "review":  "40% Off Clearance Items at Jessie Boutique",
        "createdAt":  "2026-06-30T00:57:00.0000000Z"
    },
    {
        "id":  "offer_f242048c6b9d",
        "brand":  "Jessie Boutique.com",
        "title":  "Jessie Boutique Coupon Code JESSIE20 - 15% OFF",
        "type":  "code",
        "code":  "JESSIE20",
        "discount":  "15% OFF",
        "link":  "https://www.jessieboutique.com/?rfsn=9151398.8746e53",
        "category":  "Fashion",
        "expiry":  "",
        "review":  "15% Off Storewide at Jessie Boutique",
        "createdAt":  "2026-06-30T00:56:00.0000000Z"
    },
    {
        "id":  "offer_e3bd35c16271",
        "brand":  "Jessie Boutique.com",
        "title":  "Jessie Boutique Coupon Code Save20 - 15% OFF",
        "type":  "code",
        "code":  "Save20",
        "discount":  "15% OFF",
        "link":  "https://www.jessieboutique.com/?rfsn=9151398.8746e54",
        "category":  "Fashion",
        "expiry":  "",
        "review":  "15% Off Storewide (Minimum Order: $100) at Jessie Boutique",
        "createdAt":  "2026-06-30T00:55:00.0000000Z"
    },
    {
        "id":  "offer_4c259c0a1818",
        "brand":  "reflexnutrition.com",
        "title":  "Reflexnutrition Deal - Only Â£34.99",
        "type":  "deal",
        "code":  "",
        "discount":  "Only Â£34.99",
        "link":  "https://reflexnutrition.com/discount/RN2522?rfsn=9151429.d7ad84\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9151429.d7ad84",
        "category":  "Health \u0026 Wellness",
        "expiry":  "",
        "review":  "Only Â£34.99 with Instant Wheyâ„¢ Pro",
        "createdAt":  "2026-06-30T00:54:00.0000000Z"
    },
    {
        "id":  "offer_bdc58c7ec3c6",
        "brand":  "reflexnutrition.com",
        "title":  "Reflexnutrition Deal - Only Â£25.99",
        "type":  "deal",
        "code":  "",
        "discount":  "Only Â£25.99",
        "link":  "https://reflexnutrition.com/discount/RN2522?rfsn=9151429.d7ad84\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9151429.d7ad84",
        "category":  "Health \u0026 Wellness",
        "expiry":  "",
        "review":  "Only Â£25.99 With Plant-Based Protein",
        "createdAt":  "2026-06-30T00:53:00.0000000Z"
    },
    {
        "id":  "offer_12ad2056acea",
        "brand":  "serveclothing.com",
        "title":  "Serve Clothing Coupon Code M9WRGD3T - 10% OFF",
        "type":  "code",
        "code":  "M9WRGD3T",
        "discount":  "10% OFF",
        "link":  "https://serveclothing.com/?rfsn=9151434.012429",
        "category":  "Fashion",
        "expiry":  "",
        "review":  "10% Off Storewide at Serve Clothing",
        "createdAt":  "2026-06-30T00:52:00.0000000Z"
    },
    {
        "id":  "offer_74b360aa8708",
        "brand":  "serveclothing.com",
        "title":  "Serve Clothing Coupon Code WELCOME15 - 15% OFF",
        "type":  "code",
        "code":  "WELCOME15",
        "discount":  "15% OFF",
        "link":  "https://serveclothing.com/?rfsn=9151434.012429",
        "category":  "Fashion",
        "expiry":  "",
        "review":  "15% Off Storewide at Serve Clothing",
        "createdAt":  "2026-06-30T00:51:00.0000000Z"
    },
    {
        "id":  "offer_adccd52f22a4",
        "brand":  "serveclothing.com",
        "title":  "Serve Clothing Coupon Code J3TVS4P4 - 15% OFF",
        "type":  "code",
        "code":  "J3TVS4P4",
        "discount":  "15% OFF",
        "link":  "https://serveclothing.com/?rfsn=9151434.012429",
        "category":  "Fashion",
        "expiry":  "",
        "review":  "15% Off Storewide at Serve Clothing",
        "createdAt":  "2026-06-30T00:50:00.0000000Z"
    },
    {
        "id":  "offer_2a770d6eb526",
        "brand":  "serveclothing.com",
        "title":  "Serve Clothing Coupon Code ABIFINNY - 15% OFF",
        "type":  "code",
        "code":  "ABIFINNY",
        "discount":  "15% OFF",
        "link":  "https://serveclothing.com/?rfsn=9151434.012429",
        "category":  "Fashion",
        "expiry":  "",
        "review":  "15% Off Storewide at Serve Clothing",
        "createdAt":  "2026-06-30T00:49:00.0000000Z"
    },
    {
        "id":  "offer_c580dbbeb303",
        "brand":  "serveclothing.com",
        "title":  "Serve Clothing Coupon Code SERVE15 - 15% OFF",
        "type":  "code",
        "code":  "SERVE15",
        "discount":  "15% OFF",
        "link":  "https://serveclothing.com/?rfsn=9151434.012429",
        "category":  "Fashion",
        "expiry":  "",
        "review":  "15% Off Storewide at Serve Clothing",
        "createdAt":  "2026-06-30T00:48:00.0000000Z"
    },
    {
        "id":  "offer_9eeb4dd8e789",
        "brand":  "livelovespashop.myshopify.com",
        "title":  "Live Love Spa Coupon Code LLSFRIENDS - 10% OFF",
        "type":  "code",
        "code":  "LLSFRIENDS",
        "discount":  "10% OFF",
        "link":  "https://livelovespashop.myshopify.com/?rfsn=9151470.5deaa3\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9151470.5deaa3",
        "category":  "Beauty \u0026 Spa",
        "expiry":  "",
        "review":  "10% Off Storewide at Live Love Spa w/Code",
        "createdAt":  "2026-06-30T00:47:00.0000000Z"
    },
    {
        "id":  "offer_0d37fc7a7088",
        "brand":  "livelovespashop.myshopify.com",
        "title":  "Live Love Spa Coupon Code THANKYOU10 - 10% OFF",
        "type":  "code",
        "code":  "THANKYOU10",
        "discount":  "10% OFF",
        "link":  "https://livelovespashop.myshopify.com/?rfsn=9151470.5deaa3\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9151470.5deaa4",
        "category":  "Beauty \u0026 Spa",
        "expiry":  "",
        "review":  "10% Off Storewide at Live Love Spa",
        "createdAt":  "2026-06-30T00:46:00.0000000Z"
    },
    {
        "id":  "offer_3ff88527dfa5",
        "brand":  "livelovespashop.myshopify.com",
        "title":  "Live Love Spa Coupon Code HELLO10 - 10% OFF",
        "type":  "code",
        "code":  "HELLO10",
        "discount":  "10% OFF",
        "link":  "https://livelovespashop.myshopify.com/?rfsn=9151470.5deaa3\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9151470.5deaa5",
        "category":  "Beauty \u0026 Spa",
        "expiry":  "",
        "review":  "10% Off Storewide at Live Love Spa",
        "createdAt":  "2026-06-30T00:45:00.0000000Z"
    },
    {
        "id":  "offer_d14e5888413a",
        "brand":  "livelovespashop.myshopify.com",
        "title":  "Live Love Spa Coupon Code ADBP1 - 10% OFF",
        "type":  "code",
        "code":  "ADBP1",
        "discount":  "10% OFF",
        "link":  "https://livelovespashop.myshopify.com/?rfsn=9151470.5deaa3\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9151470.5deaa6",
        "category":  "Beauty \u0026 Spa",
        "expiry":  "",
        "review":  "10% Off Storewide at Live Love Spa",
        "createdAt":  "2026-06-30T00:44:00.0000000Z"
    },
    {
        "id":  "offer_9b905e44c80c",
        "brand":  "livelovespashop.myshopify.com",
        "title":  "Live Love Spa Coupon Code ADBP2 - 10% OFF",
        "type":  "code",
        "code":  "ADBP2",
        "discount":  "10% OFF",
        "link":  "https://livelovespashop.myshopify.com/?rfsn=9151470.5deaa3\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9151470.5deaa7",
        "category":  "Beauty \u0026 Spa",
        "expiry":  "",
        "review":  "10% Off Storewide at Live Love Spa",
        "createdAt":  "2026-06-30T00:43:00.0000000Z"
    },
    {
        "id":  "offer_f8f6adfde89f",
        "brand":  "alertsusa.myshopify.com",
        "title":  "AlertsUSA Coupon Code SAFE23 - 25% OFF",
        "type":  "code",
        "code":  "SAFE23",
        "discount":  "25% OFF",
        "link":  "https://alertsusa.myshopify.com/?rfsn=9151897.d51d8e\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9151897.d51d8e",
        "category":  "Safety \u0026 Emergency",
        "expiry":  "",
        "review":  "25% Off Storewide at AlertsUSA",
        "createdAt":  "2026-06-30T00:42:00.0000000Z"
    },
    {
        "id":  "offer_cdc70fff4ca0",
        "brand":  "alertsusa.myshopify.com",
        "title":  "AlertsUSA Coupon Code PIVOT - $24 off",
        "type":  "code",
        "code":  "PIVOT",
        "discount":  "$24 off",
        "link":  "https://alertsusa.myshopify.com/?rfsn=9151897.d51d8e\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9151897.d51d8e",
        "category":  "Safety \u0026 Emergency",
        "expiry":  "",
        "review":  "$24 Off Storewide at AlertsUSA",
        "createdAt":  "2026-06-30T00:41:00.0000000Z"
    },
    {
        "id":  "offer_a2890be68134",
        "brand":  "alertsusa.myshopify.com",
        "title":  "AlertsUSA Coupon Code SAFE24 - 25% OFF",
        "type":  "code",
        "code":  "SAFE24",
        "discount":  "25% OFF",
        "link":  "https://alertsusa.myshopify.com/?rfsn=9151897.d51d8e\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9151897.d51d8e",
        "category":  "Safety \u0026 Emergency",
        "expiry":  "",
        "review":  "25% Off Storewide at AlertsUSA",
        "createdAt":  "2026-06-30T00:40:00.0000000Z"
    },
    {
        "id":  "offer_0f48dc42a1d1",
        "brand":  "alertsusa.myshopify.com",
        "title":  "AlertsUSA Coupon Code BESTMOM - 20% OFF",
        "type":  "code",
        "code":  "BESTMOM",
        "discount":  "20% OFF",
        "link":  "https://alertsusa.myshopify.com/?rfsn=9151897.d51d8e\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9151897.d51d8e",
        "category":  "Safety \u0026 Emergency",
        "expiry":  "",
        "review":  "20% Off Storewide at AlertsUSA",
        "createdAt":  "2026-06-30T00:39:00.0000000Z"
    },
    {
        "id":  "offer_66e2cd0aa0e6",
        "brand":  "alertsusa.myshopify.com",
        "title":  "AlertsUSA Coupon Code AUSAB7 - Other",
        "type":  "code",
        "code":  "AUSAB7",
        "discount":  "Other",
        "link":  "https://alertsusa.myshopify.com/?rfsn=9151897.d51d8e\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9151897.d51d8e",
        "category":  "Safety \u0026 Emergency",
        "expiry":  "",
        "review":  "Other Select Items (none) at AlertsUSA",
        "createdAt":  "2026-06-30T00:38:00.0000000Z"
    },
    {
        "id":  "offer_4ef6ebbc74eb",
        "brand":  "phoeniciangrinders.com",
        "title":  "Phoenician Grinders Coupon Code 420VIP - 25% OFF",
        "type":  "code",
        "code":  "420VIP",
        "discount":  "25% OFF",
        "link":  "https://phoeniciangrinders.com/?rfsn=9151964.787a29d\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9151964.787a29d",
        "category":  "Home Goods",
        "expiry":  "",
        "review":  "25% Off Storewide at Phoenician Grinders",
        "createdAt":  "2026-06-30T00:37:00.0000000Z"
    },
    {
        "id":  "offer_f4ebe04093ee",
        "brand":  "phoeniciangrinders.com",
        "title":  "Phoenician Grinders Coupon Code VIP22 - 22% OFF",
        "type":  "code",
        "code":  "VIP22",
        "discount":  "22% OFF",
        "link":  "https://phoeniciangrinders.com/?rfsn=9151964.787a29d\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9151964.787a29d",
        "category":  "Home Goods",
        "expiry":  "",
        "review":  "22% Off Storewide at Phoenician Grinders",
        "createdAt":  "2026-06-30T00:36:00.0000000Z"
    },
    {
        "id":  "offer_cbe6e332bc15",
        "brand":  "phoeniciangrinders.com",
        "title":  "Phoenician Grinders Coupon Code THANKYOU - 20% OFF",
        "type":  "code",
        "code":  "THANKYOU",
        "discount":  "20% OFF",
        "link":  "https://phoeniciangrinders.com/?rfsn=9151964.787a29d\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9151964.787a29d",
        "category":  "Home Goods",
        "expiry":  "",
        "review":  "20% Off Storewide at Phoenician Grinders",
        "createdAt":  "2026-06-30T00:35:00.0000000Z"
    },
    {
        "id":  "offer_06beed49b0b3",
        "brand":  "phoeniciangrinders.com",
        "title":  "Phoenician Grinders Coupon Code KOALA - 20% OFF",
        "type":  "code",
        "code":  "KOALA",
        "discount":  "20% OFF",
        "link":  "https://phoeniciangrinders.com/?rfsn=9151964.787a29d\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9151964.787a29d",
        "category":  "Home Goods",
        "expiry":  "",
        "review":  "20% Off Storewide at Phoenician Grinders",
        "createdAt":  "2026-06-30T00:34:00.0000000Z"
    },
    {
        "id":  "offer_5b9a9ca45f79",
        "brand":  "phoeniciangrinders.com",
        "title":  "Phoenician Grinders Coupon Code CLOUDMOUTH - 10% OFF",
        "type":  "code",
        "code":  "CLOUDMOUTH",
        "discount":  "10% OFF",
        "link":  "https://phoeniciangrinders.com/?rfsn=9151964.787a29d\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9151964.787a29d",
        "category":  "Home Goods",
        "expiry":  "",
        "review":  "10% Off Storewide at Phoenician Grinders",
        "createdAt":  "2026-06-30T00:33:00.0000000Z"
    },
    {
        "id":  "offer_cecee97952f6",
        "brand":  "nfsports.com",
        "title":  "NF Sports Coupon Code BARBU30 - 30% OFF",
        "type":  "code",
        "code":  "BARBU30",
        "discount":  "30% OFF",
        "link":  "https://nfsports.com/discount/?rfsn=9152035.2fb895",
        "category":  "Health \u0026 Wellness",
        "expiry":  "",
        "review":  "30% Off Storewide at NF Sports",
        "createdAt":  "2026-06-30T00:32:00.0000000Z"
    },
    {
        "id":  "offer_cf3d88dfbe32",
        "brand":  "nfsports.com",
        "title":  "NF Sports Coupon Code MELS25 - 25% OFF",
        "type":  "code",
        "code":  "MELS25",
        "discount":  "25% OFF",
        "link":  "https://nfsports.com/discount/?rfsn=9152035.2fb895",
        "category":  "Health \u0026 Wellness",
        "expiry":  "",
        "review":  "25% Off Storewide at NF Sports",
        "createdAt":  "2026-06-30T00:31:00.0000000Z"
    },
    {
        "id":  "offer_b0c4adab9177",
        "brand":  "nfsports.com",
        "title":  "NF Sports Coupon Code Aimee25 - 25% OFF",
        "type":  "code",
        "code":  "Aimee25",
        "discount":  "25% OFF",
        "link":  "https://nfsports.com/discount/?rfsn=9152035.2fb895",
        "category":  "Health \u0026 Wellness",
        "expiry":  "",
        "review":  "25% Off Storewide at NF Sports",
        "createdAt":  "2026-06-30T00:30:00.0000000Z"
    },
    {
        "id":  "offer_59641d5b841c",
        "brand":  "nfsports.com",
        "title":  "NF Sports Coupon Code RS25 - 25% OFF",
        "type":  "code",
        "code":  "RS25",
        "discount":  "25% OFF",
        "link":  "https://nfsports.com/discount/?rfsn=9152035.2fb895",
        "category":  "Health \u0026 Wellness",
        "expiry":  "",
        "review":  "25% Off Storewide at NF Sports",
        "createdAt":  "2026-06-30T00:29:00.0000000Z"
    },
    {
        "id":  "offer_c7859f56b9b8",
        "brand":  "nfsports.com",
        "title":  "NF Sports Coupon Code VNKOWGTGI8QH - $10 off",
        "type":  "code",
        "code":  "VNKOWGTGI8QH",
        "discount":  "$10 off",
        "link":  "https://nfsports.com/discount/?rfsn=9152035.2fb895",
        "category":  "Health \u0026 Wellness",
        "expiry":  "",
        "review":  "$10 Off Storewide at NF Sports",
        "createdAt":  "2026-06-30T00:28:00.0000000Z"
    },
    {
        "id":  "offer_a04ed51b5e5c",
        "brand":  "displaynow.io",
        "title":  "Display NOW Coupon Code BONUS101Y - 10% OFF",
        "type":  "code",
        "code":  "BONUS101Y",
        "discount":  "10% OFF",
        "link":  "https://referral.displaynow.io/?rfsn=9152037.f6132f",
        "category":  "Software",
        "expiry":  "",
        "review":  "10% Off Subscription Anual (Members Only) at Display NOW",
        "createdAt":  "2026-06-30T00:27:00.0000000Z"
    },
    {
        "id":  "offer_d426e299dbba",
        "brand":  "barkerwellness.com",
        "title":  "Barker Wellness Co Coupon Code BWFIRST25 - 25% OFF",
        "type":  "code",
        "code":  "BWFIRST25",
        "discount":  "25% OFF",
        "link":  "https://www.barkerwellness.com/?rfsn=9152144.2275aa",
        "category":  "Health \u0026 Wellness",
        "expiry":  "",
        "review":  "25% Off Storewide at Barker Wellness Co",
        "createdAt":  "2026-06-30T00:26:00.0000000Z"
    },
    {
        "id":  "offer_cc9e07c742d4",
        "brand":  "barkerwellness.com",
        "title":  "Barker Wellness Co Coupon Code YP7YQSSD4ZC7 - 20% OFF",
        "type":  "code",
        "code":  "YP7YQSSD4ZC7",
        "discount":  "20% OFF",
        "link":  "https://www.barkerwellness.com/?rfsn=9152144.2275aa",
        "category":  "Health \u0026 Wellness",
        "expiry":  "",
        "review":  "20% Off Storewide at Barker Wellness Co",
        "createdAt":  "2026-06-30T00:25:00.0000000Z"
    },
    {
        "id":  "offer_788439a2e542",
        "brand":  "barkerwellness.com",
        "title":  "Barker Wellness Co Coupon Code ABANDONED15 - 15% OFF",
        "type":  "code",
        "code":  "ABANDONED15",
        "discount":  "15% OFF",
        "link":  "https://www.barkerwellness.com/?rfsn=9152144.2275aa",
        "category":  "Health \u0026 Wellness",
        "expiry":  "",
        "review":  "15% Off Select Items at Barker Wellness Co",
        "createdAt":  "2026-06-30T00:24:00.0000000Z"
    },
    {
        "id":  "offer_aa85bba29c60",
        "brand":  "barkerwellness.com",
        "title":  "Barker Wellness Co Coupon Code BW25OFF - 25% OFF",
        "type":  "code",
        "code":  "BW25OFF",
        "discount":  "25% OFF",
        "link":  "https://www.barkerwellness.com/?rfsn=9152144.2275aa",
        "category":  "Health \u0026 Wellness",
        "expiry":  "",
        "review":  "25% Off Select Items at Barker Wellness Co",
        "createdAt":  "2026-06-30T00:23:00.0000000Z"
    },
    {
        "id":  "offer_157ed49995e7",
        "brand":  "barkerwellness.com",
        "title":  "Barker Wellness Co Coupon Code B1G1 - Buy get 2nd Half off",
        "type":  "code",
        "code":  "B1G1",
        "discount":  "Buy get 2nd Half off",
        "link":  "https://www.barkerwellness.com/?rfsn=9152144.2275aa",
        "category":  "Health \u0026 Wellness",
        "expiry":  "",
        "review":  "Buy 1 Get 2nd Half Off Storewide (Must Order 2 Items) at Barker Wellness Co",
        "createdAt":  "2026-06-30T00:22:00.0000000Z"
    },
    {
        "id":  "offer_9ba0093c73bd",
        "brand":  "prolon.eu",
        "title":  "Prolon Deal - Only Â£249.00",
        "type":  "deal",
        "code":  "",
        "discount":  "Only Â£249.00",
        "link":  "https://prolon.eu/?rfsn=9152146.37e8ef\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9152146.37e8ef",
        "category":  "Health \u0026 Wellness",
        "expiry":  "",
        "review":  "Only Â£249.00 with Prolon 5-Day Program",
        "createdAt":  "2026-06-30T00:21:00.0000000Z"
    },
    {
        "id":  "offer_299a3c086d45",
        "brand":  "prolon.eu",
        "title":  "Prolon Deal - Only Â£189.00",
        "type":  "deal",
        "code":  "",
        "discount":  "Only Â£189.00",
        "link":  "https://prolon.eu/?rfsn=9152146.37e8ef\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9152146.37e8ef",
        "category":  "Health \u0026 Wellness",
        "expiry":  "",
        "review":  "Only Â£189.00 with The clinically tested system for healthier, rejuvenating fasting",
        "createdAt":  "2026-06-30T00:20:00.0000000Z"
    },
    {
        "id":  "offer_070dbcba3cdf",
        "brand":  "hairclub.com",
        "title":  "HairClub Coupon Code GET10 - 10% OFF",
        "type":  "code",
        "code":  "GET10",
        "discount":  "10% OFF",
        "link":  "https://www.hairclub.com/?rfsn=9152164.02f6a6\u0026pub=IPREFCLRERECA12476\u0026referralCode=COPER14\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9152164.02f6a6",
        "category":  "Beauty \u0026 Spa",
        "expiry":  "",
        "review":  "10% Off Storewide at HairClub",
        "createdAt":  "2026-06-30T00:19:00.0000000Z"
    },
    {
        "id":  "offer_97fc7cb7f40b",
        "brand":  "hairclub.com",
        "title":  "HairClub Coupon Code WETHRIFT10 - 10% OFF",
        "type":  "code",
        "code":  "WETHRIFT10",
        "discount":  "10% OFF",
        "link":  "https://www.hairclub.com/?rfsn=9152164.02f6a6\u0026pub=IPREFCLRERECA12476\u0026referralCode=COPER14\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9152164.02f6a6",
        "category":  "Beauty \u0026 Spa",
        "expiry":  "",
        "review":  "10% Off Storewide at HairClub",
        "createdAt":  "2026-06-30T00:18:00.0000000Z"
    },
    {
        "id":  "offer_c130aa5a946f",
        "brand":  "hairclub.com",
        "title":  "HairClub Coupon Code CODE10 - 10% OFF",
        "type":  "code",
        "code":  "CODE10",
        "discount":  "10% OFF",
        "link":  "https://www.hairclub.com/?rfsn=9152164.02f6a6\u0026pub=IPREFCLRERECA12476\u0026referralCode=COPER14\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9152164.02f6a6",
        "category":  "Beauty \u0026 Spa",
        "expiry":  "",
        "review":  "10% Off Storewide at HairClub",
        "createdAt":  "2026-06-30T00:17:00.0000000Z"
    },
    {
        "id":  "offer_95241e059288",
        "brand":  "hairclub.com",
        "title":  "HairClu Coupon Code THEVEGASFASHIONISTA10 - 10% OFF",
        "type":  "code",
        "code":  "THEVEGASFASHIONISTA10",
        "discount":  "10% OFF",
        "link":  "https://www.hairclub.com/?rfsn=9152164.02f6a6\u0026pub=IPREFCLRERECA12476\u0026referralCode=COPER14\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9152164.02f6a7",
        "category":  "Beauty \u0026 Spa",
        "expiry":  "",
        "review":  "10% Off Storewide at HairClu",
        "createdAt":  "2026-06-30T00:16:00.0000000Z"
    },
    {
        "id":  "offer_a77dee4ade74",
        "brand":  "theblackpurple.com",
        "title":  "TheBlackPurple Coupon Code PRELUV - 33% OFF",
        "type":  "code",
        "code":  "PRELUV",
        "discount":  "33% OFF",
        "link":  "https://theblackpurple.com/?rfsn=9152190.b8a997\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9152190.b8a997",
        "category":  "Fashion",
        "expiry":  "",
        "review":  "33% Off Storewide at TheBlackPurple",
        "createdAt":  "2026-06-30T00:15:00.0000000Z"
    },
    {
        "id":  "offer_7abfe1bfbad6",
        "brand":  "theblackpurple.com",
        "title":  "TheBlackPurple Coupon Code MIA - 30% OFF",
        "type":  "code",
        "code":  "MIA",
        "discount":  "30% OFF",
        "link":  "https://theblackpurple.com/?rfsn=9152190.b8a997\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9152190.b8a997",
        "category":  "Fashion",
        "expiry":  "",
        "review":  "30% Off Storewide at TheBlackPurple",
        "createdAt":  "2026-06-30T00:14:00.0000000Z"
    },
    {
        "id":  "offer_a110dfaf1efc",
        "brand":  "theblackpurple.com",
        "title":  "TheBlackPurple Coupon Code Love25 - 25% OFF",
        "type":  "code",
        "code":  "Love25",
        "discount":  "25% OFF",
        "link":  "https://theblackpurple.com/?rfsn=9152190.b8a997\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9152190.b8a997",
        "category":  "Fashion",
        "expiry":  "",
        "review":  "25% Off Storewide at TheBlackPurple",
        "createdAt":  "2026-06-30T00:13:00.0000000Z"
    },
    {
        "id":  "offer_b478c0104c9d",
        "brand":  "theblackpurple.com",
        "title":  "TheBlackPurple Coupon Code JES - 20% OFF",
        "type":  "code",
        "code":  "JES",
        "discount":  "20% OFF",
        "link":  "https://theblackpurple.com/?rfsn=9152190.b8a997\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9152190.b8a997",
        "category":  "Fashion",
        "expiry":  "",
        "review":  "20% Off Storewide at TheBlackPurple",
        "createdAt":  "2026-06-30T00:12:00.0000000Z"
    },
    {
        "id":  "offer_c6d261a30dd0",
        "brand":  "theblackpurple.com",
        "title":  "TheBlackPurple Coupon Code HAPPY15 - 15% OFF",
        "type":  "code",
        "code":  "HAPPY15",
        "discount":  "15% OFF",
        "link":  "https://theblackpurple.com/?rfsn=9152190.b8a997\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9152190.b8a997",
        "category":  "Fashion",
        "expiry":  "",
        "review":  "15% Off Storewide at TheBlackPurple",
        "createdAt":  "2026-06-30T00:11:00.0000000Z"
    },
    {
        "id":  "offer_1df0b5f40ad7",
        "brand":  "theblackpurple.com",
        "title":  "Theblackpurple Deal - Free shipping",
        "type":  "deal",
        "code":  "",
        "discount":  "Free shipping",
        "link":  "https://theblackpurple.com/?rfsn=9152190.b8a997\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9152190.b8a997",
        "category":  "Fashion",
        "expiry":  "",
        "review":  "TheBlackPurple offers free standard shipping on most orders, which is automatically applied during checkout.",
        "createdAt":  "2026-06-30T00:10:00.0000000Z"
    },
    {
        "id":  "offer_ad4fdc6c7835",
        "brand":  "xyzreptiles.com",
        "title":  "XYZReptiles Coupon Code FREESHIP - Free shipping",
        "type":  "code",
        "code":  "FREESHIP",
        "discount":  "Free shipping",
        "link":  "https://www.xyzreptiles.com/?rfsn=9153430.296314\u0026utm_source=refersion\u0026utm_medium=9153430",
        "category":  "Pets",
        "expiry":  "",
        "review":  "Free Shipping Storewide (Minimum Order: $500) at XYZReptiles",
        "createdAt":  "2026-06-30T00:09:00.0000000Z"
    },
    {
        "id":  "offer_d067b7f7e500",
        "brand":  "xyzreptiles.com",
        "title":  "XYZReptiles Coupon Code 15OFFAS - 15% OFF",
        "type":  "code",
        "code":  "15OFFAS",
        "discount":  "15% OFF",
        "link":  "https://www.xyzreptiles.com/?rfsn=9153430.296314\u0026utm_source=refersion\u0026utm_medium=9153430",
        "category":  "Pets",
        "expiry":  "",
        "review":  "15% Off Sub and Adult Snakes at XYZReptiles",
        "createdAt":  "2026-06-30T00:08:00.0000000Z"
    },
    {
        "id":  "offer_ea74b447a5e7",
        "brand":  "xyzreptiles.com",
        "title":  "XYZReptiles Coupon Code 4OFF4PK - $4 off",
        "type":  "code",
        "code":  "4OFF4PK",
        "discount":  "$4 off",
        "link":  "https://www.xyzreptiles.com/?rfsn=9153430.296314\u0026utm_source=refersion\u0026utm_medium=9153430",
        "category":  "Pets",
        "expiry":  "",
        "review":  "$4 Off Any Heat Bulb 4 Pack at XYZReptiles",
        "createdAt":  "2026-06-30T00:07:00.0000000Z"
    },
    {
        "id":  "offer_9ab3af4443a1",
        "brand":  "xyzreptiles.com",
        "title":  "XYZReptiles Coupon Code BOGO100W - Buy 1 get 1 free",
        "type":  "code",
        "code":  "BOGO100W",
        "discount":  "Buy 1 get 1 free",
        "link":  "https://www.xyzreptiles.com/?rfsn=9153430.296314\u0026utm_source=refersion\u0026utm_medium=9153430",
        "category":  "Pets",
        "expiry":  "",
        "review":  "Buy 1 Get 1 Free Single Reptile Heat Lamp Bulb 100 Watt at XYZReptiles",
        "createdAt":  "2026-06-30T00:06:00.0000000Z"
    },
    {
        "id":  "offer_ec8cad272c65",
        "brand":  "xyzreptiles.com",
        "title":  "XYZReptiles Coupon Code dsbag - Free Xyzreptiles Bag with Reptile Pet Purchase",
        "type":  "code",
        "code":  "dsbag",
        "discount":  "Free Xyzreptiles Bag with Reptile Pet Purchase",
        "link":  "https://www.xyzreptiles.com/?rfsn=9153430.296314\u0026utm_source=refersion\u0026utm_medium=9153431",
        "category":  "Pets",
        "expiry":  "",
        "review":  "Free Xyzreptiles Bag With Reptile Pet Purchase Reptile Pet Purchase at XYZReptiles",
        "createdAt":  "2026-06-30T00:05:00.0000000Z"
    },
    {
        "id":  "offer_62b7d1eb1524",
        "brand":  "auroragift.com",
        "title":  "Auroragift Deal - 10% OFF",
        "type":  "deal",
        "code":  "",
        "discount":  "10% OFF",
        "link":  "https://auroragift.com/?rfsn=9153443.d4fb9da\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153443.d4fb9da",
        "category":  "Gifts",
        "expiry":  "",
        "review":  "10% Off Storewide",
        "createdAt":  "2026-06-30T00:04:00.0000000Z"
    },
    {
        "id":  "offer_a431e046827c",
        "brand":  "auroragift.com",
        "title":  "Auroragift Deal - 30% OFF",
        "type":  "deal",
        "code":  "",
        "discount":  "30% OFF",
        "link":  "https://auroragift.com/?rfsn=9153443.d4fb9da\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153443.d4fb9da",
        "category":  "Gifts",
        "expiry":  "",
        "review":  "30% Off America Spirits",
        "createdAt":  "2026-06-30T00:03:00.0000000Z"
    },
    {
        "id":  "offer_f7f4cba92ffb",
        "brand":  "auroragift.com",
        "title":  "Auroragift Deal - 25% OFF",
        "type":  "deal",
        "code":  "",
        "discount":  "25% OFF",
        "link":  "https://auroragift.com/?rfsn=9153443.d4fb9da\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153443.d4fb9da",
        "category":  "Gifts",
        "expiry":  "",
        "review":  "Select Items Only",
        "createdAt":  "2026-06-30T00:02:00.0000000Z"
    },
    {
        "id":  "offer_79b8b24d246d",
        "brand":  "auroragift.com",
        "title":  "Auroragift Deal - $3 Off",
        "type":  "deal",
        "code":  "",
        "discount":  "$3 Off",
        "link":  "https://auroragift.com/?rfsn=9153443.d4fb9da\u0026utm_source=refersion\u0026utm_medium=affiliate\u0026utm_campaign=9153443.d4fb9da",
        "category":  "Gifts",
        "expiry":  "",
        "review":  "Select Items Only",
        "createdAt":  "2026-06-30T00:01:00.0000000Z"
    }
];

const starterOffers = readJsonArrayFile(
  rootSeedOffersFile,
  readJsonArrayFile(seedOffersFile, readJsonArrayFile(bundledOffersFile, embeddedStarterOffers))
);
const starterAdminEmails = ["admin@alocoupon.local"];
const defaultSiteSettings = {
  siteName: "AloCoupon",
  slogan: "Your Trusted Marketplace for Coupons & Deals",
  homeTitle: "Codes that actually work.",
  homeDescription: "Other sites guess. We verify. Every offer is reviewed, organized, and published from real partner data before you see it.",
  logoData: "",
  faviconData: "",
  allowIndex: true,
  ampHomepage: false,
  authorName: "AloCoupon Editorial Team",
  authorAvatarData: "",
  facebook: "",
  instagram: "",
  youtube: "",
  tiktok: "",
  x: "",
  seoTitle: "AloCoupon - Verified Coupon Codes & Deals",
  seoDescription: "Verified coupon codes, promotions and deals from trusted partner stores.",
  seoKeywords: "coupon codes, deals, promotions",
  googleAnalyticsCode: "",
  couponDescription: "Don't miss out! Browse verified coupons for {{store_name}} and save before checkout.",
  howToApply: "Choose an offer, copy the coupon code, visit the store and apply the code at checkout.",
  widgetTitle: "Get deals by email",
  widgetContent: "Subscribe to receive verified coupons and new deals.",
  menuItems: "Stores|#stores\nDeals|#deals\nCategories|#categories\nBlog|#feature-post\nFAQ|#faq",
  feedbackEmail: "",
  feedbackEnabled: true,
  adsHeader: "",
  adsSidebar: "",
  adsFooter: "",
};

function ensureDataFile() {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(projectUploadsDir, { recursive: true });
  fs.mkdirSync(offerAssetsDir, { recursive: true });
  if (!fs.existsSync(offersFile)) {
    fs.writeFileSync(offersFile, JSON.stringify(starterOffers, null, 2));
  } else if (starterOffers.length) {
    const currentOffers = readJsonArrayFile(offersFile);
    if (!currentOffers.length) {
      fs.writeFileSync(offersFile, JSON.stringify(starterOffers, null, 2));
    }
  }
  if (!fs.existsSync(storesFile)) {
    const sourceOffers = readJsonArrayFile(offersFile, starterOffers);
    fs.writeFileSync(storesFile, JSON.stringify(deriveStoresFromOffers(sourceOffers), null, 2));
  }
  if (!fs.existsSync(adminEmailsFile)) {
    fs.writeFileSync(adminEmailsFile, JSON.stringify(starterAdminEmails, null, 2));
  }
  if (!fs.existsSync(projectsFile)) {
    fs.writeFileSync(projectsFile, "[]");
  }
  if (!fs.existsSync(trustpilotReviewsFile)) {
    fs.writeFileSync(trustpilotReviewsFile, "[]");
  }
  if (!fs.existsSync(siteSettingsFile)) {
    fs.writeFileSync(siteSettingsFile, JSON.stringify(defaultSiteSettings, null, 2));
  }
  if (!fs.existsSync(adminUsersFile)) {
    const initialUsers = readJsonArrayFile(adminEmailsFile, starterAdminEmails).map((email, index) => ({
      id: `user_${index + 1}`,
      name: index === 0 ? "Administrator" : String(email).split("@")[0],
      username: String(email).split("@")[0],
      email: normalizeEmail(email),
      phone: "",
      role: index === 0 ? "Administrator" : "Editor",
      status: "active",
      createdAt: new Date().toISOString(),
    }));
    fs.writeFileSync(adminUsersFile, JSON.stringify(initialUsers, null, 2));
  }
  if (!fs.existsSync(adminCategoriesFile)) fs.writeFileSync(adminCategoriesFile, "{}");
  if (!fs.existsSync(subscribersFile)) {
    fs.writeFileSync(subscribersFile, "[]");
  }
}

function readSiteSettings() {
  ensureDataFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(siteSettingsFile, "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? { ...defaultSiteSettings, ...parsed } : { ...defaultSiteSettings };
  } catch {
    return { ...defaultSiteSettings };
  }
}

function sanitizeSiteSettings(input) {
  const current = readSiteSettings();
  const next = { ...current };
  Object.keys(defaultSiteSettings).forEach((key) => {
    if (!(key in input)) return;
    if (typeof defaultSiteSettings[key] === "boolean") next[key] = Boolean(input[key]);
    else next[key] = String(input[key] ?? "").slice(0, key.endsWith("Data") ? 900000 : 20000);
  });
  ["logoData", "faviconData", "authorAvatarData"].forEach((key) => {
    if (next[key] && !/^data:image\/(?:png|jpeg|webp|gif|svg\+xml);base64,/i.test(next[key])) next[key] = "";
  });
  return next;
}

function writeSiteSettings(settings) {
  ensureDataFile();
  fs.writeFileSync(siteSettingsFile, JSON.stringify(settings, null, 2));
}

function getGoogleTrackingIds(settings = {}) {
  const source = String(settings.googleAnalyticsCode || '');
  const gtagIds = [...new Set(source.match(/\b(?:G-[A-Z0-9]{6,}|GT-[A-Z0-9]{6,}|AW-\d{6,}|UA-\d+-\d+)\b/gi) || [])].map((id) => id.toUpperCase());
  const managerIds = [...new Set(source.match(/\bGTM-[A-Z0-9]{4,}\b/gi) || [])].map((id) => id.toUpperCase());
  return { gtagIds, managerIds };
}

function getGoogleAnalyticsHead(settings = {}) {
  const { gtagIds, managerIds } = getGoogleTrackingIds(settings);
  const gtag = gtagIds.length ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gtagIds[0])}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${gtagIds.map((id) => `gtag('config',${JSON.stringify(id)});`).join('')}</script>` : '';
  const manager = managerIds.map((id) => `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(id)});</script>`).join('\n');
  return [gtag, manager].filter(Boolean).join('\n');
}

function getGoogleAnalyticsBody(settings = {}) {
  const { managerIds } = getGoogleTrackingIds(settings);
  return managerIds.map((id) => `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(id)}" height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>`).join('\n');
}

function renderHomePageHtml() {
  const settings = readSiteSettings();
  const title = escapeHtml(settings.seoTitle || defaultSiteSettings.seoTitle);
  const description = escapeHtml(settings.seoDescription || defaultSiteSettings.seoDescription);
  const keywords = escapeHtml(settings.seoKeywords || defaultSiteSettings.seoKeywords);
  let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  html = html.replace(/<meta\s+name="description"[\s\S]*?\/>/i, `<meta name="description" content="${description}" />`);
  html = html.replace(/<meta\s+property="og:title"[^>]*\/>/i, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta\s+property="og:description"[\s\S]*?\/>/i, `<meta property="og:description" content="${description}" />`);
  html = html.replace(/<meta\s+name="twitter:title"[^>]*\/>/i, `<meta name="twitter:title" content="${title}" />`);
  html = html.replace(/<meta\s+name="twitter:description"[\s\S]*?\/>/i, `<meta name="twitter:description" content="${description}" />`);
  if (/<meta\s+name="keywords"/i.test(html)) html = html.replace(/<meta\s+name="keywords"[^>]*\/>/i, `<meta name="keywords" content="${keywords}" />`);
  else html = html.replace(/(<meta\s+name="robots"[^>]*\/>)/i, `<meta name="keywords" content="${keywords}" />\n    $1`);
  const analyticsHead = getGoogleAnalyticsHead(settings);
  const analyticsBody = getGoogleAnalyticsBody(settings);
  if (analyticsHead) html = html.replace('</head>', `${analyticsHead}\n  </head>`);
  if (analyticsBody) html = html.replace(/<body([^>]*)>/i, (match) => `${match}\n${analyticsBody}`);
  return html;
}

function readAdminUsers() {
  ensureDataFile();
  return readJsonArrayFile(adminUsersFile).map((user) => ({ ...user, email: normalizeEmail(user.email) })).filter((user) => user.email);
}

function writeAdminUsers(users) {
  ensureDataFile();
  fs.writeFileSync(adminUsersFile, JSON.stringify(users, null, 2));
  fs.writeFileSync(adminEmailsFile, JSON.stringify(users.filter((user) => user.status !== "disabled").map((user) => normalizeEmail(user.email)), null, 2));
}

function readSubscribers() {
  ensureDataFile();
  return readJsonArrayFile(subscribersFile)
    .map((subscriber) => ({ ...subscriber, email: normalizeEmail(subscriber.email) }))
    .filter((subscriber) => subscriber.id && subscriber.email);
}

function writeSubscribers(subscribers) {
  ensureDataFile();
  fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2));
}

function readTrustpilotReviews() {
  ensureDataFile();
  return readJsonArrayFile(trustpilotReviewsFile);
}

function readProjects() {
  ensureDataFile();
  return readJsonArrayFile(projectsFile)
    .map((project) => ({ ...project, size: Number(project.size || 0) }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function writeProjects(projects) {
  ensureDataFile();
  fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));
}

function readOffers() {
  ensureDataFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(offersFile, "utf8").replace(/^\uFEFF/, ""));
    if (Array.isArray(parsed) && parsed.length) {
      return applyExtractedBrandLogos(normalizeOffers(parsed));
    }
    return applyExtractedBrandLogos(normalizeOffers(starterOffers));
  } catch {
    return applyExtractedBrandLogos(normalizeOffers(starterOffers));
  }
}

function readBrandLogoManifest() {
  try {
    const manifestFile = path.join(root, "assets", "brand-logos", "manifest.json");
    const parsed = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function readBrandLandingManifest() {
  try {
    const manifestFile = path.join(root, "assets", "brand-landings", "manifest.json");
    const parsed = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function readProductImageManifest() {
  try {
    const manifestFile = path.join(root, "assets", "product-images", "manifest.json");
    const parsed = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function getOfferLogoHost(offer) {
  try {
    return new URL(offer.link).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return String(offer.brand || "").trim().toLowerCase().replace(/^www\./, "");
  }
}

function applyExtractedBrandLogos(offers) {
  const manifest = readBrandLogoManifest();
  const landingManifest = readBrandLandingManifest();
  const productManifest = readProductImageManifest();
  return offers.map((offer) => ({
    ...offer,
    logo: offer.logo || manifest[getOfferLogoHost(offer)] || "",
    landingImage: offer.landingImage || landingManifest[getOfferLogoHost(offer)] || "",
    productImage: offer.productImage || productManifest[offer.id] || "",
  }));
}

function writeOffers(offers) {
  ensureDataFile();
  fs.writeFileSync(offersFile, JSON.stringify(normalizeOffers(offers), null, 2));
}

function getStoreSourceUrl(offer) {
  return String(offer.sourceUrl || offer.link || '').trim();
}

function deriveStoresFromOffers(offers) {
  const grouped = new Map();
  normalizeOffers(Array.isArray(offers) ? offers : []).forEach((offer, index) => {
    const sourceBrand = String(offer.brand || '').trim();
    const name = getPrettyBrandName(sourceBrand);
    if (!name) return;
    const slug = getOfferStoreSlug(name);
    const current = grouped.get(slug) || {
      id: `store_${crypto.createHash('sha1').update(slug).digest('hex').slice(0, 16)}`,
      name,
      sourceBrand,
      slug,
      category: String(offer.category || 'Other').trim() || 'Other',
      event: 'Uncategorized',
      image: String(offer.logo || '').trim(),
      approved: true,
      description: String(offer.sourceDescription || '').trim().slice(0, 1200),
      aboutStore: '',
      howToApply: '',
      faqs: '',
      maxOffer: 0,
      metaTitle: `${name} Coupons, Promo Codes & Deals`,
      metaKeywords: '',
      metaDescription: String(offer.sourceDescription || '').trim().slice(0, 500),
      sourceUrl: getStoreSourceUrl(offer),
      sourceTitle: String(offer.sourceTitle || '').trim().slice(0, 240),
      productImage: String(offer.productImage || '').trim(),
      order: index + 1,
      createdAt: offer.createdAt || new Date().toISOString(),
      updatedAt: offer.createdAt || new Date().toISOString(),
    };
    current.image ||= String(offer.logo || '').trim();
    current.productImage ||= String(offer.productImage || '').trim();
    current.sourceUrl ||= getStoreSourceUrl(offer);
    current.sourceTitle ||= String(offer.sourceTitle || '').trim().slice(0, 240);
    current.description ||= String(offer.sourceDescription || '').trim().slice(0, 1200);
    grouped.set(slug, current);
  });
  return Array.from(grouped.values()).sort((a, b) => Number(a.order) - Number(b.order) || a.name.localeCompare(b.name));
}

function normalizeStore(input, existing = null) {
  const now = new Date().toISOString();
  const name = String(input.name || '').trim().slice(0, 160);
  if (!name) throw new Error('Store name is required.');
  const slug = slugify(input.slug || name).slice(0, 180);
  if (!slug) throw new Error('Store slug is required.');
  const sourceUrl = String(input.sourceUrl || '').trim().slice(0, 2000);
  if (sourceUrl) {
    const parsed = new URL(sourceUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Store website must use http or https.');
  }
  return {
    id: String(existing?.id || input.id || `store_${crypto.randomBytes(12).toString('hex')}`),
    name,
    sourceBrand: String(input.sourceBrand || existing?.sourceBrand || name).trim().slice(0, 160),
    slug,
    category: String(input.category || 'Other').trim().slice(0, 120) || 'Other',
    event: String(input.event || 'Uncategorized').trim().slice(0, 120) || 'Uncategorized',
    image: sanitizeOfferImage(input.image || '', 'Store image', 1_500 * 1024),
    approved: input.approved !== false && String(input.approved).toLowerCase() !== 'false',
    deleted: input.deleted === true || String(input.deleted).toLowerCase() === 'true',
    description: String(input.description || '').trim().slice(0, 12000),
    aboutStore: String(input.aboutStore || '').trim().slice(0, 30000),
    howToApply: String(input.howToApply || '').trim().slice(0, 12000),
    faqs: String(input.faqs || '').trim().slice(0, 20000),
    maxOffer: Math.max(0, Math.min(1000, Number(input.maxOffer) || 0)),
    metaTitle: String(input.metaTitle || `${name} Coupons, Promo Codes & Deals`).trim().slice(0, 180),
    metaKeywords: String(input.metaKeywords || '').trim().slice(0, 500),
    metaDescription: String(input.metaDescription || '').trim().slice(0, 500),
    sourceUrl,
    sourceTitle: String(input.sourceTitle || '').trim().slice(0, 240),
    productImage: sanitizeOfferImage(input.productImage || '', 'Product image', 1_500 * 1024),
    order: Number.isFinite(Number(input.order)) ? Number(input.order) : 9999999,
    createdAt: existing?.createdAt || input.createdAt || now,
    updatedAt: existing === input ? (existing.updatedAt || existing.createdAt || now) : now,
  };
}

function readStores() {
  ensureDataFile();
  const existing = readJsonArrayFile(storesFile);
  const bySlug = new Map(existing.map((store) => [slugify(store.slug || store.name), store]));
  let changed = false;
  deriveStoresFromOffers(readJsonArrayFile(offersFile, starterOffers)).forEach((derived) => {
    const current = bySlug.get(derived.slug);
    if (!current) {
      existing.push(derived);
      bySlug.set(derived.slug, derived);
      changed = true;
      return;
    }
    for (const field of ['image', 'productImage', 'sourceUrl', 'sourceTitle', 'description']) {
      if (!current[field] && derived[field]) { current[field] = derived[field]; changed = true; }
    }
  });
  if (changed) fs.writeFileSync(storesFile, JSON.stringify(existing, null, 2));
  return existing.map((store) => {
    try { return normalizeStore(store, store); } catch { return null; }
  }).filter((store) => store && !store.deleted).sort((a, b) => Number(a.order) - Number(b.order) || a.name.localeCompare(b.name));
}

function writeStores(stores) {
  ensureDataFile();
  const ids = new Set(stores.map((store) => store.id));
  const tombstones = readJsonArrayFile(storesFile).filter((store) => store.deleted && !ids.has(store.id));
  fs.writeFileSync(storesFile, JSON.stringify([...stores, ...tombstones], null, 2));
}

function readAdminCategoryPreferences() {
  ensureDataFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(adminCategoriesFile, "utf8"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function sanitizeAdminCategoryPreferences(input) {
  const next = {};
  Object.entries(input && typeof input === "object" && !Array.isArray(input) ? input : {}).slice(0, 500).forEach(([key, value]) => {
    const safeKey = slugify(key).slice(0, 100);
    if (!safeKey || !value || typeof value !== "object") return;
    next[safeKey] = {
      visible: value.visible !== false,
      home: value.home !== false,
      order: Math.max(-999999, Math.min(9999999, Number(value.order) || 0)),
    };
  });
  return next;
}

function writeAdminCategoryPreferences(input) {
  const preferences = sanitizeAdminCategoryPreferences(input);
  ensureDataFile();
  fs.writeFileSync(adminCategoriesFile, JSON.stringify(preferences, null, 2));
  return preferences;
}

function getAdminDashboardData() {
  const offers = readOffers();
  const subscribers = readSubscribers();
  const stores = readStores();
  const categories = new Set(offers.map((offer) => String(offer.category || "Other").trim().toLowerCase()).filter(Boolean));
  const now = Date.now();
  const isExpired = (offer) => {
    if (!offer.expiry) return false;
    const expiry = new Date(offer.expiry).getTime();
    return !Number.isNaN(expiry) && expiry < now;
  };
  return {
    totals: {
      offers: offers.length,
      coupons: offers.filter((offer) => offer.type === "code").length,
      deals: offers.filter((offer) => offer.type === "deal").length,
      stores: stores.length,
      categories: categories.size,
      visible: offers.filter((offer) => offer.visible !== false).length,
      expired: offers.filter(isExpired).length,
      missingLogo: offers.filter((offer) => !offer.logo).length,
      missingProductImage: offers.filter((offer) => !offer.productImage).length,
      subscribers: subscribers.length,
      activeSubscribers: subscribers.filter((item) => item.status === "active").length,
      adminUsers: readAdminUsers().length,
    },
    recent: offers.slice(0, 8).map((offer) => ({
      id: offer.id,
      title: offer.title,
      brand: offer.brand,
      type: offer.type,
      visible: offer.visible !== false,
      createdAt: offer.createdAt,
      logo: offer.logo || "",
    })),
  };
}

function getDataStatus() {
  const rootSeedOffers = readJsonArrayFile(rootSeedOffersFile);
  const seedOffers = readJsonArrayFile(seedOffersFile);
  const bundledOffers = readJsonArrayFile(bundledOffersFile);
  const runtimeOffers = readJsonArrayFile(offersFile);
  return {
    ok: true,
    build: "embedded-seed-2026-07-09",
    rootSeedOffers: rootSeedOffers.length,
    seedOffers: seedOffers.length,
    bundledOffers: bundledOffers.length,
    runtimeOffers: runtimeOffers.length,
    returnedOffers: readOffers().length,
    usesCustomDataDir: Boolean(process.env.DATA_DIR),
  };
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
  res.writeHead(status, {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "X-Frame-Options": "SAMEORIGIN",
    ...headers,
  });
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
  return addAloCouponUtmToAffiliate(value);
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

function getPrettyBrandName(value) {
  const brand = cleanBrandName(value);
  if (!brand.includes(".")) {
    return brand;
  }

  return brand
    .replace(/\.(com|net|org|co|io|eu|shop|store|myshopify\.com)$/i, "")
    .split(/[.-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ") || brand;
}

function getOfferBrandName(offer) {
  const text = String(offer.review || offer.title || "");
  const atMatch = text.match(/\bat\s+([^()]+?)(?:\s+w\/code|\s+with\b|\s+coupon\b|\s+code\b|$)/i);
  if (atMatch?.[1]) {
    return atMatch[1].trim();
  }

  return getPrettyBrandName(offer.brand);
}

function isUsableCouponCode(code) {
  const normalized = String(code || "").trim().toUpperCase();
  return Boolean(normalized && !["DEAL", "NO CODE", "NO-CODE"].includes(normalized));
}

function getDisplayOfferTitle(offer) {
  const brand = getOfferBrandName(offer);
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

function readBody(req, maxBytes = 1_500_000) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > maxBytes) {
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

function isPrivateAddress(address) {
  const normalized = String(address || "").toLowerCase().replace(/^::ffff:/, "");
  if (net.isIPv4(normalized)) {
    const parts = normalized.split(".").map(Number);
    return parts[0] === 10 || parts[0] === 127 || parts[0] === 0 ||
      (parts[0] === 169 && parts[1] === 254) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) || parts[0] >= 224;
  }
  if (net.isIPv6(normalized)) {
    return normalized === "::1" || normalized === "::" || normalized.startsWith("fc") ||
      normalized.startsWith("fd") || normalized.startsWith("fe8") || normalized.startsWith("fe9") ||
      normalized.startsWith("fea") || normalized.startsWith("feb");
  }
  return true;
}

async function assertPublicUrl(value) {
  const url = new URL(String(value || ""));
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("Link must be a public http/https URL.");
  const hostname = url.hostname.toLowerCase();
  if (["localhost", "localhost.localdomain"].includes(hostname) || hostname.endsWith(".local")) throw new Error("Private links are not allowed.");
  const addresses = net.isIP(hostname) ? [{ address: hostname }] : await dns.lookup(hostname, { all: true });
  if (!addresses.length || addresses.some((item) => isPrivateAddress(item.address))) throw new Error("Private links are not allowed.");
  return url;
}

async function fetchPublicPage(value, redirectCount = 0) {
  const url = await assertPublicUrl(value);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AloCouponImportBot/1.0; +https://alocoupon.com)",
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
      },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (redirectCount >= 5) throw new Error("Too many redirects.");
      const location = response.headers.get("location");
      if (!location) throw new Error("Redirect did not include a destination.");
      return fetchPublicPage(new URL(location, url).href, redirectCount + 1);
    }
    if (!response.ok) throw new Error(`Website returned HTTP ${response.status}.`);
    const contentType = String(response.headers.get("content-type") || "").toLowerCase();
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) throw new Error("The link did not return a website page.");
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > 2_500_000) throw new Error("Website page is too large to scan.");
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > 2_500_000) throw new Error("Website page is too large to scan.");
    return { html: bytes.toString("utf8"), pageUrl: response.url || url.href };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchPublicImage(value, redirectCount = 0) {
  const url = await assertPublicUrl(value);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AloCouponImageBot/1.0; +https://alocoupon.com)",
        Accept: "image/avif,image/webp,image/png,image/jpeg,image/gif,image/*;q=0.8,*/*;q=0.2",
        Referer: new URL(value).origin + "/",
      },
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      if (redirectCount >= 5) throw new Error("Too many image redirects.");
      const location = response.headers.get("location");
      if (!location) throw new Error("Image redirect did not include a destination.");
      return fetchPublicImage(new URL(location, url).href, redirectCount + 1);
    }
    if (!response.ok) throw new Error(`Image returned HTTP ${response.status}.`);
    const contentType = String(response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
    const extensions = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/webp": "webp",
      "image/gif": "gif",
      "image/avif": "avif",
      "image/x-icon": "ico",
      "image/vnd.microsoft.icon": "ico",
    };
    const extension = extensions[contentType];
    if (!extension) throw new Error("Unsupported image type.");
    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > 5 * 1024 * 1024) throw new Error("Image is too large.");
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length || bytes.length > 5 * 1024 * 1024) throw new Error("Image is empty or too large.");
    return { bytes, extension };
  } finally {
    clearTimeout(timer);
  }
}

async function cacheExtractedImage(value, kind) {
  if (!value) return "";
  if (String(value).startsWith("/media/offer-assets/")) return String(value);
  const { bytes, extension } = await fetchPublicImage(value);
  ensureDataFile();
  const hash = crypto.createHash("sha256").update(bytes).digest("hex").slice(0, 24);
  const fileName = `${kind}-${hash}.${extension}`;
  const filePath = path.join(offerAssetsDir, fileName);
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, bytes);
  return `/media/offer-assets/${fileName}`;
}

function decodeImportedHtml(value) {
  return String(value || "").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#(?:39|x27);/gi, "'").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">");
}

function readImportedAttribute(tag, name) {
  const match = String(tag || "").match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return decodeImportedHtml(match?.[1] || match?.[2] || match?.[3] || "");
}

function resolveImportedImage(value, pageUrl) {
  if (!value || String(value).startsWith("data:")) return "";
  try {
    const url = new URL(String(value).replace(/^\/\//, "https://"), pageUrl);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function cleanImportedText(value, maxLength = 1200) {
  return decodeImportedHtml(String(value || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\\[nrt]/g, " ")
    .replace(/\s+/g, " ")
    .trim()).slice(0, maxLength);
}

function findImportedProduct(value) {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const product = findImportedProduct(item);
      if (product) return product;
    }
    return null;
  }
  const types = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
  if (types.some((type) => String(type || "").toLowerCase() === "product")) return value;
  for (const key of ["@graph", "mainEntity", "itemListElement"]) {
    const product = findImportedProduct(value[key]);
    if (product) return product;
  }
  return null;
}

function discoverStoreAssets(html, pageUrl) {
  const logos = [];
  const products = [];
  let sourceTitle = "";
  let sourceDescription = "";
  let sourcePrice = "";
  let sourceCurrency = "";
  const add = (collection, value) => {
    const resolved = resolveImportedImage(value, pageUrl);
    if (resolved && !collection.includes(resolved)) collection.push(resolved);
  };
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    const marker = (readImportedAttribute(tag, "property") || readImportedAttribute(tag, "name")).toLowerCase();
    if (["og:logo", "twitter:logo"].includes(marker)) add(logos, readImportedAttribute(tag, "content"));
    if (["og:image", "twitter:image", "twitter:image:src"].includes(marker)) add(products, readImportedAttribute(tag, "content"));
    if (!sourceTitle && ["og:title", "twitter:title"].includes(marker)) sourceTitle = cleanImportedText(readImportedAttribute(tag, "content"), 240);
    if (!sourceDescription && ["description", "og:description", "twitter:description"].includes(marker)) sourceDescription = cleanImportedText(readImportedAttribute(tag, "content"));
    if (!sourcePrice && ["product:price:amount", "og:price:amount"].includes(marker)) sourcePrice = cleanImportedText(readImportedAttribute(tag, "content"), 40);
    if (!sourceCurrency && ["product:price:currency", "og:price:currency"].includes(marker)) sourceCurrency = cleanImportedText(readImportedAttribute(tag, "content"), 12).toUpperCase();
  }
  for (const match of html.matchAll(/<(?:img|source)\b[^>]*>/gi)) {
    const tag = match[0];
    const marker = `${readImportedAttribute(tag, "class")} ${readImportedAttribute(tag, "id")} ${readImportedAttribute(tag, "alt")}`;
    const srcset = readImportedAttribute(tag, "data-srcset") || readImportedAttribute(tag, "srcset");
    const srcsetUrl = srcset ? srcset.split(",").at(-1)?.trim().split(/\s+/)[0] : "";
    const source = srcsetUrl || readImportedAttribute(tag, "data-src") || readImportedAttribute(tag, "src");
    if (/logo|site-brand|header-brand/i.test(marker) && !/payment|partner|client/i.test(marker)) add(logos, source);
    if (/product|product-card|collection-item|grid-product/i.test(marker) && !/logo|icon|placeholder/i.test(marker)) add(products, source);
  }
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    if (/icon/i.test(readImportedAttribute(tag, "rel"))) add(logos, readImportedAttribute(tag, "href"));
  }
  for (const pattern of [/"logo"\s*:\s*"([^"]+)"/gi, /"image"\s*:\s*"([^"]+)"/gi]) {
    for (const match of html.matchAll(pattern)) add(pattern.source.includes("logo") ? logos : products, match[1].replace(/\\\//g, "/"));
  }
  for (const match of html.matchAll(/<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const product = findImportedProduct(JSON.parse(decodeImportedHtml(match[1]).trim()));
      if (!product) continue;
      sourceTitle ||= cleanImportedText(product.name, 240);
      sourceDescription ||= cleanImportedText(product.description);
      const productImages = Array.isArray(product.image) ? product.image : [product.image];
      productImages.forEach((image) => add(products, typeof image === "object" ? image?.url : image));
      const offers = Array.isArray(product.offers) ? product.offers[0] : product.offers;
      sourcePrice ||= cleanImportedText(offers?.price || offers?.lowPrice, 40);
      sourceCurrency ||= cleanImportedText(offers?.priceCurrency, 12).toUpperCase();
    } catch {}
  }
  if (!sourceTitle) sourceTitle = cleanImportedText(html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1], 240);
  return {
    logo: logos[0] || "",
    productImage: products.find((url) => !/logo|favicon|icon|avatar|payment/i.test(url)) || "",
    sourceTitle,
    sourceDescription,
    sourcePrice,
    sourceCurrency,
  };
}

async function extractStoreAssets(value) {
  const { html, pageUrl } = await fetchPublicPage(value);
  const assets = discoverStoreAssets(html, pageUrl);
  const finalHost = new URL(pageUrl).hostname.toLowerCase().replace(/^www\./, "");
  const logoSource = assets.logo || `https://www.google.com/s2/favicons?domain=${encodeURIComponent(finalHost)}&sz=256`;
  let logo = "";
  let productImage = "";
  try { logo = await cacheExtractedImage(logoSource, "logo"); } catch {}
  try { productImage = await cacheExtractedImage(assets.productImage, "product"); } catch {}
  return {
    ...assets,
    logo,
    productImage,
    sourceUrl: pageUrl,
    host: finalHost,
  };
}

function createNewsletterToken(subscriberOrId, purpose) {
  const subscriber = typeof subscriberOrId === "object" ? subscriberOrId : readSubscribers().find((item) => item.id === subscriberOrId);
  const subscriberId = subscriber?.id || String(subscriberOrId || "");
  const version = purpose === "confirm" ? String(subscriber?.confirmVersion || "") : "";
  if (!subscriberId || (purpose === "confirm" && !version)) return "";
  const signature = crypto.createHmac("sha256", newsletterSecret).update(`${purpose}:${subscriberId}:${version}`).digest("base64url");
  return `${subscriberId}.${signature}`;
}

function getSubscriberFromToken(token, purpose) {
  const [subscriberId, providedSignature] = String(token || "").split(".");
  if (!subscriberId || !providedSignature) return null;
  const subscriber = readSubscribers().find((item) => item.id === subscriberId);
  if (!subscriber) return null;
  const version = purpose === "confirm" ? String(subscriber.confirmVersion || "") : "";
  if (purpose === "confirm" && !version) return null;
  const expectedSignature = crypto.createHmac("sha256", newsletterSecret).update(`${purpose}:${subscriberId}:${version}`).digest("base64url");
  const expected = Buffer.from(expectedSignature);
  const provided = Buffer.from(providedSignature);
  if (expected.length !== provided.length || !crypto.timingSafeEqual(expected, provided)) return null;
  return subscriber;
}

function getNewsletterRequestKey(req) {
  return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown").split(",")[0].trim();
}

function enforceNewsletterRateLimit(req) {
  const key = getNewsletterRequestKey(req);
  const now = Date.now();
  const recent = (newsletterRateLimits.get(key) || []).filter((time) => now - time < 60 * 60 * 1000);
  if (recent.length >= 5) throw new Error("Too many signup attempts. Please try again later.");
  recent.push(now);
  newsletterRateLimits.set(key, recent);
}

async function sendNewsletterEmail({ to, subject, html, text, headers = {}, idempotencyKey }) {
  if (!resendApiKey || !resendFromEmail) return { sent: false, reason: "not_configured" };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey.slice(0, 256) } : {}),
    },
    body: JSON.stringify({ from: resendFromEmail, to: [to], subject, html, text, headers }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || result.name || "Email provider rejected the message.");
  return { sent: true, id: result.id || "" };
}

function getAbsoluteAssetUrl(value) {
  const source = String(value || "").trim();
  if (/^https?:\/\//i.test(source) || source.startsWith("data:")) return source;
  return source.startsWith("/") ? `${siteUrl}${source}` : "";
}

function newsletterEmailShell(content, unsubscribeUrl = "") {
  const footer = unsubscribeUrl
    ? `<p style="margin:24px 0 0;color:#7a8995;font-size:12px;line-height:1.6">You received this because you subscribed to AloCoupon deal alerts. <a href="${escapeHtml(unsubscribeUrl)}" style="color:#087dbd">Unsubscribe</a>.</p>`
    : `<p style="margin:24px 0 0;color:#7a8995;font-size:12px;line-height:1.6">AloCoupon only sends requested deal alerts.</p>`;
  return `<!doctype html><html><body style="margin:0;background:#f4f7f9;font-family:Arial,sans-serif;color:#15364d"><div style="max-width:620px;margin:0 auto;padding:28px 16px"><div style="background:#fff;border:1px solid #e1e8ed;border-radius:18px;padding:28px"><a href="${escapeHtml(siteUrl)}" style="color:#11334b;font-size:24px;font-weight:900;text-decoration:none">Alo<span style="color:#0a9b67">Coupon</span></a>${content}${footer}</div></div></body></html>`;
}

async function sendNewsletterConfirmation(subscriber) {
  const confirmUrl = `${siteUrl}/newsletter/confirm?token=${encodeURIComponent(createNewsletterToken(subscriber, "confirm"))}`;
  const content = `<p style="margin:26px 0 8px;color:#0a9b67;font-size:12px;font-weight:800;text-transform:uppercase">Confirm your subscription</p><h1 style="margin:0 0 12px;font-size:30px;line-height:1.2">Get verified deals in your inbox</h1><p style="color:#607483;line-height:1.7">Click below to confirm that you want to receive new coupon codes and affiliate deals from AloCoupon.</p><p style="margin:24px 0"><a href="${escapeHtml(confirmUrl)}" style="display:inline-block;background:#0a9b67;color:#fff;border-radius:10px;padding:13px 20px;font-weight:800;text-decoration:none">Confirm subscription</a></p>`;
  const result = await sendNewsletterEmail({
    to: subscriber.email,
    subject: "Confirm your AloCoupon deal alerts",
    html: newsletterEmailShell(content),
    text: `Confirm your AloCoupon deal alerts: ${confirmUrl}`,
    idempotencyKey: `newsletter-confirm-${subscriber.id}-${Date.now().toString(36)}`,
  });
  return { ...result, confirmUrl };
}

function buildDealAlertContent(offers) {
  const cards = offers.slice(0, 8).map((offer) => {
    const title = escapeHtml(getDisplayOfferTitle(offer));
    const summary = escapeHtml(getOfferSummary(offer));
    const discount = escapeHtml(offer.discount || "New deal");
    const brand = escapeHtml(getOfferBrandName(offer));
    const code = isUsableCouponCode(offer.code) ? escapeHtml(offer.code) : "No code needed";
    const link = escapeHtml(getAloCouponTrackingUrl(offer.link));
    const logo = getAbsoluteAssetUrl(offer.logo);
    return `<div style="margin-top:16px;border:1px solid #e2e8ee;border-radius:14px;padding:18px"><div style="display:flex;gap:12px;align-items:center">${logo ? `<img src="${escapeHtml(logo)}" alt="" width="54" height="54" style="object-fit:contain;border:1px solid #e2e8ee;border-radius:10px;padding:4px" />` : ""}<div><p style="margin:0 0 4px;color:#0a9b67;font-size:12px;font-weight:800">${brand} · ${discount}</p><h2 style="margin:0;font-size:18px;line-height:1.35">${title}</h2></div></div><p style="color:#667786;font-size:14px;line-height:1.6">${summary}</p><p style="margin:14px 0"><span style="background:#f6f9fa;border:1px dashed #aab9c3;border-radius:8px;padding:8px 10px;font-weight:800">${code}</span></p><a href="${link}" style="display:inline-block;background:#0a9b67;color:#fff;border-radius:9px;padding:11px 17px;font-weight:800;text-decoration:none">View deal →</a></div>`;
  }).join("");
  return `<p style="margin:26px 0 8px;color:#0a9b67;font-size:12px;font-weight:800;text-transform:uppercase">New verified offers</p><h1 style="margin:0 0 10px;font-size:30px">Fresh deals just landed</h1><p style="color:#607483;line-height:1.7">Here are the newest AloCoupon offers selected for you.</p>${cards}`;
}

async function notifySubscribersOfOffers(offers) {
  const visibleOffers = offers.filter((offer) => offer && offer.visible !== false);
  if (!visibleOffers.length || !resendApiKey || !resendFromEmail) return { sent: 0, skipped: true };
  const subscribers = readSubscribers().filter((subscriber) => subscriber.status === "active");
  let sent = 0;
  for (const subscriber of subscribers) {
    const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?token=${encodeURIComponent(createNewsletterToken(subscriber.id, "unsubscribe"))}`;
    try {
      await sendNewsletterEmail({
        to: subscriber.email,
        subject: visibleOffers.length === 1 ? `${getOfferBrandName(visibleOffers[0])}: ${visibleOffers[0].discount || "New deal"}` : `${visibleOffers.length} new verified deals from AloCoupon`,
        html: newsletterEmailShell(buildDealAlertContent(visibleOffers), unsubscribeUrl),
        text: visibleOffers.map((offer) => `${getDisplayOfferTitle(offer)}\n${getAloCouponTrackingUrl(offer.link)}`).join("\n\n") + `\n\nUnsubscribe: ${unsubscribeUrl}`,
        headers: { "List-Unsubscribe": `<${unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
        idempotencyKey: `deal-alert-${subscriber.id}-${visibleOffers.map((offer) => offer.id).join("-")}`,
      });
      sent += 1;
      subscriber.lastNotifiedAt = new Date().toISOString();
    } catch (error) {
      console.error(`Newsletter delivery failed for subscriber ${subscriber.id}: ${error.message}`);
    }
  }
  if (subscribers.length) writeSubscribers(readSubscribers().map((current) => subscribers.find((item) => item.id === current.id) || current));
  return { sent, skipped: false };
}

function newsletterStatusPage(title, message, success = true) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)} | AloCoupon</title></head><body style="margin:0;background:#f4f7f9;font-family:Arial,sans-serif;color:#15364d"><main style="max-width:560px;margin:10vh auto;padding:20px"><section style="background:#fff;border:1px solid #e1e8ed;border-radius:18px;padding:34px;text-align:center"><div style="font-size:40px">${success ? "✓" : "!"}</div><h1>${escapeHtml(title)}</h1><p style="color:#667786;line-height:1.7">${escapeHtml(message)}</p><a href="/" style="display:inline-block;margin-top:12px;background:#0a9b67;color:#fff;border-radius:10px;padding:12px 18px;font-weight:800;text-decoration:none">Back to AloCoupon</a></section></main></body></html>`;
}

const allowedProjectExtensions = new Set([
  ".zip", ".rar", ".7z", ".tar", ".gz", ".js", ".jsx", ".ts", ".tsx",
  ".html", ".css", ".json", ".md", ".txt", ".py", ".java", ".php", ".sql",
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".pdf",
]);

function createProjectId() {
  return `project_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}`;
}

function sanitizeProjectUpload(input) {
  const name = String(input.name || "").trim();
  const description = String(input.description || "").trim();
  const version = String(input.version || "").trim();
  const projectType = String(input.projectType || "other").trim().toLowerCase();
  const originalFileName = path.basename(String(input.fileName || "").trim());
  const extension = path.extname(originalFileName).toLowerCase();
  const match = String(input.fileData || "").match(/^data:([^;,]+)?;base64,([a-z0-9+/]+={0,2})$/i);

  if (!name) throw new Error("Project name is required.");
  if (!description) throw new Error("Project description is required.");
  if (!originalFileName || !allowedProjectExtensions.has(extension)) {
    throw new Error("Choose a supported source-code or archive file.");
  }
  if (!match) throw new Error("The selected file could not be read.");

  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > 8 * 1024 * 1024) {
    throw new Error("Project file must be 8 MB or smaller.");
  }

  const id = createProjectId();
  const storedFileName = `${id}${extension}`;
  return {
    project: {
      id,
      name: name.slice(0, 120),
      description: description.slice(0, 2000),
      version: version.slice(0, 40),
      projectType: ["website", "application", "template", "library", "image", "document", "other"].includes(projectType) ? projectType : "other",
      fileName: originalFileName.slice(0, 180),
      storedFileName,
      size: buffer.length,
      createdAt: new Date().toISOString(),
    },
    buffer,
  };
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

function getOfferStoreSlug(offerOrBrand) {
  const brand = typeof offerOrBrand === "string" ? offerOrBrand : getOfferBrandName(offerOrBrand);
  return slugify(brand) || "store";
}

function getOfferStorePath(offerOrBrand) {
  return `/store/${getOfferStoreSlug(offerOrBrand)}`;
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
  const storeGroups = groupOffersByBrand(offers);
  const urls = [
    sitemapUrl("/", Date.now(), "1.0"),
    ...Array.from(storeGroups.values()).map((group) => sitemapUrl(getOfferStorePath(group.brand), group.items[0]?.createdAt || Date.now(), "0.85")),
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
  const validThrough = getValidOfferExpiry(offer) || undefined;

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
          "name": getOfferBrandName(offer),
        },
      },
    ],
  };
}

function groupOffersByBrand(items) {
  return normalizeOffers(items).reduce((groups, offer) => {
    const brand = getOfferBrandName(offer);
    const key = getOfferStoreSlug(brand);
    if (!groups.has(key)) {
      groups.set(key, { brand, items: [] });
    }
    groups.get(key).items.push(offer);
    return groups;
  }, new Map());
}

function findStoreGroupBySlug(slug) {
  const normalizedSlug = slugify(slug);
  const store = readStores().find((item) => item.slug === normalizedSlug && item.approved) || null;
  const offers = readOffers();
  const groups = groupOffersByBrand(offers);
  const storeItems = store ? offers.filter((offer) => String(offer.brand || '').trim().toLowerCase() === String(store.sourceBrand || store.name).trim().toLowerCase()) : [];
  const group = storeItems.length ? { brand: store.name, items: storeItems } : groups.get(normalizedSlug);
  if (group) group.store = store;
  return group;
}

function getValidOfferExpiry(offer) {
  const value = String(offer.expiryDate || offer.expiresAt || offer.expiry || "").trim();
  if (!value || /limited|ongoing|unknown|n\/a|no expir/i.test(value)) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function getStoreCategoryProfile(group) {
  const categories = group.items
    .map((offer) => String(offer.category || "").trim())
    .filter((category) => category && !/^other$/i.test(category));
  if (categories.length) {
    const counts = categories.reduce((result, category) => result.set(category, (result.get(category) || 0) + 1), new Map());
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }
  const corpus = group.items.map((offer) => `${offer.sourceTitle || ""} ${offer.title || ""} ${offer.sourceDescription || ""} ${offer.review || ""}`).join(" ").toLowerCase();
  const inferredCategories = [
    ["Beauty & Personal Care", /beauty|hair|skin|cosmetic|fragrance|shampoo|salon/],
    ["Fashion & Accessories", /fashion|apparel|clothing|shirt|dress|shoe|bag|backpack|jewelry/],
    ["Electronics & Technology", /monitor|drone|camera|electronic|laptop|display|thermo|temperature|sensor/],
    ["Health & Wellness", /health|fitness|supplement|protein|vitamin|wellness|workout/],
    ["Home & Garden", /garden|home|furniture|paint|kitchen|wine|fridge|refrigerator/],
    ["Pets", /pet|reptile|dog|cat|animal/],
    ["Collectibles & General Merchandise", /funko|collectible|clearance|liquidacion|storewide/],
    ["Software & Online Services", /software|saas|hosting|subscription|plugin|app/],
  ];
  return inferredCategories.find(([, pattern]) => pattern.test(corpus))?.[0] || "Online Retail";
}

function getStoreOfferDescription(offer, brand) {
  const couponCode = isUsableCouponCode(offer.code) ? String(offer.code).trim() : '';
  let source = String(offer.sourceDescription || offer.review || offer.title || "").replace(/\s+/g, " ").trim();
  if (couponCode) {
    const escapedCode = couponCode.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    source = source.replace(new RegExp(`\\b(?:coupon\\s+)?code\\s*[:#-]?\\s*${escapedCode}(?=$|[^a-z0-9])`, 'gi'), 'the coupon');
    if (couponCode.length >= 4 && /[a-z]/i.test(couponCode)) {
      source = source.replace(new RegExp(`(^|[^a-z0-9])${escapedCode}(?=$|[^a-z0-9])`, 'gi'), '$1the coupon');
    }
    source = source.replace(/\bthe coupon\s+the coupon\b/gi, 'the coupon').replace(/\s+/g, ' ').trim();
  }
  const discount = String(offer.discount || "a current promotion").trim();
  const category = String(offer.category || "").trim();
  const expiry = getValidOfferExpiry(offer);
  const details = [
    source,
    couponCode ? `Apply the coupon at checkout for the listed ${discount} promotion.` : `No coupon code is listed; open the deal to check how the ${discount} promotion is applied.`,
    category && !/^other$/i.test(category) ? `This offer is filed under ${category}.` : "",
    expiry ? `The supplied expiration date is ${new Date(expiry).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.` : `The source record does not provide a confirmed expiration date, so check the terms on ${brand}'s website before ordering.`,
  ].filter(Boolean);
  return [...new Set(details)].join(" ");
}

function getStoreFaq(group) {
  const brand = group.brand;
  const codeCount = group.items.filter((offer) => isUsableCouponCode(offer.code)).length;
  const dealCount = group.items.length - codeCount;
  const datedOffers = group.items.filter(getValidOfferExpiry).length;
  return [
    {
      question: `How do I use a ${brand} coupon code?`,
      answer: codeCount
        ? `Choose one of the ${codeCount} coupon codes currently listed for ${brand}, select Get Code, and copy it. Continue to the original website, add eligible items to the cart, and paste the code into the promo-code field at checkout. Confirm that the discount appears before paying.`
        : `${brand} currently has no coupon code in the AloCoupon source records. Use one of the ${dealCount} code-free deals instead, and verify the advertised price or automatic discount on the original website before paying.`,
    },
    {
      question: `Does ${brand} have verified coupon codes and deals?`,
      answer: `AloCoupon currently lists ${codeCount} coupon ${codeCount === 1 ? "code" : "codes"} and ${dealCount} online ${dealCount === 1 ? "deal" : "deals"} for ${brand}. Each entry links to its original destination and keeps the source title or the original API description so shoppers can verify the scope and terms.`,
    },
    {
      question: `Why is my ${brand} coupon code not working?`,
      answer: `The code may be limited to selected products, require a minimum order, exclude sale items, or have expired. Check spelling and capitalization, confirm the cart meets the offer terms, and try another listed offer. ${datedOffers ? `${datedOffers} offers include a supplied expiration date.` : "The current source records do not include confirmed expiration dates, so the merchant checkout page is the final source of validity."}`,
    },
    {
      question: `Do ${brand} deals require a promo code?`,
      answer: dealCount
        ? `${dealCount} current ${brand} ${dealCount === 1 ? "deal is" : "deals are"} listed without a coupon code. For these offers, select Get Deal and verify the sale price or automatic discount on the original website before completing the purchase.`
        : `All current ${brand} offers in the AloCoupon source records use coupon codes. Select Get Code, copy the code, and confirm that checkout accepts it before completing the purchase.`,
    },
  ];
}

function getStoreRating(group) {
  const source = group.items.find((offer) => Number(offer.ratingValue) > 0 && Number(offer.ratingCount) > 0);
  if (!source) return null;
  return {
    value: Math.min(5, Math.max(1, Number(source.ratingValue))),
    count: Math.max(1, Math.floor(Number(source.ratingCount))),
  };
}

function getRelatedStoreGroups(group, limit = 6) {
  const category = getStoreCategoryProfile(group);
  return [...groupOffersByBrand(readOffers()).values()]
    .filter((candidate) => getOfferStoreSlug(candidate.brand) !== getOfferStoreSlug(group.brand))
    .map((candidate) => ({ candidate, sameCategory: getStoreCategoryProfile(candidate) === category }))
    .sort((a, b) => Number(b.sameCategory) - Number(a.sameCategory) || b.candidate.items.length - a.candidate.items.length)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

function storeStructuredData(group) {
  const storePath = getOfferStorePath(group.brand);
  const storeUrl = getAbsoluteUrl(storePath);
  const title = `${group.brand} Coupons and Promo Codes`;
  const category = getStoreCategoryProfile(group);
  const description = `Compare verified ${group.brand} coupon codes and ${category.toLowerCase()} deals, with source-linked offer details, eligibility notes, and expiration information when supplied.`;
  const faqs = getStoreFaq(group);
  const rating = getStoreRating(group);

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
        "@id": `${storeUrl}#breadcrumb`,
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
            "name": "Stores",
            "item": getAbsoluteUrl("/#stores"),
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": group.brand,
            "item": storeUrl,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": `${storeUrl}#store`,
        "name": title,
        "description": description,
        "url": storeUrl,
        "about": category,
        "keywords": `${group.brand} coupons, ${group.brand} promo codes, ${group.brand} deals, ${category} discounts`,
        ...(rating ? {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": rating.value,
            "ratingCount": rating.count,
            "bestRating": 5,
            "worstRating": 1,
          },
        } : {}),
        "isPartOf": {
          "@id": `${siteUrl}/#website`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${storeUrl}#offers`,
        "itemListElement": group.items.map((offer, index) => {
          const validThrough = getValidOfferExpiry(offer);
          return {
            "@type": "ListItem",
            "position": index + 1,
            "item": {
              "@type": "Offer",
              "url": getAbsoluteUrl(getOfferDealPath(offer)),
              "name": String(offer.sourceTitle || offer.title || getDisplayOfferTitle(offer)).trim(),
              "description": getStoreOfferDescription(offer, group.brand),
              "category": String(offer.category && !/^other$/i.test(offer.category) ? offer.category : category),
              ...(validThrough ? { "validThrough": validThrough } : {}),
              "seller": { "@type": "Organization", "name": group.brand },
            },
          };
        }),
      },
      {
        "@type": "FAQPage",
        "@id": `${storeUrl}#faq`,
        "mainEntity": faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": { "@type": "Answer", "text": faq.answer },
        })),
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

function sanitizeOfferImage(value, label = "Image", maxBytes = 800 * 1024) {
  const image = String(value || "").trim();
  if (!image) return "";
  if (/^\/assets\/(?:brand-logos|product-images|brand-landings)\/[a-z0-9._-]+$/i.test(image)) return image;
  if (/^\/media\/offer-assets\/(?:logo|product)-[a-f0-9]{24}\.(?:png|jpe?g|webp|gif|avif|ico)$/i.test(image)) return image;
  try {
    const url = new URL(image);
    if (url.protocol === "https:" && !url.username && !url.password) return url.href;
  } catch {}
  const match = image.match(/^data:image\/(png|jpeg|webp|gif);base64,([a-z0-9+/]+={0,2})$/i);
  if (!match) throw new Error(`${label} must be an HTTPS URL or a PNG, JPG, WEBP, or GIF image.`);
  const byteLength = Buffer.from(match[2], "base64").length;
  if (!byteLength || byteLength > maxBytes) throw new Error(`${label} must be ${Math.round(maxBytes / 1024)} KB or smaller.`);
  return `data:image/${match[1].toLowerCase()};base64,${match[2]}`;
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
    expiryDate: String(input.expiryDate || input.expiresAt || "").trim().slice(0, 80),
    review: String(input.review || "").trim(),
    logo: sanitizeOfferImage(input.logo, "Logo"),
    productImage: sanitizeOfferImage(input.productImage, "Product image", 1_500 * 1024),
    slug: slugify(input.slug || input.title),
    order: Number.isFinite(Number(input.order)) ? Number(input.order) : 9999999,
    visible: input.visible !== false && String(input.visible).toLowerCase() !== "false",
    metaTitle: String(input.metaTitle || input.title || "").trim().slice(0, 180),
    sourceTitle: String(input.sourceTitle || "").trim().slice(0, 240),
    sourceDescription: String(input.sourceDescription || "").trim().slice(0, 1200),
    sourcePrice: String(input.sourcePrice || "").trim().slice(0, 40),
    sourceCurrency: String(input.sourceCurrency || "").trim().toUpperCase().slice(0, 12),
    sourceUrl: String(input.sourceUrl || input.assetSourceUrl || "").trim().slice(0, 2000),
    ratingValue: Number(input.ratingValue) > 0 ? Math.min(5, Math.max(1, Number(input.ratingValue))) : 0,
    ratingCount: Number(input.ratingCount) > 0 ? Math.floor(Number(input.ratingCount)) : 0,
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

  if (!offer.logo) {
    const extractedLogo = readBrandLogoManifest()[getOfferLogoHost(offer)];
    if (extractedLogo) offer.logo = extractedLogo;
  }

  for (const field of ["brand", "title", "discount", "category", "review"]) {
    if (!offer[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
  if (!offer.logo) {
    throw new Error("A logo is required for every deal.");
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
  <link rel="stylesheet" href="/styles.css?v=20260719-storecms" />
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
  <link rel="stylesheet" href="/styles.css?v=20260719-storecms" />
</head>
<body class="admin-mode">
  <div class="admin-cms-shell">
    <aside class="cms-sidebar" id="cms-sidebar">
      <a class="cms-brand" href="#dashboard"><span class="cms-brand-mark">A</span><strong>AloCoupon CMS</strong></a>
      <p class="cms-menu-label">QUẢN LÝ NỘI DUNG</p>
      <nav class="cms-nav" aria-label="Admin navigation">
        <button class="cms-nav-item is-active" type="button" data-admin-target="dashboard"><span>⌂</span> Tổng quan</button>
        <button class="cms-nav-item" type="button" data-admin-target="categories"><span>▦</span> Quản lý danh mục</button>
        <button class="cms-nav-item cms-parent-item" id="coupon-menu-toggle" type="button" aria-expanded="true"><span>◆</span> Quản lý coupon <b>⌄</b></button>
        <div class="cms-subnav" id="coupon-subnav">
          <button type="button" data-admin-target="store-list"><span>›</span> Store <em id="nav-store-count">0</em></button>
          <button type="button" data-admin-target="offer-list"><span>›</span> Offer <em id="nav-offer-count">0</em></button>
          <button type="button" data-admin-target="deal-list"><span>›</span> Deal <em id="nav-deal-count">0</em></button>
          <button type="button" data-admin-target="bulk-offer-import"><span>⇧</span> Upload Deal & Coupon</button>
        </div>
        <button class="cms-nav-item" type="button" data-admin-target="news"><span>▤</span> Bài viết / Post <em id="nav-post-count">0</em></button>
        <button class="cms-nav-item" type="button" data-admin-target="content"><span>□</span> Trang / Page</button>
        <button class="cms-nav-item" type="button" data-admin-target="widgets"><span>▧</span> Widget</button>
        <button class="cms-nav-item" type="button" data-admin-target="menu"><span>☰</span> Menu</button>
      </nav>
      <p class="cms-menu-label cms-system-label">HỆ THỐNG</p>
      <nav class="cms-nav cms-system-nav" aria-label="System navigation">
        <button class="cms-nav-item" type="button" data-admin-target="projects"><span>▣</span> Media / File</button>
        <button class="cms-nav-item" type="button" data-admin-target="users"><span>♙</span> User quản trị</button>
        <button class="cms-nav-item" type="button" data-admin-target="subscribers"><span>✉</span> Member / Subscriber <em id="nav-member-count">0</em></button>
        <button class="cms-nav-item cms-parent-item" id="settings-menu-toggle" type="button" aria-expanded="true"><span>⚙</span> Quản lý cấu hình <b>⌄</b></button>
        <div class="cms-subnav" id="settings-subnav">
          <button type="button" data-admin-target="settings-general"><span>›</span> Cấu hình chung</button>
          <button type="button" data-admin-target="settings-author"><span>›</span> Cấu hình tác giả</button>
          <button type="button" data-admin-target="settings-feedback"><span>›</span> Cấu hình phản hồi</button>
          <button type="button" data-admin-target="settings-social"><span>›</span> Cấu hình mạng xã hội</button>
          <button type="button" data-admin-target="settings-seo"><span>›</span> Cấu hình SEO</button>
          <button type="button" data-admin-target="settings-content"><span>›</span> Cấu hình nội dung</button>
          <button type="button" data-admin-target="settings-ads"><span>›</span> Cấu hình Ads</button>
        </div>
      </nav>
      <div class="cms-user-card"><span class="cms-user-avatar">${escapeHtml(adminEmail).slice(0, 1).toUpperCase()}</span><span><strong>Administrator</strong><small>${escapeHtml(adminEmail)}</small></span></div>
    </aside>
    <div class="cms-workspace">
      <header class="cms-topbar">
        <button class="cms-menu-toggle" id="cms-menu-toggle" type="button" aria-label="Toggle menu">☰</button>
        <nav><button type="button" data-admin-target="dashboard">Home</button><button type="button" data-admin-target="bulk-offer-import">Nhập dữ liệu</button></nav>
        <form class="cms-global-search" id="cms-global-search"><span>⌕</span><input id="cms-global-search-input" type="search" placeholder="Tìm Store, Offer, Deal, mã coupon..." /><kbd>Enter</kbd></form>
        <div class="cms-top-actions"><a href="/" target="_blank">◉ Xem website</a><span>🔔</span><button id="top-logout-btn" type="button">Đăng xuất</button></div>
      </header>
      <main class="cms-main">
        <section class="cms-panel is-active" data-admin-panel="dashboard">
          <div class="cms-page-heading"><div><h1>Dashboard AloCoupon</h1><p>Theo dõi dữ liệu, chất lượng hình ảnh và trạng thái newsletter tại một nơi.</p></div><div class="cms-breadcrumb"><strong>Tổng quan</strong></div></div>
          <div class="admin-dashboard-cards" id="admin-dashboard-cards"><div class="admin-dashboard-loading">Đang tải số liệu...</div></div>
          <section class="cms-data-architecture">
            <div class="cms-data-architecture-head"><div><span class="cms-kicker">CẤU TRÚC DỮ LIỆU CMS</span><h2>Quản trị theo từng thực thể</h2><p>Cấu trúc được ánh xạ theo hệ thống mẫu: Category, Store, Offer, Deal, Post, Page, Widget, Menu, Member và Settings.</p></div><button class="cms-btn cms-btn-dark" data-admin-target="bulk-offer-import" type="button">Nhập dữ liệu</button></div>
            <div class="cms-entity-flow">
              <button class="cms-entity-card entity-category" type="button" data-admin-target="categories"><span><i>▦</i> Category</span><strong id="entity-category-count">0</strong><small>Phân loại nội dung</small></button>
              <i class="cms-flow-arrow">→</i>
              <button class="cms-entity-card entity-store" type="button" data-admin-target="store-list"><span><i>◆</i> Store</span><strong id="entity-store-count">0</strong><small>Thương hiệu / cửa hàng</small></button>
              <i class="cms-flow-arrow">→</i>
              <div class="cms-entity-split"><button class="cms-entity-card entity-offer" type="button" data-admin-target="offer-list"><span><i>％</i> Offer</span><strong id="entity-offer-count">0</strong><small>Coupon có mã</small></button><button class="cms-entity-card entity-deal" type="button" data-admin-target="deal-list"><span><i>↘</i> Deal</span><strong id="entity-deal-count">0</strong><small>Khuyến mãi không mã</small></button></div>
            </div>
            <div class="cms-entity-secondary"><button type="button" data-admin-target="news"><b>Post</b><span>Nội dung từ API</span></button><button type="button" data-admin-target="content"><b>Page</b><span>Trang tĩnh</span></button><button type="button" data-admin-target="widgets"><b>Widget</b><span>Khối hiển thị</span></button><button type="button" data-admin-target="menu"><b>Menu</b><span>Điều hướng</span></button><button type="button" data-admin-target="subscribers"><b>Member</b><span>Subscriber</span></button><button type="button" data-admin-target="settings-general"><b>Settings</b><span>Cấu hình site</span></button></div>
          </section>
          <div class="admin-dashboard-grid">
            <section class="admin-dashboard-block"><div class="admin-dashboard-block-head"><div><h2>Chất lượng dữ liệu</h2><p>Tìm và sửa nhanh các offer thiếu ảnh.</p></div><button class="cms-btn cms-btn-info" id="refresh-offer-assets-btn" type="button">Tối ưu ảnh (tối đa 40)</button></div><div id="admin-quality-summary"></div></section>
            <section class="admin-dashboard-block"><div class="admin-dashboard-block-head"><div><h2>Thao tác nhanh</h2><p>Các công việc quản trị thường dùng.</p></div></div><div class="admin-quick-actions"><button data-admin-target="bulk-offer-import" type="button">⇧ Nhập Deal/Coupon</button><button data-admin-target="deal-create" type="button">＋ Tạo Deal</button><button data-admin-target="offer-list" type="button">◆ Quản lý Coupon</button><button data-admin-target="subscribers" type="button">✉ Subscribers</button></div></section>
          </div>
          <section class="admin-dashboard-block"><div class="admin-dashboard-block-head"><div><h2>Dữ liệu mới nhất</h2><p>8 Deal/Coupon được cập nhật gần đây.</p></div><button class="cms-btn cms-btn-dark" id="reload-dashboard-btn" type="button">↻ Làm mới</button></div><div class="category-table-wrap"><table class="category-table"><thead><tr><th>Ảnh</th><th>Tiêu đề</th><th>Store</th><th>Loại</th><th>Trạng thái</th><th>Ngày tạo</th></tr></thead><tbody id="admin-dashboard-recent"></tbody></table></div></section>
        </section>

        <section class="cms-panel" data-admin-panel="categories" hidden>
          <div class="cms-page-heading"><div><h1>Quản lý danh mục</h1><p>Quản lý cấu trúc danh mục bài viết và nội dung hiển thị trên website.</p></div><div class="cms-breadcrumb"><button data-admin-target="categories">Home</button><span>/</span><strong>Danh mục</strong></div></div>
          <div class="category-toolbar">
            <div class="category-search"><input id="category-search" type="search" placeholder="Tìm kiếm" /><select id="category-kind"><option value="all">Tất cả</option><option value="Posts">Posts</option><option value="Coupon">Coupon</option></select><button class="cms-btn cms-btn-primary" id="category-search-btn" type="button">Tìm kiếm</button></div>
            <div class="category-actions"><button class="cms-btn cms-btn-primary" id="save-categories-btn" type="button">▣ Cập nhật</button><button class="cms-btn cms-btn-info" id="export-categories-btn" type="button">▧ Export</button><button class="cms-btn cms-btn-info" id="add-category-btn" type="button">⊕ Thêm mới</button><button class="cms-btn cms-btn-danger" id="delete-categories-btn" type="button">▰ Xóa <span id="selected-category-count">0</span></button><button class="cms-btn cms-btn-dark" id="reset-categories-btn" type="button">↶ Cancel</button></div>
          </div>
          <div class="category-table-wrap">
            <table class="category-table">
              <thead><tr><th class="row-number"></th><th class="check-cell"><input id="select-all-categories" type="checkbox" /></th><th>Name</th><th>Hiển thị</th><th>Hiển thị trang chủ</th><th>STT</th><th>Ngày đăng</th><th class="row-actions"></th></tr></thead>
              <tbody id="category-table-body"></tbody>
            </table>
          </div>
        </section>

        <section class="cms-panel" data-admin-panel="news" hidden>
          <div class="cms-page-heading"><div><h1>Quản lý tin tức</h1><p>Tạo và quản lý các bài viết, tin tức trên AloCoupon.</p></div><div class="cms-breadcrumb"><button data-admin-target="categories">Home</button><span>/</span><strong>Tin tức</strong></div></div>
          <div class="category-toolbar"><div class="category-search"><input id="news-list-search" type="search" placeholder="Tìm theo tiêu đề hoặc store" /><button class="cms-btn cms-btn-primary" id="news-list-search-btn" type="button">Tìm kiếm</button></div><div class="category-actions"><button class="cms-btn cms-btn-info" data-admin-target="offers" type="button">⊕ Thêm nội dung từ API</button></div></div>
          <div class="cms-source-note">Nguồn dữ liệu: <strong>/api/offers</strong> của AloCoupon — không sử dụng bài viết từ TeelaCodes.</div>
          <div class="category-table-wrap"><table class="category-table"><thead><tr><th>#</th><th>Tiêu đề</th><th>Store</th><th>Danh mục</th><th>Loại</th><th>Ngày đăng</th><th></th></tr></thead><tbody id="news-list-body"></tbody></table></div>
        </section>

        <section class="cms-panel" data-admin-panel="content" hidden>
          <div class="cms-page-heading"><div><h1>Trang nội dung</h1><p>Quản lý các trang giới thiệu, chính sách và nội dung tĩnh.</p></div><div class="cms-breadcrumb"><button data-admin-target="categories">Home</button><span>/</span><strong>Trang nội dung</strong></div></div>
          <div class="cms-source-note">Các trang dưới đây ánh xạ trực tiếp tới cấu hình website AloCoupon hiện tại.</div>
          <div class="category-table-wrap"><table class="category-table"><thead><tr><th>#</th><th>Trang / khu vực</th><th>Trường dữ liệu</th><th>Nội dung hiện tại</th><th>Trạng thái</th><th></th></tr></thead><tbody id="content-page-list"></tbody></table></div>
        </section>

        <section class="cms-panel coupon-manager-panel" data-admin-panel="store-list" hidden>
          <div class="cms-page-heading"><div><h1>Quản lý store</h1><p>Danh sách cửa hàng được tổng hợp từ dữ liệu coupon đã upload.</p></div><div class="cms-breadcrumb"><button data-admin-target="categories">Home</button><span>/</span><strong>Store</strong></div></div>
          <div class="category-toolbar"><div class="category-search"><input id="store-list-search" type="search" placeholder="Tìm kiếm" /><select id="store-list-status"><option value="all">Tất cả trạng thái</option><option value="visible">Hiển thị</option></select><button class="cms-btn cms-btn-primary coupon-search-btn" data-list="store" type="button">Tìm kiếm</button></div><div class="category-actions"><button class="cms-btn cms-btn-primary" id="refresh-store-list-btn" type="button">↻ Làm mới</button><button class="cms-btn cms-btn-info create-coupon-btn" data-create-type="code" type="button">⊕ Thêm mới</button><button class="cms-btn cms-btn-dark" data-admin-target="dashboard" type="button">↶ Dashboard</button></div></div>
          <div class="category-table-wrap"><table class="category-table coupon-data-table"><thead><tr><th class="row-number"></th><th class="check-cell"><input type="checkbox" data-select-all="store" /></th><th>Store</th><th>Logo</th><th>Danh mục</th><th>Coupon</th><th>Deal</th><th>Dữ liệu nguồn</th><th>Cập nhật</th><th class="row-actions"></th></tr></thead><tbody id="store-list-body"></tbody></table></div>
        </section>

        <section class="cms-panel cms-create-panel cms-store-editor-panel" data-admin-panel="store-edit" hidden>
          <div class="cms-page-heading cms-create-heading">
            <div><h1 id="store-editor-title">Thêm mới store</h1><p>Quản lý Store độc lập theo cấu trúc proCMS, vẫn dùng dữ liệu và API AloCoupon.</p></div>
            <div class="cms-breadcrumb"><button data-admin-target="dashboard">Home</button><span>/</span><button data-admin-target="store-list">Store</button><span>/</span><strong>Chỉnh sửa</strong></div>
          </div>
          <div class="cms-create-actions cms-store-actions">
            <button class="cms-btn cms-btn-primary" type="submit" form="store-editor-form">▣ Cập nhật</button>
            <a class="cms-btn cms-btn-info" id="store-preview-btn" href="#" target="_blank" rel="noopener" hidden>◉ Xem trước</a>
            <button class="cms-btn cms-btn-info" id="store-new-btn" type="button">⊕ Thêm mới</button>
            <button class="cms-btn cms-btn-danger" id="store-delete-btn" type="button" hidden>▰ Xóa</button>
            <button class="cms-btn cms-btn-dark" data-admin-target="store-list" type="button">↶ Cancel</button>
          </div>
          <form class="cms-editor-form cms-store-editor" id="store-editor-form">
            <input name="id" type="hidden" />
            <input name="sourceTitle" type="hidden" />
            <input name="productImage" type="hidden" />
            <div class="cms-field-row"><label for="store-name">Tên store</label><input id="store-name" name="name" type="text" placeholder="Tên store" required /></div>
            <div class="cms-field-row"><label for="store-slug">Slug</label><input id="store-slug" name="slug" type="text" placeholder="store-slug" required /></div>
            <div class="cms-field-row"><label for="store-category">Danh mục</label><select id="store-category" name="category"><option>Other</option></select></div>
            <div class="cms-field-row"><label for="store-event">Events</label><select id="store-event" name="event"><option>Uncategorized</option><option>Black Friday</option><option>Valentine</option><option>Christmas</option><option>Halloween</option></select></div>
            <div class="cms-field-row"><label for="store-source-url">Website nguồn</label><div class="cms-store-source-control"><input id="store-source-url" name="sourceUrl" type="url" placeholder="https://website-cua-store.com/" /><button class="cms-btn cms-btn-info" id="store-extract-btn" type="button">⌁ Trích xuất logo & nội dung</button></div><small class="cms-field-help">Tự lấy logo, ảnh sản phẩm, tiêu đề và mô tả từ website công khai; không thay dữ liệu Offer/Deal gốc.</small></div>
            <div class="cms-field-row"><label for="store-image-file">Image</label><div class="cms-file-picker"><label class="cms-file-button" for="store-image-file">▧ Chọn file</label><input id="store-image-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" /><input id="store-image" name="image" type="text" placeholder="URL logo hoặc chọn file" /><span id="store-image-file-name">Chưa chọn file</span></div></div>
            <div class="cms-field-row cms-preview-row" id="store-image-preview-row" hidden><span></span><div class="cms-store-media-preview"><div><small>Logo store</small><img id="store-image-preview" alt="Store logo" /></div><div id="store-product-preview-wrap" hidden><small>Ảnh sản phẩm trích xuất</small><img id="store-product-preview" alt="Product preview" /></div></div></div>
            <div class="cms-field-row"><label>Duyệt bài</label><label class="cms-switch"><input name="approved" type="checkbox" checked /><span>YES</span></label></div>
            <div class="cms-field-row cms-description-row"><label for="store-description">Mô tả ngắn</label><div class="cms-rich-editor"><div class="cms-editor-toolbar"><button type="button">Source</button><button type="button"><b>B</b></button><button type="button"><i>I</i></button><button type="button"><u>U</u></button><button type="button">☷</button><button type="button">☰</button><select><option>Format</option></select><select><option>Font</option></select></div><textarea id="store-description" name="description" rows="5" placeholder="Nếu để trống hệ thống sẽ dùng mô tả đã trích xuất"></textarea></div></div>
            <div class="cms-field-row cms-description-row"><label for="store-about">About store</label><div class="cms-rich-editor"><div class="cms-editor-toolbar"><button type="button">Source</button><button type="button"><b>B</b></button><button type="button"><i>I</i></button><button type="button">Link</button><button type="button">☷</button><select><option>Paragraph</option></select></div><textarea id="store-about" name="aboutStore" rows="9"></textarea></div></div>
            <div class="cms-field-row cms-description-row"><label for="store-how-to">How to apply</label><textarea id="store-how-to" name="howToApply" rows="5" placeholder="Nếu để trống sẽ dùng hướng dẫn mặc định"></textarea></div>
            <div class="cms-field-row cms-description-row"><label for="store-faqs">FAQS</label><textarea id="store-faqs" name="faqs" rows="7" placeholder="Mỗi câu hỏi và câu trả lời trên một đoạn riêng"></textarea></div>
            <div class="cms-field-row"><label for="store-max-offer">Max Offer</label><input id="store-max-offer" name="maxOffer" type="number" min="0" max="1000" value="0" /></div>
            <div class="cms-field-row"><label for="store-order">Sắp xếp</label><input id="store-order" name="order" type="number" value="9999999" /></div>
            <div class="cms-field-row"><label for="store-meta-title">Meta title</label><input id="store-meta-title" name="metaTitle" type="text" /></div>
            <div class="cms-field-row"><label for="store-meta-keywords">Meta keywords</label><input id="store-meta-keywords" name="metaKeywords" type="text" /></div>
            <div class="cms-field-row cms-description-row"><label for="store-meta-description">Meta description</label><textarea id="store-meta-description" name="metaDescription" rows="4"></textarea></div>
            <div class="cms-field-row" id="store-offers-link-row" hidden><label>List Offers</label><button class="category-name-link" id="store-view-offers-btn" type="button">View Offers</button></div>
            <div class="cms-form-footer"><span></span><button class="cms-btn cms-btn-primary" type="submit">Save</button></div>
          </form>
        </section>

        <section class="cms-panel coupon-manager-panel" data-admin-panel="offer-list" hidden>
          <div class="cms-page-heading"><div><h1>Quản lý offer</h1><p>Danh sách coupon code và promotion đã upload.</p></div><div class="cms-breadcrumb"><button data-admin-target="categories">Home</button><span>/</span><strong>Offer</strong></div></div>
          <div class="category-toolbar"><div class="category-search"><input id="offer-list-search" type="search" placeholder="Tìm kiếm" /><select id="offer-list-store"><option value="all">Tất cả store</option></select><select id="offer-list-status"><option value="all">Tất cả trạng thái</option><option value="code">Coupon Code</option><option value="promotion">Promotion</option></select><button class="cms-btn cms-btn-primary coupon-search-btn" data-list="offer" type="button">Tìm kiếm</button></div><div class="category-actions"><button class="cms-btn cms-btn-primary" id="update-offer-list-btn" type="button">▣ Cập nhật</button><button class="cms-btn cms-btn-info create-coupon-btn" data-create-type="code" type="button">⊕ Thêm mới</button><button class="cms-btn cms-btn-danger batch-delete-offers-btn" data-list-type="offer" type="button">▰ Xóa <span id="selected-offer-count">0</span></button><button class="cms-btn cms-btn-dark" data-admin-target="categories" type="button">↶ Cancel</button></div></div>
          <div class="category-table-wrap"><table class="category-table coupon-data-table"><thead><tr><th class="row-number"></th><th class="check-cell"><input type="checkbox" data-select-all="offer" /></th><th>Name</th><th>Duyệt</th><th>Verified</th><th>Store</th><th>STT</th><th>Ngày đăng</th><th class="row-actions"></th></tr></thead><tbody id="offer-list-body"></tbody></table></div>
        </section>

        <section class="cms-panel coupon-manager-panel" data-admin-panel="bulk-offer-import" hidden>
          <div class="cms-page-heading"><div><h1>Upload hàng loạt Deal & Coupon</h1><p>Nhập tối đa 500 dòng, kiểm tra trước và tự lấy logo/ảnh sản phẩm từ website cửa hàng.</p></div><div class="cms-breadcrumb"><button data-admin-target="categories">Home</button><span>/</span><strong>Upload Deal & Coupon</strong></div></div>
          <details class="bulk-deal-import" open>
            <summary>⇧ Chọn file Deal / Coupon (CSV / JSON)</summary>
            <form id="bulk-deal-import-form">
              <label>Các file dữ liệu <input id="bulk-deal-file" type="file" accept=".csv,.json,text/csv,application/json" multiple required /></label>
              <small>Bạn có thể giữ Ctrl/Shift để chọn nhiều file. Tổng cộng tối đa 500 dòng mỗi lần.</small>
              <label>Logo chung (không bắt buộc) <input id="bulk-deal-logo" type="file" accept="image/png,image/jpeg,image/webp,image/gif" /></label>
              <label class="bulk-auto-assets"><input id="bulk-auto-assets" type="checkbox" checked /> <span><strong>Tự động lấy logo và ảnh sản phẩm</strong><small>Hệ thống theo affiliate link đến trang cửa hàng và chỉ quét các website công khai.</small></span></label>
              <div class="bulk-deal-actions"><button class="cms-btn cms-btn-info" id="download-deal-template" type="button">Tải CSV mẫu</button><button class="cms-btn cms-btn-info" id="preview-bulk-deals" type="submit">1. Xem trước & lấy ảnh</button><button class="cms-btn cms-btn-primary" id="run-bulk-deal-import" type="button" disabled>2. Đăng dữ liệu hợp lệ</button></div>
              <p id="bulk-deal-result">Chọn file rồi bấm “Xem trước & lấy ảnh”. Dòng trùng hoặc thiếu dữ liệu sẽ không được đăng.</p>
              <div class="bulk-preview" id="bulk-preview" hidden>
                <div class="bulk-preview-summary" id="bulk-preview-summary"></div>
                <div class="bulk-preview-table-wrap"><table class="bulk-preview-table"><thead><tr><th>#</th><th>Ảnh</th><th>Deal / Coupon</th><th>Store</th><th>Loại</th><th>Trạng thái</th></tr></thead><tbody id="bulk-preview-body"></tbody></table></div>
              </div>
            </form>
          </details>
        </section>

        <section class="cms-panel coupon-manager-panel" data-admin-panel="deal-list" hidden>
          <div class="cms-page-heading"><div><h1>Quản lý deal</h1><p>Đăng và quản lý deal hiển thị trên website.</p></div><div class="cms-breadcrumb"><button data-admin-target="categories">Home</button><span>/</span><strong>Deal</strong></div></div>
          <div class="category-toolbar"><div class="category-search"><input id="deal-list-search" type="search" placeholder="Tìm kiếm" /><select id="deal-list-category"><option value="all">Tất cả danh mục</option></select><select id="deal-list-status"><option value="all">Tất cả trạng thái</option><option value="visible">Hiển thị</option></select><button class="cms-btn cms-btn-primary coupon-search-btn" data-list="deal" type="button">Tìm kiếm</button></div><div class="category-actions"><button class="cms-btn cms-btn-primary" id="update-deal-list-btn" type="button">▣ Cập nhật</button><button class="cms-btn cms-btn-info create-coupon-btn" data-create-type="deal" type="button">⊕ Thêm mới</button><button class="cms-btn cms-btn-danger batch-delete-offers-btn" data-list-type="deal" type="button">▰ Xóa <span id="selected-deal-count">0</span></button><button class="cms-btn cms-btn-dark" data-admin-target="categories" type="button">↶ Cancel</button></div></div>
          <div class="category-table-wrap"><table class="category-table coupon-data-table"><thead><tr><th class="row-number"></th><th class="check-cell"><input type="checkbox" data-select-all="deal" /></th><th>Name</th><th>Image</th><th>Hiển thị</th><th>Danh mục</th><th>STT</th><th>Ngày đăng</th><th class="row-actions"></th></tr></thead><tbody id="deal-list-body"></tbody></table></div>
        </section>

        <section class="cms-panel cms-create-panel" data-admin-panel="deal-create" hidden>
          <div class="cms-page-heading cms-create-heading">
            <div><h1>Thêm mới deal</h1></div>
            <div class="cms-breadcrumb"><button data-admin-target="categories">Home</button><span>/</span><button data-admin-target="deal-list">Deal</button><span>/</span><strong>Thêm mới deal</strong></div>
          </div>
          <div class="cms-create-actions"><button class="cms-btn cms-btn-primary" type="submit" form="deal-create-form">▣ Cập nhật</button><button class="cms-btn cms-btn-dark" data-admin-target="deal-list" type="button">↶ Cancel</button></div>
          <form class="cms-editor-form" id="deal-create-form">
            <div class="cms-field-row"><label for="deal-create-title">Tên deal</label><input id="deal-create-title" name="title" type="text" placeholder="Tên deal" required /></div>
            <div class="cms-field-row"><label for="deal-create-slug">Slug</label><input id="deal-create-slug" name="slug" type="text" placeholder="Slug" /></div>
            <div class="cms-field-row"><label for="deal-create-order">Sắp xếp</label><input id="deal-create-order" name="order" type="number" value="9999999" /></div>
            <div class="cms-field-row"><label for="deal-create-brand">Store / Thương hiệu</label><input id="deal-create-brand" name="brand" type="text" placeholder="Tên store hoặc thương hiệu" required /></div>
            <div class="cms-field-row"><label for="deal-create-category">Danh mục</label><select id="deal-create-category" name="category" required><option value="Other">Other</option></select></div>
            <div class="cms-field-row"><label for="deal-create-image">Image <small>Không bắt buộc — hệ thống tự lấy theo affiliate link</small></label><div class="cms-file-picker"><label class="cms-file-button" for="deal-create-image">▧ Chọn file</label><input id="deal-create-image" name="logoFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif" /><span id="deal-create-file-name">Tự động lấy từ website</span></div></div>
            <div class="cms-field-row cms-preview-row" id="deal-create-preview-row" hidden><span></span><div class="cms-deal-image-preview"><img id="deal-create-preview" alt="Deal image preview" /><button id="deal-create-remove-image" type="button">×</button></div></div>
            <div class="cms-field-row"><label>Hiển thị</label><label class="cms-switch"><input name="visible" type="checkbox" checked /><span>YES</span></label></div>
            <div class="cms-field-row cms-description-row"><label for="deal-create-description">Mô tả</label><div class="cms-rich-editor"><div class="cms-editor-toolbar"><button type="button">Source</button><button type="button">▣</button><button type="button">□</button><button type="button">⌕</button><button type="button">▤</button><span></span><button type="button"><b>B</b></button><button type="button"><i>I</i></button><button type="button"><u>U</u></button><button type="button">S</button><button type="button">x₂</button><button type="button">x²</button><button type="button">☷</button><button type="button">☰</button><button type="button">↶</button><button type="button">↷</button><select><option>Styles</option></select><select><option>Format</option></select><select><option>Font</option></select><select><option>Size</option></select></div><textarea id="deal-create-description" name="review" required></textarea></div></div>
            <div class="cms-field-row"><label for="deal-create-discount">Giảm giá</label><input id="deal-create-discount" name="discount" type="text" placeholder="Ví dụ: 20% Off" required /></div>
            <div class="cms-field-row"><label for="deal-create-link">Affiliate link</label><input id="deal-create-link" name="link" type="url" placeholder="https://..." required /></div>
            <div class="cms-field-row"><label for="deal-create-expiry">Hạn sử dụng</label><input id="deal-create-expiry" name="expiry" type="text" placeholder="Không bắt buộc" /></div>
            <div class="cms-field-row"><label for="deal-create-meta-title">Meta title</label><input id="deal-create-meta-title" name="metaTitle" type="text" placeholder="Meta title" /></div>
          </form>
        </section>

    <section class="cms-panel" data-admin-panel="widgets" hidden>
      <div class="cms-page-heading"><div><h1>Widget</h1><p>Quản lý nội dung widget hiển thị trên website.</p></div></div>
      <form class="cms-settings-form" data-settings-form>
        <div class="cms-field-row"><label>Tiêu đề widget</label><input name="widgetTitle" type="text" /></div>
        <div class="cms-field-row cms-description-row"><label>Nội dung widget</label><textarea name="widgetContent" rows="10"></textarea></div>
        <div class="cms-settings-actions"><button class="cms-btn cms-btn-primary" type="submit">▣ Cập nhật</button></div>
      </form>
    </section>

    <section class="cms-panel" data-admin-panel="menu" hidden>
      <div class="cms-page-heading"><div><h1>Menu</h1><p>Mỗi dòng gồm tên menu và liên kết, phân cách bằng ký tự |.</p></div></div>
      <form class="cms-settings-form" data-settings-form>
        <div class="cms-field-row cms-description-row"><label>Danh sách menu</label><textarea name="menuItems" rows="14" placeholder="Deals|#deals"></textarea></div>
        <div class="cms-settings-actions"><button class="cms-btn cms-btn-primary" type="submit">▣ Cập nhật</button></div>
      </form>
    </section>

    <section class="cms-panel" data-admin-panel="users" hidden>
      <div class="cms-page-heading"><div><h1>Quản lý user</h1><p>Quản lý tài khoản được phép đăng nhập trang quản trị.</p></div><div class="cms-breadcrumb"><button data-admin-target="categories">Home</button><span>/</span><strong>User</strong></div></div>
      <div class="admin-user-toolbar">
        <form id="admin-user-form" class="cms-inline-form">
          <input name="name" type="text" placeholder="Họ và tên" required />
          <input name="username" type="text" placeholder="Tên đăng nhập" />
          <input name="email" type="email" placeholder="Email" required />
          <input name="phone" type="text" placeholder="Số điện thoại" />
          <select name="role"><option>Administrator</option><option selected>Editor</option><option>Viewer</option></select>
          <button class="cms-btn cms-btn-info" type="submit">⊕ Thêm mới</button>
        </form>
      </div>
      <div class="category-table-wrap"><table class="category-table"><thead><tr><th>Họ và tên</th><th>Tên đăng nhập</th><th>Email</th><th>Số điện thoại</th><th>Ngày đăng ký</th><th>Trạng thái</th><th></th></tr></thead><tbody id="admin-user-table-body"></tbody></table></div>
    </section>

    <section class="cms-panel" data-admin-panel="subscribers" hidden>
      <div class="cms-page-heading"><div><h1>Email subscribers</h1><p>Quản lý người đăng ký nhận coupon và deal mới từ AloCoupon.</p></div><div class="cms-breadcrumb"><button data-admin-target="categories">Home</button><span>/</span><strong>Subscribers</strong></div></div>
      <div class="admin-stats"><span><strong id="subscriber-total-count">0</strong> Total</span><span><strong id="subscriber-active-count">0</strong> Active</span><span><strong id="subscriber-pending-count">0</strong> Pending</span><span><strong>${resendApiKey && resendFromEmail ? "Ready" : "Setup needed"}</strong> Email delivery</span></div>
      <div class="category-table-wrap"><table class="category-table"><thead><tr><th>Email</th><th>Status</th><th>Subscribed</th><th>Confirmed</th><th>Last notified</th><th></th></tr></thead><tbody id="subscriber-table-body"></tbody></table></div>
    </section>

    <section class="cms-panel" data-admin-panel="settings-general" hidden>
      <div class="cms-page-heading"><div><h1>Cấu hình chung</h1><p>Logo, favicon và nội dung chính của website.</p></div><div class="cms-breadcrumb"><button data-admin-target="categories">Home</button><span>/</span><strong>Cấu hình chung</strong></div></div>
      <form class="cms-settings-form" data-settings-form>
        <div class="cms-field-row"><label>Tên site</label><input name="siteName" type="text" required /></div>
        <div class="cms-field-row"><label>Logo</label><div class="cms-setting-upload"><input type="file" accept="image/*" data-setting-file="logoData" /><img data-setting-preview="logoData" alt="Logo preview" hidden /></div></div>
        <div class="cms-field-row"><label>Favicon</label><div class="cms-setting-upload"><input type="file" accept="image/*" data-setting-file="faviconData" /><img data-setting-preview="faviconData" alt="Favicon preview" hidden /></div></div>
        <div class="cms-field-row"><label>Cho phép index</label><label class="cms-switch"><input name="allowIndex" type="checkbox" /><span>YES</span></label></div>
        <div class="cms-field-row"><label>AMP trang chủ</label><label class="cms-switch"><input name="ampHomepage" type="checkbox" /><span>YES</span></label></div>
        <div class="cms-field-row"><label>Slogan</label><input name="slogan" type="text" /></div>
        <div class="cms-field-row"><label>Thông báo đầu trang 1</label><input name="homeTitle" type="text" /></div>
        <div class="cms-field-row"><label>Thông báo đầu trang 2</label><textarea name="homeDescription" rows="3"></textarea></div>
        <div class="cms-settings-actions"><button class="cms-btn cms-btn-primary" type="submit">▣ Cập nhật</button></div>
      </form>
    </section>

    <section class="cms-panel" data-admin-panel="settings-author" hidden>
      <div class="cms-page-heading"><div><h1>Cấu hình tác giả</h1><p>Thông tin đại diện của tác giả website.</p></div></div>
      <form class="cms-settings-form" data-settings-form>
        <div class="cms-field-row"><label>Name</label><input name="authorName" type="text" /></div>
        <div class="cms-field-row"><label>Avatar</label><div class="cms-setting-upload"><input type="file" accept="image/*" data-setting-file="authorAvatarData" /><img data-setting-preview="authorAvatarData" alt="Author preview" hidden /></div></div>
        <div class="cms-settings-actions"><button class="cms-btn cms-btn-primary" type="submit">▣ Cập nhật</button></div>
      </form>
    </section>

    <section class="cms-panel" data-admin-panel="settings-feedback" hidden>
      <div class="cms-page-heading"><div><h1>Cấu hình phản hồi</h1><p>Thiết lập địa chỉ nhận phản hồi từ người dùng.</p></div></div>
      <form class="cms-settings-form" data-settings-form>
        <div class="cms-field-row"><label>Email nhận phản hồi</label><input name="feedbackEmail" type="email" /></div>
        <div class="cms-field-row"><label>Bật form phản hồi</label><label class="cms-switch"><input name="feedbackEnabled" type="checkbox" /><span>YES</span></label></div>
        <div class="cms-settings-actions"><button class="cms-btn cms-btn-primary" type="submit">▣ Cập nhật</button></div>
      </form>
    </section>

    <section class="cms-panel" data-admin-panel="settings-social" hidden>
      <div class="cms-page-heading"><div><h1>Cấu hình mạng xã hội</h1><p>Liên kết các kênh truyền thông chính thức.</p></div></div>
      <form class="cms-settings-form" data-settings-form>
        <div class="cms-field-row"><label>Facebook</label><input name="facebook" type="url" placeholder="https://facebook.com/..." /></div>
        <div class="cms-field-row"><label>Instagram</label><input name="instagram" type="url" placeholder="https://instagram.com/..." /></div>
        <div class="cms-field-row"><label>YouTube</label><input name="youtube" type="url" placeholder="https://youtube.com/..." /></div>
        <div class="cms-field-row"><label>TikTok</label><input name="tiktok" type="url" placeholder="https://tiktok.com/@..." /></div>
        <div class="cms-field-row"><label>X / Twitter</label><input name="x" type="url" placeholder="https://x.com/..." /></div>
        <div class="cms-settings-actions"><button class="cms-btn cms-btn-primary" type="submit">▣ Cập nhật</button></div>
      </form>
    </section>

    <section class="cms-panel" data-admin-panel="settings-seo" hidden>
      <div class="cms-page-heading"><div><h1>Cấu hình SEO</h1><p>Thiết lập metadata tìm kiếm và Google Analytics cho toàn bộ website.</p></div></div>
      <form class="cms-settings-form" data-settings-form>
        <div class="cms-field-row"><label>Meta title</label><input name="seoTitle" type="text" maxlength="160" /></div>
        <div class="cms-field-row cms-description-row"><label>Meta keywords</label><textarea name="seoKeywords" rows="4" maxlength="1000" placeholder="coupon codes, promo codes, online deals..."></textarea></div>
        <div class="cms-field-row"><label>Meta description</label><textarea name="seoDescription" rows="5" maxlength="500"></textarea></div>
        <div class="cms-field-row cms-description-row"><label>Google Analytics Code</label><div><textarea name="googleAnalyticsCode" rows="20" maxlength="20000" placeholder="Dán mã Google tag (gtag.js), Measurement ID G-... hoặc Google Tag Manager GTM-..."></textarea><small class="cms-field-help cms-seo-help">Hệ thống chỉ trích xuất các ID Google hợp lệ (G-, GT-, AW-, UA-, GTM-) và tự tạo script an toàn trên toàn site.</small></div></div>
        <div class="cms-settings-actions"><button class="cms-btn cms-btn-primary" type="submit">▣ Cập nhật</button></div>
      </form>
    </section>

    <section class="cms-panel" data-admin-panel="settings-content" hidden>
      <div class="cms-page-heading"><div><h1>Cấu hình nội dung</h1><p>Mẫu mô tả coupon và hướng dẫn áp dụng mã.</p></div></div>
      <form class="cms-settings-form" data-settings-form>
        <div class="cms-field-row cms-description-row"><label>Mô tả coupons</label><textarea name="couponDescription" rows="14" placeholder="Có thể dùng {{store_name}} để chèn tên Store"></textarea></div>
        <div class="cms-field-row cms-description-row"><label>How to apply</label><textarea name="howToApply" rows="12"></textarea></div>
        <div class="cms-settings-actions"><button class="cms-btn cms-btn-primary" type="submit">▣ Cập nhật</button></div>
      </form>
    </section>

    <section class="cms-panel" data-admin-panel="settings-ads" hidden>
      <div class="cms-page-heading"><div><h1>Cấu hình Ads</h1><p>Quản lý mã quảng cáo theo từng vị trí.</p></div></div>
      <form class="cms-settings-form" data-settings-form>
        <div class="cms-field-row cms-description-row"><label>Header Ads</label><textarea name="adsHeader" rows="6" placeholder="Mã quảng cáo đầu trang"></textarea></div>
        <div class="cms-field-row cms-description-row"><label>Sidebar Ads</label><textarea name="adsSidebar" rows="6" placeholder="Mã quảng cáo sidebar"></textarea></div>
        <div class="cms-field-row cms-description-row"><label>Footer Ads</label><textarea name="adsFooter" rows="6" placeholder="Mã quảng cáo cuối trang"></textarea></div>
        <div class="cms-settings-actions"><button class="cms-btn cms-btn-primary" type="submit">▣ Cập nhật</button></div>
      </form>
    </section>

    <section class="section admin-section cms-panel" data-admin-panel="offers" hidden>
      <div class="container admin-layout">
        <div class="admin-copy">
          <p class="eyebrow">Secure affiliate workspace</p>
          <h2>Admin Deal & Coupon Upload</h2>
          <p>This page is protected by a server session. Only admins can publish product promotions into Deals Of Today and the public deal search.</p>
          <div class="admin-stats"><span><strong id="offer-count">0</strong> Published offers</span><span><strong id="project-count">0</strong> Project files</span><span class="admin-session-label">Signed in: ${escapeHtml(adminEmail)}</span></div>
          <p><a class="button button-outline" href="/" style="color:#fff;border-color:rgba(255,255,255,.36);">View Public Site</a></p>
        </div>
        <form class="admin-form" id="secure-offer-form">
          <input name="id" type="hidden" />
          <label>Partner / Brand <input name="brand" type="text" placeholder="Example: HeyGen" required /></label>
          <label class="logo-upload-field">Logo for this deal
            <input name="logoFile" type="file" accept="image/png,image/jpeg,image/webp,image/gif" />
            <span class="form-help">Required for every deal. PNG, JPG, WEBP or GIF; maximum 500 KB.</span>
            <span class="logo-preview" id="logo-preview" hidden>
              <img alt="Deal logo preview" />
              <button class="button button-outline" id="remove-logo-btn" type="button">Remove logo</button>
            </span>
          </label>
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
    <section class="section container admin-project-section cms-panel" data-admin-panel="projects" hidden>
      <div class="section-title admin-section-heading">
        <div><p class="eyebrow">Quản lý file</p><h2>Upload hàng loạt dự án & tệp</h2><p>Chọn nhiều dự án, source code, ảnh hoặc file nén để upload trong cùng một lần.</p></div>
        <span class="security-badge">Admin only</span>
      </div>
      <div class="project-upload-layout">
        <form class="admin-form project-upload-form" id="project-upload-form">
          <label>Project name / batch prefix <input name="name" type="text" placeholder="Để trống để dùng tên từng file" maxlength="120" /></label>
          <div class="form-row">
            <label>Project type
              <select name="projectType"><option value="website">Website</option><option value="application">Application</option><option value="template">Template</option><option value="library">Library</option><option value="image">Image / Logo</option><option value="document">Document</option><option value="other">Other</option></select>
            </label>
            <label>Version <input name="version" type="text" placeholder="v1.0.0 (optional)" maxlength="40" /></label>
          </div>
          <label>Project description <textarea name="description" rows="5" maxlength="2000" placeholder="Describe what the project does, setup notes, technology, and important usage details..." required></textarea></label>
          <label class="project-dropzone" id="project-dropzone">
            <input name="projectFile" type="file" accept=".zip,.rar,.7z,.tar,.gz,.js,.jsx,.ts,.tsx,.html,.css,.json,.md,.txt,.py,.java,.php,.sql,.png,.jpg,.jpeg,.webp,.gif,.svg,.pdf" multiple required />
            <span class="upload-icon" aria-hidden="true">&#8593;</span>
            <strong>Chọn nhiều file hoặc kéo cả lô vào đây</strong>
            <span>ZIP, RAR, 7Z, source code or text file — maximum 8 MB</span>
          </label>
          <div class="selected-project-file" id="selected-project-file" hidden>
            <span class="file-type-badge" id="project-file-type">ZIP</span>
            <span><strong id="project-file-name"></strong><small id="project-file-size"></small></span>
            <button class="file-remove-btn" id="remove-project-file" type="button" aria-label="Remove selected file">&times;</button>
          </div>
          <button class="button button-primary project-submit-btn" type="submit" id="upload-project-btn">Upload Projects</button>
        </form>
        <div class="project-library" id="project-library" aria-live="polite"></div>
      </div>
    </section>
    <section class="section container cms-panel" data-admin-panel="offers" hidden>
      <div class="section-title"><h2>Published Partner Reviews & Coupons</h2></div>
      <div class="admin-offer-grid" id="admin-offer-list"></div>
    </section>
      </main>
    </div>
  </div>
  <div class="toast" role="status" aria-live="polite"></div>
  <script>
    const form = document.querySelector("#secure-offer-form");
    const list = document.querySelector("#admin-offer-list");
    const count = document.querySelector("#offer-count");
    const toast = document.querySelector(".toast");
    const saveButton = document.querySelector("#save-offer-btn");
    const cancelEditButton = document.querySelector("#cancel-edit-btn");
    const logoInput = form.elements.logoFile;
    const logoPreview = document.querySelector("#logo-preview");
    const logoPreviewImage = logoPreview.querySelector("img");
    const removeLogoButton = document.querySelector("#remove-logo-btn");
    const projectForm = document.querySelector("#project-upload-form");
    const projectInput = projectForm.elements.projectFile;
    const projectDropzone = document.querySelector("#project-dropzone");
    const projectLibrary = document.querySelector("#project-library");
    const projectCount = document.querySelector("#project-count");
    const selectedProjectFile = document.querySelector("#selected-project-file");
    const projectFileName = document.querySelector("#project-file-name");
    const projectFileSize = document.querySelector("#project-file-size");
    const projectFileType = document.querySelector("#project-file-type");
    const uploadProjectButton = document.querySelector("#upload-project-btn");
    const cmsSidebar = document.querySelector("#cms-sidebar");
    const categoryTableBody = document.querySelector("#category-table-body");
    const categorySearchInput = document.querySelector("#category-search");
    const categoryKindSelect = document.querySelector("#category-kind");
    const storeListBody = document.querySelector("#store-list-body");
    const storeEditorForm = document.querySelector('#store-editor-form');
    const storeImageInput = document.querySelector('#store-image');
    const storeImageFile = document.querySelector('#store-image-file');
    const storeImagePreviewRow = document.querySelector('#store-image-preview-row');
    const storeImagePreview = document.querySelector('#store-image-preview');
    const storeProductPreviewWrap = document.querySelector('#store-product-preview-wrap');
    const storeProductPreview = document.querySelector('#store-product-preview');
    const offerListBody = document.querySelector("#offer-list-body");
    const dealListBody = document.querySelector("#deal-list-body");
    const newsListBody = document.querySelector("#news-list-body");
    const contentPageList = document.querySelector("#content-page-list");
    const bulkDealImportForm = document.querySelector("#bulk-deal-import-form");
    const bulkDealFileInput = document.querySelector("#bulk-deal-file");
    const bulkDealLogoInput = document.querySelector("#bulk-deal-logo");
    const bulkDealResult = document.querySelector("#bulk-deal-result");
    const bulkAutoAssetsInput = document.querySelector("#bulk-auto-assets");
    const bulkPreview = document.querySelector("#bulk-preview");
    const bulkPreviewSummary = document.querySelector("#bulk-preview-summary");
    const bulkPreviewBody = document.querySelector("#bulk-preview-body");
    const previewBulkDealsButton = document.querySelector("#preview-bulk-deals");
    const runBulkDealImportButton = document.querySelector("#run-bulk-deal-import");
    let preparedBulkDeals = [];
    const dealCreateForm = document.querySelector("#deal-create-form");
    const dealCreateImageInput = document.querySelector("#deal-create-image");
    const dealCreatePreviewRow = document.querySelector("#deal-create-preview-row");
    const dealCreatePreview = document.querySelector("#deal-create-preview");
    const dealCreateFileName = document.querySelector("#deal-create-file-name");
    const adminUserForm = document.querySelector("#admin-user-form");
    const adminUserTableBody = document.querySelector("#admin-user-table-body");
    const subscriberTableBody = document.querySelector("#subscriber-table-body");
    const adminDashboardCards = document.querySelector("#admin-dashboard-cards");
    const adminQualitySummary = document.querySelector("#admin-quality-summary");
    const adminDashboardRecent = document.querySelector("#admin-dashboard-recent");
    const settingsForms = document.querySelectorAll("[data-settings-form]");
    let currentOffers = [];
    let currentStores = [];
    let currentLogo = "";
    let currentProjectFiles = [];
    let currentDealLogo = "";
    let currentSettings = {};
    let categoryPreferences = {};
    let adminCategories = [];

    function showToast(message) {
      toast.textContent = message;
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 2400);
    }

    function openAdminPanel(target) {
      document.querySelectorAll("[data-admin-panel]").forEach((panel) => {
        const active = panel.dataset.adminPanel === target;
        panel.hidden = !active;
        panel.classList.toggle("is-active", active);
      });
      document.querySelectorAll(".cms-nav [data-admin-target]").forEach((button) => button.classList.toggle("is-active", button.dataset.adminTarget === target));
      cmsSidebar.classList.remove("is-open");
      if (target === "dashboard") loadAdminDashboard();
      if (window.location.hash !== "#" + target) history.replaceState(null, "", "#" + target);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    document.querySelectorAll("[data-admin-target]").forEach((button) => button.addEventListener("click", () => openAdminPanel(button.dataset.adminTarget)));
    const requestedAdminPanel = window.location.hash.replace(/^#/, "");
    if (requestedAdminPanel && document.querySelector('[data-admin-panel="' + requestedAdminPanel + '"]')) openAdminPanel(requestedAdminPanel);
    window.addEventListener("hashchange", () => {
      const target = window.location.hash.replace(/^#/, "");
      if (target && document.querySelector('[data-admin-panel="' + target + '"]')) openAdminPanel(target);
    });
    document.querySelector("#cms-global-search").addEventListener("submit", (event) => {
      event.preventDefault();
      const query = document.querySelector("#cms-global-search-input").value.trim();
      if (!query) return;
      document.querySelector("#offer-list-search").value = query;
      document.querySelector("#offer-list-store").value = "all";
      document.querySelector("#offer-list-status").value = "all";
      renderOfferManager();
      openAdminPanel("offer-list");
      showToast('Kết quả cho "' + query + '"');
    });
    document.querySelector("#cms-menu-toggle").addEventListener("click", () => cmsSidebar.classList.toggle("is-open"));
    document.querySelector("#coupon-menu-toggle").addEventListener("click", (event) => {
      const expanded = event.currentTarget.getAttribute("aria-expanded") === "true";
      event.currentTarget.setAttribute("aria-expanded", String(!expanded));
      document.querySelector("#coupon-subnav").hidden = expanded;
    });
    document.querySelector("#settings-menu-toggle")?.addEventListener("click", (event) => {
      const expanded = event.currentTarget.getAttribute("aria-expanded") === "true";
      event.currentTarget.setAttribute("aria-expanded", String(!expanded));
      document.querySelector("#settings-subnav").hidden = expanded;
    });

    async function saveCategoryState() {
      categoryPreferences = Object.fromEntries(adminCategories.map((item) => [item.key, {
        visible: item.visible,
        home: item.home,
        order: item.order,
      }]));
      const res = await fetch("/api/admin/categories", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(categoryPreferences) });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "Không thể lưu danh mục.");
      categoryPreferences = result;
    }

    async function loadAdminCategoryPreferences() {
      const res = await fetch("/api/admin/categories");
      categoryPreferences = res.ok ? await res.json() : {};
    }

    function getCategoryKey(value) {
      return String(value || "Other").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "other";
    }

    function formatCategoryDate(value) {
      const date = new Date(value || Date.now());
      if (Number.isNaN(date.getTime())) return "—";
      return date.toLocaleDateString("vi-VN").replaceAll("/", "-");
    }

    function syncCategoriesFromOffers(offers) {
      const grouped = new Map();
      offers.forEach((offer) => {
        const name = String(offer.category || "Other").trim() || "Other";
        const key = getCategoryKey(name);
        const createdAt = new Date(offer.createdAt || 0).getTime();
        const current = grouped.get(key) || { key, id: key, name, type: "Coupon", count: 0, latestAt: 0 };
        current.count += 1;
        if (createdAt > current.latestAt) current.latestAt = createdAt;
        grouped.set(key, current);
      });
      adminCategories = Array.from(grouped.values()).map((item) => {
        const preference = categoryPreferences[item.key] || {};
        return {
          ...item,
          visible: preference.visible !== false,
          home: preference.home !== false,
          order: Number(preference.order ?? 9999999),
          date: formatCategoryDate(item.latestAt),
        };
      }).sort((a, b) => b.latestAt - a.latestAt || a.name.localeCompare(b.name));
      renderCategories();
    }

    function formatAdminDate(value) {
      const date = new Date(value || Date.now());
      return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("vi-VN").replaceAll("/", "-");
    }

    async function loadAdminDashboard() {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) return;
      const data = await res.json();
      const totals = data.totals || {};
      const entityCounts = {
        "nav-store-count": totals.stores || 0,
        "nav-offer-count": totals.coupons || 0,
        "nav-deal-count": totals.deals || 0,
        "nav-post-count": (totals.coupons || 0) + (totals.deals || 0),
        "nav-member-count": totals.activeSubscribers || 0,
        "entity-category-count": totals.categories || 0,
        "entity-store-count": totals.stores || 0,
        "entity-offer-count": totals.coupons || 0,
        "entity-deal-count": totals.deals || 0,
      };
      Object.entries(entityCounts).forEach(([id, value]) => { const element = document.getElementById(id); if (element) element.textContent = Number(value); });
      const cards = [
        ["Coupon code", totals.coupons || 0, "Mã giảm giá", "offer-list"],
        ["Deal", totals.deals || 0, "Ưu đãi không mã", "deal-list"],
        ["Store", totals.stores || 0, "Thương hiệu", "store-list"],
        ["Subscribers", totals.activeSubscribers || 0, "Đã xác nhận", "subscribers"],
      ];
      adminDashboardCards.innerHTML = cards.map((card) => '<button class="admin-stat-card" type="button" data-admin-target="' + card[3] + '"><span>' + escapeHtml(card[0]) + '</span><strong>' + Number(card[1]) + '</strong><small>' + escapeHtml(card[2]) + '</small></button>').join("");
      adminDashboardCards.querySelectorAll("[data-admin-target]").forEach((button) => button.addEventListener("click", () => openAdminPanel(button.dataset.adminTarget)));
      adminQualitySummary.innerHTML = '<div class="admin-quality-item"><span>Thiếu logo</span><strong>' + Number(totals.missingLogo || 0) + '</strong></div><div class="admin-quality-item"><span>Thiếu ảnh sản phẩm</span><strong>' + Number(totals.missingProductImage || 0) + '</strong></div><div class="admin-quality-item"><span>Đã hết hạn</span><strong>' + Number(totals.expired || 0) + '</strong></div><div class="admin-quality-item"><span>Danh mục</span><strong>' + Number(totals.categories || 0) + '</strong></div>';
      adminDashboardRecent.innerHTML = (data.recent || []).map((offer) => '<tr><td>' + (offer.logo ? '<img class="coupon-table-logo" src="' + escapeHtml(offer.logo) + '" alt="" />' : '—') + '</td><td><strong>' + escapeHtml(offer.title) + '</strong></td><td>' + escapeHtml(offer.brand) + '</td><td>' + (offer.type === "code" ? "Coupon" : "Deal") + '</td><td><span class="' + (offer.visible ? "cms-status-active" : "cms-status-disabled") + '">' + (offer.visible ? "Hiển thị" : "Ẩn") + '</span></td><td>' + formatAdminDate(offer.createdAt) + '</td></tr>').join("") || '<tr><td colspan="6">Chưa có dữ liệu.</td></tr>';
    }

    function populateCouponFilters() {
      const stores = Array.from(new Set(currentOffers.map((offer) => String(offer.brand || "").trim()).filter(Boolean))).sort();
      const categories = Array.from(new Set(currentOffers.map((offer) => String(offer.category || "Other").trim()).filter(Boolean))).sort();
      const storeSelect = document.querySelector("#offer-list-store");
      const categorySelect = document.querySelector("#deal-list-category");
      const dealCreateCategory = document.querySelector("#deal-create-category");
      const currentStore = storeSelect.value;
      const currentCategory = categorySelect.value;
      storeSelect.innerHTML = '<option value="all">Tất cả store</option>' + stores.map((store) => '<option value="' + escapeHtml(store) + '">' + escapeHtml(store) + '</option>').join("");
      categorySelect.innerHTML = '<option value="all">Tất cả danh mục</option>' + categories.map((category) => '<option value="' + escapeHtml(category) + '">' + escapeHtml(category) + '</option>').join("");
      dealCreateCategory.innerHTML = categories.map((category) => '<option value="' + escapeHtml(category) + '">' + escapeHtml(category) + '</option>').join("") + '<option value="Other">Other</option>';
      if (stores.includes(currentStore)) storeSelect.value = currentStore;
      if (categories.includes(currentCategory)) categorySelect.value = currentCategory;
    }

    function getFilteredCouponItems(kind) {
      const search = document.querySelector("#" + kind + "-list-search").value.trim().toLowerCase();
      let items = currentOffers.filter((offer) => kind === "deal" ? offer.type === "deal" : offer.type !== "deal");
      if (kind === "offer") {
        const store = document.querySelector("#offer-list-store").value;
        const type = document.querySelector("#offer-list-status").value;
        items = items.filter((offer) => (store === "all" || offer.brand === store) && (type === "all" || offer.type === type));
      } else {
        const category = document.querySelector("#deal-list-category").value;
        const status = document.querySelector("#deal-list-status").value;
        items = items.filter((offer) => (category === "all" || offer.category === category) && (status === "all" || offer.visible !== false));
      }
      return items.filter((offer) => !search || [offer.title, offer.brand, offer.code, offer.category].some((value) => String(value || "").toLowerCase().includes(search)));
    }

    function renderStoreManager() {
      const query = document.querySelector("#store-list-search").value.trim().toLowerCase();
      const status = document.querySelector('#store-list-status').value;
      const groups = new Map();
      currentOffers.forEach((offer) => {
        const key = String(offer.brand || "Unknown store").trim() || "Unknown store";
        const current = groups.get(key) || { brand: key, count: 0, coupons: 0, deals: 0, categories: new Set(), missingSource: 0, logo: offer.logo || "", latestAt: 0 };
        current.count += 1;
        if (offer.type === "deal") current.deals += 1;
        else current.coupons += 1;
        current.categories.add(String(offer.category || "Other"));
        if (!offer.sourceTitle && !offer.sourceDescription) current.missingSource += 1;
        current.logo ||= offer.logo || "";
        current.latestAt = Math.max(current.latestAt, new Date(offer.createdAt || 0).getTime());
        groups.set(key, current);
      });
      const stores = currentStores.filter((store) => (status === 'all' || store.approved) && (!query || [store.name, store.slug, store.category].some((value) => String(value || '').toLowerCase().includes(query))));
      storeListBody.innerHTML = stores.length ? stores.map((store, index) => {
        const aggregate = groups.get(store.sourceBrand || store.name) || { count: 0, coupons: 0, deals: 0, categories: new Set([store.category]), missingSource: 0, latestAt: store.updatedAt };
        return \`<tr data-store-id="\${escapeHtml(store.id)}"><td class="row-number">\${index + 1}</td><td class="check-cell"><input class="coupon-row-select" data-list="store" type="checkbox" /></td><td><button class="category-name-link store-edit-btn" type="button">\${escapeHtml(store.name)}</button><small class="cms-table-sub">\${escapeHtml(store.slug)} · \${aggregate.count} offer</small></td><td>\${store.image ? '<img class="coupon-table-logo" src="' + escapeHtml(store.image) + '" alt="" />' : '<span class="coupon-image-empty">Thiếu logo</span>'}</td><td><span class="cms-data-chip">\${escapeHtml(store.category || Array.from(aggregate.categories)[0] || 'Other')}</span></td><td><strong>\${aggregate.coupons}</strong></td><td><strong>\${aggregate.deals}</strong></td><td><span class="\${store.sourceTitle || store.description ? 'cms-status-active' : 'cms-status-warning'}">\${store.sourceTitle || store.description ? 'Đã trích xuất' : 'Thiếu metadata'}</span></td><td>\${formatAdminDate(store.updatedAt || aggregate.latestAt)}</td><td class="row-actions"><button class="table-edit-btn store-edit-btn" type="button" title="Chỉnh sửa Store">✎</button><button class="table-edit-btn store-offers-btn" type="button" title="Xem Offers">→</button></td></tr>\`;
      }).join('') : '<tr><td class="coupon-no-data" colspan="10">Chưa có dữ liệu Store.</td></tr>';
    }

    function renderOfferManager() {
      const items = getFilteredCouponItems("offer");
      offerListBody.innerHTML = items.length ? items.map((offer, index) => \`<tr data-offer-id="\${escapeHtml(offer.id)}"><td class="row-number">\${index + 1}</td><td class="check-cell"><input class="coupon-row-select" data-list="offer" type="checkbox" /></td><td><button class="category-name-link coupon-edit-btn" type="button">\${escapeHtml(offer.title)}</button><small class="coupon-code-note">\${escapeHtml(offer.code || "No code")}</small></td><td><select class="offer-visible"><option value="true" \${offer.visible !== false ? "selected" : ""}>Có</option><option value="false" \${offer.visible === false ? "selected" : ""}>Không</option></select></td><td><span class="cms-status-active">Đã kiểm tra</span></td><td>\${escapeHtml(offer.brand)}</td><td><input class="category-order offer-order" type="number" value="\${Number(offer.order ?? index + 1)}" /></td><td>\${formatAdminDate(offer.createdAt)}</td><td class="row-actions"><button class="table-edit-btn coupon-edit-btn" type="button">✎</button><button class="table-delete-btn coupon-delete-btn" type="button">▰</button></td></tr>\`).join("") : '<tr><td class="coupon-no-data" colspan="9">No data !</td></tr>';
    }

    function renderDealManager() {
      const items = getFilteredCouponItems("deal");
      dealListBody.innerHTML = items.length ? items.map((offer, index) => \`<tr data-offer-id="\${escapeHtml(offer.id)}"><td class="row-number">\${index + 1}</td><td class="check-cell"><input class="coupon-row-select" data-list="deal" type="checkbox" /></td><td><button class="category-name-link coupon-edit-btn" type="button">\${escapeHtml(offer.title)}</button><small class="coupon-code-note">\${escapeHtml(offer.discount)}</small></td><td>\${offer.productImage || offer.logo ? '<img class="coupon-table-logo" src="' + escapeHtml(offer.productImage || offer.logo) + '" alt="" />' : '<span class="coupon-image-empty">No image</span>'}</td><td><select class="offer-visible"><option value="true" \${offer.visible !== false ? "selected" : ""}>Có</option><option value="false" \${offer.visible === false ? "selected" : ""}>Không</option></select></td><td>\${escapeHtml(offer.category)}</td><td><input class="category-order offer-order" type="number" value="\${Number(offer.order ?? index + 1)}" /></td><td>\${formatAdminDate(offer.createdAt)}</td><td class="row-actions"><button class="table-edit-btn coupon-edit-btn" type="button">✎</button><button class="table-delete-btn coupon-delete-btn" type="button">▰</button></td></tr>\`).join("") : '<tr><td class="coupon-no-data" colspan="9">No data !</td></tr>';
    }

    function renderCouponManagers() {
      populateCouponFilters();
      renderStoreManager();
      renderOfferManager();
      renderDealManager();
      updateCouponSelectionCounts();
    }

    function renderCmsContentViews() {
      const query = String(document.querySelector("#news-list-search")?.value || "").trim().toLowerCase();
      const newsItems = currentOffers.filter((offer) => !query || [offer.title, offer.brand, offer.category, offer.review].some((value) => String(value || "").toLowerCase().includes(query))).slice(0, 100);
      newsListBody.innerHTML = newsItems.length ? newsItems.map((offer, index) => '<tr><td class="row-number">' + (index + 1) + '</td><td><strong>' + escapeHtml(offer.title) + '</strong><small class="coupon-code-note">' + escapeHtml(offer.review || "") + '</small></td><td>' + escapeHtml(offer.brand) + '</td><td>' + escapeHtml(offer.category || "Other") + '</td><td><span class="cms-content-type">' + (offer.type === "deal" ? "Deal" : "Coupon") + '</span></td><td>' + formatAdminDate(offer.createdAt) + '</td><td><button class="table-edit-btn cms-news-edit" data-offer-id="' + escapeHtml(offer.id) + '" type="button">✎</button></td></tr>').join("") : '<tr><td class="coupon-no-data" colspan="7">Không có dữ liệu phù hợp từ API AloCoupon.</td></tr>';

      const contentRows = [
        ["Trang chủ", "homeTitle", currentSettings.homeTitle, "settings-general"],
        ["Mô tả trang chủ", "homeDescription", currentSettings.homeDescription, "settings-general"],
        ["Mô tả coupon", "couponDescription", currentSettings.couponDescription, "settings-content"],
        ["Hướng dẫn sử dụng mã", "howToApply", currentSettings.howToApply, "settings-content"],
        ["SEO website", "seoDescription", currentSettings.seoDescription, "settings-seo"],
        ["Widget đăng ký", "widgetContent", currentSettings.widgetContent, "widgets"],
      ];
      contentPageList.innerHTML = contentRows.map((row, index) => '<tr><td class="row-number">' + (index + 1) + '</td><td><strong>' + escapeHtml(row[0]) + '</strong></td><td><code>' + escapeHtml(row[1]) + '</code></td><td class="cms-content-preview">' + escapeHtml(String(row[2] || "Chưa thiết lập").slice(0, 180)) + '</td><td><span class="' + (row[2] ? "cms-status-active" : "cms-status-disabled") + '">' + (row[2] ? "Hiển thị" : "Trống") + '</span></td><td><button class="table-edit-btn cms-content-edit" data-settings-panel="' + row[3] + '" type="button">✎</button></td></tr>').join("");
    }

    function parseBulkDealCsv(text) {
      const rows = [];
      let row = [];
      let cell = "";
      let quoted = false;
      for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        if (char === '"') {
          if (quoted && text[index + 1] === '"') { cell += '"'; index += 1; }
          else quoted = !quoted;
        } else if (char === "," && !quoted) {
          row.push(cell.trim()); cell = "";
        } else if ((char === String.fromCharCode(10) || char === String.fromCharCode(13)) && !quoted) {
          if (char === String.fromCharCode(13) && text[index + 1] === String.fromCharCode(10)) index += 1;
          row.push(cell.trim()); cell = "";
          if (row.some(Boolean)) rows.push(row);
          row = [];
        } else cell += char;
      }
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      if (rows.length < 2) return [];
      const headers = rows.shift().map((header) => header.replace(/^\uFEFF/, "").trim().toLowerCase());
      return rows.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
    }

    function normalizeBulkDealRow(source) {
      const row = Object.fromEntries(Object.entries(source || {}).map(([key, value]) => [String(key).trim().toLowerCase(), value]));
      const pick = (...keys) => {
        for (const key of keys) if (row[key] !== undefined && String(row[key]).trim()) return String(row[key]).trim();
        return "";
      };
      const title = pick("title", "name", "deal_name", "tên deal");
      const code = pick("code", "coupon_code", "mã");
      const requestedType = pick("type", "offer_type", "loại").toLowerCase();
      return {
        title,
        brand: pick("brand", "store", "merchant", "thương hiệu"),
        discount: pick("discount", "sale", "giảm giá") || "Deal",
        link: pick("link", "url", "affiliate_link", "affiliate link"),
        category: pick("category", "catalog", "danh mục") || "Other",
        review: pick("review", "description", "mô tả") || title,
        expiry: pick("expiry", "expires", "hạn sử dụng"),
        logo: pick("logo", "image", "logo_data"),
        code,
        type: code || ["coupon", "coupon code", "code"].includes(requestedType) ? "code" : requestedType === "promotion" ? "promotion" : "deal",
        order: Number(pick("order", "stt")) || 9999999,
        visible: !["false", "0", "no", "không"].includes(pick("visible", "hiển thị").toLowerCase()),
      };
    }

    document.querySelector("#download-deal-template").addEventListener("click", () => {
      const csv = ['type,title,brand,discount,link,category,description,expiry,code,logo', '"deal","Summer Sale","example.com","20% OFF","https://example.com/?ref=your-id","Fashion","20% off selected products","2026-12-31","",""', '"coupon","Welcome Coupon","example.com","10% OFF","https://example.com/?ref=your-id","Fashion","Coupon for new customers","2026-12-31","WELCOME10",""', ''].join(String.fromCharCode(10));
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "deal-coupon-import-template.csv";
      link.click();
      URL.revokeObjectURL(url);
    });

    async function readBulkDealFiles() {
      const dataFiles = Array.from(bulkDealFileInput.files || []);
      if (!dataFiles.length) throw new Error("Chọn một hoặc nhiều file CSV/JSON.");
      if (dataFiles.some((file) => file.size > 5 * 1024 * 1024)) throw new Error("Mỗi file dữ liệu phải nhỏ hơn 5 MB.");
      const rawItems = [];
      for (let fileIndex = 0; fileIndex < dataFiles.length; fileIndex += 1) {
        const dataFile = dataFiles[fileIndex];
        previewBulkDealsButton.textContent = "Đang đọc file " + (fileIndex + 1) + "/" + dataFiles.length + "...";
        const text = await dataFile.text();
        const parsed = dataFile.name.toLowerCase().endsWith(".json") ? JSON.parse(text) : parseBulkDealCsv(text);
        const fileItems = Array.isArray(parsed) ? parsed : parsed.items;
        if (!Array.isArray(fileItems)) throw new Error("File " + dataFile.name + " không đúng định dạng.");
        fileItems.forEach((item) => rawItems.push({ ...item, source_file: dataFile.name }));
      }
      if (!rawItems.length) throw new Error("Các file không có dòng Deal/Coupon hợp lệ.");
      if (rawItems.length > 500) throw new Error("Tổng cộng tối đa 500 Deal/Coupon trong một lần import.");
      const sharedLogoFile = bulkDealLogoInput.files[0];
      const sharedLogo = sharedLogoFile ? await readLogoFile(sharedLogoFile) : "";
      return rawItems.map(normalizeBulkDealRow).map((item) => ({ ...item, logo: item.logo || sharedLogo }));
    }

    function renderBulkDealPreview(result) {
      const validRows = result.items || [];
      const issueRows = [...(result.errors || []), ...(result.duplicates || [])];
      bulkPreview.hidden = false;
      bulkPreviewSummary.innerHTML = '<strong>' + validRows.length + ' dòng sẵn sàng</strong><span>' + Number(result.extractedCount || 0) + ' dòng có ảnh tự động</span><span>' + issueRows.length + ' dòng bị bỏ qua</span>';
      const validHtml = validRows.slice(0, 200).map((item, index) => {
        const image = item.productImage || item.logo || "";
        return '<tr><td>' + (index + 1) + '</td><td>' + (image ? '<img src="' + escapeHtml(image) + '" alt="" />' : '—') + '</td><td><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.discount || "") + '</small></td><td>' + escapeHtml(item.brand) + '</td><td><span class="bulk-type ' + escapeHtml(item.type) + '">' + (item.type === "code" ? "Coupon" : "Deal") + '</span></td><td><span class="bulk-status ok">Hợp lệ</span></td></tr>';
      }).join("");
      const issueHtml = issueRows.slice(0, 100).map((item) => '<tr class="has-error"><td>' + escapeHtml(item.row || "—") + '</td><td>—</td><td><strong>' + escapeHtml(item.title || "Dòng dữ liệu") + '</strong></td><td>—</td><td>—</td><td><span class="bulk-status error">' + escapeHtml(item.error || "Không hợp lệ") + '</span></td></tr>').join("");
      bulkPreviewBody.innerHTML = validHtml + issueHtml || '<tr><td colspan="6">Không có dữ liệu hợp lệ.</td></tr>';
      preparedBulkDeals = validRows;
      runBulkDealImportButton.disabled = !preparedBulkDeals.length;
    }

    bulkDealImportForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        previewBulkDealsButton.disabled = true;
        runBulkDealImportButton.disabled = true;
        preparedBulkDeals = [];
        const items = await readBulkDealFiles();
        previewBulkDealsButton.textContent = bulkAutoAssetsInput.checked ? "Đang quét website & lấy ảnh..." : "Đang kiểm tra dữ liệu...";
        const res = await fetch("/api/offers/batch/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, autoExtract: bulkAutoAssetsInput.checked }) });
        const result = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(result.error || "Không thể xem trước dữ liệu.");
        renderBulkDealPreview(result);
        bulkDealResult.textContent = "Đã kiểm tra " + result.total + " dòng. Hãy xem bảng bên dưới rồi bấm Đăng dữ liệu hợp lệ.";
        showToast("Đã chuẩn bị " + preparedBulkDeals.length + " Deal/Coupon hợp lệ.");
      } catch (error) {
        bulkDealResult.textContent = error.message;
        showToast(error.message);
      } finally {
        previewBulkDealsButton.disabled = false;
        previewBulkDealsButton.textContent = "1. Xem trước & lấy ảnh";
      }
    });

    runBulkDealImportButton.addEventListener("click", async () => {
      if (!preparedBulkDeals.length) return showToast("Hãy xem trước dữ liệu trước khi đăng.");
      try {
        runBulkDealImportButton.disabled = true;
        runBulkDealImportButton.textContent = "Đang đăng " + preparedBulkDeals.length + " dòng...";
        const res = await fetch("/api/offers/batch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: preparedBulkDeals }) });
        const result = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(result.error || "Import thất bại.");
        await loadOffers();
        const couponCount = result.created.filter((item) => item.type === "code").length;
        const dealCount = result.created.length - couponCount;
        bulkDealResult.textContent = "Đã đăng " + result.created.length + " dòng: " + dealCount + " Deal, " + couponCount + " Coupon.";
        showToast("Đã đăng thành công " + result.created.length + " Deal/Coupon.");
        preparedBulkDeals = [];
        bulkDealImportForm.reset();
        bulkPreview.hidden = true;
      } catch (error) {
        bulkDealResult.textContent = error.message;
        showToast(error.message);
      } finally {
        runBulkDealImportButton.textContent = "2. Đăng dữ liệu hợp lệ";
        runBulkDealImportButton.disabled = !preparedBulkDeals.length;
      }
    });

    bulkDealFileInput.addEventListener("change", () => {
      preparedBulkDeals = [];
      runBulkDealImportButton.disabled = true;
      bulkPreview.hidden = true;
    });

    function updateCouponSelectionCounts() {
      ["offer", "deal"].forEach((kind) => {
        const target = document.querySelector("#selected-" + kind + "-count");
        if (target) target.textContent = document.querySelectorAll('.coupon-row-select[data-list="' + kind + '"]:checked').length;
      });
    }

    function updateSelectedCategoryCount() {
      const checked = categoryTableBody.querySelectorAll(".category-select:checked").length;
      document.querySelector("#selected-category-count").textContent = checked;
      document.querySelector("#select-all-categories").checked = Boolean(checked) && checked === categoryTableBody.querySelectorAll(".category-select").length;
    }

    function renderCategories() {
      const query = categorySearchInput.value.trim().toLowerCase();
      const kind = categoryKindSelect.value;
      const rows = adminCategories.filter((item) => (!query || item.name.toLowerCase().includes(query)) && (kind === "all" || item.type === kind));
      categoryTableBody.innerHTML = rows.length ? rows.map((item, index) => \`
        <tr data-category-id="\${item.id}">
          <td class="row-number">\${index + 1}</td>
          <td class="check-cell"><input class="category-select" type="checkbox" /></td>
          <td><button class="category-name-link edit-category-btn" type="button">\${escapeHtml(item.name)}</button><small class="category-type-label">\${item.count} offer\${item.count === 1 ? "" : "s"}</small></td>
          <td><select class="category-visible"><option value="true" \${item.visible ? "selected" : ""}>Có</option><option value="false" \${!item.visible ? "selected" : ""}>Không</option></select></td>
          <td><select class="category-home"><option value="true" \${item.home ? "selected" : ""}>Có</option><option value="false" \${!item.home ? "selected" : ""}>Không</option></select></td>
          <td><input class="category-order" type="number" value="\${Number(item.order || 0)}" /></td>
          <td>\${escapeHtml(item.date)}</td>
          <td class="row-actions"><button class="table-edit-btn edit-category-btn" type="button" title="Chỉnh sửa">✎</button><button class="table-delete-btn delete-category-btn" type="button" title="Xóa">▰</button></td>
        </tr>\`).join("") : \`<tr><td class="category-no-results" colspan="8">Không tìm thấy danh mục phù hợp.</td></tr>\`;
      updateSelectedCategoryCount();
    }

    function syncCategoryRows() {
      categoryTableBody.querySelectorAll("tr[data-category-id]").forEach((row) => {
        const item = adminCategories.find((category) => String(category.id) === row.dataset.categoryId);
        if (!item) return;
        item.visible = row.querySelector(".category-visible").value === "true";
        item.home = row.querySelector(".category-home").value === "true";
        item.order = Number(row.querySelector(".category-order").value || 0);
      });
    }

    document.querySelector("#category-search-btn").addEventListener("click", renderCategories);
    categorySearchInput.addEventListener("input", renderCategories);
    categoryKindSelect.addEventListener("change", renderCategories);
    document.querySelector("#select-all-categories").addEventListener("change", (event) => {
      categoryTableBody.querySelectorAll(".category-select").forEach((checkbox) => { checkbox.checked = event.target.checked; });
      updateSelectedCategoryCount();
    });
    categoryTableBody.addEventListener("change", (event) => {
      if (event.target.matches(".category-select")) updateSelectedCategoryCount();
    });
    categoryTableBody.addEventListener("click", async (event) => {
      const row = event.target.closest("tr[data-category-id]");
      if (!row) return;
      const id = row.dataset.categoryId;
      const item = adminCategories.find((category) => String(category.id) === id);
      if (!item) return;
      if (event.target.closest(".edit-category-btn")) {
        const nextName = prompt("Đổi tên danh mục:", item.name);
        if (!nextName || nextName.trim() === item.name) return;
        const updates = currentOffers.filter((offer) => offer.category === item.name).map((offer) => ({ id: offer.id, category: nextName.trim() }));
        const res = await fetch("/api/admin/offers/batch", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updates }) });
        const result = await res.json().catch(() => ({}));
        if (!res.ok) return showToast(result.error || "Không thể đổi tên danh mục.");
        await loadOffers();
        showToast("Đã đổi tên danh mục cho " + result.updated + " offer.");
      }
      if (event.target.closest(".delete-category-btn") && confirm('Xóa danh mục "' + item.name + '"?')) {
        const deleteIds = currentOffers.filter((offer) => offer.category === item.name).map((offer) => offer.id);
        const res = await fetch("/api/admin/offers/batch", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deleteIds }) });
        const result = await res.json().catch(() => ({}));
        if (!res.ok) return showToast(result.error || "Không thể xóa danh mục.");
        await loadOffers();
        showToast("Đã xóa danh mục và " + result.deleted + " offer.");
      }
    });
    document.querySelector("#save-categories-btn").addEventListener("click", async () => {
      syncCategoryRows();
      try { await saveCategoryState(); showToast("Đã lưu danh mục trên máy chủ."); }
      catch (error) { showToast(error.message); }
    });
    document.querySelector("#add-category-btn").addEventListener("click", () => {
      openAdminPanel("offers");
      form.elements.customCategory.focus();
      showToast("Nhập danh mục mới trong form upload offer.");
    });
    document.querySelector("#delete-categories-btn").addEventListener("click", async () => {
      const selectedIds = Array.from(categoryTableBody.querySelectorAll(".category-select:checked")).map((checkbox) => checkbox.closest("tr").dataset.categoryId);
      if (!selectedIds.length) return showToast("Hãy chọn danh mục cần xóa.");
      const selectedNames = new Set(adminCategories.filter((item) => selectedIds.includes(String(item.id))).map((item) => item.name));
      const deleteIds = currentOffers.filter((offer) => selectedNames.has(offer.category)).map((offer) => offer.id);
      if (!confirm("Xóa " + selectedNames.size + " danh mục và " + deleteIds.length + " offer bên trong?")) return;
      const res = await fetch("/api/admin/offers/batch", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deleteIds }) });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) return showToast(result.error || "Không thể xóa danh mục.");
      await loadOffers();
      showToast("Đã xóa " + result.deleted + " offer.");
    });
    document.querySelector("#reset-categories-btn").addEventListener("click", () => {
      categorySearchInput.value = "";
      categoryKindSelect.value = "all";
      renderCategories();
    });
    document.querySelector("#export-categories-btn").addEventListener("click", () => {
      const rows = [["Name", "Type", "Visible", "Home", "Order", "Date"], ...adminCategories.map((item) => [item.name, item.type, item.visible ? "Yes" : "No", item.home ? "Yes" : "No", item.order, item.date])];
      const csv = rows.map((row) => row.map((cell) => '"' + String(cell).replaceAll('"', '""') + '"').join(",")).join("\\n");
      const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "alocoupon-categories.csv";
      link.click();
      URL.revokeObjectURL(url);
      showToast("Đã export danh mục.");
    });

    document.querySelectorAll(".coupon-search-btn").forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.list === "store") renderStoreManager();
      if (button.dataset.list === "offer") renderOfferManager();
      if (button.dataset.list === "deal") renderDealManager();
    }));
    ["store-list-search", "offer-list-search", "deal-list-search"].forEach((id) => document.querySelector("#" + id).addEventListener("input", () => {
      if (id.startsWith("store")) renderStoreManager();
      if (id.startsWith("offer")) renderOfferManager();
      if (id.startsWith("deal")) renderDealManager();
    }));
    ["offer-list-store", "offer-list-status"].forEach((id) => document.querySelector("#" + id).addEventListener("change", renderOfferManager));
    document.querySelector('#store-list-status').addEventListener('change', renderStoreManager);
    ["deal-list-category", "deal-list-status"].forEach((id) => document.querySelector("#" + id).addEventListener("change", renderDealManager));

    document.querySelectorAll(".create-coupon-btn").forEach((button) => button.addEventListener("click", () => {
      const type = button.dataset.createType || "code";
      if (type === "deal") {
        resetDealCreateForm();
        openAdminPanel("deal-create");
        dealCreateForm.elements.title.focus();
        return;
      }
      resetFormMode();
      form.elements.type.value = type;
      form.elements.code.required = type !== "deal";
      saveButton.textContent = type === "deal" ? "Đăng deal" : "Đăng offer";
      openAdminPanel("offers");
      form.elements.brand.focus();
    }));

    document.querySelectorAll("[data-select-all]").forEach((checkbox) => checkbox.addEventListener("change", () => {
      const kind = checkbox.dataset.selectAll;
      document.querySelectorAll('.coupon-row-select[data-list="' + kind + '"]').forEach((item) => { item.checked = checkbox.checked; });
      updateCouponSelectionCounts();
    }));
    document.querySelectorAll(".coupon-data-table").forEach((table) => table.addEventListener("change", (event) => {
      if (event.target.matches(".coupon-row-select")) updateCouponSelectionCounts();
    }));

    async function deleteOfferFromManager(offerId) {
      const offer = currentOffers.find((item) => item.id === offerId);
      if (!offer || !confirm('Xóa "' + offer.title + '"?')) return;
      const res = await fetch("/api/offers/" + encodeURIComponent(offerId), { method: "DELETE" });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) return showToast(result.error || "Xóa thất bại.");
      await loadOffers();
      showToast("Đã xóa dữ liệu.");
    }

    [offerListBody, dealListBody].forEach((body) => body.addEventListener("click", (event) => {
      const row = event.target.closest("tr[data-offer-id]");
      if (!row) return;
      const offer = currentOffers.find((item) => item.id === row.dataset.offerId);
      if (event.target.closest(".coupon-edit-btn") && offer) {
        fillForm(offer);
        openAdminPanel("offers");
      }
      if (event.target.closest(".coupon-delete-btn")) deleteOfferFromManager(row.dataset.offerId);
    }));

    function adminSlug(value) {
      return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    }

    function populateStoreCategoryOptions(selected = 'Other') {
      const values = Array.from(new Set(['Other', ...adminCategories.map((item) => item.name), ...currentOffers.map((offer) => offer.category).filter(Boolean)]));
      const select = storeEditorForm.elements.category;
      select.innerHTML = values.sort().map((value) => '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>').join('');
      select.value = values.includes(selected) ? selected : 'Other';
    }

    function updateStoreImagePreview() {
      const image = String(storeEditorForm.elements.image.value || '').trim();
      const product = String(storeEditorForm.elements.productImage.value || '').trim();
      storeImagePreviewRow.hidden = !image && !product;
      storeImagePreview.hidden = !image;
      if (image) storeImagePreview.src = image;
      storeProductPreviewWrap.hidden = !product;
      if (product) storeProductPreview.src = product;
    }

    function resetStoreEditor(store = null) {
      storeEditorForm.reset();
      const item = store || {};
      storeEditorForm.elements.id.value = item.id || '';
      storeEditorForm.elements.name.value = item.name || '';
      storeEditorForm.elements.slug.value = item.slug || '';
      populateStoreCategoryOptions(item.category || 'Other');
      storeEditorForm.elements.event.value = item.event || 'Uncategorized';
      storeEditorForm.elements.sourceUrl.value = item.sourceUrl || '';
      storeEditorForm.elements.sourceTitle.value = item.sourceTitle || '';
      storeEditorForm.elements.productImage.value = item.productImage || '';
      storeEditorForm.elements.image.value = item.image || '';
      storeEditorForm.elements.approved.checked = item.approved !== false;
      storeEditorForm.elements.description.value = item.description || '';
      storeEditorForm.elements.aboutStore.value = item.aboutStore || '';
      storeEditorForm.elements.howToApply.value = item.howToApply || '';
      storeEditorForm.elements.faqs.value = item.faqs || '';
      storeEditorForm.elements.maxOffer.value = Number(item.maxOffer || 0);
      storeEditorForm.elements.order.value = Number(item.order ?? 9999999);
      storeEditorForm.elements.metaTitle.value = item.metaTitle || '';
      storeEditorForm.elements.metaKeywords.value = item.metaKeywords || '';
      storeEditorForm.elements.metaDescription.value = item.metaDescription || '';
      document.querySelector('#store-editor-title').textContent = item.id ? 'Sửa store' : 'Thêm mới store';
      document.querySelector('#store-delete-btn').hidden = !item.id;
      document.querySelector('#store-offers-link-row').hidden = !item.id;
      const preview = document.querySelector('#store-preview-btn');
      preview.hidden = !item.slug;
      preview.href = item.slug ? '/store/' + encodeURIComponent(item.slug) : '#';
      document.querySelector('#store-image-file-name').textContent = 'Chưa chọn file';
      storeImageFile.value = '';
      updateStoreImagePreview();
    }

    function openStoreEditor(store) {
      resetStoreEditor(store);
      openAdminPanel('store-edit');
      storeEditorForm.elements.name.focus();
    }

    const storeCreateTrigger = document.querySelector('[data-admin-panel="store-list"] .create-coupon-btn');
    storeCreateTrigger?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      openStoreEditor(null);
    }, true);

    document.querySelector('#store-new-btn').addEventListener('click', () => openStoreEditor(null));
    storeEditorForm.elements.name.addEventListener('input', () => {
      if (!storeEditorForm.elements.id.value) storeEditorForm.elements.slug.value = adminSlug(storeEditorForm.elements.name.value);
    });
    storeImageInput.addEventListener('input', updateStoreImagePreview);
    storeImageFile.addEventListener('change', () => {
      const file = storeImageFile.files?.[0];
      if (!file) return;
      if (file.size > 1_500 * 1024) { storeImageFile.value = ''; return showToast('Ảnh Store phải nhỏ hơn 1.5 MB.'); }
      const reader = new FileReader();
      reader.onload = () => {
        storeImageInput.value = String(reader.result || '');
        document.querySelector('#store-image-file-name').textContent = file.name;
        updateStoreImagePreview();
      };
      reader.readAsDataURL(file);
    });

    document.querySelector('#store-extract-btn').addEventListener('click', async (event) => {
      const button = event.currentTarget;
      const sourceUrl = storeEditorForm.elements.sourceUrl.value.trim();
      if (!sourceUrl) return showToast('Hãy nhập website nguồn của Store.');
      button.disabled = true;
      button.textContent = 'Đang trích xuất...';
      try {
        const res = await fetch('/api/admin/stores/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sourceUrl }) });
        const assets = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(assets.error || 'Không thể trích xuất website.');
        storeEditorForm.elements.image.value = assets.logo || storeEditorForm.elements.image.value;
        storeEditorForm.elements.productImage.value = assets.productImage || '';
        storeEditorForm.elements.sourceTitle.value = assets.sourceTitle || '';
        if (!storeEditorForm.elements.name.value && assets.sourceTitle) storeEditorForm.elements.name.value = assets.sourceTitle.split(/[|–—-]/)[0].trim();
        if (!storeEditorForm.elements.slug.value) storeEditorForm.elements.slug.value = adminSlug(storeEditorForm.elements.name.value);
        if (!storeEditorForm.elements.description.value) storeEditorForm.elements.description.value = assets.sourceDescription || '';
        if (!storeEditorForm.elements.aboutStore.value) storeEditorForm.elements.aboutStore.value = assets.sourceDescription || '';
        if (!storeEditorForm.elements.metaDescription.value) storeEditorForm.elements.metaDescription.value = assets.sourceDescription || '';
        if (!storeEditorForm.elements.metaTitle.value) storeEditorForm.elements.metaTitle.value = assets.sourceTitle || '';
        updateStoreImagePreview();
        showToast('Đã trích xuất logo, ảnh sản phẩm và nội dung nguồn.');
      } catch (error) { showToast(error.message); }
      finally { button.disabled = false; button.textContent = '⌁ Trích xuất logo & nội dung'; }
    });

    storeEditorForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const id = storeEditorForm.elements.id.value;
      const payload = Object.fromEntries(new FormData(storeEditorForm).entries());
      payload.approved = storeEditorForm.elements.approved.checked;
      payload.image = storeEditorForm.elements.image.value;
      payload.productImage = storeEditorForm.elements.productImage.value;
      const res = await fetch(id ? '/api/admin/stores/' + encodeURIComponent(id) : '/api/admin/stores', { method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) return showToast(result.error || 'Không thể lưu Store.');
      await loadOffers();
      openStoreEditor(result);
      showToast('Đã lưu Store và giữ nguyên dữ liệu Offer/Deal liên kết.');
    });

    document.querySelector('#store-delete-btn').addEventListener('click', async () => {
      const id = storeEditorForm.elements.id.value;
      if (!id || !confirm('Xóa Store này khỏi CMS? Offer/Deal gốc sẽ được giữ nguyên.')) return;
      const res = await fetch('/api/admin/stores/' + encodeURIComponent(id), { method: 'DELETE' });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) return showToast(result.error || 'Không thể xóa Store.');
      await loadOffers();
      openAdminPanel('store-list');
      showToast('Đã xóa Store; dữ liệu Offer/Deal vẫn được giữ nguyên.');
    });

    function showOffersForStore(store) {
      const select = document.querySelector('#offer-list-store');
      select.value = store.sourceBrand || store.name;
      renderOfferManager();
      openAdminPanel('offer-list');
    }
    document.querySelector('#store-view-offers-btn').addEventListener('click', () => {
      const store = currentStores.find((item) => item.id === storeEditorForm.elements.id.value);
      if (store) showOffersForStore(store);
    });

    storeListBody.addEventListener('click', (event) => {
      const row = event.target.closest('tr[data-store-id]');
      if (!row) return;
      const store = currentStores.find((item) => item.id === row.dataset.storeId);
      if (!store) return;
      if (event.target.closest('.store-offers-btn')) showOffersForStore(store);
      else if (event.target.closest('.store-edit-btn')) openStoreEditor(store);
    });

    document.querySelectorAll(".batch-delete-offers-btn").forEach((button) => button.addEventListener("click", async () => {
      const kind = button.dataset.listType;
      const ids = Array.from(document.querySelectorAll('.coupon-row-select[data-list="' + kind + '"]:checked')).map((checkbox) => checkbox.closest("tr").dataset.offerId);
      if (!ids.length) return showToast("Hãy chọn dữ liệu cần xóa.");
      if (!confirm("Xóa " + ids.length + " mục đã chọn?")) return;
      const res = await fetch("/api/admin/offers/batch", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ deleteIds: ids }) });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) return showToast(result.error || "Không thể xóa dữ liệu.");
      await loadOffers();
      showToast("Đã xóa " + result.deleted + " mục.");
    }));

    async function saveManagerRows(body) {
      const updates = Array.from(body.querySelectorAll("tr[data-offer-id]")).map((row) => ({
        id: row.dataset.offerId,
        visible: row.querySelector(".offer-visible")?.value !== "false",
        order: Number(row.querySelector(".offer-order")?.value || 0),
      }));
      if (!updates.length) return showToast("Không có dữ liệu để cập nhật.");
      const res = await fetch("/api/admin/offers/batch", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updates }) });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) return showToast(result.error || "Cập nhật thất bại.");
      await loadOffers();
      showToast("Đã lưu " + result.updated + " mục.");
    }

    document.querySelector("#update-offer-list-btn").addEventListener("click", () => saveManagerRows(offerListBody));
    document.querySelector("#update-deal-list-btn").addEventListener("click", () => saveManagerRows(dealListBody));
    document.querySelector("#refresh-store-list-btn").addEventListener("click", async () => { await loadOffers(); showToast("Đã làm mới danh sách store."); });
    document.querySelector("#reload-dashboard-btn").addEventListener("click", async () => { await loadAdminDashboard(); showToast("Đã làm mới dashboard."); });
    document.querySelector("#refresh-offer-assets-btn").addEventListener("click", async (event) => {
      const button = event.currentTarget;
      button.disabled = true;
      button.textContent = "Đang quét website...";
      try {
        const res = await fetch("/api/admin/offers/refresh-assets", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
        const result = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(result.error || "Không thể tối ưu ảnh.");
        await loadOffers();
        await loadAdminDashboard();
        showToast("Đã tối ưu ảnh cho " + result.refreshed + "/" + result.attempted + " offer.");
      } catch (error) {
        showToast(error.message);
      } finally {
        button.disabled = false;
        button.textContent = "Tối ưu ảnh (tối đa 40)";
      }
    });

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
      return addAloCouponUtmToAffiliate(value);
    }

    function getAloCouponAffiliateUrl(value) {
      return getAloCouponTrackingUrl(value);
    }

    function resetFormMode() {
      form.reset();
      form.elements.id.value = "";
      setLogoPreview("");
      saveButton.textContent = "Publish To Deals";
      cancelEditButton.hidden = true;
    }

    function setLogoPreview(value) {
      currentLogo = value || "";
      logoPreviewImage.src = currentLogo;
      logoPreview.hidden = !currentLogo;
    }

    function readLogoFile(file) {
      return new Promise((resolve, reject) => {
        const allowedTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) return reject(new Error("Choose a PNG, JPG, WEBP, or GIF image."));
        if (file.size > 500 * 1024) return reject(new Error("Deal logo must be 500 KB or smaller."));
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Could not read the selected logo."));
        reader.readAsDataURL(file);
      });
    }

    function resetDealCreateForm() {
      dealCreateForm.reset();
      dealCreateForm.elements.order.value = "9999999";
      currentDealLogo = "";
      dealCreateImageInput.value = "";
      dealCreatePreview.src = "";
      dealCreatePreviewRow.hidden = true;
      dealCreateFileName.textContent = "Tự động lấy từ website";
    }

    dealCreateForm.elements.title.addEventListener("input", () => {
      dealCreateForm.elements.slug.value = dealCreateForm.elements.title.value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    });

    dealCreateImageInput.addEventListener("change", async () => {
      const file = dealCreateImageInput.files[0];
      if (!file) return;
      try {
        currentDealLogo = await readLogoFile(file);
        dealCreatePreview.src = currentDealLogo;
        dealCreatePreviewRow.hidden = false;
        dealCreateFileName.textContent = file.name;
      } catch (error) {
        resetDealCreateForm();
        showToast(error.message);
      }
    });

    document.querySelector("#deal-create-remove-image").addEventListener("click", () => {
      currentDealLogo = "";
      dealCreateImageInput.value = "";
      dealCreatePreview.src = "";
      dealCreatePreviewRow.hidden = true;
      dealCreateFileName.textContent = "Tự động lấy từ website";
    });

    dealCreateForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = new FormData(dealCreateForm);
      const payload = {
        title: data.get("title"),
        slug: data.get("slug"),
        order: Number(data.get("order") || 9999999),
        brand: data.get("brand"),
        category: data.get("category"),
        visible: dealCreateForm.elements.visible.checked,
        review: data.get("review"),
        discount: data.get("discount"),
        link: data.get("link"),
        expiry: data.get("expiry"),
        metaTitle: data.get("metaTitle"),
        type: "deal",
        code: "",
        logo: currentDealLogo,
        autoExtract: true,
      };
      const submitButton = document.querySelector('[form="deal-create-form"]');
      submitButton.disabled = true;
      submitButton.textContent = "Đang lưu...";
      try {
        const res = await fetch("/api/offers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const result = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(result.error || "Không thể đăng deal.");
        resetDealCreateForm();
        await loadOffers();
        openAdminPanel("deal-list");
        showToast("Đã đăng deal thành công.");
      } catch (error) {
        showToast(error.message);
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "▣ Cập nhật";
      }
    });

    function getPayload() {
      const payload = Object.fromEntries(new FormData(form).entries());
      payload.category = (payload.customCategory || payload.category || "").trim();
      payload.logo = currentLogo;
      delete payload.logoFile;
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
      logoInput.value = "";
      setLogoPreview(offer.logo || "");
      const option = Array.from(form.elements.category.options).find((item) => item.value === offer.category);
      form.elements.category.value = option ? offer.category : "Other";
      form.elements.customCategory.value = option ? "" : (offer.category || "");
      saveButton.textContent = "Save Changes";
      cancelEditButton.hidden = false;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function formatFileSize(bytes) {
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    function setCurrentProjectFiles(files) {
      currentProjectFiles = Array.from(files || []);
      selectedProjectFile.hidden = !currentProjectFiles.length;
      projectDropzone.classList.toggle("has-file", Boolean(currentProjectFiles.length));
      if (!currentProjectFiles.length) {
        projectInput.value = "";
        return;
      }
      const totalSize = currentProjectFiles.reduce((sum, file) => sum + file.size, 0);
      projectFileName.textContent = currentProjectFiles.length === 1 ? currentProjectFiles[0].name : currentProjectFiles.length + " files selected";
      projectFileSize.textContent = formatFileSize(totalSize);
      projectFileType.textContent = currentProjectFiles.length === 1 ? (currentProjectFiles[0].name.split(".").pop() || "FILE").slice(0, 5).toUpperCase() : "BATCH";
    }

    function validateProjectFile(file) {
      const allowed = ["zip", "rar", "7z", "tar", "gz", "js", "jsx", "ts", "tsx", "html", "css", "json", "md", "txt", "py", "java", "php", "sql", "png", "jpg", "jpeg", "webp", "gif", "svg", "pdf"];
      const extension = (file.name.split(".").pop() || "").toLowerCase();
      if (!allowed.includes(extension)) throw new Error("Choose a supported source-code or archive file.");
      if (file.size > 8 * 1024 * 1024) throw new Error("Project file must be 8 MB or smaller.");
    }

    function readProjectFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("Could not read the selected project file."));
        reader.readAsDataURL(file);
      });
    }

    async function loadProjects() {
      const res = await fetch("/api/projects");
      if (!res.ok) return;
      const projects = await res.json();
      projectCount.textContent = projects.length;
      projectLibrary.innerHTML = projects.length ? projects.map((project) => \`
        <article class="project-file-card">
          \${/\.(png|jpe?g|webp|gif|svg)$/i.test(project.fileName) ? \`<img class="project-media-thumb" src="/api/projects/\${encodeURIComponent(project.id)}/preview" alt="\${escapeHtml(project.name)}" />\` : ""}
          <div class="project-file-card-top">
            <span class="file-type-badge">\${escapeHtml((project.fileName.split(".").pop() || "FILE").slice(0, 5).toUpperCase())}</span>
            <div><p class="project-kind">\${escapeHtml(project.projectType)}\${project.version ? " · " + escapeHtml(project.version) : ""}</p><h3>\${escapeHtml(project.name)}</h3></div>
          </div>
          <p class="project-description">\${escapeHtml(project.description)}</p>
          <div class="project-file-meta"><span>\${escapeHtml(project.fileName)}</span><span>\${formatFileSize(project.size)}</span><span>\${escapeHtml(new Date(project.createdAt).toLocaleString())}</span></div>
          <div class="admin-offer-actions"><a class="button button-outline" href="/api/projects/\${encodeURIComponent(project.id)}/download">Download</a><button class="button button-outline delete-project-btn" data-id="\${escapeHtml(project.id)}" data-name="\${escapeHtml(project.name)}" type="button">Delete</button></div>
        </article>\`).join("") : \`<div class="project-empty-state"><span class="upload-icon">&#8593;</span><h3>No project files yet</h3><p>Select a source file and add its description to build your private library.</p></div>\`;
    }

    async function loadOffers() {
      const [res, storesRes] = await Promise.all([fetch("/api/offers"), fetch('/api/admin/stores')]);
      const offers = await res.json();
      const stores = storesRes.ok ? await storesRes.json() : [];
      currentOffers = Array.isArray(offers) ? offers : [];
      currentStores = Array.isArray(stores) ? stores : [];
      syncCategoriesFromOffers(currentOffers);
      renderCouponManagers();
      renderCmsContentViews();
      count.textContent = currentOffers.length;
      list.innerHTML = currentOffers.length ? currentOffers.map((offer) => \`
        <article class="admin-offer-card">
          <div class="admin-offer-top">
            <div class="admin-brand-title">\${offer.logo ? \`<img class="admin-brand-logo" src="\${escapeHtml(offer.logo)}" alt="" />\` : ""}<div><p class="store-name">\${escapeHtml(offer.brand)}</p><h3>\${escapeHtml(offer.title)}</h3></div></div>
            <span class="coupon-pill">\${escapeHtml(offer.discount)}</span>
          </div>
          <p>\${escapeHtml(offer.review)}</p>
          <div class="admin-offer-meta"><span>\${escapeHtml(offer.type || "code")}</span><span>\${escapeHtml(offer.category)}</span><span>\${escapeHtml(offer.expiry || "No expiry note")}</span><span>\${escapeHtml(offer.code || "No code")}</span><span>\${escapeHtml(new Date(offer.createdAt || Date.now()).toLocaleString())}</span></div>
          <div class="admin-offer-actions">
            <button class="button button-outline edit-offer-btn" type="button" data-id="\${escapeHtml(offer.id)}">Edit</button>
            <button class="button button-outline delete-offer-btn" type="button" data-id="\${escapeHtml(offer.id)}">Delete</button>
            <a class="product-link" href="\${escapeHtml(getAloCouponAffiliateUrl(offer.link))}" target="_blank" rel="sponsored noopener">Open</a>
          </div>
        </article>\`
      ).join("") : \`<p class="admin-empty-state">No offers yet. Upload real partner data from the form above.</p>\`;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = getPayload();
      const isEdit = Boolean(payload.id);
      if (isEdit && !currentLogo) {
        showToast("Offer đang sửa cần có logo.");
        logoInput.focus();
        return;
      }
      payload.autoExtract = !isEdit;
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

    logoInput.addEventListener("change", async () => {
      const file = logoInput.files[0];
      if (!file) return;
      try {
        setLogoPreview(await readLogoFile(file));
      } catch (error) {
        logoInput.value = "";
        showToast(error.message);
      }
    });

    removeLogoButton.addEventListener("click", () => {
      logoInput.value = "";
      setLogoPreview("");
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

    projectInput.addEventListener("change", () => {
      const selected = Array.from(projectInput.files || []);
      const valid = [];
      const invalid = [];
      selected.forEach((file) => {
        try { validateProjectFile(file); valid.push(file); }
        catch (error) { invalid.push(file.name + ": " + error.message); }
      });
      setCurrentProjectFiles(valid);
      if (invalid.length) showToast(valid.length + " file hợp lệ, " + invalid.length + " file bị bỏ qua.");
    });

    ["dragenter", "dragover"].forEach((eventName) => projectDropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      projectDropzone.classList.add("is-dragging");
    }));
    ["dragleave", "drop"].forEach((eventName) => projectDropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      projectDropzone.classList.remove("is-dragging");
    }));
    projectDropzone.addEventListener("drop", (event) => {
      const dropped = Array.from(event.dataTransfer.files || []);
      const valid = [];
      dropped.forEach((file) => {
        try { validateProjectFile(file); valid.push(file); } catch {}
      });
      setCurrentProjectFiles(valid);
      if (valid.length !== dropped.length) showToast(valid.length + "/" + dropped.length + " file hợp lệ.");
    });

    document.querySelector("#remove-project-file").addEventListener("click", () => setCurrentProjectFiles([]));

    projectForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!currentProjectFiles.length) {
        showToast("Chọn ít nhất một file trước khi upload.");
        projectInput.click();
        return;
      }
      try {
        uploadProjectButton.disabled = true;
        const formData = new FormData(projectForm);
        const files = [...currentProjectFiles];
        const failedFiles = [];
        let uploaded = 0;
        for (let index = 0; index < files.length; index += 1) {
          const file = files[index];
          uploadProjectButton.textContent = "Uploading " + (index + 1) + "/" + files.length + "...";
          try {
            validateProjectFile(file);
            const baseName = file.name.replace(/\.[^.]+$/, "");
            const prefix = String(formData.get("name") || "").trim();
            const payload = {
              name: files.length > 1 ? (prefix ? prefix + " - " + baseName : baseName) : (prefix || baseName),
              projectType: formData.get("projectType"),
              version: formData.get("version"),
              description: formData.get("description"),
              fileName: file.name,
              fileData: await readProjectFile(file),
            };
            const res = await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
            const result = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(result.error || "Upload failed.");
            uploaded += 1;
          } catch {
            failedFiles.push(file);
          }
        }
        if (!failedFiles.length) projectForm.reset();
        setCurrentProjectFiles(failedFiles);
        await loadProjects();
        showToast("Đã upload " + uploaded + "/" + files.length + " file." + (failedFiles.length ? " File lỗi vẫn được giữ để thử lại." : ""));
      } catch (error) {
        showToast(error.message);
      } finally {
        uploadProjectButton.disabled = false;
        uploadProjectButton.textContent = "Upload Projects";
      }
    });

    projectLibrary.addEventListener("click", async (event) => {
      const button = event.target.closest(".delete-project-btn");
      if (!button || !confirm('Delete "' + button.dataset.name + '"?')) return;
      const res = await fetch("/api/projects/" + encodeURIComponent(button.dataset.id), { method: "DELETE" });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) return showToast(result.error || "Delete failed.");
      await loadProjects();
      showToast("Project deleted.");
    });

    async function loadAdminUsers() {
      const res = await fetch("/api/admin/users");
      const users = res.ok ? await res.json() : [];
      adminUserTableBody.innerHTML = users.length ? users.map((user) => {
        const registered = new Date(user.createdAt || Date.now()).toLocaleDateString("vi-VN");
        return '<tr><td><strong>' + escapeHtml(user.name) + '</strong><small class="cms-table-sub">' + escapeHtml(user.role) + '</small></td><td>' + escapeHtml(user.username) + '</td><td>' + escapeHtml(user.email) + '</td><td>' + escapeHtml(user.phone || "—") + '</td><td>' + escapeHtml(registered) + '</td><td><span class="cms-status-active">Hoạt động</span></td><td><button class="cms-icon-btn danger delete-admin-user" type="button" data-id="' + escapeHtml(user.id) + '" data-name="' + escapeHtml(user.name) + '">×</button></td></tr>';
      }).join("") : '<tr><td colspan="7">Chưa có user.</td></tr>';
    }

    async function loadSubscribers() {
      const res = await fetch("/api/admin/subscribers");
      const subscribers = res.ok ? await res.json() : [];
      document.querySelector("#subscriber-total-count").textContent = String(subscribers.length);
      document.querySelector("#subscriber-active-count").textContent = String(subscribers.filter((item) => item.status === "active").length);
      document.querySelector("#subscriber-pending-count").textContent = String(subscribers.filter((item) => item.status === "pending").length);
      const formatDate = (value) => value ? new Date(value).toLocaleString("vi-VN") : "—";
      subscriberTableBody.innerHTML = subscribers.length ? subscribers.map((subscriber) => '<tr><td><strong>' + escapeHtml(subscriber.email) + '</strong></td><td><span class="cms-status-active">' + escapeHtml(subscriber.status) + '</span></td><td>' + escapeHtml(formatDate(subscriber.createdAt)) + '</td><td>' + escapeHtml(formatDate(subscriber.confirmedAt)) + '</td><td>' + escapeHtml(formatDate(subscriber.lastNotifiedAt)) + '</td><td><button class="cms-icon-btn danger delete-subscriber" type="button" data-id="' + escapeHtml(subscriber.id) + '" data-email="' + escapeHtml(subscriber.email) + '">×</button></td></tr>').join("") : '<tr><td colspan="6">Chưa có subscriber.</td></tr>';
    }

    subscriberTableBody.addEventListener("click", async (event) => {
      const button = event.target.closest(".delete-subscriber");
      if (!button || !confirm('Xóa subscriber "' + button.dataset.email + '"?')) return;
      const res = await fetch("/api/admin/subscribers/" + encodeURIComponent(button.dataset.id), { method: "DELETE" });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) return showToast(result.error || "Không thể xóa subscriber.");
      await loadSubscribers();
      showToast("Đã xóa subscriber.");
    });

    adminUserForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const payload = Object.fromEntries(new FormData(adminUserForm));
      const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) return showToast(result.error || "Không thể thêm user.");
      adminUserForm.reset();
      await loadAdminUsers();
      showToast("Đã thêm user và cấp quyền đăng nhập.");
    });

    adminUserTableBody.addEventListener("click", async (event) => {
      const button = event.target.closest(".delete-admin-user");
      if (!button || !confirm('Xóa user "' + button.dataset.name + '"?')) return;
      const res = await fetch("/api/admin/users/" + encodeURIComponent(button.dataset.id), { method: "DELETE" });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) return showToast(result.error || "Không thể xóa user.");
      await loadAdminUsers();
      showToast("Đã xóa user.");
    });

    function syncSettingsForms() {
      settingsForms.forEach((settingsForm) => {
        Array.from(settingsForm.elements).forEach((element) => {
          if (!element.name || !(element.name in currentSettings)) return;
          if (element.type === "checkbox") element.checked = Boolean(currentSettings[element.name]);
          else element.value = currentSettings[element.name] || "";
        });
      });
      document.querySelectorAll("[data-setting-preview]").forEach((preview) => {
        const value = currentSettings[preview.dataset.settingPreview] || "";
        preview.hidden = !value;
        if (value) preview.src = value;
      });
    }

    async function loadSiteSettings() {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) return;
      currentSettings = await res.json();
      syncSettingsForms();
      renderCmsContentViews();
    }

    document.querySelector("#news-list-search-btn")?.addEventListener("click", renderCmsContentViews);
    document.querySelector("#news-list-search")?.addEventListener("input", renderCmsContentViews);
    newsListBody?.addEventListener("click", (event) => {
      const button = event.target.closest(".cms-news-edit");
      if (!button) return;
      const offer = currentOffers.find((item) => item.id === button.dataset.offerId);
      if (offer) { fillForm(offer); openAdminPanel("offers"); }
    });
    contentPageList?.addEventListener("click", (event) => {
      const button = event.target.closest(".cms-content-edit");
      if (button) openAdminPanel(button.dataset.settingsPanel);
    });

    document.querySelectorAll("[data-setting-file]").forEach((input) => {
      input.addEventListener("change", () => {
        const file = input.files[0];
        if (!file) return;
        if (!file.type.startsWith("image/") || file.size > 700 * 1024) {
          input.value = "";
          return showToast("Ảnh phải nhỏ hơn 700 KB.");
        }
        const reader = new FileReader();
        reader.onload = () => {
          currentSettings[input.dataset.settingFile] = reader.result;
          syncSettingsForms();
        };
        reader.readAsDataURL(file);
      });
    });

    settingsForms.forEach((settingsForm) => settingsForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      Array.from(settingsForm.elements).forEach((element) => {
        if (!element.name) return;
        currentSettings[element.name] = element.type === "checkbox" ? element.checked : element.value;
      });
      const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(currentSettings) });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) return showToast(result.error || "Không thể lưu cấu hình.");
      currentSettings = result;
      syncSettingsForms();
      showToast("Đã cập nhật cấu hình website.");
    }));

    async function logoutAdmin() {
      await fetch("/api/logout", { method: "POST" });
      location.href = "/admin";
    }
    document.querySelector("#logout-btn").addEventListener("click", logoutAdmin);
    document.querySelector("#top-logout-btn").addEventListener("click", logoutAdmin);

    loadAdminCategoryPreferences().then(loadOffers);
    loadAdminDashboard();
    loadProjects();
    loadAdminUsers();
    loadSubscribers();
    loadSiteSettings();
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

function serveOfferAsset(req, res, pathname) {
  const match = String(pathname || "").match(/^\/media\/offer-assets\/((?:logo|product)-[a-f0-9]{24}\.(?:png|jpe?g|webp|gif|avif|ico))$/i);
  if (!match) return false;
  const filePath = path.join(offerAssetsDir, match[1]);
  try {
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) throw new Error("Not a file");
    res.writeHead(200, {
      "Content-Type": types[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Content-Length": stat.size,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    });
    if (req.method === "HEAD") res.end();
    else fs.createReadStream(filePath).pipe(res);
  } catch {
    send(res, 404, "Image not found");
  }
  return true;
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

    const extension = path.extname(filePath).toLowerCase();
    const cacheControl = extension === ".html"
      ? "no-cache, must-revalidate"
      : [".css", ".js"].includes(extension)
        ? "public, max-age=3600, must-revalidate"
        : "public, max-age=86400";
    res.writeHead(200, {
      "Content-Type": types[extension] || "application/octet-stream",
      "Cache-Control": cacheControl,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
      "X-Frame-Options": "SAMEORIGIN",
    });
    if (safePath === '/index.html') {
      res.end(renderHomePageHtml());
      return;
    }
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

function redirectToOfferAffiliate(offer, res) {
  const target = addAloCouponUtmToAffiliate(getSafeAffiliateUrl(offer.link));
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
  const brand = escapeHtml(getOfferBrandName(offer));
  const title = escapeHtml(getDisplayOfferTitle(offer));
  const discount = escapeHtml(offer.discount || "Best Deal");
  const category = escapeHtml(offer.category || "Deal");
  const validExpiry = getValidOfferExpiry(offer);
  const expiry = escapeHtml(validExpiry ? new Date(validExpiry).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Expiry not provided");
  const review = escapeHtml(getOfferSummary(offer) || "Review this offer before visiting the partner website.");
  const code = escapeHtml(offer.code || "No code needed");
  const hasCode = Boolean(String(offer.code || "").trim());
  const safeAffiliateLink = escapeHtml(affiliateLink);
  const dealUrl = escapeHtml(getAbsoluteUrl(getOfferDealPath(offer)));
  const structuredData = jsonLdScript(dealStructuredData(offer));
  const siteSettings = readSiteSettings();
  const analyticsHead = getGoogleAnalyticsHead(siteSettings);
  const analyticsBody = getGoogleAnalyticsBody(siteSettings);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="index, follow" />
  <title>${title} | AloCoupon</title>
  <meta name="description" content="${review}" />
  <meta name="keywords" content="${escapeHtml(`${offer.brand || ''}, ${offer.category || ''}, ${siteSettings.seoKeywords || ''}`)}" />
  <link rel="canonical" href="${dealUrl}" />
  <link rel="alternate" type="application/rss+xml" title="AloCoupon Latest Deals" href="${escapeHtml(getAbsoluteUrl("/rss.xml"))}" />
  ${structuredData}
  ${analyticsHead}
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
  ${analyticsBody}
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

function storePage(group) {
  const storeRecord = group.store || {};
  const siteSettings = readSiteSettings();
  const analyticsHead = getGoogleAnalyticsHead(siteSettings);
  const analyticsBody = getGoogleAnalyticsBody(siteSettings);
  const maxOffer = Math.max(0, Number(storeRecord.maxOffer) || 0);
  const visibleItems = maxOffer ? group.items.slice(0, maxOffer) : group.items;
  const formatStoreDiscount = (value) => String(value || "Deal").trim()
    .replace(/^([$£€])(\d+(?:\.\d+)?)%\s*off$/i, "$1$2 OFF");
  const getStoreDiscountScore = (value) => {
    const text = formatStoreDiscount(value).toLowerCase();
    const percent = text.match(/(\d+(?:\.\d+)?)\s*%/);
    if (percent) return Number(percent[1]) * 100;
    const amount = text.match(/[$£€]\s*(\d+(?:\.\d+)?)/);
    if (amount) return Number(amount[1]);
    return text.includes("free") ? 20 : 0;
  };
  const brand = escapeHtml(group.brand);
  const storePath = `/store/${encodeURIComponent(storeRecord.slug || getOfferStoreSlug(group.brand))}`;
  const storeUrl = escapeHtml(getAbsoluteUrl(storePath));
  const categoryProfile = storeRecord.category || getStoreCategoryProfile(group);
  const description = escapeHtml(storeRecord.metaDescription || storeRecord.description || `Compare ${group.items.length} verified ${group.brand} coupon codes and ${categoryProfile.toLowerCase()} deals. Review code requirements, product scope, source details, and expiration dates when supplied.`);
  const structuredData = jsonLdScript(storeStructuredData(group));
  const codeCount = visibleItems.filter((offer) => isUsableCouponCode(offer.code)).length;
  const dealCount = visibleItems.length - codeCount;
  const primaryOffer = visibleItems.find((offer) => offer.logo) || visibleItems[0] || {};
  const bestOfferItem = [...visibleItems].sort((a, b) => getStoreDiscountScore(b.discount) - getStoreDiscountScore(a.discount))[0];
  const bestOffer = escapeHtml(formatStoreDiscount(bestOfferItem?.discount || "Best Deal"));
  const affiliateLink = escapeHtml(getAloCouponTrackingUrl(primaryOffer.link || storeRecord.sourceUrl || "#"));
  const domain = escapeHtml(getOfferLogoHost(primaryOffer));
  const logo = escapeHtml(storeRecord.image || primaryOffer.logo || "");
  const initials = escapeHtml(String(group.brand || "Store").split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "ST");
  const latestTime = Math.max(...group.items.map((offer) => new Date(offer.createdAt || 0).getTime()).filter(Number.isFinite), 0);
  const updatedLabel = latestTime ? new Date(latestTime).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently";
  const sourceDescriptions = [...new Set(group.items.map((offer) => String(offer.sourceDescription || offer.review || "").trim()).filter(Boolean))];
  const aboutCopy = escapeHtml(storeRecord.aboutStore || storeRecord.description || sourceDescriptions.slice(0, 4).join(" ") || `The current ${group.brand} records cover ${categoryProfile.toLowerCase()} promotions available through the store's original website.`);
  const howToApplyCopy = escapeHtml(storeRecord.howToApply || '');
  const storeCategory = escapeHtml(categoryProfile);
  const customFaqs = String(storeRecord.faqs || '').split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean).map((block) => {
    const lines = block.split(/\n/).map((line) => line.replace(/^(?:Q|A)[:.)-]?\s*/i, '').trim()).filter(Boolean);
    return lines.length > 1 ? { question: lines[0], answer: lines.slice(1).join(' ') } : null;
  }).filter(Boolean);
  const faqs = customFaqs.length ? customFaqs : getStoreFaq(group);
  const rating = getStoreRating(group);
  const faqRows = faqs.map((faq) => `<details><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join("");
  const relatedStoreLinks = getRelatedStoreGroups(group).map((related) => `<a href="${escapeHtml(getOfferStorePath(related.brand))}">${escapeHtml(related.brand)} coupons <span>${related.items.length} offers</span></a>`).join("");
  const productCoverage = visibleItems.slice(0, 8).map((offer) => `<li><a href="${escapeHtml(getOfferDealPath(offer))}">${escapeHtml(String(offer.sourceTitle || offer.title || getDisplayOfferTitle(offer)).trim())}</a><span>${escapeHtml(offer.discount || "Deal")}</span></li>`).join("");
  const offerRows = visibleItems.map((offer) => {
    const sourceTitle = String(offer.sourceTitle || offer.title || getDisplayOfferTitle(offer)).trim();
    const sourceSummary = getStoreOfferDescription(offer, group.brand);
    const title = escapeHtml(sourceTitle);
    const summary = escapeHtml(sourceSummary);
    const discount = escapeHtml(formatStoreDiscount(offer.discount));
    const hasCode = isUsableCouponCode(offer.code);
    const code = escapeHtml(hasCode ? offer.code : "No code needed");
    const typeLabel = hasCode ? "Coupon code" : "Online deal";
    const validExpiry = getValidOfferExpiry(offer);
    const expiry = escapeHtml(validExpiry ? new Date(validExpiry).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Expiry not provided");
    const safeLink = escapeHtml(getAloCouponTrackingUrl(offer.link));
    const sourcePrice = escapeHtml([offer.sourceCurrency, offer.sourcePrice].filter(Boolean).join(" "));
    return `
      <article class="brand-offer-card" data-offer-type="${hasCode ? "code" : "deal"}" data-search="${escapeHtml(`${title} ${summary} ${discount} ${code}`.toLowerCase())}">
        <div class="brand-offer-discount"><strong>${discount}</strong><span>${hasCode ? "COUPON" : "DEAL"}</span></div>
        <div class="brand-offer-content">
          <div class="brand-offer-meta"><span class="offer-type-dot"></span>${typeLabel}<span>•</span><span>${expiry}</span><span class="verified-label">✓ Verified</span></div>
          <h2>${title}</h2>
          <p>${summary}</p>
          <small class="brand-source-note">Source: original product link${sourcePrice ? ` &middot; ${sourcePrice}` : ""} &middot; ${expiry}</small>
        </div>
        <div class="brand-offer-side">
          <a class="brand-offer-action" href="${safeLink}" data-code="${hasCode ? code : ""}" rel="sponsored noopener">${hasCode ? "Get Code" : "Get Deal"}<span>→</span></a>
        </div>
      </article>
    `;
  }).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="index, follow" />
  <title>${escapeHtml(storeRecord.metaTitle || `${group.brand} Coupons and Promo Codes | AloCoupon`)}</title>
  <meta name="description" content="${description}" />
  <meta name="keywords" content="${escapeHtml(storeRecord.metaKeywords || `${group.brand} coupons, ${group.brand} promo codes, ${group.brand} deals, ${categoryProfile} discounts`)}" />
  <meta property="og:title" content="${brand} Coupons and Promo Codes" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${storeUrl}" />
  <link rel="canonical" href="${storeUrl}" />
  <link rel="alternate" type="application/rss+xml" title="AloCoupon Latest Deals" href="${escapeHtml(getAbsoluteUrl("/rss.xml"))}" />
  ${structuredData}
  ${analyticsHead}
  <link rel="stylesheet" href="/styles.css" />
  <style>
    :root { --store-blue: #087dbd; --store-navy: #11334b; --store-green: #0a9b67; --store-line: #e2e8ee; --store-muted: #667786; }
    * { box-sizing: border-box; }
    html, body { overflow-x: hidden; }
    body { background: #f5f8fa; color: var(--store-navy); font-family: Inter, Arial, sans-serif; margin: 0; }
    .brand-topbar { background: #fff; border-bottom: 1px solid var(--store-line); }
    .brand-topbar-inner { align-items: center; display: flex; justify-content: space-between; margin: auto; max-width: 1180px; padding: 16px 22px; }
    .brand-site-logo { color: var(--store-navy); font-size: 1.35rem; font-weight: 950; letter-spacing: -.04em; text-decoration: none; }
    .brand-site-logo span { color: var(--store-green); }
    .brand-back-link { color: #516473; font-size: .86rem; font-weight: 800; text-decoration: none; }
    .brand-back-link:hover { color: var(--store-blue); }
    .brand-page { margin: 0 auto; max-width: 1180px; padding: 26px 22px 72px; }
    .brand-breadcrumb { color: #7a8995; font-size: .8rem; margin: 0 0 18px; }
    .brand-breadcrumb a { color: inherit; text-decoration: none; }
    .brand-breadcrumb strong { color: #3f5566; }
    .brand-hero { background: linear-gradient(135deg, #fff 60%, #edf9f5); border: 1px solid var(--store-line); border-radius: 22px; box-shadow: 0 16px 40px rgba(26, 52, 70, .08); overflow: hidden; padding: 30px; }
    .brand-hero-main { align-items: center; display: grid; gap: 26px; grid-template-columns: 136px minmax(0, 1fr) 220px; }
    .brand-logo-shell { align-items: center; background: #fff; border: 1px solid #dfe7ec; border-radius: 22px; box-shadow: 0 8px 22px rgba(17, 51, 75, .08); display: flex; height: 136px; justify-content: center; overflow: hidden; padding: 5px; position: relative; width: 136px; }
    .brand-logo-shell img { height: 100%; object-fit: contain; position: relative; transform: scale(1.18); width: 100%; z-index: 1; }
    .brand-logo-fallback { align-items: center; background: linear-gradient(145deg, #eef8fd, #e9f8f1); color: var(--store-blue); display: flex; font-size: 1.8rem; font-weight: 950; inset: 0; justify-content: center; position: absolute; }
    .brand-eyebrow { align-items: center; color: var(--store-green); display: flex; font-size: .72rem; font-weight: 950; gap: 7px; letter-spacing: .08em; margin: 0 0 9px; text-transform: uppercase; }
    .brand-eyebrow i { background: var(--store-green); border-radius: 50%; height: 7px; width: 7px; }
    .brand-hero-main > div { min-width: 0; }
    .brand-page h1 { color: var(--store-navy); font-size: clamp(1.8rem, 4vw, 2.75rem); letter-spacing: -.04em; line-height: 1.08; margin: 0 0 9px; overflow-wrap: anywhere; }
    .brand-domain { color: #738491; font-size: .86rem; margin: 0 0 12px; }
    .brand-copy { color: var(--store-muted); font-size: .94rem; line-height: 1.65; margin: 0; max-width: 680px; }
    .brand-best-box { background: #113b52; border-radius: 17px; color: #fff; padding: 20px; text-align: center; }
    .brand-best-box span { color: #b9d5e2; display: block; font-size: .7rem; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; }
    .brand-best-box strong { display: block; font-size: 1.65rem; margin: 8px 0 14px; }
    .brand-best-box a { background: #12a873; border-radius: 10px; color: #fff; display: block; font-size: .82rem; font-weight: 900; padding: 11px; text-decoration: none; }
    .brand-stats { border-top: 1px solid var(--store-line); display: grid; grid-template-columns: repeat(4, 1fr); margin-top: 27px; padding-top: 22px; }
    .brand-stat { border-right: 1px solid var(--store-line); padding: 0 22px; }
    .brand-stat:first-child { padding-left: 0; }
    .brand-stat:last-child { border: 0; }
    .brand-stat strong { color: var(--store-navy); display: block; font-size: 1.15rem; }
    .brand-stat span { color: #7c8a95; font-size: .74rem; font-weight: 700; }
    .brand-offers-head { align-items: end; display: flex; gap: 20px; justify-content: space-between; margin: 32px 0 16px; }
    .brand-offers-head h2 { font-size: 1.45rem; margin: 0 0 4px; overflow-wrap: anywhere; }
    .brand-offers-head p { color: var(--store-muted); font-size: .85rem; margin: 0; }
    .brand-offer-tools { align-items: center; display: flex; gap: 9px; }
    .brand-offer-search { background: #fff; border: 1px solid var(--store-line); border-radius: 10px; color: var(--store-navy); min-width: 220px; outline: none; padding: 10px 13px; }
    .brand-offer-search:focus { border-color: var(--store-blue); box-shadow: 0 0 0 3px rgba(8, 125, 189, .1); }
    .brand-filter { background: #fff; border: 1px solid var(--store-line); border-radius: 9px; color: #637480; cursor: pointer; font-size: .76rem; font-weight: 850; padding: 10px 12px; }
    .brand-filter.is-active { background: var(--store-navy); border-color: var(--store-navy); color: #fff; }
    .brand-offer-list { display: grid; gap: 14px; }
    .brand-offer-card { align-items: center; background: #fff; border: 1px solid var(--store-line); border-radius: 16px; display: grid; gap: 22px; grid-template-columns: 118px minmax(0, 1fr) 150px; padding: 20px; transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease; }
    .brand-offer-card:hover { border-color: rgba(8, 125, 189, .45); box-shadow: 0 12px 28px rgba(17, 51, 75, .09); transform: translateY(-2px); }
    .brand-offer-card[hidden] { display: none; }
    .brand-offer-discount { align-items: center; background: #ecf9f3; border: 1px solid #d4f0e3; border-radius: 14px; color: #07825a; display: flex; flex-direction: column; justify-content: center; min-height: 92px; padding: 12px; text-align: center; }
    .brand-offer-discount strong { font-size: 1.22rem; line-height: 1.1; }
    .brand-offer-discount span { font-size: .66rem; font-weight: 900; letter-spacing: .1em; margin-top: 7px; }
    .brand-offer-meta { align-items: center; color: #778793; display: flex; flex-wrap: wrap; font-size: .68rem; font-weight: 800; gap: 7px; margin: 0 0 7px; text-transform: uppercase; }
    .offer-type-dot { background: var(--store-blue); border-radius: 50%; height: 6px; width: 6px; }
    .verified-label { color: var(--store-green); }
    .brand-offer-card h2 { color: var(--store-navy); font-size: 1.04rem; line-height: 1.35; margin: 0 0 7px; }
    .brand-offer-card p { color: var(--store-muted); font-size: .83rem; line-height: 1.5; margin: 0 0 12px; }
    .brand-offer-code-row { align-items: center; display: flex; gap: 9px; }
    .brand-offer-code-row span { color: #87949d; font-size: .68rem; font-weight: 800; text-transform: uppercase; }
    .brand-offer-code-row strong { background: #f7fafb; border: 1px dashed #aebdc7; border-radius: 7px; color: #344b5c; font-size: .76rem; letter-spacing: .05em; padding: 7px 9px; }
    .brand-offer-side { align-items: stretch; display: flex; flex-direction: column; gap: 10px; text-align: center; }
    .brand-offer-side small { color: #91a0aa; font-size: .68rem; }
    .brand-offer-action { align-items: center; background: var(--store-green); border-radius: 10px; color: #fff; display: flex; font-size: .82rem; font-weight: 900; justify-content: center; padding: 12px 14px; text-decoration: none; }
    .brand-offer-action span { margin-left: 8px; transition: transform .18s ease; }
    .brand-offer-action:hover span { transform: translateX(3px); }
    .brand-empty { background: #fff; border: 1px dashed #bac7cf; border-radius: 14px; color: #6e7f8b; padding: 30px; text-align: center; }
    .brand-trust-note { align-items: center; color: #748590; display: flex; font-size: .76rem; gap: 7px; justify-content: center; margin: 24px 0 0; }
    .brand-trust-note strong { color: var(--store-green); }
    .brand-back-link { display: none; }
    .store-page-search { display: flex; flex: 1; margin-left: 90px; max-width: 680px; }
    .store-page-search input { border: 1px solid #cfd6dc; border-radius: 4px 0 0 4px; flex: 1; font-size: .95rem; min-width: 0; padding: 13px 16px; }
    .store-page-search button { background: #079d13; border: 0; border-radius: 0 4px 4px 0; color: #fff; cursor: pointer; font-weight: 800; padding: 0 22px; }
    .store-reference-layout { align-items: start; display: grid; gap: 26px; grid-template-columns: 270px minmax(0, 1fr); }
    .store-reference-sidebar { display: grid; gap: 18px; position: sticky; top: 16px; }
    .store-reference-content { min-width: 0; }
    .store-reference-content > h1 { font-size: 2rem; margin: 0 0 13px; }
    .store-reference-content > .brand-copy { margin-bottom: 22px; max-width: 850px; }
    .store-reference-sidebar .brand-hero { border-radius: 3px; box-shadow: 0 2px 9px rgba(0,0,0,.08); padding: 22px; }
    .store-reference-sidebar .brand-hero-main { display: flex; flex-direction: column; gap: 14px; text-align: center; }
    .store-reference-sidebar .brand-logo-shell { border-radius: 2px; height: 150px; width: 100%; }
    .store-reference-sidebar .brand-identity h2 { font-size: 1.35rem; margin: 0 0 5px; overflow-wrap: anywhere; }
    .store-reference-sidebar .brand-eyebrow { justify-content: center; }
    .brand-rating { color: #f2b600; font-size: .88rem; font-weight: 900; margin: 7px 0 0; }
    .brand-rating span { color: #738491; font-size: .72rem; font-weight: 700; }
    .store-reference-sidebar .brand-best-box { background: transparent; padding: 0; width: 100%; }
    .store-reference-sidebar .brand-best-box a { background: #079d13; border-radius: 3px; }
    .store-stats-card { background: #fff; border: 1px solid #e0e4e7; border-radius: 3px; box-shadow: 0 2px 9px rgba(0,0,0,.06); padding: 18px; }
    .store-stats-card > strong { display: block; font-size: .92rem; line-height: 1.5; text-align: center; }
    .store-stats-card div { align-items: center; border-top: 1px solid #e5e8ea; display: flex; font-size: .8rem; justify-content: space-between; margin-top: 11px; padding-top: 11px; }
    .store-stats-card div span { color: #6e7c85; }
    .store-stats-card div b { color: #079d13; max-width: 50%; text-align: right; }
    .store-reference-content .brand-offers-head { align-items: center; background: #fff; border-bottom: 1px solid #d9dee2; margin: 0 0 15px; padding: 0; }
    .store-reference-content .brand-offers-head > div:first-child { display: none; }
    .store-reference-content .brand-offer-tools { gap: 0; overflow-x: auto; }
    .store-reference-content .brand-filter { border: 0; border-bottom: 3px solid transparent; border-radius: 0; padding: 14px 18px; white-space: nowrap; }
    .store-reference-content .brand-filter.is-active { background: #fff; border-bottom-color: #079d13; color: #079d13; }
    .store-reference-content .brand-offer-search { border-radius: 3px; margin-right: 12px; }
    .store-reference-content .brand-offer-card { border-radius: 3px; box-shadow: 0 2px 8px rgba(0,0,0,.05); grid-template-columns: 100px minmax(0,1fr) 150px; }
    .store-reference-content .brand-offer-discount { background: #effaec; border: 1px dashed #86ca79; border-radius: 2px; color: #16810b; }
    .store-reference-content .brand-offer-action { background: #079d13; border-radius: 3px; font-size: .9rem; }
    .brand-source-note, .brand-code-preview { color: #8a969e; display: block; font-size: .68rem; }
    .store-about-card, .store-how-card, .store-faq-card, .store-rating-card, .store-related-card { background: #fff; border: 1px solid #e0e4e7; border-radius: 3px; margin-top: 28px; padding: 26px; }
    .store-about-card h2, .store-how-card h2, .store-faq-card h2, .store-rating-card h2, .store-related-card h2 { font-size: 1.5rem; margin: 0 0 20px; }
    .store-about-card h3 { font-size: 1rem; margin: 20px 0 6px; }
    .store-about-card p, .store-steps p { color: #586a76; font-size: .86rem; line-height: 1.65; margin: 0; }
    .store-steps { display: grid; gap: 18px; grid-template-columns: repeat(3, 1fr); }
    .store-steps article { border-right: 1px solid #e1e5e8; padding-right: 18px; }
    .store-steps article:last-child { border: 0; }
    .store-steps b { align-items: center; background: #079d13; border-radius: 50%; color: #fff; display: flex; height: 32px; justify-content: center; width: 32px; }
    .store-steps h3 { font-size: .95rem; margin: 11px 0 6px; }
    .store-product-coverage { display: grid; gap: 8px; list-style: none; margin: 12px 0 0; padding: 0; }
    .store-product-coverage li { align-items: center; border-bottom: 1px solid #e8ecef; display: flex; gap: 15px; justify-content: space-between; padding: 9px 0; }
    .store-product-coverage a { color: #174d6b; font-size: .84rem; font-weight: 750; text-decoration: none; }
    .store-product-coverage span { color: #07825a; flex: 0 0 auto; font-size: .75rem; font-weight: 850; }
    .store-faq-card > p, .store-related-card > p, .store-rating-empty p { color: #586a76; font-size: .86rem; line-height: 1.65; }
    .store-faq-list details { border-top: 1px solid #e1e6e9; padding: 15px 0; }
    .store-faq-list summary { color: #183d54; cursor: pointer; font-size: .92rem; font-weight: 850; }
    .store-faq-list details p { color: #586a76; font-size: .84rem; line-height: 1.65; margin: 10px 0 0; }
    .store-rating-score { align-items: center; display: flex; flex-wrap: wrap; gap: 11px; }
    .store-rating-score strong { font-size: 2rem; }
    .store-rating-score span { color: #f2b600; letter-spacing: .08em; }
    .store-rating-score small { color: #667786; width: 100%; }
    .store-rating-empty { background: #f7f9fa; border-left: 4px solid #94a5af; padding: 14px 17px; }
    .store-rating-empty p { margin: 6px 0 0; }
    .store-related-card > div { display: grid; gap: 9px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .store-related-card > div a { align-items: center; border: 1px solid #e1e6e9; color: #174d6b; display: flex; font-size: .84rem; font-weight: 800; justify-content: space-between; padding: 12px; text-decoration: none; }
    .store-related-card > div span { color: #738491; font-size: .7rem; font-weight: 700; }
    @media (max-width: 880px) { .store-reference-layout { grid-template-columns: 220px minmax(0, 1fr); } .store-reference-sidebar .brand-logo-shell { height: 120px; } .store-page-search { margin-left: 30px; } .store-reference-content .brand-offer-card { grid-template-columns: 84px minmax(0, 1fr); } }
    @media (max-width: 680px) { .brand-topbar-inner { align-items: stretch; flex-direction: column; gap: 12px; } .store-page-search { margin: 0; max-width: none; } .store-reference-layout { display: block; } .store-reference-sidebar { position: static; } .store-reference-sidebar .brand-hero-main { display: grid; grid-template-columns: 92px 1fr; text-align: left; } .store-reference-sidebar .brand-logo-shell { height: 92px; width: 92px; } .store-reference-sidebar .brand-eyebrow { justify-content: flex-start; } .store-reference-sidebar .brand-best-box { grid-column: 1 / -1; } .store-stats-card { margin: 14px 0 24px; } .store-reference-content .brand-offer-tools { width: 100%; } .store-reference-content .brand-offer-search { display: none; } .store-reference-content .brand-offer-card { grid-template-columns: 76px minmax(0, 1fr); } .store-steps { grid-template-columns: 1fr; } .store-steps article { border-bottom: 1px solid #e1e5e8; border-right: 0; padding: 0 0 18px; } }
    @media (max-width: 880px) { .brand-hero-main { grid-template-columns: 112px 1fr; } .brand-logo-shell { height: 112px; width: 112px; } .brand-best-box { grid-column: 1 / -1; } .brand-offer-card { grid-template-columns: 100px minmax(0, 1fr); } .brand-offer-side { align-items: center; flex-direction: row; grid-column: 2; justify-content: space-between; text-align: left; } .brand-offer-action { min-width: 130px; } .brand-offers-head { align-items: stretch; flex-direction: column; } .brand-offer-tools { flex-wrap: wrap; } }
    @media (max-width: 620px) { .brand-topbar-inner, .brand-page { padding-left: 16px; padding-right: 16px; } .brand-page { padding-top: 18px; } .brand-hero { padding: 20px; } .brand-hero-main { align-items: start; gap: 14px; grid-template-columns: 88px 1fr; } .brand-logo-shell { border-radius: 16px; height: 88px; padding: 7px; width: 88px; } .brand-page h1 { font-size: 1.55rem; } .brand-copy { grid-column: 1 / -1; } .brand-stats { grid-template-columns: repeat(2, 1fr); row-gap: 18px; } .brand-stat { border: 0; padding: 0; } .brand-offer-tools { display: grid; grid-template-columns: repeat(3, 1fr); } .brand-offer-search { grid-column: 1 / -1; min-width: 0; width: 100%; } .brand-filter { padding-inline: 6px; } .brand-offer-card { gap: 14px; grid-template-columns: 76px 1fr; padding: 15px; } .brand-offer-discount { min-height: 76px; padding: 8px; } .brand-offer-discount strong { font-size: 1rem; } .brand-offer-card h2 { font-size: .94rem; } .brand-offer-card p { display: none; } .brand-offer-code-row { align-items: flex-start; flex-direction: column; gap: 5px; } .brand-offer-side { align-items: stretch; flex-direction: column; grid-column: 1 / -1; } .brand-offer-side small { display: none; } .brand-offer-action { width: 100%; } }
  </style>
</head>
<body>
  ${analyticsBody}
  <header class="brand-topbar">
    <div class="brand-topbar-inner">
      <a class="brand-site-logo" href="/">Alo<span>Coupon</span></a>
      <form class="store-page-search" action="/" method="get">
        <input name="q" type="search" placeholder="Search Stores" aria-label="Search stores" />
        <button type="submit">Search</button>
      </form>
      <a class="brand-back-link" href="/#stores">← Explore all stores</a>
    </div>
  </header>
  <main class="brand-page">
    <p class="brand-breadcrumb"><a href="/">Home</a> &nbsp;/&nbsp; <a href="/#stores">Stores</a> &nbsp;/&nbsp; <strong>${brand}</strong></p>
    <div class="store-reference-layout">
      <aside class="store-reference-sidebar">
        <section class="brand-hero">
          <div class="brand-hero-main">
        <div class="brand-logo-shell">
          <span class="brand-logo-fallback"${logo ? ` style="display:none"` : ""}>${initials}</span>
          ${logo ? `<img src="${logo}" alt="${brand} logo" onerror="this.hidden=true;this.previousElementSibling.style.display='flex'" />` : ""}
        </div>
        <div class="brand-identity">
          <p class="brand-eyebrow"><i></i> Verified store</p>
          <h2>${brand}</h2>
          <p class="brand-domain">${domain}</p>
          <p class="brand-rating">${rating ? `★★★★★ <span>${rating.value.toFixed(1)} from ${rating.count} ratings</span>` : `<span>No customer ratings yet</span>`}</p>
        </div>
        <div class="brand-best-box">
          <a href="${affiliateLink}" rel="sponsored noopener">Get Coupon Alert</a>
        </div>
          </div>
        </section>
        <section class="store-stats-card">
          <strong>${codeCount} Coupon Codes</strong><strong>${group.items.length} Verified Offers</strong>
          <div><span>Coupon Codes</span><b>${codeCount}</b></div>
          <div><span>Deals</span><b>${dealCount}</b></div>
          <div><span>Best Offer</span><b>${bestOffer}</b></div>
        </section>
      </aside>
      <section class="store-reference-content">
        <h1>${brand} Coupons and Promo Codes</h1>
        <p class="brand-copy">${escapeHtml(storeRecord.description || `Compare ${visibleItems.length} verified ${group.brand} coupon codes, promo codes, and ${categoryProfile} discounts. Product names, eligibility notes, and descriptions below come from the original product link or AloCoupon's source API record.`)} Browse more offers by <a href="/#categories">shopping category</a> or visit <a href="/#stores">all coupon stores</a>.</p>
    <div class="brand-offers-head">
      <div><h2>Today's best ${brand} offers</h2><p>Every code and deal is reviewed before it appears here.</p></div>
      <div class="brand-offer-tools">
        <input class="brand-offer-search" type="search" placeholder="Search offers..." aria-label="Search store offers" />
        <button class="brand-filter is-active" type="button" data-filter="all">All (${group.items.length})</button>
        <button class="brand-filter" type="button" data-filter="verified">Verified (${group.items.length})</button>
        <button class="brand-filter" type="button" data-filter="code">Codes (${codeCount})</button>
        <button class="brand-filter" type="button" data-filter="deal">Deals (${dealCount})</button>
      </div>
    </div>
    <section class="brand-offer-list" aria-label="${brand} offers">
      ${offerRows}
    </section>
    <p class="brand-empty" hidden>No offers match your search.</p>
    <section class="store-about-card">
      <h2>About ${brand} coupons and deals</h2>
      <h3>What ${brand} sells</h3>
      <p>${aboutCopy}</p>
      <p>Based on the offers currently available through AloCoupon, ${brand} is listed in <strong>${storeCategory}</strong>. This page contains ${codeCount} coupon ${codeCount === 1 ? "code" : "codes"} and ${dealCount} code-free ${dealCount === 1 ? "deal" : "deals"}. The strongest listed saving is ${bestOffer}, and the records were last checked on ${updatedLabel}. The merchant domain connected to these offers is ${domain}.</p>
      <h3>Current product and promotion coverage</h3>
      <ul class="store-product-coverage">${productCoverage}</ul>
      <h3>How AloCoupon verifies ${brand} offers</h3>
      <p>Each offer keeps its original destination URL and source wording. AloCoupon separates coupon codes from automatic deals, records the advertised saving, and displays a confirmed expiration date only when the source data supplies a valid date. If a date is missing, the page says “Expiry not provided” instead of using an unsupported countdown label.</p>
      <h3>What to check before buying</h3>
      <p>Open the original product page and confirm eligible items, minimum-spend rules, regional restrictions, shipping costs, exclusions, and the final checkout total. Prices and availability can change after AloCoupon's last check, so the merchant checkout remains the final source for purchase terms.</p>
    </section>
    <section class="store-how-card">
      <h2>How to apply ${brand} coupon codes</h2>
      ${howToApplyCopy ? `<p>${howToApplyCopy}</p>` : ''}
      <div class="store-steps">
        <article><b>1</b><h3>Choose an offer</h3><p>Select a verified deal or coupon that matches the product you want.</p></article>
        <article><b>2</b><h3>Open the original link</h3><p>Click Get Deal or Get Code to continue to the original product page.</p></article>
        <article><b>3</b><h3>Apply and verify</h3><p>Enter the copied code at checkout and confirm the final price before ordering.</p></article>
      </div>
    </section>
    <section class="store-faq-card" id="store-faq">
      <h2>${brand} coupon FAQ</h2>
      <p>These answers reflect the ${group.items.length} offers and expiration fields currently stored for ${brand}.</p>
      <div class="store-faq-list">${faqRows}</div>
    </section>
    <section class="store-rating-card">
      <h2>${brand} shopper rating</h2>
      ${rating
        ? `<div class="store-rating-score"><strong>${rating.value.toFixed(1)}</strong><span>★★★★★</span><small>${rating.count} customer ratings</small></div>`
        : `<div class="store-rating-empty"><strong>Not rated yet</strong><p>AloCoupon has no verified customer rating records for ${brand}, so no AggregateRating schema is published. This avoids showing an unsupported score in search results.</p></div>`}
    </section>
    <nav class="store-related-card" aria-label="Related coupon stores">
      <h2>Explore related coupon stores</h2>
      <p>Continue browsing stores with active offers, or return to the <a href="/#categories">${storeCategory} and shopping categories</a> directory.</p>
      <div>${relatedStoreLinks}</div>
    </nav>
      </section>
    </div>
    <p class="brand-trust-note"><strong>✓ Verified</strong> · Affiliate links may earn AloCoupon a commission at no extra cost to you.</p>
  </main>
  <script>
    (() => {
      const cards = [...document.querySelectorAll('.brand-offer-card')];
      const search = document.querySelector('.brand-offer-search');
      const empty = document.querySelector('.brand-empty');
      let activeFilter = 'all';
      const applyFilters = () => {
        const query = String(search.value || '').trim().toLowerCase();
        let visible = 0;
        cards.forEach((card) => {
          const matchesType = activeFilter === 'all' || activeFilter === 'verified' || card.dataset.offerType === activeFilter;
          const matchesSearch = !query || String(card.dataset.search || '').includes(query);
          card.hidden = !(matchesType && matchesSearch);
          if (!card.hidden) visible += 1;
        });
        empty.hidden = visible > 0;
      };
      document.querySelectorAll('.brand-filter').forEach((button) => button.addEventListener('click', () => {
        activeFilter = button.dataset.filter || 'all';
        document.querySelectorAll('.brand-filter').forEach((item) => item.classList.toggle('is-active', item === button));
        applyFilters();
      }));
      search.addEventListener('input', applyFilters);
      document.querySelectorAll('.brand-offer-action[data-code]').forEach((link) => link.addEventListener('click', () => {
        const code = link.dataset.code;
        if (code && navigator.clipboard) navigator.clipboard.writeText(code).catch(() => {});
      }));
    })();
  </script>
</body>
</html>`;
}

function getOfferDuplicateKey(offer) {
  let link = String(offer.link || "").trim().toLowerCase();
  try {
    const url = new URL(link);
    url.hash = "";
    link = `${url.hostname.toLowerCase()}${url.pathname.replace(/\/+$/, "")}${url.search}`;
  } catch {}
  return [String(offer.brand || "").trim().toLowerCase(), String(offer.code || "").trim().toUpperCase(), String(offer.title || "").trim().toLowerCase(), link].join("|");
}

async function prepareBatchOffers(rawItems, { autoExtract = false } = {}) {
  const items = rawItems.map((item) => ({ ...item }));
  const extractionCache = new Map();
  const extractionJobs = new Map();
  if (autoExtract) {
    items.forEach((item) => {
      if ((item.logo && item.productImage && item.sourceTitle && item.sourceDescription) || !item.link) return;
      const key = String(item.link).trim();
      if (!extractionJobs.has(key)) extractionJobs.set(key, item.link);
    });
    const jobs = Array.from(extractionJobs.entries()).slice(0, 40);
    let cursor = 0;
    async function worker() {
      while (cursor < jobs.length) {
        const [key, link] = jobs[cursor++];
        try {
          extractionCache.set(key, { ...(await extractStoreAssets(link)), error: "" });
        } catch (error) {
          extractionCache.set(key, { logo: "", productImage: "", error: error.message || "Could not scan website." });
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(4, jobs.length) }, worker));
    items.forEach((item) => {
      const assets = extractionCache.get(String(item.link || "").trim());
      if (assets) {
        item.logo ||= assets.logo;
        item.productImage ||= assets.productImage;
        item.sourceTitle ||= assets.sourceTitle;
        item.sourceDescription ||= assets.sourceDescription;
        item.sourcePrice ||= assets.sourcePrice;
        item.sourceCurrency ||= assets.sourceCurrency;
        item.sourceUrl ||= assets.sourceUrl;
        item.assetSourceUrl = assets.sourceUrl || "";
        item.assetWarning = assets.error || "";
      }
    });
  }

  const existingKeys = new Set(readOffers().map(getOfferDuplicateKey));
  const batchKeys = new Set();
  const ready = [];
  const errors = [];
  const duplicates = [];
  items.forEach((item, index) => {
    try {
      const offer = sanitizeOffer(item);
      const key = getOfferDuplicateKey(offer);
      if (existingKeys.has(key) || batchKeys.has(key)) {
        duplicates.push({ row: index + 2, title: offer.title, error: "Duplicate offer was skipped." });
        return;
      }
      batchKeys.add(key);
      ready.push(offer);
    } catch (error) {
      const warning = item.assetWarning || "";
      errors.push({ row: index + 2, title: String(item.title || item.name || ""), error: warning ? `${error.message} Auto image: ${warning}` : error.message });
    }
  });
  return {
    items: ready,
    errors,
    duplicates,
    total: items.length,
    extractedCount: items.filter((item) => item.logo && (item.assetSourceUrl || item.productImage)).length,
  };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${host}:${port}`);

    if (req.method === "GET" && (url.pathname === "/go" || url.pathname.startsWith("/go/"))) {
      handleAffiliateRedirect(url, res);
      return;
    }

    const storeMatch = url.pathname.match(/^\/store\/([^/]+)$/);
    if (req.method === "GET" && storeMatch) {
      const group = findStoreGroupBySlug(decodeURIComponent(storeMatch[1]));
      if (!group) {
        send(res, 404, "Store not found");
        return;
      }

      send(res, 200, storePage(group), "text/html; charset=utf-8");
      return;
    }

    const dealMatch = url.pathname.match(/^\/deal\/([^/]+)$/);
    if (req.method === "GET" && dealMatch) {
      const offer = findOfferByDealSlug(decodeURIComponent(dealMatch[1]));
      if (!offer) {
        send(res, 404, "Deal not found");
        return;
      }

      redirectToOfferAffiliate(offer, res);
      return;
    }

    if (req.method === "GET" && url.pathname === "/healthz") {
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/newsletter/status") {
      sendJson(res, 200, {
        configured: Boolean(resendApiKey && resendFromEmail),
        apiKeyPresent: Boolean(resendApiKey),
        apiKeyFormatValid: /^re_[A-Za-z0-9_-]{20,}$/.test(resendApiKey),
        fromEmailPresent: Boolean(resendFromEmail),
        fromEmailFormatValid: /<[^<>\s@]+@[^<>\s@]+\.[^<>\s@]+>$/.test(resendFromEmail),
        siteUrlConfigured: Boolean(process.env.SITE_URL),
        newsletterSecretConfigured: Boolean(process.env.NEWSLETTER_SECRET),
      });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/newsletter/subscribe") {
      enforceNewsletterRateLimit(req);
      const payload = JSON.parse(await readBody(req, 20_000));
      if (String(payload.website || "").trim()) return sendJson(res, 202, { ok: true, message: "Please check your inbox to confirm your subscription." });
      const email = normalizeEmail(payload.email);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error("Please enter a valid email address.");
      const subscribers = readSubscribers();
      let subscriber = subscribers.find((item) => item.email === email);
      if (subscriber?.status === "active") return sendJson(res, 200, { ok: true, message: "This email is already subscribed." });
      if (!subscriber) {
        subscriber = { id: `sub_${crypto.randomBytes(12).toString("hex")}`, email, status: "pending", confirmVersion: crypto.randomBytes(12).toString("hex"), createdAt: new Date().toISOString(), confirmedAt: "", unsubscribedAt: "", lastNotifiedAt: "" };
        subscribers.push(subscriber);
      } else {
        subscriber.status = "pending";
        subscriber.confirmVersion = crypto.randomBytes(12).toString("hex");
        subscriber.createdAt = new Date().toISOString();
        subscriber.unsubscribedAt = "";
      }
      writeSubscribers(subscribers);
      const delivery = await sendNewsletterConfirmation(subscriber);
      sendJson(res, 202, {
        ok: true,
        emailConfigured: delivery.sent,
        message: delivery.sent ? "Please check your inbox to confirm your subscription." : "Subscription saved. Email delivery is waiting for administrator configuration.",
        ...(!isProduction && !delivery.sent ? { debugConfirmUrl: delivery.confirmUrl } : {}),
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/newsletter/confirm") {
      const subscriber = getSubscriberFromToken(url.searchParams.get("token"), "confirm");
      if (!subscriber) return send(res, 400, newsletterStatusPage("Invalid confirmation link", "This confirmation link is invalid or no longer available.", false), "text/html; charset=utf-8");
      const subscribers = readSubscribers();
      const current = subscribers.find((item) => item.id === subscriber.id);
      current.status = "active";
      current.confirmVersion = "";
      current.confirmedAt = current.confirmedAt || new Date().toISOString();
      current.unsubscribedAt = "";
      writeSubscribers(subscribers);
      send(res, 200, newsletterStatusPage("Subscription confirmed", "You will now receive the newest verified AloCoupon deals."), "text/html; charset=utf-8");
      return;
    }

    if ((req.method === "GET" || req.method === "POST") && url.pathname === "/newsletter/unsubscribe") {
      const subscriber = getSubscriberFromToken(url.searchParams.get("token"), "unsubscribe");
      if (!subscriber) {
        if (req.method === "POST") return send(res, 200, "", "text/plain; charset=utf-8");
        return send(res, 400, newsletterStatusPage("Invalid unsubscribe link", "This unsubscribe link is invalid or no longer available.", false), "text/html; charset=utf-8");
      }
      const subscribers = readSubscribers();
      const current = subscribers.find((item) => item.id === subscriber.id);
      current.status = "unsubscribed";
      current.unsubscribedAt = new Date().toISOString();
      writeSubscribers(subscribers);
      if (req.method === "POST") return send(res, 200, "", "text/plain; charset=utf-8");
      send(res, 200, newsletterStatusPage("You are unsubscribed", "You will no longer receive AloCoupon deal alerts. You can subscribe again at any time."), "text/html; charset=utf-8");
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/data-status") {
      sendJson(res, 200, getDataStatus());
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

    if (req.method === "GET" && url.pathname === "/api/trustpilot-reviews") {
      sendJson(res, 200, readTrustpilotReviews());
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/site-settings") {
      const settings = readSiteSettings();
      sendJson(res, 200, {
        siteName: settings.siteName, slogan: settings.slogan, homeTitle: settings.homeTitle,
        homeDescription: settings.homeDescription, logoData: settings.logoData,
        faviconData: settings.faviconData, seoTitle: settings.seoTitle,
        seoDescription: settings.seoDescription, seoKeywords: settings.seoKeywords,
        couponDescription: settings.couponDescription,
        howToApply: settings.howToApply, menuItems: settings.menuItems,
        widgetTitle: settings.widgetTitle, widgetContent: settings.widgetContent,
      });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/admin/settings") {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: "Admin login required." });
      sendJson(res, 200, readSiteSettings());
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/admin/dashboard") {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: "Admin login required." });
      sendJson(res, 200, getAdminDashboardData());
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/admin/stores') {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: 'Admin login required.' });
      sendJson(res, 200, readStores());
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/stores/extract') {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: 'Admin login required.' });
      const payload = JSON.parse(await readBody(req, 50_000));
      if (!String(payload.sourceUrl || '').trim()) throw new Error('Store website is required.');
      sendJson(res, 200, await extractStoreAssets(payload.sourceUrl));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/api/admin/stores') {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: 'Admin login required.' });
      const stores = readStores();
      const store = normalizeStore(JSON.parse(await readBody(req, 2_500_000)));
      if (stores.some((item) => item.slug === store.slug)) throw new Error('Store slug already exists.');
      stores.push(store);
      writeStores(stores);
      sendJson(res, 201, store);
      return;
    }

    const adminStoreMatch = url.pathname.match(/^\/api\/admin\/stores\/([^/]+)$/);
    if (req.method === 'PUT' && adminStoreMatch) {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: 'Admin login required.' });
      const stores = readStores();
      const index = stores.findIndex((item) => item.id === decodeURIComponent(adminStoreMatch[1]));
      if (index < 0) return sendJson(res, 404, { error: 'Store not found.' });
      const previous = stores[index];
      const store = normalizeStore(JSON.parse(await readBody(req, 2_500_000)), previous);
      if (stores.some((item, itemIndex) => itemIndex !== index && item.slug === store.slug)) throw new Error('Store slug already exists.');
      stores[index] = store;
      writeStores(stores);
      sendJson(res, 200, store);
      return;
    }

    if (req.method === 'DELETE' && adminStoreMatch) {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: 'Admin login required.' });
      const allStores = readJsonArrayFile(storesFile);
      const store = allStores.find((item) => item.id === decodeURIComponent(adminStoreMatch[1]));
      if (!store) return sendJson(res, 404, { error: 'Store not found.' });
      store.deleted = true;
      store.approved = false;
      store.updatedAt = new Date().toISOString();
      writeStores(allStores);
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/admin/categories") {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: "Admin login required." });
      sendJson(res, 200, readAdminCategoryPreferences());
      return;
    }

    if (req.method === "PUT" && url.pathname === "/api/admin/categories") {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: "Admin login required." });
      const payload = JSON.parse(await readBody(req));
      sendJson(res, 200, writeAdminCategoryPreferences(payload));
      return;
    }

    if (req.method === "PUT" && url.pathname === "/api/admin/offers/batch") {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: "Admin login required." });
      const payload = JSON.parse(await readBody(req, 2_000_000));
      const updates = Array.isArray(payload.updates) ? payload.updates.slice(0, 500) : [];
      const deleteIds = new Set((Array.isArray(payload.deleteIds) ? payload.deleteIds : []).slice(0, 500).map(String));
      const updateMap = new Map(updates.map((item) => [String(item.id || ""), item]));
      if (!updateMap.size && !deleteIds.size) throw new Error("No offer changes were supplied.");
      const current = readOffers();
      let updated = 0;
      let deleted = 0;
      const next = [];
      current.forEach((offer) => {
        if (deleteIds.has(offer.id)) { deleted += 1; return; }
        const change = updateMap.get(offer.id);
        if (!change) { next.push(offer); return; }
        const merged = { ...offer };
        if ("visible" in change) merged.visible = change.visible !== false && String(change.visible).toLowerCase() !== "false";
        if ("order" in change) merged.order = Math.max(-999999, Math.min(9999999, Number(change.order) || 0));
        if ("category" in change && String(change.category || "").trim()) merged.category = String(change.category).trim().slice(0, 120);
        if ("brand" in change && String(change.brand || "").trim()) merged.brand = String(change.brand).trim().slice(0, 160);
        next.push(sanitizeUpdatedOffer(merged, offer));
        updated += 1;
      });
      writeOffers(next);
      sendJson(res, 200, { ok: true, updated, deleted, total: next.length });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/admin/offers/refresh-assets") {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: "Admin login required." });
      const payload = JSON.parse(await readBody(req));
      const requestedIds = new Set((Array.isArray(payload.ids) ? payload.ids : []).slice(0, 40).map(String));
      const offers = readOffers();
      const targets = offers.filter((offer) => requestedIds.size ? requestedIds.has(offer.id) : (!offer.logo || !offer.productImage || /^https?:/i.test(offer.logo))).slice(0, 40);
      let refreshed = 0;
      const failures = [];
      for (const offer of targets) {
        try {
          const assets = await extractStoreAssets(offer.link);
          offer.logo = assets.logo || offer.logo;
          offer.productImage = assets.productImage || offer.productImage;
          offer.sourceTitle = assets.sourceTitle || offer.sourceTitle || "";
          offer.sourceDescription = assets.sourceDescription || offer.sourceDescription || "";
          offer.sourcePrice = assets.sourcePrice || offer.sourcePrice || "";
          offer.sourceCurrency = assets.sourceCurrency || offer.sourceCurrency || "";
          offer.sourceUrl = assets.sourceUrl || offer.sourceUrl || "";
          refreshed += 1;
        } catch (error) {
          failures.push({ id: offer.id, title: offer.title, error: error.message });
        }
      }
      if (refreshed) writeOffers(offers);
      sendJson(res, 200, { ok: true, refreshed, attempted: targets.length, failures });
      return;
    }

    if (req.method === "PUT" && url.pathname === "/api/admin/settings") {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: "Admin login required." });
      const settings = sanitizeSiteSettings(JSON.parse(await readBody(req, 2_500_000)));
      writeSiteSettings(settings);
      sendJson(res, 200, settings);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/admin/users") {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: "Admin login required." });
      sendJson(res, 200, readAdminUsers());
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/admin/subscribers") {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: "Admin login required." });
      sendJson(res, 200, readSubscribers().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      return;
    }

    const subscriberMatch = url.pathname.match(/^\/api\/admin\/subscribers\/([^/]+)$/);
    if (req.method === "DELETE" && subscriberMatch) {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: "Admin login required." });
      const subscriberId = decodeURIComponent(subscriberMatch[1]);
      const subscribers = readSubscribers();
      const subscriber = subscribers.find((item) => item.id === subscriberId);
      if (!subscriber) return sendJson(res, 404, { error: "Subscriber not found." });
      writeSubscribers(subscribers.filter((item) => item.id !== subscriberId));
      sendJson(res, 200, subscriber);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/admin/users") {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: "Admin login required." });
      const payload = JSON.parse(await readBody(req));
      const email = normalizeEmail(payload.email);
      const users = readAdminUsers();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Email không hợp lệ.");
      if (users.some((user) => user.email === email)) throw new Error("Email đã tồn tại.");
      const user = {
        id: `user_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`,
        name: String(payload.name || email.split("@")[0]).trim().slice(0, 100),
        username: String(payload.username || email.split("@")[0]).trim().slice(0, 60),
        email,
        phone: String(payload.phone || "").trim().slice(0, 30),
        role: ["Administrator", "Editor", "Viewer"].includes(payload.role) ? payload.role : "Editor",
        status: "active",
        createdAt: new Date().toISOString(),
      };
      writeAdminUsers([...users, user]);
      sendJson(res, 201, user);
      return;
    }

    const adminUserMatch = url.pathname.match(/^\/api\/admin\/users\/([^/]+)$/);
    if (req.method === "DELETE" && adminUserMatch) {
      const session = getAdminSession(req);
      if (!session) return sendJson(res, 401, { error: "Admin login required." });
      const users = readAdminUsers();
      const userId = decodeURIComponent(adminUserMatch[1]);
      const user = users.find((item) => item.id === userId);
      if (!user) return sendJson(res, 404, { error: "Không tìm thấy user." });
      if (user.email === session.email) return sendJson(res, 400, { error: "Không thể xóa tài khoản đang đăng nhập." });
      writeAdminUsers(users.filter((item) => item.id !== userId));
      sendJson(res, 200, user);
      return;
    }

    if (req.method === "GET" && url.pathname === "/api/projects") {
      if (!isAuthenticated(req)) {
        sendJson(res, 401, { error: "Admin login required." });
        return;
      }
      sendJson(res, 200, readProjects());
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/projects") {
      if (!isAuthenticated(req)) {
        sendJson(res, 401, { error: "Admin login required." });
        return;
      }
      const payload = JSON.parse(await readBody(req, 12_000_000));
      const { project, buffer } = sanitizeProjectUpload(payload);
      fs.writeFileSync(path.join(projectUploadsDir, project.storedFileName), buffer);
      writeProjects([project, ...readProjects()]);
      sendJson(res, 201, project);
      return;
    }

    const projectPreviewMatch = url.pathname.match(/^\/api\/projects\/([^/]+)\/preview$/);
    if (req.method === "GET" && projectPreviewMatch) {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: "Admin login required." });
      const project = readProjects().find((item) => item.id === decodeURIComponent(projectPreviewMatch[1]));
      if (!project) return sendJson(res, 404, { error: "File not found." });
      const filePath = path.join(projectUploadsDir, project.storedFileName);
      if (!fs.existsSync(filePath)) return sendJson(res, 404, { error: "File content not found." });
      const contentType = types[path.extname(filePath).toLowerCase()] || "application/octet-stream";
      send(res, 200, fs.readFileSync(filePath), contentType, { "Cache-Control": "private, max-age=300", "X-Content-Type-Options": "nosniff" });
      return;
    }

    const projectDownloadMatch = url.pathname.match(/^\/api\/projects\/([^/]+)\/download$/);
    if (req.method === "GET" && projectDownloadMatch) {
      if (!isAuthenticated(req)) {
        sendJson(res, 401, { error: "Admin login required." });
        return;
      }
      const project = readProjects().find((item) => item.id === decodeURIComponent(projectDownloadMatch[1]));
      if (!project) {
        sendJson(res, 404, { error: "Project not found." });
        return;
      }
      const filePath = path.join(projectUploadsDir, project.storedFileName);
      if (!fs.existsSync(filePath)) {
        sendJson(res, 404, { error: "Project file not found." });
        return;
      }
      const safeDownloadName = project.fileName.replace(/[\r\n"]/g, "_");
      send(res, 200, fs.readFileSync(filePath), "application/octet-stream", {
        "Content-Disposition": `attachment; filename="${safeDownloadName}"`,
        "X-Content-Type-Options": "nosniff",
      });
      return;
    }

    const projectMatch = url.pathname.match(/^\/api\/projects\/([^/]+)$/);
    if (req.method === "DELETE" && projectMatch) {
      if (!isAuthenticated(req)) {
        sendJson(res, 401, { error: "Admin login required." });
        return;
      }
      const projectId = decodeURIComponent(projectMatch[1]);
      const projects = readProjects();
      const index = projects.findIndex((item) => item.id === projectId);
      if (index === -1) {
        sendJson(res, 404, { error: "Project not found." });
        return;
      }
      const [deleted] = projects.splice(index, 1);
      const filePath = path.join(projectUploadsDir, deleted.storedFileName);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      writeProjects(projects);
      sendJson(res, 200, deleted);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/offers/batch/preview") {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: "Admin login required." });
      const payload = JSON.parse(await readBody(req, 15_000_000));
      const items = Array.isArray(payload) ? payload : payload.items;
      if (!Array.isArray(items) || !items.length) throw new Error("Không có Deal/Coupon để xem trước.");
      if (items.length > 500) throw new Error("Mỗi lần chỉ xử lý tối đa 500 Deal/Coupon.");
      const prepared = await prepareBatchOffers(items, { autoExtract: payload.autoExtract !== false });
      sendJson(res, 200, prepared);
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/offers/batch") {
      if (!isAuthenticated(req)) return sendJson(res, 401, { error: "Admin login required." });
      const payload = JSON.parse(await readBody(req, 15_000_000));
      const items = Array.isArray(payload) ? payload : payload.items;
      const sharedLogo = Array.isArray(payload) ? "" : String(payload.sharedLogo || "");
      if (!Array.isArray(items) || !items.length) throw new Error("Không có Deal/Coupon để import.");
      if (items.length > 500) throw new Error("Mỗi lần chỉ import tối đa 500 Deal/Coupon.");
      const prepared = await prepareBatchOffers(items.map((item) => ({ ...item, type: item.type || "deal", logo: item.logo || sharedLogo })), { autoExtract: payload.autoExtract === true });
      const created = prepared.items;
      const errors = [...prepared.errors, ...prepared.duplicates];
      if (created.length) {
        writeOffers([...created, ...readOffers()]);
        void notifySubscribersOfOffers(created);
      }
      sendJson(res, errors.length ? 207 : 201, { created, errors, duplicates: prepared.duplicates, total: items.length });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/offers") {
      if (!isAuthenticated(req)) {
        sendJson(res, 401, { error: "Admin login required." });
        return;
      }

      const payload = JSON.parse(await readBody(req));
      if (!payload.logo && payload.link && payload.autoExtract !== false) {
        try {
          const assets = await extractStoreAssets(payload.link);
          payload.logo = assets.logo;
          payload.productImage = assets.productImage;
        } catch {}
      }
      const offer = sanitizeOffer(payload);
      const offers = readOffers();
      writeOffers([offer, ...offers]);
      void notifySubscribersOfOffers([offer]);
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
      if (serveOfferAsset(req, res, decodeURIComponent(url.pathname))) return;
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
