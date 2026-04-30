function hasProtocol(value: string) {
  return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(value);
}

function looksLikeDomain(value: string) {
  return /^[\w.-]+\.[a-z]{2,}(?:[/:?#]|$)/i.test(value);
}

export function normalizeImageUrlInput(value?: string | null) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (!hasProtocol(trimmed) && looksLikeDomain(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

export function getSafeImageUrl(value?: string | null) {
  const normalized = normalizeImageUrlInput(value);

  if (!normalized) {
    return undefined;
  }

  if (normalized.startsWith("/")) {
    return normalized;
  }

  try {
    const parsed = new URL(normalized);
    if (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:" ||
      parsed.protocol === "data:" ||
      parsed.protocol === "blob:"
    ) {
      return parsed.toString();
    }
  } catch {
    return undefined;
  }

  return undefined;
}
