const toast = document.querySelector(".toast");
let currentLang = localStorage.getItem("siteLanguage") || "en";

const languageMeta = {
  en: { code: "EN", flagSrc: "assets/flags/us.svg" },
  fr: { code: "FR", flagSrc: "assets/flags/fr.svg" },
  pt: { code: "PT", flagSrc: "assets/flags/pt.svg" }
};

const translations = {
  en: {
    metaTitle: "AloCoupon Coupons, Promo Codes & Product Reviews",
    "nav.stores": "Stores",
    "nav.deals": "Deals",
    "nav.categories": "Categories",
    "nav.reviews": "Reviews",
    "nav.faq": "FAQ",
    "search.placeholder": "Search deals",
    "search.button": "Search",
    "hero.eyebrow": "Leading Coupons & Deals Marketplace",
    "hero.title": "Leading Coupons & Deals Marketplace",
    "hero.copy": "Discover verified affiliate offers, featured stores, product reviews, and limited-time coupon codes for software, AI tools, ecommerce products, fashion, food, electronics, and more.",
    "hero.primary": "Browse Today's Deals",
    "hero.secondary": "Explore Stores",
    "stores.title": "Popular Store",
    "stores.link": "View All Stores",
    "stores.intro": "Explore stores and brands with active affiliate campaigns, product discounts, and coupon opportunities.",
    "deals.title": "Deals Of Today",
    "deals.link": "Deals",
    "deals.intro": "Compare current promo codes, free trials, and limited-time savings before visiting each product website.",
    "deals.getDeal": "Get Deal",
    "deals.visit": "Visit Product Link",
    "deal1.badge": "Free Trial",
    "deal1.media": "AI Video",
    "deal1.title": "HeyGen Deal: Get Started with Free Trial Plan",
    "deal1.desc": "Create studio-quality AI videos with avatars, voiceovers, and templates for product demos, ads, and social campaigns.",
    "deal2.badge": "30% Off",
    "deal2.media": "Backup",
    "deal2.title": "WPvivid Backup Pro Coupon for WordPress Sites",
    "deal2.desc": "Protect WordPress sites with scheduled backups, migration tools, and simple restore options for client or store projects.",
    "deal3.badge": "15% Off",
    "deal3.media": "Commerce",
    "deal3.title": "Barn2 WooCommerce Plugin Bundle Discount Code",
    "deal3.desc": "Upgrade WooCommerce stores with product tables, filters, bulk ordering, and conversion-focused shopping experiences.",
    "feedback.eyebrow": "Trustpilot Feedback",
    "feedback.title": "Product Review Signals from Trustpilot",
    "feedback.copy": "Review snapshots for featured products, summarized from public Trustpilot pages so visitors can compare customer sentiment before claiming a deal.",
    "feedback.updated": "Source: Trustpilot public review pages",
    "feedback.heygen": "Trustpilot reviewers often mention easy video creation, AI avatars, and voice options, while some users report concerns around product credits and subscriptions.",
    "feedback.wpvivid": "WPvivid has a small Trustpilot sample, so the score should be treated carefully. The current public page shows limited review volume and mixed confidence.",
    "feedback.barn2": "Barn2 receives strong Trustpilot feedback, especially around plugin functionality, responsive support, and help with WooCommerce customization.",
    "feedback.source": "Source: Trustpilot",
    "faq.title": "Coupon and Product Review FAQ",
    "faq.q1": "How does AloCoupon choose coupon offers?",
    "faq.a1": "AloCoupon highlights affiliate offers with clear product value, visible discount details, and direct product links so visitors can compare deals quickly.",
    "faq.q2": "Can visitors check reviews before claiming a coupon?",
    "faq.a2": "Yes. Featured deals include Trustpilot source notes where available, helping shoppers review customer sentiment before visiting a product site.",
    "faq.q3": "Which coupon categories are available?",
    "faq.a3": "The marketplace covers AI, ecommerce, software, electronics, fashion, food, health, travel, web hosting, and other shopping categories.",
    "categories.title": "All Categories",
    "categories.intro": "Find deals by shopping intent, product type, or affiliate niche.",
    "cat.ai": "AI",
    "cat.automotive": "Automotive",
    "cat.beauty": "Beauty and Fragrance",
    "cat.software": "Computers and Software",
    "cat.ecommerce": "Ecommerce",
    "cat.electronics": "Electronics",
    "cat.fashion": "Fashion",
    "cat.finance": "Financial Services",
    "cat.food": "Food",
    "cat.gaming": "Gaming and Esports",
    "cat.health": "Health",
    "cat.home": "Home Garden",
    "cat.phone": "Phone Accessories",
    "cat.saas": "SaaS",
    "cat.tips": "Saving Tips",
    "cat.review": "Store Review",
    "cat.travel": "Travel",
    "cat.hosting": "Web Hosting",
    "footer.copy": "Coupon marketplace for affiliate campaigns, store reviews, and verified promotional offers.",
    "footer.events": "Event Sales",
    "footer.blackFriday": "Black Friday",
    "footer.christmas": "Christmas",
    "footer.valentine": "Valentine",
    "footer.resources": "Resources",
    "footer.productFeed": "Product Feed",
    "footer.bestRated": "Best Rated Product",
    "footer.customerFeedback": "Customer Feedback",
    "footer.company": "Company",
    "footer.about": "About Us",
    "footer.contact": "Contact Us",
    "footer.help": "Help Center",
    "footer.social": "Social",
    copiedLabel: "Code Copied",
    copiedToast: "Coupon code {code} copied.",
    fallbackToast: "Your coupon code: {code}",
    searchToast: "Showing today's featured deals."
  },
  fr: {
    metaTitle: "AloCoupon Coupons, Codes Promo et Avis Produits",
    "nav.stores": "Boutiques",
    "nav.deals": "Offres",
    "nav.categories": "Catégories",
    "nav.reviews": "Avis",
    "nav.faq": "FAQ",
    "search.placeholder": "Rechercher des offres",
    "search.button": "Rechercher",
    "hero.eyebrow": "Marketplace leader de coupons et offres",
    "hero.title": "Marketplace leader de coupons et offres",
    "hero.copy": "Découvrez des offres d'affiliation vérifiées, des boutiques mises en avant, des avis produits et des codes promo limités pour les logiciels, les outils IA, l'ecommerce, la mode, l'alimentation, l'électronique et plus encore.",
    "hero.primary": "Voir les offres du jour",
    "hero.secondary": "Explorer les boutiques",
    "stores.title": "Boutiques populaires",
    "stores.link": "Voir toutes les boutiques",
    "stores.intro": "Explorez les boutiques et marques avec des campagnes d'affiliation actives, des remises produits et des opportunités de coupons.",
    "deals.title": "Offres du jour",
    "deals.link": "Offres",
    "deals.intro": "Comparez les codes promo, essais gratuits et économies limitées avant de visiter le site de chaque produit.",
    "deals.getDeal": "Obtenir l'offre",
    "deals.visit": "Voir le lien produit",
    "deal1.badge": "Essai gratuit",
    "deal1.media": "Vidéo IA",
    "deal1.title": "Offre HeyGen : commencez avec le plan d'essai gratuit",
    "deal1.desc": "Créez des vidéos IA de qualité studio avec avatars, voix off et modèles pour démonstrations produit, publicités et campagnes sociales.",
    "deal2.badge": "-30 %",
    "deal2.media": "Sauvegarde",
    "deal2.title": "Coupon WPvivid Backup Pro pour sites WordPress",
    "deal2.desc": "Protégez les sites WordPress avec des sauvegardes planifiées, des outils de migration et des options de restauration simples.",
    "deal3.badge": "-15 %",
    "deal3.media": "Commerce",
    "deal3.title": "Code de réduction Barn2 pour le bundle WooCommerce",
    "deal3.desc": "Améliorez les boutiques WooCommerce avec des tableaux produits, filtres, commandes groupées et expériences d'achat orientées conversion.",
    "feedback.eyebrow": "Avis Trustpilot",
    "feedback.title": "Signaux d'avis produits depuis Trustpilot",
    "feedback.copy": "Aperçus d'avis pour les produits mis en avant, résumés depuis les pages publiques Trustpilot afin d'aider les visiteurs à comparer le sentiment client avant de réclamer une offre.",
    "feedback.updated": "Source : pages d'avis publiques Trustpilot",
    "feedback.heygen": "Les avis Trustpilot mentionnent souvent la création vidéo simple, les avatars IA et les options vocales, tandis que certains utilisateurs signalent des préoccupations liées aux crédits et aux abonnements.",
    "feedback.wpvivid": "WPvivid possède un petit échantillon d'avis Trustpilot, le score doit donc être lu avec prudence. La page publique actuelle montre un volume d'avis limité et une confiance mitigée.",
    "feedback.barn2": "Barn2 reçoit de bons retours Trustpilot, notamment sur les fonctionnalités des plugins, le support réactif et l'aide à la personnalisation WooCommerce.",
    "feedback.source": "Source : Trustpilot",
    "faq.title": "FAQ coupons et avis produits",
    "faq.q1": "Comment AloCoupon choisit-il les offres de coupons ?",
    "faq.a1": "AloCoupon met en avant les offres d'affiliation avec une valeur produit claire, des détails de réduction visibles et des liens directs afin de comparer rapidement les offres.",
    "faq.q2": "Les visiteurs peuvent-ils consulter les avis avant de réclamer un coupon ?",
    "faq.a2": "Oui. Les offres mises en avant incluent des mentions de source Trustpilot lorsque disponibles, afin d'aider les acheteurs à évaluer le sentiment client avant de visiter le site du produit.",
    "faq.q3": "Quelles catégories de coupons sont disponibles ?",
    "faq.a3": "La marketplace couvre l'IA, l'ecommerce, les logiciels, l'électronique, la mode, l'alimentation, la santé, le voyage, l'hébergement web et d'autres catégories shopping.",
    "categories.title": "Toutes les catégories",
    "categories.intro": "Trouvez des offres selon l'intention d'achat, le type de produit ou la niche d'affiliation.",
    "cat.ai": "IA",
    "cat.automotive": "Automobile",
    "cat.beauty": "Beauté et parfum",
    "cat.software": "Informatique et logiciels",
    "cat.ecommerce": "Ecommerce",
    "cat.electronics": "Électronique",
    "cat.fashion": "Mode",
    "cat.finance": "Services financiers",
    "cat.food": "Alimentation",
    "cat.gaming": "Gaming et esport",
    "cat.health": "Santé",
    "cat.home": "Maison et jardin",
    "cat.phone": "Accessoires téléphone",
    "cat.saas": "SaaS",
    "cat.tips": "Conseils d'économie",
    "cat.review": "Avis boutique",
    "cat.travel": "Voyage",
    "cat.hosting": "Hébergement web",
    "footer.copy": "Marketplace de coupons pour campagnes d'affiliation, avis boutiques et offres promotionnelles vérifiées.",
    "footer.events": "Ventes événementielles",
    "footer.blackFriday": "Black Friday",
    "footer.christmas": "Noël",
    "footer.valentine": "Saint-Valentin",
    "footer.resources": "Ressources",
    "footer.productFeed": "Flux produits",
    "footer.bestRated": "Produits les mieux notés",
    "footer.customerFeedback": "Avis clients",
    "footer.company": "Entreprise",
    "footer.about": "À propos",
    "footer.contact": "Contact",
    "footer.help": "Centre d'aide",
    "footer.social": "Réseaux",
    copiedLabel: "Code copié",
    copiedToast: "Code coupon {code} copié.",
    fallbackToast: "Votre code coupon : {code}",
    searchToast: "Affichage des offres du jour."
  },
  pt: {
    metaTitle: "AloCoupon Cupons, Códigos Promocionais e Avaliações",
    "nav.stores": "Lojas",
    "nav.deals": "Ofertas",
    "nav.categories": "Categorias",
    "nav.reviews": "Avaliações",
    "nav.faq": "FAQ",
    "search.placeholder": "Pesquisar ofertas",
    "search.button": "Pesquisar",
    "hero.eyebrow": "Marketplace líder de cupons e ofertas",
    "hero.title": "Marketplace líder de cupons e ofertas",
    "hero.copy": "Descubra ofertas de afiliados verificadas, lojas em destaque, avaliações de produtos e códigos promocionais por tempo limitado para software, ferramentas de IA, ecommerce, moda, alimentação, eletrônicos e muito mais.",
    "hero.primary": "Ver ofertas de hoje",
    "hero.secondary": "Explorar lojas",
    "stores.title": "Lojas populares",
    "stores.link": "Ver todas as lojas",
    "stores.intro": "Explore lojas e marcas com campanhas de afiliados ativas, descontos em produtos e oportunidades de cupons.",
    "deals.title": "Ofertas de hoje",
    "deals.link": "Ofertas",
    "deals.intro": "Compare códigos promocionais, testes grátis e economias por tempo limitado antes de visitar o site de cada produto.",
    "deals.getDeal": "Obter oferta",
    "deals.visit": "Visitar link do produto",
    "deal1.badge": "Teste grátis",
    "deal1.media": "Vídeo com IA",
    "deal1.title": "Oferta HeyGen: comece com o plano de teste grátis",
    "deal1.desc": "Crie vídeos de IA com qualidade de estúdio usando avatares, locuções e modelos para demos de produto, anúncios e campanhas sociais.",
    "deal2.badge": "30% Off",
    "deal2.media": "Backup",
    "deal2.title": "Cupom WPvivid Backup Pro para sites WordPress",
    "deal2.desc": "Proteja sites WordPress com backups agendados, ferramentas de migração e opções simples de restauração.",
    "deal3.badge": "15% Off",
    "deal3.media": "Commerce",
    "deal3.title": "Código de desconto Barn2 para pacote WooCommerce",
    "deal3.desc": "Melhore lojas WooCommerce com tabelas de produtos, filtros, pedidos em massa e experiências de compra focadas em conversão.",
    "feedback.eyebrow": "Feedback Trustpilot",
    "feedback.title": "Sinais de avaliação de produtos no Trustpilot",
    "feedback.copy": "Resumo de avaliações dos produtos em destaque, baseado em páginas públicas do Trustpilot para ajudar visitantes a comparar a percepção dos clientes antes de resgatar uma oferta.",
    "feedback.updated": "Fonte: páginas públicas de avaliações do Trustpilot",
    "feedback.heygen": "Avaliações no Trustpilot frequentemente mencionam criação de vídeo fácil, avatares de IA e opções de voz, enquanto alguns usuários relatam preocupações com créditos e assinaturas.",
    "feedback.wpvivid": "O WPvivid tem uma amostra pequena no Trustpilot, então a pontuação deve ser lida com cuidado. A página pública atual mostra volume limitado de avaliações e confiança mista.",
    "feedback.barn2": "O Barn2 recebe feedback forte no Trustpilot, especialmente sobre funcionalidades dos plugins, suporte responsivo e ajuda com personalização WooCommerce.",
    "feedback.source": "Fonte: Trustpilot",
    "faq.title": "FAQ sobre cupons e avaliações de produtos",
    "faq.q1": "Como a AloCoupon escolhe ofertas de cupons?",
    "faq.a1": "A AloCoupon destaca ofertas de afiliados com valor claro de produto, detalhes visíveis de desconto e links diretos para que visitantes comparem ofertas rapidamente.",
    "faq.q2": "Os visitantes podem verificar avaliações antes de resgatar um cupom?",
    "faq.a2": "Sim. As ofertas em destaque incluem notas de fonte do Trustpilot quando disponíveis, ajudando compradores a revisar a percepção dos clientes antes de visitar o site do produto.",
    "faq.q3": "Quais categorias de cupons estão disponíveis?",
    "faq.a3": "A marketplace cobre IA, ecommerce, software, eletrônicos, moda, alimentação, saúde, viagens, hospedagem web e outras categorias de compras.",
    "categories.title": "Todas as categorias",
    "categories.intro": "Encontre ofertas por intenção de compra, tipo de produto ou nicho de afiliados.",
    "cat.ai": "IA",
    "cat.automotive": "Automotivo",
    "cat.beauty": "Beleza e fragrâncias",
    "cat.software": "Computadores e software",
    "cat.ecommerce": "Ecommerce",
    "cat.electronics": "Eletrônicos",
    "cat.fashion": "Moda",
    "cat.finance": "Serviços financeiros",
    "cat.food": "Alimentação",
    "cat.gaming": "Games e esports",
    "cat.health": "Saúde",
    "cat.home": "Casa e jardim",
    "cat.phone": "Acessórios para celular",
    "cat.saas": "SaaS",
    "cat.tips": "Dicas de economia",
    "cat.review": "Avaliação de loja",
    "cat.travel": "Viagens",
    "cat.hosting": "Hospedagem web",
    "footer.copy": "Marketplace de cupons para campanhas de afiliados, avaliações de lojas e ofertas promocionais verificadas.",
    "footer.events": "Vendas sazonais",
    "footer.blackFriday": "Black Friday",
    "footer.christmas": "Natal",
    "footer.valentine": "Dia dos Namorados",
    "footer.resources": "Recursos",
    "footer.productFeed": "Feed de produtos",
    "footer.bestRated": "Produto mais bem avaliado",
    "footer.customerFeedback": "Feedback dos clientes",
    "footer.company": "Empresa",
    "footer.about": "Sobre nós",
    "footer.contact": "Contato",
    "footer.help": "Central de ajuda",
    "footer.social": "Redes sociais",
    copiedLabel: "Código copiado",
    copiedToast: "Código do cupom {code} copiado.",
    fallbackToast: "Seu código de cupom: {code}",
    searchToast: "Mostrando as ofertas em destaque de hoje."
  }
};

