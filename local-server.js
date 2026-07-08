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
const rootSeedOffersFile = path.join(root, "seed-offers.json");
const seedOffersFile = path.join(root, "data", "seed-offers.json");
const bundledOffersFile = path.join(root, "data", "offers.json");
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

function readJsonArrayFile(filePath, fallback = []) {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
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

function ensureDataFile() {
  fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(offersFile)) {
    fs.writeFileSync(offersFile, JSON.stringify(starterOffers, null, 2));
  } else if (starterOffers.length) {
    const currentOffers = readJsonArrayFile(offersFile);
    if (!currentOffers.length) {
      fs.writeFileSync(offersFile, JSON.stringify(starterOffers, null, 2));
    }
  }
  if (!fs.existsSync(adminEmailsFile)) {
    fs.writeFileSync(adminEmailsFile, JSON.stringify(starterAdminEmails, null, 2));
  }
}

function readOffers() {
  ensureDataFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(offersFile, "utf8"));
    if (Array.isArray(parsed) && parsed.length) {
      return normalizeOffers(parsed);
    }
    return normalizeOffers(starterOffers);
  } catch {
    return normalizeOffers(starterOffers);
  }
}

function writeOffers(offers) {
  ensureDataFile();
  fs.writeFileSync(offersFile, JSON.stringify(normalizeOffers(offers), null, 2));
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

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_500_000) {
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
  return groupOffersByBrand(readOffers()).get(normalizedSlug);
}

