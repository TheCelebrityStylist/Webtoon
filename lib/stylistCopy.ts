const bannedPhrases = [
  "still searching",
  "time cap",
  "system",
  "timeout",
  "rate limit",
];

const loadingLines = [
  "Sketching a silhouette that feels expensive without trying too hard.",
  "Pulling sharp textures and soft volume so the look moves elegantly.",
  "Balancing polish with a touch of attitude for that quiet luxury energy.",
  "Editing down to pieces that feel intentional and effortless.",
];

export function sanitizeCopy(text: string) {
  let output = text;
  bannedPhrases.forEach((phrase) => {
    const regex = new RegExp(phrase, "gi");
    output = output.replace(regex, "");
  });
  return output.replace(/\s+/g, " ").trim();
}

export function openingLine(prompt: string) {
  return sanitizeCopy(
    `Got it. I’m curating a premium look inspired by “${prompt}” with real pieces you can buy now.`,
  );
}

export function loadingLine(step: number) {
  return loadingLines[step % loadingLines.length];
}

export function itemCommentary(title: string) {
  return sanitizeCopy(
    `This one brings a clean, elevated finish: “${title}” with a refined silhouette.`,
  );
}

export function summaryLine(total: number, currency: string) {
  const formatted = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(total || 0);

  return sanitizeCopy(
    `Your edit comes together at ${formatted}. Sleek, intentional, and ready for the spotlight.`,
  );
}
