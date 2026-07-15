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
    "stores.title": "Popular Stores",
    "stores.link": "View All Deals",
    "stores.intro": "Explore stores and brands with active affiliate campaigns, product discounts, and coupon opportunities.",
    "deals.title": "Deals Of Today",
    "deals.link": "Deals",
    "deals.intro": "Compare current promo codes, free trials, and limited-time savings before visiting each product website.",
    "deals.getDeal": "Get Deal",
    "deals.visit": "Open",
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
    "faq.title": "Coupon and Product Review FAQ",
    "faq.q1": "How does AloCoupon choose coupon offers?",
    "faq.a1": "AloCoupon highlights affiliate offers with clear product value, visible discount details, and direct product links so visitors can compare deals quickly.",
    "faq.q2": "Can visitors check reviews before claiming a coupon?",
    "faq.a2": "Yes. Featured deals include product information and offer details to help shoppers compare options before visiting a product site.",
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
    "stores.link": "Voir toutes les offres",
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
    "faq.title": "FAQ coupons et avis produits",
    "faq.q1": "Comment AloCoupon choisit-il les offres de coupons ?",
    "faq.a1": "AloCoupon met en avant les offres d'affiliation avec une valeur produit claire, des détails de réduction visibles et des liens directs afin de comparer rapidement les offres.",
    "faq.q2": "Les visiteurs peuvent-ils consulter les avis avant de réclamer un coupon ?",
    "faq.a2": "Oui. Les offres mises en avant incluent les informations produit et les détails de l'offre pour aider les acheteurs à comparer avant de visiter le site du produit.",
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
    "stores.link": "Ver todas as ofertas",
    "stores.intro": "Explore lojas e marcas com campanhas de afiliados ativas, descontos em produtos e oportunidades de cupons.",
    "deals.title": "Ofertas de hoje",
    "deals.link": "Ofertas",
    "deals.intro": "Compare códigos promocionais, testes grátis e economias por tempo limitado antes de visitar o site de cada produto.",
    "deals.getDeal": "Obter oferta",
    "deals.visit": "Abrir",
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
    "faq.title": "FAQ sobre cupons e avaliações de produtos",
    "faq.q1": "Como a AloCoupon escolhe ofertas de cupons?",
    "faq.a1": "A AloCoupon destaca ofertas de afiliados com valor claro de produto, detalhes visíveis de desconto e links diretos para que visitantes comparem ofertas rapidamente.",
    "faq.q2": "Os visitantes podem verificar avaliações antes de resgatar um cupom?",
    "faq.a2": "Sim. As ofertas em destaque incluem informações do produto e detalhes da oferta para ajudar compradores a comparar antes de visitar o site do produto.",
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
      showToast("Opening affiliate link.");
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
    } finally {
      if (safeLink !== "#") {
        openAffiliateLinkAfterDelay(safeLink);
      }
    }
  });
}

document.querySelectorAll(".claim-btn").forEach((button) => {
  bindCouponButton(button);
});

document.querySelector(".search-box")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const query = event.currentTarget.querySelector("input")?.value || "";
  if (dealSearchInputEl) {
    dealSearchInputEl.value = query;
  }
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
    const query = normalizeDealSearch(form.querySelector('input[type="search"]')?.value || "");
    const cards = Array.from(panel?.querySelectorAll(".store-coupon-card") || []);

    cards.forEach((card) => {
      const searchable = normalizeDealSearch(card.textContent || "");
      card.classList.toggle("is-search-hidden", Boolean(query && !searchable.includes(query)));
    });

    panel?.querySelectorAll(".store-coupon-group").forEach((group) => {
      const hasMatch = group.querySelector(".store-coupon-card:not(.is-search-hidden)");
      group.classList.toggle("is-search-hidden", !hasMatch);
    });

    openStoreToolPanel(panel?.id || "store-detail");
    const matchedCount = cards.filter((card) => !card.classList.contains("is-search-hidden")).length;
    showToast(query ? `Found ${matchedCount} matching store offers.` : "Showing all store coupons.");
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
      const visibleCards = group.querySelectorAll(".store-coupon-card:not(.is-hidden):not(.is-search-hidden)");
      group.classList.toggle("is-hidden", visibleCards.length === 0);
    });
  });
});

document.querySelectorAll(".store-coupon-action").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = button.dataset.code;
    const safeLink = button.dataset.link || "#";
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
    } finally {
      if (safeLink !== "#") {
        openAffiliateLinkAfterDelay(safeLink);
      }
    }
  });
});

