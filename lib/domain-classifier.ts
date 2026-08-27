import type { DomainCategory, DomainLists } from "./types";

/**
 * Extracts the registrable base domain from a hostname.
 *
 * - Strips leading "www."
 * - Returns the last two labels (e.g. "sub.example.com" -> "example.com").
 *   For known multi-part TLDs such as "co.uk" this is a simplification,
 *   but it covers all domains in our default lists.
 */
export function extractBaseDomain(hostname: string): string {
  let h = hostname.toLowerCase().trim();

  // Strip leading "www."
  if (h.startsWith("www.")) {
    h = h.slice(4);
  }

  const parts = h.split(".");
  if (parts.length <= 2) return h;

  // Return last two labels as the base domain.
  return parts.slice(-2).join(".");
}

/**
 * Classify a hostname against the user's domain lists.
 *
 * Matching logic:
 * 1. Exact match on the full hostname (minus "www.").
 * 2. Exact match on the extracted base domain.
 * 3. Suffix match — the hostname ends with "." + listed domain
 *    (covers deep subdomains like "sub.docs.google.com").
 */
export function classifyDomain(
  hostname: string,
  lists: DomainLists,
): DomainCategory {
  const normalized = hostname.toLowerCase().trim().replace(/^www\./, "");
  const base = extractBaseDomain(hostname);

  // Check productive list first.
  for (const domain of lists.productive) {
    const d = domain.toLowerCase();
    if (normalized === d || base === d || normalized.endsWith(`.${d}`)) {
      return "productive";
    }
  }

  // Then non-productive.
  for (const domain of lists.nonProductive) {
    const d = domain.toLowerCase();
    if (normalized === d || base === d || normalized.endsWith(`.${d}`)) {
      return "non-productive";
    }
  }

  return "neutral";
}