function t(key) {
  return translations[currentLang][key] || translations.en[key] || key;
}

function applyLanguage(lang) {
  currentLang = translations[lang] ? lang : "en";
  localStorage.setItem("siteLanguage", currentLang);
  document.documentElement.lang = currentLang;
  document.title = t("metaTitle");

  document.querySelectorAll("[data-i18n]").forEach((item) => {
    item.textContent = t(item.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((item) => {
    item.placeholder = t(item.dataset.i18nPlaceholder);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((item) => {
    item.setAttribute("aria-label", t(item.dataset.i18nAriaLabel));
  });

  document.querySelectorAll(".lang-btn").forEach((button) => {
    const isActive = button.dataset.lang === currentLang;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const activeLanguage = languageMeta[currentLang] || languageMeta.en;
  document.querySelectorAll(".current-flag").forEach((item) => {
    item.src = activeLanguage.flagSrc;
  });
  document.querySelectorAll(".current-lang").forEach((item) => {
    item.textContent = activeLanguage.code;
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

async function copyCoupon(code) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(code);
    return;
  }

  const input = document.createElement("input");
  input.value = code;
  input.setAttribute("readonly", "");
  input.style.position = "absolute";
  input.style.left = "-9999px";
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function bindCouponButton(button) {
  button.addEventListener("click", async () => {
    const code = button.dataset.code || "";
    const safeLink = button.dataset.link || "#";
    const originalLabel = button.textContent;

    if (!isUsableCouponCode(code)) {
      if (safeLink !== "#") {
        openAffiliateLinkAfterDelay(safeLink);
      }
      showToast("Opening AloCoupon deal page.");
      return;
    }

    try {
      await copyCoupon(code);
      button.textContent = button.classList.contains("claim-btn") ? t("copiedLabel") : "Copied";
      button.setAttribute("aria-label", `Copied coupon code ${code}`);
      showToast(t("copiedToast").replace("{code}", code));

      window.setTimeout(() => {
        button.textContent = button.dataset.i18n ? t(button.dataset.i18n) : originalLabel;
      }, 2200);
    } catch {
      showToast(t("fallbackToast").replace("{code}", code));
    }
  });
}

document.querySelectorAll(".claim-btn").forEach((button) => {
  bindCouponButton(button);
});

document.querySelector(".search-box")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = event.currentTarget.querySelector("input")?.value || "";
  filterDeals(query);
  document.querySelector("#deals")?.scrollIntoView({ behavior: "smooth" });
  showToast(query.trim() ? `Showing deals for "${query.trim()}".` : t("searchToast"));
});

const storeToolPanels = document.querySelectorAll(".is-tool-panel");
const storeToolTriggers = document.querySelectorAll(".store-tool-trigger");

function openStoreToolPanel(panelId = "store-detail") {
  const storeToolPanel = document.querySelector(`#${panelId}`);
  if (!storeToolPanel) {
    return;
  }

  storeToolPanels.forEach((panel) => {
    const isTarget = panel === storeToolPanel;
    panel.hidden = !isTarget;
    panel.classList.toggle("is-open", isTarget);
    if (!isTarget) {
      panel.classList.remove("is-visible");
    }
  });

  storeToolPanel.hidden = false;
  storeToolPanel.classList.add("is-open", "is-visible");
  storeToolTriggers.forEach((trigger) => {
    const isActive = trigger.dataset.panel === panelId;
    trigger.classList.toggle("is-active", isActive);
    trigger.setAttribute("aria-expanded", String(isActive));
  });
  storeToolPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

storeToolTriggers.forEach((trigger) => {
  const panelId = trigger.dataset.panel || "store-detail";
  trigger.setAttribute("aria-controls", panelId);
  trigger.setAttribute("aria-expanded", "false");
  trigger.addEventListener("click", () => openStoreToolPanel(panelId));
});

document.querySelectorAll(".store-search").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const panel = form.closest(".is-tool-panel");
    openStoreToolPanel(panel?.id || "store-detail");
    showToast("Showing matched store coupons.");
  });
});

document.querySelectorAll(".coupon-alert-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const storeName = button.closest(".store-profile")?.querySelector("h2")?.textContent || "this store";
    showToast(`Coupon alert enabled for ${storeName}.`);
  });
});

document.querySelectorAll(".coupon-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const filter = tab.dataset.filter || "all";
    const panel = tab.closest(".store-coupon-panel");
    panel?.querySelectorAll(".coupon-tab").forEach((item) => {
      item.classList.toggle("is-active", item === tab);
    });

    panel?.querySelectorAll(".store-coupon-card").forEach((card) => {
      const types = (card.dataset.couponType || "").split(" ");
      card.classList.toggle("is-hidden", filter !== "all" && !types.includes(filter));
    });

    panel?.querySelectorAll(".store-coupon-group").forEach((group) => {
      const visibleCards = group.querySelectorAll(".store-coupon-card:not(.is-hidden)");
      group.classList.toggle("is-hidden", visibleCards.length === 0);
    });
  });
});