const affiliateItemsEl = document.querySelector("#affiliate-items");
const dealSearchResultsEl = document.querySelector("#deal-search-results");
const dealEmptyStateEl = document.querySelector("#deal-empty-state");
const dealCategoryFilterEl = document.querySelector("#deal-category-filter");
const dealSearchInputEl = document.querySelector("#deal-search-input");
const dealSortSelectEl = document.querySelector("#deal-sort-select");
const dealSliderDotsEl = document.querySelector("#deal-slider-dots");
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
const starterAffiliateItems = [
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
const featuredCouponItems = [];
let activeDealCategory = "all";
let activeDealType = "all";
let activeDealStore = "all";
let lastAffiliateItems = [];
let activeDealPage = 0;
let activeHeroStoreIndex = 0;
let heroAutoplayTimer = null;
const dealsPerPage = 12;

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

function getAffiliateDomain(value) {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function getAffiliateFaviconUrl(value) {
  const domain = getAffiliateDomain(value);
  return domain ? `https://${domain}/favicon.ico` : "";
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

function getOfferStoreUrl(brand) {
  return `/store/${slugify(brand) || "store"}`;
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
  showToast("Opening affiliate link.");
  openAffiliateLinkAfterDelay(href);
});

function normalizeStoreKey(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeCategoryKey(value) {
  return String(value || "Other")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "other";
}

function normalizeDealSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function getEditDistance(a, b) {
  const first = normalizeDealSearch(a);
  const second = normalizeDealSearch(b);
  if (!first) return second.length;
  if (!second) return first.length;

  const previous = Array.from({ length: second.length + 1 }, (_, index) => index);
  const current = Array(second.length + 1).fill(0);

  for (let i = 1; i <= first.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= second.length; j += 1) {
      const cost = first[i - 1] === second[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
    }
    previous.splice(0, previous.length, ...current);
  }

  return previous[second.length];
}

function getFuzzyTextScore(query, target) {
  const normalizedQuery = normalizeDealSearch(query);
  const normalizedTarget = normalizeDealSearch(target);
  if (!normalizedQuery || !normalizedTarget) return 0;

  if (normalizedTarget === normalizedQuery) return 180;
  if (normalizedTarget.startsWith(normalizedQuery)) return 155;
  if (normalizedTarget.includes(normalizedQuery)) return 130;

  const queryTokens = normalizedQuery.split(" ").filter(Boolean);
  const targetTokens = normalizedTarget.split(" ").filter(Boolean);
  if (!queryTokens.length || !targetTokens.length) return 0;

  let score = 0;
  queryTokens.forEach((queryToken) => {
    let bestTokenScore = 0;
    targetTokens.forEach((targetToken) => {
      if (targetToken === queryToken) {
        bestTokenScore = Math.max(bestTokenScore, 100);
        return;
      }
      if (targetToken.startsWith(queryToken) || queryToken.startsWith(targetToken)) {
        bestTokenScore = Math.max(bestTokenScore, 86);
        return;
      }
      const distance = getEditDistance(queryToken, targetToken);
      const maxLength = Math.max(queryToken.length, targetToken.length);
      const similarity = maxLength ? 1 - distance / maxLength : 0;
      if (similarity >= 0.58) {
        bestTokenScore = Math.max(bestTokenScore, Math.round(similarity * 74));
      }
    });
    score += bestTokenScore;
  });

  return Math.round(score / queryTokens.length);
}

function getDealSearchScore(deal, query) {
  const normalizedQuery = normalizeDealSearch(query);
  if (!normalizedQuery) return 0;

  const brandScore = getFuzzyTextScore(normalizedQuery, deal.dataset.searchBrand || "");
  const titleScore = getFuzzyTextScore(normalizedQuery, deal.dataset.searchTitle || "");
  const codeScore = getFuzzyTextScore(normalizedQuery, deal.dataset.searchCode || "");
  const searchableScore = getFuzzyTextScore(normalizedQuery, deal.dataset.searchable || "");

  return Math.max(brandScore + 70, titleScore, codeScore + 40, searchableScore - 10);
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
    const brand = getOfferBrandName(item);
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

function getDiscountScore(discount) {
  const value = String(discount || "").toLowerCase();
  const percent = value.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percent) {
    return Number(percent[1]);
  }
  if (value.includes("free")) {
    return 20;
  }
  const amount = value.match(/(?:\$|£|€)\s*(\d+(?:\.\d+)?)/);
  return amount ? Math.min(Number(amount[1]), 99) / 2 : 0;
}

function createAffiliateCard(item, index) {
  const article = document.createElement("article");
  article.className = "admin-offer-card";

  const safeLink = getAloCouponAffiliateUrl(item.link);
  const brand = escapeHtml(getOfferBrandName(item));
  const title = escapeHtml(getDisplayOfferTitle(item));
  const initials = escapeHtml(getStoreInitials(getOfferBrandName(item)));
  const rawCode = String(item.code || "").trim();
  const code = escapeHtml(rawCode);
  const discount = escapeHtml(item.discount);
  const category = escapeHtml(item.category);
  const expiry = escapeHtml(item.expiry || "No expiry note");
  const review = escapeHtml(getOfferSummary(item));
  const hasCode = isUsableCouponCode(rawCode);

  article.innerHTML = `
    <div class="admin-offer-top">
      <div class="admin-brand-title">
        ${getBrandMark(item, initials)}
        <div>
        <p class="store-name">${brand}</p>
        <h3><a class="deal-title-link" href="${safeLink}" target="_blank" rel="sponsored noopener">${title}</a></h3>
        </div>
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
      <a class="product-link" href="${safeLink}" target="_blank" rel="sponsored noopener">Open</a>
    </div>
  `;

  article.dataset.index = String(index);
  return article;
}

function createUploadedDealCard(item, index) {
  const article = document.createElement("article");
  article.className = "deal-card searchable-deal uploaded-public-deal";

  const safeLink = getAloCouponAffiliateUrl(item.link);
  const detailLink = getOfferDealUrl(item);
  const rawLink = escapeHtml(item.link || "");
  const brandName = getOfferBrandName(item);
  const displayTitle = getDisplayOfferTitle(item);
  const brand = escapeHtml(brandName);
  const initials = escapeHtml(getStoreInitials(brandName));
  const title = escapeHtml(displayTitle);
  const rawCode = String(item.code || "").trim();
  const code = escapeHtml(rawCode);
  const discount = escapeHtml(item.discount);
  const category = escapeHtml(item.category || "Deal");
  const expiry = escapeHtml(item.expiry || "Limited time");
  const review = escapeHtml(getOfferSummary(item));
  const dealImage = item.productImage || item.logo;
  const logo = dealImage
    ? `<img class="deal-product-logo" src="${escapeHtml(dealImage)}" alt="${brand}" />`
    : `<span class="deal-product-placeholder"><strong>${initials}</strong><small>${brand}</small></span>`;
  const buttonLabel = getOfferButtonLabel(item);
  const mediaClasses = ["", "green", "amber"];
  const mediaClass = mediaClasses[index % mediaClasses.length];
  const hasCode = isUsableCouponCode(rawCode);
  const offerType = hasCode ? "Coupon" : "Deal";
  const timingLabel = item.expiry ? expiry : "Active now";
  const uploadedAt = item.createdAt
    ? escapeHtml(new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }))
    : "Uploaded offer";

  article.dataset.searchable = [
    brand,
    title,
    code,
    discount,
    category,
    expiry,
    review,
    rawLink,
    offerType,
    uploadedAt
  ].join(" ").toLowerCase();
  article.dataset.category = normalizeCategoryKey(item.category || "Other");
  article.dataset.store = normalizeStoreKey(item.brand || brandName);
  article.dataset.originalIndex = String(index);
  article.dataset.offerType = hasCode ? "coupon" : "deal";
  article.dataset.discountScore = String(getDiscountScore(item.discount));
  article.dataset.createdAt = item.createdAt ? String(new Date(item.createdAt).getTime()) : "0";
  article.dataset.searchBrand = normalizeDealSearch(brandName);
  article.dataset.searchTitle = normalizeDealSearch(displayTitle);
  article.dataset.searchCode = normalizeDealSearch(rawCode);
  article.dataset.searchScore = "0";
  article.dataset.offerId = String(item.id || index);

  article.innerHTML = `
    <div class="deal-media ${mediaClass}">
      <span class="deal-flash" aria-hidden="true">⚡</span>
      ${logo}
    </div>
    <div class="deal-content">
      <div class="brand-highlight">
        ${getBrandMark(item, initials)}
        <p class="store-name">${brand}</p>
      </div>
      <h3><a class="deal-title-link" href="${detailLink}">${title}</a></h3>
      <p class="product-desc">${review}</p>
      <div class="deal-price-row">
        <div class="price-line"><small>${hasCode ? `Code: ${code}` : timingLabel}</small><span>${discount}</span></div>
        <button class="deal-favorite" type="button" aria-label="Save ${brand} deal" aria-pressed="false">♥</button>
      </div>
      <button class="button button-primary claim-btn" type="button" data-code="${code}" data-link="${safeLink}">${buttonLabel}</button>
      <a class="product-link" href="${safeLink}" target="_blank" rel="sponsored noopener">Open</a>
    </div>
  `;

  bindCouponButton(article.querySelector(".claim-btn"));
  bindFavoriteButton(article.querySelector(".deal-favorite"), article.dataset.offerId);
  return article;
}

function bindFavoriteButton(button, offerId) {
  const storageKey = `alocoupon-favorite-${offerId}`;
  const syncState = (active) => {
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
    button.setAttribute("aria-label", active ? "Remove saved deal" : "Save deal");
  };

  syncState(localStorage.getItem(storageKey) === "1");
  button.addEventListener("click", () => {
    const active = button.getAttribute("aria-pressed") !== "true";
    syncState(active);
    if (active) localStorage.setItem(storageKey, "1");
    else localStorage.removeItem(storageKey);
    showToast(active ? "Deal saved." : "Deal removed from saved items.");
  });
}

function getStoreInitials(name) {
  const words = String(name || "Store")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "ST";
}

function getBrandMark(item, initials, small = false) {
  const logo = String(item?.logo || "");
  const isSafeLogo = /^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/]+=*$/i.test(logo)
    || /^\/assets\/brand-logos\/[a-z0-9._-]+$/i.test(logo);
  if (isSafeLogo) {
    return `<img class="brand-logo${small ? " small" : ""}" src="${logo}" alt="" loading="lazy" />`;
  }
  return `<span class="brand-initials${small ? " small" : ""}">${initials}</span>`;
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
      showToast("Opening affiliate link.");
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
    } finally {
      if (safeLink !== "#") {
        openAffiliateLinkAfterDelay(safeLink);
      }
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
  const initials = escapeHtml(getStoreInitials(getOfferBrandName(item)));

  article.innerHTML = `
    <div class="coupon-discount">${escapeHtml(discount.main)}${discount.sub ? `<span>${escapeHtml(discount.sub)}</span>` : ""}</div>
    <div class="coupon-copy">
      <div class="coupon-brand-line">
        ${getBrandMark(item, initials, true)}
        <p class="verified-label">${brand} &middot; Verified ${typeLabel}</p>
      </div>
      <h3><a class="deal-title-link" href="${safeLink}" target="_blank" rel="sponsored noopener">${title}</a></h3>
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
  const storeUrl = getOfferStoreUrl(group.brand);

  section.innerHTML = `
    <div class="store-coupon-group-head">
      <div>
        <p><a class="store-group-link" href="${storeUrl}">${escapeHtml(group.brand)}</a></p>
        <h3><a class="store-group-link" href="${storeUrl}">${escapeHtml(group.brand)} Coupons and Promo Codes</a></h3>
      </div>
      <a class="store-group-count" href="${storeUrl}">${group.items.length} offers</a>
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
  const normalizedQuery = normalizeDealSearch(query);
  const deals = Array.from(document.querySelectorAll("#deals .searchable-deal"));
  let visibleCount = 0;
  const sortMode = dealSortSelectEl?.value || "featured";
  const scoredDeals = deals.map((deal) => {
    const score = getDealSearchScore(deal, normalizedQuery);
    deal.dataset.searchScore = String(score);
    return { deal, score };
  });
  const maxSearchScore = scoredDeals.reduce((max, item) => Math.max(max, item.score), 0);

  if (dealSearchResultsEl) {
    scoredDeals
      .sort((aItem, bItem) => {
        const a = aItem.deal;
        const b = bItem.deal;
        if (normalizedQuery && aItem.score !== bItem.score) {
          return bItem.score - aItem.score;
        }
        const aIsCategory = activeDealCategory !== "all" && a.dataset.category === activeDealCategory;
        const bIsCategory = activeDealCategory !== "all" && b.dataset.category === activeDealCategory;
        if (aIsCategory !== bIsCategory) {
          return aIsCategory ? -1 : 1;
        }
        if (sortMode === "discount") {
          return Number(b.dataset.discountScore || 0) - Number(a.dataset.discountScore || 0);
        }
        if (sortMode === "latest") {
          return Number(b.dataset.createdAt || 0) - Number(a.dataset.createdAt || 0);
        }
        return Number(a.dataset.originalIndex || 0) - Number(b.dataset.originalIndex || 0);
      })
      .forEach((item) => dealSearchResultsEl.appendChild(item.deal));
  }

  const orderedDeals = dealSearchResultsEl
    ? Array.from(dealSearchResultsEl.querySelectorAll(".searchable-deal"))
    : deals;
  const matchedDeals = [];
  orderedDeals.forEach((deal) => {
    const score = Number(deal.dataset.searchScore || 0);
    const isStrongSearchMatch = score >= 58;
    const isClosestSearchMatch = maxSearchScore > 0 && score >= Math.max(35, maxSearchScore - 10);
    const matchesQuery = !normalizedQuery || isStrongSearchMatch || isClosestSearchMatch;
    const matchesType = activeDealType === "all" || deal.dataset.offerType === activeDealType;
    const matchesCategory = activeDealCategory === "all" || deal.dataset.category === activeDealCategory;
    const matchesStore = activeDealStore === "all" || deal.dataset.store === activeDealStore;
    const matchesFilter = matchesQuery && matchesType && matchesCategory && matchesStore;
    deal.dataset.filterMatch = String(matchesFilter);
    deal.hidden = !matchesFilter;
    deal.classList.toggle("is-category-highlight", matchesQuery && matchesType && matchesCategory && activeDealCategory !== "all");
    if (matchesFilter) {
      visibleCount += 1;
      matchedDeals.push(deal);
    }
  });

  activeDealPage = 0;
  renderDealPagination(matchedDeals);

  if (dealEmptyStateEl) {
    dealEmptyStateEl.hidden = visibleCount !== 0;
  }
}

