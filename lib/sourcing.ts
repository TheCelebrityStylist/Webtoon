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

function findScriptJsonLd(html: string): string[] {
  const matches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) ?? [];
  return matches
    .map((tag) => tag.replace(/^.*?>/s, "").replace(/<\/script>$/i, "").trim())
    .filter(Boolean);
}

function parseJsonLdProducts(html: string, baseUrl: string): LookProduct[] {
  const results: LookProduct[] = [];

  for (const raw of findScriptJsonLd(html)) {
    try {
      const data = JSON.parse(raw);
      const nodes = Array.isArray(data) ? data : [data];

      for (const node of nodes) {
        if (!node) continue;

        if (node["@type"] === "ItemList" && Array.isArray(node.itemListElement)) {
          for (const item of node.itemListElement) {
            const product = item?.item ?? item;
            if (!product?.name || !product?.offers) continue;
            results.push({
              retailer: "",
              title: product.name,
              price: Number(product.offers.price || 0),
              currency: product.offers.priceCurrency || "EUR",
              image: Array.isArray(product.image) ? product.image[0] : product.image || "",
              url: ensureAbsolute(product.url, baseUrl),
            });
          }
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
      }
    } catch {
      // ignore invalid JSON-LD
    }
  }

  return results.filter((item) => item.title && item.url);
}

function parseTileProducts(html: string, baseUrl: string): LookProduct[] {
  const products: LookProduct[] = [];
  const anchorTags = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/gi) ?? [];

  for (const tag of anchorTags) {
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1] ?? "";
    if (!href || !/product|p\//i.test(href)) continue;

    const title = tag.match(/title=["']([^"']+)["']/i)?.[1] ?? tag.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!title) continue;

    const image = tag.match(/<img[^>]*src=["']([^"']+)["']/i)?.[1] ?? "";
    const priceText = tag.match(/(?:€|EUR|\$)\s?\d+[\d.,]*/i)?.[0] ?? "";

    products.push({
      retailer: "",
      title,
      price: normalizePrice(priceText),
      currency: "EUR",
      image: ensureAbsolute(image, baseUrl),
      url: ensureAbsolute(href, baseUrl),
    });
  }

  return products.filter((product) => product.title && product.url);
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

  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] ?? "";
  const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] ?? "";

  if (ogImage && !product.image) {
    product.image = ogImage;
  }

  if (!ogTitle) return true;
  return ogTitle.toLowerCase().includes(product.title.toLowerCase().slice(0, 10));
}

async function sourceRetailer(name: string, searchUrl: string, baseUrl: string) {
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
  const tasks = retailers.map((retailer) => sourceRetailer(retailer.name, retailer.search(query), retailer.baseUrl));

  const globalTimeout = new Promise<LookProduct[]>((resolve) => setTimeout(() => resolve([]), GLOBAL_TIMEOUT_MS));

  const results = await Promise.race([
    Promise.allSettled(tasks).then((settled) => settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []))),
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