document.querySelectorAll(".store-coupon-action").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = button.dataset.code;
    const originalLabel = button.textContent;

    try {
      await copyCoupon(code);
      button.textContent = "Copied";
      showToast(`Coupon code ${code} copied.`);
      window.setTimeout(() => {
        button.textContent = originalLabel;
      }, 1800);
    } catch {
      showToast(`Coupon code: ${code}`);
    }
  });
});

const affiliateItemsEl = document.querySelector("#affiliate-items");
const dealSearchResultsEl = document.querySelector("#deal-search-results");
const dealEmptyStateEl = document.querySelector("#deal-empty-state");
const liveCouponListEl = document.querySelector("#live-coupon-list");
const liveStoreInitialsEl = document.querySelector("#live-store-initials");
const liveStoreNameEl = document.querySelector("#live-store-name");
const liveStoreRatingEl = document.querySelector("#live-store-rating");
const liveStoreCouponCountEl = document.querySelector("#live-store-coupon-count");
const liveStoreCodeCountEl = document.querySelector("#live-store-code-count");
const liveStoreDealCountEl = document.querySelector("#live-store-deal-count");
const liveStoreBestOfferEl = document.querySelector("#live-store-best-offer");
const liveCouponHeadingEl = document.querySelector("#live-coupon-heading");
const liveCouponSubheadingEl = document.querySelector("#live-coupon-subheading");
const liveAboutTitleEl = document.querySelector("#live-about-title");
const liveAboutCopyEl = document.querySelector("#live-about-copy");
const starterAffiliateItems = [];
const featuredCouponItems = [];