function syncDealCategoryControls() {
  document.querySelectorAll("[data-deal-category], .deal-category-chip").forEach((item) => {
    const category = item.dataset.dealCategory || item.dataset.category || "all";
    const isActive = category === activeDealCategory;
    item.classList.toggle("is-active", isActive);
    if (item.tagName === "A" || item.tagName === "BUTTON") {
      item.setAttribute("aria-pressed", String(isActive));
    }
  });
}

function setActiveDealCategory(category = "all", options = {}) {
  activeDealCategory = category || "all";
  renderDealCategoryFilters(lastAffiliateItems);
  syncDealCategoryControls();
  filterDeals(dealSearchInputEl?.value || document.querySelector(".search-box input")?.value || "");
  Array.from(document.querySelectorAll(".deal-category-chip"))
    .find((chip) => chip.dataset.category === activeDealCategory)
    ?.scrollIntoView({
    behavior: "smooth",
    inline: "nearest",
    block: "nearest"
  });

  if (options.scroll) {
    document.querySelector("#deals")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (options.toast) {
    const label = document.querySelector(`[data-deal-category="${activeDealCategory}"]`)?.textContent?.trim()
      || document.querySelector(`.deal-category-chip[data-category="${activeDealCategory}"] span`)?.textContent?.trim()
      || "All Deals";
    showToast(activeDealCategory === "all" ? "Showing all deals." : `Highlighted ${label}.`);
  }
}

function renderDealCategoryFilters(items) {
  if (!dealCategoryFilterEl) {
    return;
  }

  const groups = new Map();
  items.forEach((item) => {
    const label = String(item.category || "Other").trim() || "Other";
    const key = normalizeCategoryKey(label);
    if (!groups.has(key)) {
      groups.set(key, { key, label, count: 0 });
    }
    groups.get(key).count += 1;
  });

  const orderedGroups = Array.from(groups.values()).sort((a, b) => {
    if (activeDealCategory !== "all") {
      if (a.key === activeDealCategory) return -1;
      if (b.key === activeDealCategory) return 1;
    }
    return b.count - a.count || a.label.localeCompare(b.label);
  });
  const buttons = [
    { key: "all", label: "All", count: items.length },
    ...orderedGroups,
  ];

  if (activeDealCategory !== "all" && !groups.has(activeDealCategory)) {
    activeDealCategory = "all";
  }

  dealCategoryFilterEl.innerHTML = buttons.map((item) => `
    <button class="deal-category-chip${item.key === activeDealCategory ? " is-active" : ""}" type="button" data-category="${escapeHtml(item.key)}">
      <span>${escapeHtml(item.label)}</span>
      <strong>${item.count}</strong>
    </button>
  `).join("");

  dealCategoryFilterEl.querySelectorAll(".deal-category-chip").forEach((button) => {
    button.addEventListener("click", () => {
      setActiveDealCategory(button.dataset.category || "all");
    });
  });

  syncDealCategoryControls();
}

function renderFeaturePost(items) {
  const section = document.querySelector("#feature-post");
  const card = section?.querySelector(".feature-post-card");
  if (!section || !card || !Array.isArray(items) || !items.length) return;

  const featured = items.find((item) => item.productImage || item.landingImage || item.logo) || items[0];
  const brand = getOfferBrandName(featured);
  const title = getDisplayOfferTitle(featured);
  const summary = getOfferSummary(featured);
  const imageSource = featured.productImage || featured.landingImage || featured.logo || "assets/affiliate-hero.png";
  const image = card.querySelector(".feature-post-media img");
  const heading = card.querySelector(".feature-post-copy h3");
  const copy = card.querySelector(".feature-post-copy p");
  const link = card.querySelector(".read-link");

  card.classList.toggle("uses-logo", Boolean(featured.logo && imageSource === featured.logo));
  card.dataset.offerId = String(featured.id || "");
  if (image) {
    image.src = imageSource;
    image.alt = `${brand} featured deal`;
  }
  if (heading) heading.textContent = title;
  if (copy) copy.textContent = summary;
  if (link) {
    link.href = getOfferDealUrl(featured);
    link.textContent = "View Deal";
  }
}

async function renderUploadedDealsInMainGrid() {
  if (!dealSearchResultsEl) {
    return;
  }

  dealSearchResultsEl.querySelectorAll(".uploaded-public-deal").forEach((item) => item.remove());
  const items = await getAffiliateItems();
  lastAffiliateItems = items;
  renderFeaturePost(items);
  renderLandingHero(items);
  renderPopularStores(items);
  renderDealCategoryFilters(items);
  items.forEach((item, index) => {
    dealSearchResultsEl.appendChild(createUploadedDealCard(item, index));
  });
  filterDeals(dealSearchInputEl?.value || document.querySelector(".search-box input")?.value || "");
}

function renderLandingHeroLegacy(items) {
  const banner = document.querySelector(".home-feature-banner");
  const featured = items.find((item) => item.landingImage);
  if (!banner || !featured) return;
  const brand = getOfferBrandName(featured);
  const image = banner.querySelector("img");
  const label = banner.querySelector(".home-banner-copy small");
  const title = banner.querySelector(".home-banner-copy strong");
  if (image) {
    image.src = featured.landingImage;
    image.alt = `${brand} featured deal`;
  }
  if (label) label.textContent = `${brand} · ALOCOUPON PICK`;
  if (title) title.textContent = getDisplayOfferTitle(featured);
}

function renderLandingHero(items) {
  const carousel = document.querySelector(".home-feature-carousel");
  const banner = carousel?.querySelector(".home-feature-banner");
  const rail = carousel?.querySelector(".home-store-rail");
  const dots = carousel?.querySelector(".home-banner-dots");
  if (!carousel || !banner || !rail || !dots) return;

  const storeMap = new Map();
  items.forEach((item) => {
    const brand = getOfferBrandName(item);
    const key = normalizeStoreKey(item.brand || brand);
    if (!key || storeMap.has(key) || !(item.productImage || item.landingImage || item.logo)) return;
    storeMap.set(key, { key, brand, item });
  });
  const stores = Array.from(storeMap.values());
  if (!stores.length) return;
  activeHeroStoreIndex = Math.min(activeHeroStoreIndex, stores.length - 1);

  rail.innerHTML = `
    <button class="home-store-chip${activeDealStore === "all" ? " is-filtered" : ""}" type="button" data-store-key="all">All stores</button>
    ${stores.map(({ key, brand, item }, index) => {
      const mark = item.logo
        ? `<img src="${escapeHtml(item.logo)}" alt="" />`
        : `<span>${escapeHtml(getStoreInitials(brand))}</span>`;
      return `<button class="home-store-chip" type="button" data-store-index="${index}" data-store-key="${escapeHtml(key)}">${mark}<b>${escapeHtml(brand)}</b></button>`;
    }).join("")}
  `;
  dots.innerHTML = stores.map(({ brand }, index) => `
    <button type="button" data-store-index="${index}" aria-label="Show ${escapeHtml(brand)}" aria-pressed="false"></button>
  `).join("");

  const selectStore = (index, options = {}) => {
    activeHeroStoreIndex = (index + stores.length) % stores.length;
    const { item, brand, key } = stores[activeHeroStoreIndex];
    const image = banner.querySelector("img");
    const label = banner.querySelector(".home-banner-copy small");
    const title = banner.querySelector(".home-banner-copy strong");
    const source = item.productImage || item.landingImage || item.logo;
    banner.classList.toggle("uses-product-image", Boolean(item.productImage));
    if (image) {
      image.src = source;
      image.alt = `${brand} product deal`;
    }
    if (label) label.textContent = `${brand} · ALOCOUPON PICK`;
    if (title) title.textContent = getDisplayOfferTitle(item);
    rail.querySelectorAll("[data-store-index]").forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.storeIndex) === activeHeroStoreIndex);
    });
    dots.querySelectorAll("[data-store-index]").forEach((button) => {
      const isActive = Number(button.dataset.storeIndex) === activeHeroStoreIndex;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    const activeChip = rail.querySelector(`[data-store-index="${activeHeroStoreIndex}"]`);
    if (activeChip) {
      rail.scrollTo({
        left: Math.max(0, activeChip.offsetLeft - (rail.clientWidth - activeChip.clientWidth) / 2),
        behavior: options.instant ? "auto" : "smooth"
      });
    }
    if (options.filter) {
      activeDealStore = key;
      rail.querySelectorAll("[data-store-key]").forEach((button) => button.classList.toggle("is-filtered", button.dataset.storeKey === key));
      filterDeals(dealSearchInputEl?.value || "");
      if (options.scroll) document.querySelector("#deals")?.scrollIntoView({ behavior: "smooth", block: "start" });
      showToast(`Showing deals from ${brand}.`);
    }
  };

  rail.querySelector('[data-store-key="all"]')?.addEventListener("click", () => {
    activeDealStore = "all";
    rail.querySelectorAll("[data-store-key]").forEach((button) => button.classList.toggle("is-filtered", button.dataset.storeKey === "all"));
    filterDeals(dealSearchInputEl?.value || "");
    document.querySelector("#deals")?.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("Showing deals from all stores.");
  });
  rail.querySelectorAll("[data-store-index]").forEach((button) => {
    button.addEventListener("click", () => selectStore(Number(button.dataset.storeIndex), { filter: true }));
  });
  dots.querySelectorAll("[data-store-index]").forEach((button) => {
    button.addEventListener("click", () => selectStore(Number(button.dataset.storeIndex)));
  });
  banner.querySelector(".is-prev")?.addEventListener("click", () => selectStore(activeHeroStoreIndex - 1));
  banner.querySelector(".is-next")?.addEventListener("click", () => selectStore(activeHeroStoreIndex + 1));
  banner.querySelector(".home-banner-action")?.addEventListener("click", () => selectStore(activeHeroStoreIndex, { filter: true, scroll: true }));

  clearInterval(heroAutoplayTimer);
  selectStore(activeHeroStoreIndex, { instant: true });
}

