const TIERMAKER_HOSTS = new Set(["tiermaker.com", "www.tiermaker.com"]);
const TIERMAKER_IMAGE_PATH = /^\/images\/chart(?:\/chart)?\/.+/i;
const CLOUDFLARE_MARKERS = [
  "__cf_chl_",
  "Enable JavaScript and cookies to continue",
  "Just a moment...",
];

export type TierMakerImportedItem = {
  label: string;
  imageUrl: string;
};

export type TierMakerImportPayload = {
  normalizedUrl: string;
  title: string | null;
  items: TierMakerImportedItem[];
};

export class TierMakerImportError extends Error {
  public readonly status: number;

  constructor(
    message: string,
    status: number,
  ) {
    super(message);
    this.name = "TierMakerImportError";
    this.status = status;
  }
}

export function normalizeTierMakerUrl(rawUrl: string): URL {
  let url: URL;

  try {
    url = new URL(rawUrl.trim());
  } catch {
    throw new TierMakerImportError("Enter a valid TierMaker URL.", 400);
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new TierMakerImportError("TierMaker URLs must use http or https.", 400);
  }

  if (!TIERMAKER_HOSTS.has(url.hostname)) {
    throw new TierMakerImportError("Only tiermaker.com URLs are supported.", 400);
  }

  if (url.pathname === "/" || !url.pathname.startsWith("/create/")) {
    throw new TierMakerImportError(
      "Paste a direct TierMaker template URL from the create page.",
      400,
    );
  }

  url.hash = "";
  url.search = "";
  return url;
}

export function isTierMakerBotBlockPage(html: string): boolean {
  return CLOUDFLARE_MARKERS.some((marker) => html.includes(marker));
}

export async function fetchTierMakerImport(
  rawUrl: string,
): Promise<TierMakerImportPayload> {
  const normalizedUrl = normalizeTierMakerUrl(rawUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(normalizedUrl, {
      headers: {
        "accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      },
      redirect: "follow",
      signal: controller.signal,
    });

    const html = await response.text();
    if (isTierMakerBotBlockPage(html)) {
      throw new TierMakerImportError(
        "TierMaker blocked the automated import request. Try again later or paste item labels manually.",
        502,
      );
    }

    if (!response.ok) {
      throw new TierMakerImportError(
        `TierMaker returned ${response.status}. Try a different template URL.`,
        502,
      );
    }

    return parseTierMakerTemplateHtml(html, normalizedUrl);
  } catch (error) {
    if (error instanceof TierMakerImportError) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new TierMakerImportError("TierMaker import timed out.", 504);
    }

    throw new TierMakerImportError("Unable to reach TierMaker.", 502);
  } finally {
    clearTimeout(timeout);
  }
}

export function parseTierMakerTemplateHtml(
  html: string,
  pageUrl: URL,
): TierMakerImportPayload {
  if (isTierMakerBotBlockPage(html)) {
    throw new TierMakerImportError(
      "TierMaker blocked the automated import request. Try again later or paste item labels manually.",
      502,
    );
  }

  const imageUrls = collectTierMakerImageUrls(html, pageUrl);
  if (imageUrls.length === 0) {
    throw new TierMakerImportError(
      "No TierMaker items were found on that page. Use a direct template URL.",
      422,
    );
  }

  return {
    normalizedUrl: pageUrl.toString(),
    title: extractTierMakerTitle(html),
    items: imageUrls.map((imageUrl, index) => ({
      label: deriveItemLabel(imageUrl, index),
      imageUrl,
    })),
  };
}

function collectTierMakerImageUrls(html: string, pageUrl: URL): string[] {
  const matches = new Set<string>();
  const regexes = [
    /<img[^>]+class=["'][^"']*draggable-filler[^"']*["'][^>]+src=["']([^"']+)["']/gi,
    /<(?:img|div)[^>]+(?:src|data-src|data-image)=["']([^"']*\/images\/chart(?:\/chart)?\/[^"']+)["']/gi,
    /background-image\s*:\s*url\((["']?)([^"')]+)\1\)/gi,
    /https?:\\\/\\\/(?:www\.)?tiermaker\.com\\\/images\\\/chart(?:\\\/chart)?\\\/[^"'\\\s<]+/gi,
    /\/images\/chart(?:\/chart)?\/[^"'\\\s<]+/gi,
  ];

  for (const regex of regexes) {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(html)) !== null) {
      const rawValue = match[2] ?? match[1] ?? match[0];
      const normalized = normalizeImageUrlCandidate(rawValue, pageUrl);
      if (normalized) {
        matches.add(normalized);
      }
    }
  }

  return Array.from(matches);
}

function normalizeImageUrlCandidate(
  rawValue: string,
  pageUrl: URL,
): string | null {
  const decoded = decodeHtml(rawValue)
    .replace(/\\\//g, "/")
    .replace(/^"+|"+$/g, "")
    .replace(/^'+|'+$/g, "")
    .replace(/[)",'\]]+$/g, "")
    .trim();

  if (!decoded) {
    return null;
  }

  let url: URL;
  try {
    url = decoded.startsWith("http")
      ? new URL(decoded)
      : new URL(decoded, pageUrl.origin);
  } catch {
    return null;
  }

  if (!TIERMAKER_HOSTS.has(url.hostname) || !TIERMAKER_IMAGE_PATH.test(url.pathname)) {
    return null;
  }

  url.hash = "";
  return url.toString();
}

function extractTierMakerTitle(html: string): string | null {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (!titleMatch?.[1]) {
    return null;
  }

  const cleaned = decodeHtml(titleMatch[1])
    .replace(/\s+-\s+TierMaker\s*$/i, "")
    .replace(/^Create\s+(?:a|an)\s+/i, "")
    .replace(/\s+Tier\s+List(?:\s+Maker)?$/i, "")
    .trim();

  return cleaned || null;
}

function deriveItemLabel(imageUrl: string, index: number): string {
  const filename = imageUrl.split("/").pop();
  if (!filename) {
    return `Imported Item ${index + 1}`;
  }

  const decoded = decodeURIComponent(filename)
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!decoded) {
    return `Imported Item ${index + 1}`;
  }

  return decoded.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/gi, "/");
}