async function getAffiliateItems() {
  if (window.location.protocol === "file:") {
    return starterAffiliateItems;
  }

  try {
    const response = await fetch("/api/offers", { headers: { "Accept": "application/json" } });
    if (!response.ok) {
      return starterAffiliateItems;
    }

    const items = await response.json();
    return Array.isArray(items) ? sortOffersNewestFirst(items) : starterAffiliateItems;
  } catch {
    return starterAffiliateItems;
  }
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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

  return `${window.location.origin}/go?utm_source=alocoupon&url=${encodeURIComponent(affiliateUrl)}`;
}

function getAloCouponAffiliateUrl(value) {
  return getAloCouponTrackingUrl(value);
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getOfferDealUrl(item) {
  const base = slugify([item?.brand, item?.title].filter(Boolean).join(" ")) || "deal";
  const id = slugify(item?.id) || slugify(item?.link) || Date.now().toString(36);
  return `/deal/${base}-${id}`;
}

function handleAloCouponRedirectPage() {
  if (window.location.pathname !== "/go" && !window.location.pathname.startsWith("/go/")) {
    return;
  }

  const target = addAloCouponUtmToAffiliate(
    new URLSearchParams(window.location.search).get("url") ||
    `https://${window.location.pathname.slice("/go/".length)}${window.location.search}${window.location.hash}`
  );
  if (target !== "#") {
    window.location.replace(target);
  }
}

handleAloCouponRedirectPage();

function openAffiliateLinkAfterDelay(url) {
  window.location.href = url;
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a.product-link");
  if (!link) {
    return;
  }

  const href = link.getAttribute("href");
  if (!href || href === "#") {
    return;
  }

  event.preventDefault();
  showToast("Opening AloCoupon deal page.");
  openAffiliateLinkAfterDelay(href);
});

