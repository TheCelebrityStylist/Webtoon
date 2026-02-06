import * as cheerio from "cheerio";
import type { LookProduct } from "@/lib/lookJob";

const GLOBAL_TIMEOUT_MS = 8000;
const RETAILER_TIMEOUT_MS = 1500;

const retailers = [
  {
    name: "COS",
    baseUrl: "https://www.cos.com",
    search: (query: string) =>
      `https://www.cos.com/en_eur/search.html?q=${encodeURIComponent(query)}`,
  },
  {
    name: "Zara",
    baseUrl: "https://www.zara.com",
    search: (query: string) =>
      `https://www.zara.com/nl/en/search?searchTerm=${encodeURIComponent(query)}`,
  },
  {
    name: "& Other Stories",
    baseUrl: "https://www.stories.com",
    search: (query: string) =>
      `https://www.stories.com/en_eur/search?q=${encodeURIComponent(query)}`,
  },
];

const productSlots = ["Outerwear", "Top", "Bottom", "Shoes", "Bag"];

const neutralBoost = "cream black ivory camel";

function normalizePrice(value: string) {
  const cleaned = value.replace(/[^\d.,]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function ensureAbsolute(url: string, baseUrl: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return new URL(url, baseUrl).toString();
}

function parseJsonLdProducts(html: string, baseUrl: string): LookProduct[] {
  const $ = cheerio.load(html);
  const results: LookProduct[] = [];

  $("script[type='application/ld+json']").each((_, el) => {
    const raw = $(el).contents().text();
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      const nodes = Array.isArray(data) ? data : [data];
      nodes.forEach((node) => {
        if (!node) return;
        if (node["@type"] === "ItemList" && Array.isArray(node.itemListElement)) {
          node.itemListElement.forEach((item: any) => {
            const product = item.item || item;
            if (product && product.name && product.offers) {
              results.push({
                retailer: "",
                title: product.name,
                price: Number(product.offers.price || 0),
                currency: product.offers.priceCurrency || "EUR",
                image: Array.isArray(product.image)
                  ? product.image[0]
                  : product.image || "",
                url: ensureAbsolute(product.url, baseUrl),
              });
            }
          });
        }
        if (node["@type"] === "Product" && node.name && node.offers) {
          results.push({
            retailer: "",
            title: node.name,
            price: Number(node.offers.price || 0),
            currency: node.offers.priceCurrency || "EUR",
            image: Array.isArray(node.image) ? node.image[0] : node.image || "",
            url: ensureAbsolute(node.url, baseUrl),
          });
        }
      });
    } catch {
      // ignore invalid JSON-LD
    }
  });

  return results.filter((item) => item.title && item.url);
}

function parseTileProducts(html: string, baseUrl: string): LookProduct[] {
  const $ = cheerio.load(html);
  const products: LookProduct[] = [];
  $("a").each((_, link) => {
    const href = $(link).attr("href") || "";
    const title = $(link).attr("title") || $(link).text().trim();
    if (!href || !title) return;
    if (!/product|p\//i.test(href)) return;
    const image = $(link).find("img").attr("src") || "";
    const priceText = $(link).find("[class*='price']").text() || "";
    products.push({
      retailer: "",
      title,
      price: normalizePrice(priceText),
      currency: "EUR",
      image: ensureAbsolute(image, baseUrl),
      url: ensureAbsolute(href, baseUrl),
    });
  });

  return products.filter((p) => p.title && p.url);
}

async function fetchHtml(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "user-agent": "Mozilla/5.0" },
      cache: "no-store",
    });
    if (!response.ok) return "";
    return await response.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

async function verifyProduct(product: LookProduct, timeoutMs: number) {
  const html = await fetchHtml(product.url, timeoutMs);
  if (!html) return false;
  const $ = cheerio.load(html);
  const ogTitle = $("meta[property='og:title']").attr("content") || "";
  const ogImage = $("meta[property='og:image']").attr("content") || "";
  if (ogImage && !product.image) product.image = ogImage;
  if (!ogTitle) return true;
  const matches = ogTitle.toLowerCase().includes(product.title.toLowerCase().slice(0, 10));
  return matches;
}

async function sourceRetailer(name: string, searchUrl: string, baseUrl: string, query: string) {
  const html = await fetchHtml(searchUrl, RETAILER_TIMEOUT_MS);
  if (!html) return [] as LookProduct[];

  const jsonProducts = parseJsonLdProducts(html, baseUrl);
  const tileProducts = parseTileProducts(html, baseUrl);
  const merged = [...jsonProducts, ...tileProducts]
    .map((item) => ({ ...item, retailer: name }))
    .filter((item) => item.title && item.url);

  const seen = new Set<string>();
  const unique = merged.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });

  const verified: LookProduct[] = [];
  for (const item of unique.slice(0, 4)) {
    const ok = await verifyProduct(item, 1200);
    if (ok) verified.push(item);
  }

  return verified.length ? verified : unique.slice(0, 4);
}

function assignSlots(products: LookProduct[]) {
  const productsBySlot: Record<string, LookProduct[]> = {};
  const slotCopy = [...productSlots];

  products.forEach((product, index) => {
    const slot = slotCopy[index % slotCopy.length];
    if (!productsBySlot[slot]) productsBySlot[slot] = [];
    productsBySlot[slot].push(product);
  });

  return productsBySlot;
}

export async function sourceProducts(prompt: string) {
  const query = `${prompt} ${neutralBoost}`.trim();
  const tasks = retailers.map((retailer) =>
    sourceRetailer(retailer.name, retailer.search(query), retailer.baseUrl, query),
  );

  const globalTimeout = new Promise<LookProduct[]>((resolve) =>
    setTimeout(() => resolve([]), GLOBAL_TIMEOUT_MS),
  );

  const results = await Promise.race([
    Promise.allSettled(tasks).then((settled) =>
      settled.flatMap((result) =>
        result.status === "fulfilled" ? result.value : [],
      ),
    ),
    globalTimeout,
  ]);

  const filtered = results.filter((item) => item.title && item.url);
  const productsBySlot = assignSlots(filtered);
  const total = filtered.reduce((sum, item) => sum + (item.price || 0), 0);

  return {
    productsBySlot,
    items: filtered,
    total,
  };
}