function storeStructuredData(group) {
  const storePath = getOfferStorePath(group.brand);
  const storeUrl = getAbsoluteUrl(storePath);
  const title = `${group.brand} Coupons and Promo Codes`;
  const description = `Browse all verified ${group.brand} coupon codes, deals, discounts, and affiliate offers on AloCoupon.`;

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
            "name": "Coupon Store",
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
        "isPartOf": {
          "@id": `${siteUrl}/#website`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${storeUrl}#offers`,
        "itemListElement": group.items.map((offer, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": getAbsoluteUrl(getOfferDealPath(offer)),
          "name": getDisplayOfferTitle(offer),
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

function sanitizeBrandLogo(value) {
  const logo = String(value || "").trim();
  if (!logo) return "";

  const match = logo.match(/^data:image\/(png|jpeg|webp|gif);base64,([a-z0-9+/]+={0,2})$/i);
  if (!match) throw new Error("Logo must be a PNG, JPG, WEBP, or GIF image.");

  const byteLength = Buffer.from(match[2], "base64").length;
  if (!byteLength || byteLength > 500 * 1024) {
    throw new Error("Deal logo must be 500 KB or smaller.");
  }
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
    review: String(input.review || "").trim(),
    logo: sanitizeBrandLogo(input.logo),
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
    const logoInput = form.elements.logoFile;
    const logoPreview = document.querySelector("#logo-preview");
    const logoPreviewImage = logoPreview.querySelector("img");
    const removeLogoButton = document.querySelector("#remove-logo-btn");
    let currentOffers = [];
    let currentLogo = "";

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

    async function loadOffers() {
      const res = await fetch("/api/offers");
      const offers = await res.json();
      currentOffers = Array.isArray(offers) ? offers : [];
      count.textContent = offers.length;
      list.innerHTML = offers.length ? offers.map((offer) => \`
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
      if (!currentLogo) {
        showToast("Please upload a logo for this deal.");
        logoInput.focus();
        return;
      }
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

function storePage(group) {
  const brand = escapeHtml(group.brand);
  const storePath = getOfferStorePath(group.brand);
  const storeUrl = escapeHtml(getAbsoluteUrl(storePath));
  const description = escapeHtml(`All verified ${group.brand} coupon codes, promo codes, product deals, and affiliate offers on AloCoupon.`);
  const structuredData = jsonLdScript(storeStructuredData(group));
  const codeCount = group.items.filter((offer) => isUsableCouponCode(offer.code)).length;
  const dealCount = group.items.length - codeCount;
  const bestOffer = escapeHtml(group.items[0]?.discount || "Best Deal");
  const affiliateLink = escapeHtml(getAloCouponTrackingUrl(group.items[0]?.link || "#"));
  const offerRows = group.items.map((offer) => {
    const title = escapeHtml(getDisplayOfferTitle(offer));
    const summary = escapeHtml(getOfferSummary(offer));
    const discount = escapeHtml(offer.discount || "Deal");
    const code = escapeHtml(isUsableCouponCode(offer.code) ? offer.code : "No code needed");
    const typeLabel = isUsableCouponCode(offer.code) ? "Coupon code" : "Affiliate deal";
    const safeLink = escapeHtml(getAloCouponTrackingUrl(offer.link));
    const dealLink = escapeHtml(getOfferDealPath(offer));
    return `
      <article class="brand-offer-card">
        <div class="brand-offer-discount">${discount}</div>
        <div>
          <p class="brand-offer-type">${typeLabel}</p>
          <h2><a href="${dealLink}">${title}</a></h2>
          <p>${summary}</p>
          <div class="brand-offer-code">${code}</div>
        </div>
        <a class="brand-offer-action" href="${safeLink}" rel="sponsored noopener">Open</a>
      </article>
    `;
  }).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="index, follow" />
  <title>${brand} Coupons and Promo Codes | AloCoupon</title>
  <meta name="description" content="${description}" />
  <link rel="canonical" href="${storeUrl}" />
  <link rel="alternate" type="application/rss+xml" title="AloCoupon Latest Deals" href="${escapeHtml(getAbsoluteUrl("/rss.xml"))}" />
  ${structuredData}
  <link rel="stylesheet" href="/styles.css" />
  <style>
    body { background: #f4fbf8; color: #17202a; font-family: Arial, sans-serif; margin: 0; }
    .brand-page { margin: 0 auto; max-width: 1080px; padding: 42px 20px 64px; }
    .brand-hero { background: #fff; border: 1px solid #dfe7ef; border-radius: 12px; box-shadow: 0 20px 50px rgba(16, 24, 40, .1); padding: 28px; }
    .brand-eyebrow { color: #08764f; font-size: 13px; font-weight: 900; letter-spacing: .02em; margin: 0 0 8px; text-transform: uppercase; }
    .brand-page h1 { color: #17202a; font-size: clamp(2rem, 5vw, 3.4rem); line-height: 1.05; margin: 0 0 12px; }
    .brand-copy { color: #5f6d7e; font-size: 1rem; margin: 0 0 18px; max-width: 720px; }
    .brand-stats { display: flex; flex-wrap: wrap; gap: 10px; margin: 18px 0 0; }
    .brand-stats span { background: #e8f8f0; border-radius: 999px; color: #08764f; font-weight: 900; padding: 8px 12px; }
    .brand-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
    .brand-actions a { background: #13a76b; border-radius: 999px; color: #fff; font-weight: 900; padding: 12px 16px; text-decoration: none; }
    .brand-actions a.secondary { background: #e8f8f0; color: #08764f; }
    .brand-offer-list { display: grid; gap: 14px; margin-top: 22px; }
    .brand-offer-card { align-items: center; background: #fff; border: 1px solid #dfe7ef; border-radius: 10px; box-shadow: 0 12px 28px rgba(16, 24, 40, .08); display: grid; gap: 18px; grid-template-columns: 120px 1fr auto; padding: 18px; }
    .brand-offer-discount { color: #029b22; font-size: 1.5rem; font-weight: 900; text-align: center; }
    .brand-offer-type { color: #667085; font-size: .78rem; font-weight: 900; margin: 0 0 6px; text-transform: uppercase; }
    .brand-offer-card h2 { font-size: 1.12rem; margin: 0 0 6px; }
    .brand-offer-card h2 a { color: inherit; text-decoration: none; }
    .brand-offer-card h2 a:hover { color: #08764f; text-decoration: underline; text-underline-offset: 3px; }
    .brand-offer-card p { color: #667085; margin: 0 0 10px; }
    .brand-offer-code { background: #f8fafc; border: 1px dashed #94a3b8; border-radius: 8px; display: inline-block; font-weight: 900; padding: 8px 10px; }
    .brand-offer-action { background: #029b22; border-radius: 7px; color: #fff; font-weight: 900; padding: 12px 14px; text-align: center; text-decoration: none; }
    @media (max-width: 760px) { .brand-offer-card { grid-template-columns: 1fr; } .brand-offer-discount { text-align: left; } .brand-offer-action { width: fit-content; } }
  </style>
</head>
<body>
  <main class="brand-page">
    <section class="brand-hero">
      <p class="brand-eyebrow">AloCoupon Store Page</p>
      <h1>${brand} Coupons and Promo Codes</h1>
      <p class="brand-copy">${description}</p>
      <div class="brand-stats">
        <span>${group.items.length} offers</span>
        <span>${codeCount} coupon codes</span>
        <span>${dealCount} deals</span>
        <span>Best offer: ${bestOffer}</span>
      </div>
      <div class="brand-actions">
        <a href="${affiliateLink}" rel="sponsored noopener">Open</a>
        <a class="secondary" href="/#store-detail">Back to Coupon Store</a>
      </div>
    </section>
    <section class="brand-offer-list" aria-label="${brand} offers">
      ${offerRows}
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