function normalizeStoreKey(value) {
  return String(value || "").trim().toLowerCase();
}

function isUsableCouponCode(code) {
  const normalized = String(code || "").trim().toUpperCase();
  return Boolean(normalized && !["DEAL", "NO CODE", "NO-CODE"].includes(normalized));
}

function getOfferKind(item) {
  const type = String(item?.type || "").trim().toLowerCase();
  if (type === "promotion" || type === "promo") {
    return "promotion";
  }
  if (type === "deal" || !isUsableCouponCode(item?.code)) {
    return "deal";
  }
  return "code";
}

function getOfferTypeLabel(item) {
  const kind = getOfferKind(item);
  if (kind === "promotion") {
    return "Promotion Code";
  }
  return kind === "deal" ? "Deal" : "Code";
}

function getOfferButtonLabel(item) {
  const kind = getOfferKind(item);
  if (kind === "promotion") {
    return "Get Promo Code";
  }
  return kind === "deal" ? "Get Deal" : "Get Code";
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

function getOfferBrandName(item) {
  const text = String(item?.review || item?.title || "");
  const atMatch = text.match(/\bat\s+([^()]+?)(?:\s+w\/code|\s+with\b|\s+coupon\b|\s+code\b|$)/i);
  if (atMatch?.[1]) {
    return atMatch[1].trim();
  }

  return getPrettyBrandName(item?.brand);
}

function getDisplayOfferTitle(item) {
  const brand = getOfferBrandName(item);
  const discount = String(item?.discount || "").trim();
  const code = String(item?.code || "").trim();
  const review = String(item?.review || item?.title || "").trim();

  if (isUsableCouponCode(code)) {
    return `${brand} Coupon Code ${code}${discount ? ` - ${discount}` : ""}`;
  }

  if (discount) {
    return `${brand} Deal - ${discount}`;
  }

  return review || `${brand} Deal`;
}

function getOfferSummary(item) {
  const title = String(item?.title || "").trim();
  const review = String(item?.review || "").trim();
  const displayTitle = getDisplayOfferTitle(item);
  return review && review !== title && review !== displayTitle ? review : title || review || displayTitle;
}

function getOfferTime(item) {
  const time = new Date(item?.createdAt || 0).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function sortOffersNewestFirst(items) {
  return [...items].sort((a, b) => getOfferTime(b) - getOfferTime(a));
}

function groupOffersByBrand(items) {
  return sortOffersNewestFirst(items).reduce((groups, item) => {
    const brand = String(item.brand || "Partner Store").trim() || "Partner Store";
    const key = normalizeStoreKey(brand);
    if (!groups.has(key)) {
      groups.set(key, { brand, items: [] });
    }
    groups.get(key).items.push(item);
    return groups;
  }, new Map());
}

function getBestOffer(items) {
  return items.find((item) => isUsableCouponCode(item.code))?.discount || items[0]?.discount || "Best Deal";
}

function createAffiliateCard(item, index) {
  const article = document.createElement("article");
  article.className = "admin-offer-card";

  const safeLink = getAloCouponAffiliateUrl(item.link);
  const brand = escapeHtml(getOfferBrandName(item));
  const title = escapeHtml(getDisplayOfferTitle(item));
  const rawCode = String(item.code || "").trim();
  const code = escapeHtml(rawCode);
  const discount = escapeHtml(item.discount);
  const category = escapeHtml(item.category);
  const expiry = escapeHtml(item.expiry || "No expiry note");
  const review = escapeHtml(getOfferSummary(item));
  const hasCode = isUsableCouponCode(rawCode);

  article.innerHTML = `
    <div class="admin-offer-top">
      <div>
        <p class="store-name">${brand}</p>
        <h3>${title}</h3>
      </div>
      <span class="coupon-pill">${discount}</span>
    </div>
    <p>${review}</p>
    <div class="admin-offer-meta">
      <span>${category}</span>
      <span>${expiry}</span>
      <span>${hasCode ? code : "No code"}</span>
    </div>
    <div class="admin-offer-actions">
      <button class="button button-primary admin-copy-code" type="button" data-code="${code}" data-link="${safeLink}">${hasCode ? "Copy Code" : "Open Deal"}</button>
      <a class="product-link" href="${safeLink}" target="_blank" rel="sponsored noopener">Visit Affiliate Link</a>
    </div>
  `;

  article.dataset.index = String(index);
  return article;
}

function createUploadedDealCard(item, index) {
  const article = document.createElement("article");
  article.className = "deal-card searchable-deal uploaded-public-deal";

  const safeLink = getAloCouponAffiliateUrl(item.link);
  const brand = escapeHtml(getOfferBrandName(item));
  const title = escapeHtml(getDisplayOfferTitle(item));
  const rawCode = String(item.code || "").trim();
  const code = escapeHtml(rawCode);
  const discount = escapeHtml(item.discount);
  const category = escapeHtml(item.category || "Deal");
  const expiry = escapeHtml(item.expiry || "Limited time");
  const review = escapeHtml(getOfferSummary(item));
  const buttonLabel = getOfferButtonLabel(item);
  const mediaClasses = ["", "green", "amber"];
  const mediaClass = mediaClasses[index % mediaClasses.length];
  const hasCode = isUsableCouponCode(rawCode);
  const codeLabel = hasCode ? code : "No code needed";
  const offerType = hasCode ? "Coupon" : "Deal";
  const timingLabel = item.expiry ? expiry : "Active now";

  article.dataset.searchable = [
    brand,
    title,
    code,
    discount,
    category,
    expiry,
    review
  ].join(" ").toLowerCase();

  article.innerHTML = `
    <div class="deal-media ${mediaClass}">
      <span class="deal-badge">${offerType}</span>
      <strong>${discount}</strong>
      <small>${brand}</small>
    </div>
    <div class="deal-content">
      <p class="store-name">${brand}</p>
      <h3>${title}</h3>
      <p class="product-desc">${review}</p>
      <div class="coupon-code-line">
        <span>${hasCode ? "Coupon code" : "Deal type"}</span>
        <strong>${codeLabel}</strong>
      </div>
      <div class="price-line"><span>${discount}</span><small>${timingLabel}</small></div>
      <button class="button button-primary claim-btn" type="button" data-code="${code}" data-link="${safeLink}">${buttonLabel}</button>
      <a class="product-link" href="${safeLink}" target="_blank" rel="sponsored noopener">Visit Product Link</a>
    </div>
  `;

  bindCouponButton(article.querySelector(".claim-btn"));
  return article;
}

function getStoreInitials(name) {
  const words = String(name || "Store")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "ST";
}

function getDiscountParts(discount) {
  const value = String(discount || "Deal").trim();
  const parts = value.split(/\s+/);
  if (parts.length === 1) {
    return { main: parts[0], sub: "" };
  }
  return {
    main: parts[0],
    sub: parts.slice(1).join(" ").toUpperCase()
  };
}

function bindStoreCouponAction(button) {
  button.addEventListener("click", async () => {
    const code = button.dataset.code || "";
    const safeLink = button.dataset.link || "#";
    const originalLabel = button.textContent;

    if (!isUsableCouponCode(code)) {
      if (safeLink !== "#") {
        openAffiliateLinkAfterDelay(safeLink);
      }
      showToast("Opening AloCoupon deal page.");
      return;
    }

    try {
      await copyCoupon(code);
      button.textContent = "Copied";
      showToast(`Coupon code ${code} copied.`);
      window.setTimeout(() => {
        button.textContent = originalLabel;
      }, 1800);
    } catch {
      showToast(`Coupon code: ${code}`);
    }
  });
}

function createLiveCouponRow(item) {
  const article = document.createElement("article");
  article.className = "store-coupon-card";
  const rawCode = String(item.code || "").trim();
  const kind = getOfferKind(item);
  const typeLabel = getOfferTypeLabel(item);
  const buttonLabel = getOfferButtonLabel(item);
  article.dataset.couponType = `${kind === "deal" ? "deal" : "code"} verified`;

  const code = escapeHtml(rawCode);
  const safeLink = getAloCouponAffiliateUrl(item.link);
  const brand = escapeHtml(getOfferBrandName(item));
  const title = escapeHtml(getDisplayOfferTitle(item));
  const review = escapeHtml(getOfferSummary(item));
  const discount = getDiscountParts(item.discount);

  article.innerHTML = `
    <div class="coupon-discount">${escapeHtml(discount.main)}${discount.sub ? `<span>${escapeHtml(discount.sub)}</span>` : ""}</div>
    <div class="coupon-copy">
      <p class="verified-label">${brand} &middot; Verified ${typeLabel}</p>
      <h3>${title}</h3>
      <p>${review}</p>
    </div>
    <button class="store-coupon-action" type="button" data-code="${code}" data-link="${safeLink}">${buttonLabel}</button>
  `;

  bindStoreCouponAction(article.querySelector(".store-coupon-action"));
  return article;
}

function createLiveCouponGroup(group) {
  const section = document.createElement("section");
  section.className = "store-coupon-group";
  const dealCount = group.items.filter((item) => getOfferKind(item) === "deal").length;
  const codeCount = group.items.length - dealCount;

  section.innerHTML = `
    <div class="store-coupon-group-head">
      <div>
        <p>${escapeHtml(group.brand)}</p>
        <h3>${escapeHtml(group.brand)} Coupons and Promo Codes</h3>
      </div>
      <span>${group.items.length} offers</span>
    </div>
  `;

  group.items.forEach((item) => {
    section.appendChild(createLiveCouponRow(item));
  });

  section.dataset.couponType = [
    "verified",
    codeCount ? "code" : "",
    dealCount ? "deal" : ""
  ].filter(Boolean).join(" ");

  return section;
}

async function renderLiveCouponStore() {
  if (!liveCouponListEl) {
    return;
  }

  const items = sortOffersNewestFirst([...(await getAffiliateItems()), ...featuredCouponItems]);
  const storeName = "All Coupon Stores";
  const visibleItems = items;
  const bestOffer = getBestOffer(visibleItems);
  const dealCount = visibleItems.filter((item) => getOfferKind(item) === "deal").length;
  const codeCount = visibleItems.length - dealCount;
  const brandGroups = Array.from(groupOffersByBrand(visibleItems).values());

  liveCouponListEl.innerHTML = "";
  if (brandGroups.length) {
    brandGroups.forEach((group) => {
      liveCouponListEl.appendChild(createLiveCouponGroup(group));
    });
  } else {
    liveCouponListEl.innerHTML = `<p class="deal-empty-state">No real coupon data yet. Admin-uploaded offers will appear here.</p>`;
  }

  liveStoreInitialsEl && (liveStoreInitialsEl.textContent = getStoreInitials(storeName));
  liveStoreNameEl && (liveStoreNameEl.textContent = storeName);
  liveStoreRatingEl && (liveStoreRatingEl.textContent = "5.0 / admin verified");
  liveStoreCouponCountEl && (liveStoreCouponCountEl.textContent = `${visibleItems.length} Verified Coupons`);
  liveStoreCodeCountEl && (liveStoreCodeCountEl.textContent = String(codeCount));
  liveStoreDealCountEl && (liveStoreDealCountEl.textContent = String(dealCount));
  liveStoreBestOfferEl && (liveStoreBestOfferEl.textContent = bestOffer);
  liveCouponHeadingEl && (liveCouponHeadingEl.textContent = "Coupon Store");
  liveCouponSubheadingEl && (liveCouponSubheadingEl.textContent = "Browse all product coupons by store. Each brand is grouped separately so codes and deals do not mix.");
  liveAboutTitleEl && (liveAboutTitleEl.textContent = "Welcome to Coupon Store.");
  liveAboutCopyEl && (liveAboutCopyEl.textContent = "Featured deals and admin-approved promotions appear here as separated store groups. Visitors can claim a code or open a product deal without mixing brands.");

  document.querySelector("#live-tab-all") && (document.querySelector("#live-tab-all").textContent = `All(${visibleItems.length})`);
  document.querySelector("#live-tab-verified") && (document.querySelector("#live-tab-verified").textContent = `Verified(${visibleItems.length})`);
  document.querySelector("#live-tab-code") && (document.querySelector("#live-tab-code").textContent = `Codes(${codeCount})`);
  document.querySelector("#live-tab-deal") && (document.querySelector("#live-tab-deal").textContent = `Deals(${dealCount})`);
}

function filterDeals(query = "") {
  const normalizedQuery = query.trim().toLowerCase();
  const deals = document.querySelectorAll("#deals .searchable-deal");
  let visibleCount = 0;

  deals.forEach((deal) => {
    const haystack = `${deal.dataset.searchable || ""} ${deal.textContent || ""}`.toLowerCase();
    const isMatch = !normalizedQuery || haystack.includes(normalizedQuery);
    deal.hidden = !isMatch;
    if (isMatch) visibleCount += 1;
  });

  if (dealEmptyStateEl) {
    dealEmptyStateEl.hidden = visibleCount !== 0;
  }
}

async function renderUploadedDealsInMainGrid() {
  if (!dealSearchResultsEl) {
    return;
  }

  dealSearchResultsEl.querySelectorAll(".uploaded-public-deal").forEach((item) => item.remove());
  const items = await getAffiliateItems();
  items.forEach((item, index) => {
    dealSearchResultsEl.appendChild(createUploadedDealCard(item, index));
  });
  filterDeals(document.querySelector(".search-box input")?.value || "");
}

async function renderAffiliateItems() {
  if (!affiliateItemsEl) {
    return;
  }

  const items = await getAffiliateItems();
  affiliateItemsEl.innerHTML = "";
  if (!items.length) {
    affiliateItemsEl.innerHTML = `<p class="deal-empty-state">No partner reviews or coupons yet. Admin-approved offers will appear here.</p>`;
    return;
  }
  items.forEach((item, index) => {
    affiliateItemsEl.appendChild(createAffiliateCard(item, index));
  });
}

affiliateItemsEl?.addEventListener("click", async (event) => {
  const button = event.target.closest(".admin-copy-code");
  if (!button) {
    return;
  }

  const code = button.dataset.code;
  const safeLink = button.dataset.link || "#";
  if (!isUsableCouponCode(code)) {
    if (safeLink !== "#") {
      openAffiliateLinkAfterDelay(safeLink);
    }
    showToast("Opening AloCoupon deal page.");
    return;
  }

  try {
    await copyCoupon(code);
    showToast(`Copied coupon code ${code}`);
  } catch {
    showToast(`Coupon code: ${code}`);
  }
});

document.querySelectorAll(".language-switch").forEach((switcher) => {
  const trigger = switcher.querySelector(".language-trigger");

  trigger?.addEventListener("click", () => {
    const isOpen = switcher.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", String(isOpen));
  });
});

document.querySelectorAll(".lang-btn").forEach((button) => {
  button.addEventListener("click", () => {
    applyLanguage(button.dataset.lang);
    const switcher = button.closest(".language-switch");
    const trigger = switcher?.querySelector(".language-trigger");
    switcher?.classList.remove("is-open");
    trigger?.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("click", (event) => {
  document.querySelectorAll(".language-switch.is-open").forEach((switcher) => {
    if (switcher.contains(event.target)) {
      return;
    }

    switcher.classList.remove("is-open");
    switcher.querySelector(".language-trigger")?.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  document.querySelectorAll(".language-switch.is-open").forEach((switcher) => {
    switcher.classList.remove("is-open");
    switcher.querySelector(".language-trigger")?.setAttribute("aria-expanded", "false");
  });
});

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

applyLanguage(currentLang);
renderUploadedDealsInMainGrid();
renderAffiliateItems();
renderLiveCouponStore();