function renderDealPagination(matchedDeals) {
  const deals = Array.from(document.querySelectorAll("#deals .searchable-deal"));
  const totalPages = Math.ceil(matchedDeals.length / dealsPerPage);
  activeDealPage = Math.max(0, Math.min(activeDealPage, Math.max(0, totalPages - 1)));
  const start = activeDealPage * dealsPerPage;
  const pageItems = new Set(matchedDeals.slice(start, start + dealsPerPage));

  deals.forEach((deal) => {
    deal.hidden = !pageItems.has(deal);
  });

  if (!dealSliderDotsEl) return;
  dealSliderDotsEl.hidden = totalPages <= 1;
  dealSliderDotsEl.innerHTML = Array.from({ length: totalPages }, (_, index) => `
    <button class="deal-page-dot${index === activeDealPage ? " is-active" : ""}" type="button" data-page="${index}" aria-label="Show deal page ${index + 1}" aria-pressed="${index === activeDealPage}"></button>
  `).join("");
  dealSliderDotsEl.querySelectorAll(".deal-page-dot").forEach((button) => {
    button.addEventListener("click", () => {
      activeDealPage = Number(button.dataset.page || 0);
      const currentMatches = deals.filter((deal) => deal.dataset.filterMatch === "true");
      renderDealPagination(currentMatches);
      document.querySelector("#deals .section-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function renderPopularStores(items) {
  const grid = document.querySelector("#popular-store-grid");
  if (!grid) return;
  const stores = new Map();
  items.forEach((item) => {
    const brand = getOfferBrandName(item);
    const key = brand.trim().toLowerCase();
    if (!key) return;
    if (!stores.has(key)) stores.set(key, { brand, items: [], item });
    const store = stores.get(key);
    store.items.push(item);
    if (!store.item.logo && item.logo) store.item = item;
  });
  const popular = Array.from(stores.values()).slice(0, 15);
  grid.innerHTML = popular.map(({ brand, item, items: storeItems }) => {
    const initials = escapeHtml(getStoreInitials(brand));
    const domain = getAffiliateDomain(item.link);
    const favicon = getAffiliateFaviconUrl(item.link);
    const logoSource = String(item.logo || favicon || "");
    const logo = logoSource
      ? `<img src="${escapeHtml(logoSource)}" data-favicon="${escapeHtml(favicon)}" alt="${escapeHtml(brand)} logo" loading="lazy" /><span class="store-logo-fallback" aria-hidden="true">${initials}</span>`
      : `<span class="store-logo-fallback is-visible" aria-hidden="true">${initials}</span>`;
    const slug = slugify(brand) || "store";
    const offerCount = storeItems.length;
    const bestOffer = escapeHtml(getBestOffer(storeItems));
    const offerLabel = `${offerCount} ${offerCount === 1 ? "offer" : "offers"}`;
    return `
      <a class="store-card" href="/store/${encodeURIComponent(slug)}" aria-label="View ${escapeHtml(brand)} coupons and deals">
        <div class="store-card-top">
          <div class="store-logo dynamic-store-logo">${logo}</div>
          <span class="store-offer-count">${offerLabel}</span>
        </div>
        <div class="store-card-content">
          <h3>${escapeHtml(brand)}</h3>
          ${domain ? `<p class="store-domain">${escapeHtml(domain)}</p>` : ""}
        </div>
        <div class="store-card-bottom">
          <span class="store-best-offer">${bestOffer}</span>
          <span class="store-card-cta">View coupons <b aria-hidden="true">→</b></span>
        </div>
      </a>`;
  }).join("");

  grid.querySelectorAll(".dynamic-store-logo img").forEach((image) => {
    image.addEventListener("error", () => {
      const fallbackUrl = image.dataset.favicon || "";
      if (fallbackUrl && image.dataset.fallbackTried !== "true") {
        image.dataset.fallbackTried = "true";
        image.src = fallbackUrl;
        return;
      }
      image.hidden = true;
      image.nextElementSibling?.classList.add("is-visible");
    });
  });
}

dealSearchInputEl?.addEventListener("input", (event) => {
  filterDeals(event.currentTarget.value || "");
});

document.querySelectorAll(".deal-type-btn").forEach((button) => {
  button.addEventListener("click", () => {
    activeDealType = button.dataset.dealType || "all";
    document.querySelectorAll(".deal-type-btn").forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    filterDeals(dealSearchInputEl?.value || "");
  });
});

dealSortSelectEl?.addEventListener("change", () => {
  filterDeals(dealSearchInputEl?.value || "");
});

document.querySelectorAll("[data-deal-category]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveDealCategory(link.dataset.dealCategory || "all", { scroll: true, toast: true });
  });
});

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
    showToast("Opening affiliate link.");
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

const newsletterForm = document.querySelector("#newsletter-form");
const newsletterStatus = document.querySelector("#newsletter-status");

newsletterForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!newsletterForm.reportValidity()) return;
  const button = newsletterForm.querySelector('button[type="submit"]');
  const originalLabel = button.innerHTML;
  newsletterStatus.className = "newsletter-status";
  newsletterStatus.textContent = "Saving your subscription...";
  button.disabled = true;
  button.textContent = "Please wait...";
  try {
    const payload = Object.fromEntries(new FormData(newsletterForm));
    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ email: payload.email, website: payload.website || "" }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Could not save your subscription.");
    newsletterStatus.classList.add("is-success");
    newsletterStatus.textContent = result.message || "Please check your inbox to confirm your subscription.";
    if (result.debugConfirmUrl) {
      const debugLink = document.createElement("a");
      debugLink.href = result.debugConfirmUrl;
      debugLink.textContent = " Confirm locally →";
      debugLink.style.color = "inherit";
      debugLink.style.fontWeight = "900";
      newsletterStatus.appendChild(debugLink);
    }
    newsletterForm.reset();
  } catch (error) {
    newsletterStatus.classList.add("is-error");
    newsletterStatus.textContent = error.message || "Could not save your subscription.";
  } finally {
    button.disabled = false;
    button.innerHTML = originalLabel;
  }
});

