const title = (value: string) => value.replace(/\b\w/g, (character) => character.toUpperCase());

export function defaultBranchName(quote: string) {
  const normalized = quote.trim().replace(/[“”"'.,!?]/g, "");
  const carrying = /\b(?:carrying|holding|wearing)\s+(?:the\s+)?(.+)$/i.exec(normalized);
  if (carrying) return `${title(carrying[1])} left behind`;
  const words = normalized.split(/\s+/).filter(Boolean);
  const subject = words.slice(-Math.min(3, words.length)).join(" ");
  return subject ? `${title(subject)} changed` : "Alternate history";
}