async function applyPublicSiteSettings() {
  if (window.location.protocol === "file:") return;
  try {
    const response = await fetch("/api/site-settings", { headers: { Accept: "application/json" } });
    if (!response.ok) return;
    const settings = await response.json();
    if (settings.seoTitle) document.title = settings.seoTitle;
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && settings.seoDescription) metaDescription.content = settings.seoDescription;
    const heroTitle = document.querySelector("#home h1");
    const heroDescription = document.querySelector("#home .hero-copy");
    const tagline = document.querySelector(".header-tagline");
    if (heroTitle && settings.homeTitle) heroTitle.textContent = settings.homeTitle;
    if (heroDescription && settings.homeDescription) heroDescription.textContent = settings.homeDescription;
    if (tagline && settings.slogan) tagline.textContent = settings.slogan;
    const newsletterTitle = document.querySelector("#newsletter-title");
    const newsletterDescription = document.querySelector("#newsletter-description");
    if (newsletterTitle && settings.widgetTitle) newsletterTitle.textContent = settings.widgetTitle;
    if (newsletterDescription && settings.widgetContent) newsletterDescription.textContent = settings.widgetContent;
    const mainNav = document.querySelector(".main-nav");
    if (mainNav && settings.menuItems) {
      const entries = String(settings.menuItems).split(/\r?\n/).map((line) => line.split("|")).filter((entry) => entry[0]?.trim() && entry[1]?.trim());
      if (entries.length) {
        mainNav.querySelectorAll("a").forEach((link) => link.remove());
        const firstButton = mainNav.querySelector("button");
        entries.forEach(([label, href]) => {
          const link = document.createElement("a");
          link.textContent = label.trim();
          link.href = href.trim();
          mainNav.insertBefore(link, firstButton);
        });
      }
    }
    const brand = document.querySelector(".brand");
    if (brand && settings.siteName) brand.setAttribute("aria-label", `${settings.siteName} home`);
    if (brand && settings.logoData) {
      brand.querySelectorAll(".brand-mark, .brand-word").forEach((item) => { item.hidden = true; });
      let customLogo = brand.querySelector(".custom-site-logo");
      if (!customLogo) {
        customLogo = document.createElement("img");
        customLogo.className = "custom-site-logo";
        brand.appendChild(customLogo);
      }
      customLogo.src = settings.logoData;
      customLogo.alt = settings.siteName || "Site logo";
    }
    if (settings.faviconData) {
      let favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }
      favicon.href = settings.faviconData;
    }
  } catch {}
}

applyLanguage(currentLang);
applyPublicSiteSettings();
renderUploadedDealsInMainGrid();
renderAffiliateItems();
renderLiveCouponStore();
