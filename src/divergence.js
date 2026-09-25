function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function analyzeDivergence(token) {
  const premium = Number(token.premiumPct ?? 0);
  const absolutePremium = Math.abs(premium);

  let level = "LOW";

  if (absolutePremium >= 25) {
    level = "EXTREME";
  } else if (absolutePremium >= 10) {
    level = "HIGH";
  } else if (absolutePremium >= 5) {
    level = "MEDIUM";
  }

  const score = Math.round(
    clamp(absolutePremium / 25 * 100, 0, 100)
  );

  let direction = "NEUTRAL";

  if (premium > 0) direction = "PREMIUM";
  if (premium < 0) direction = "DISCOUNT";

  let explanation;

  if (premium >= 25) {
    explanation =
      "Token price is materially above the current PreStocks mark price.";
  } else if (premium >= 10) {
    explanation =
      "Token price is significantly above the current PreStocks mark price.";
  } else if (premium >= 5) {
    explanation =
      "Token price is moderately above the current PreStocks mark price.";
  } else if (premium <= -25) {
    explanation =
      "Token price is materially below the current PreStocks mark price.";
  } else if (premium <= -10) {
    explanation =
      "Token price is significantly below the current PreStocks mark price.";
  } else if (premium <= -5) {
    explanation =
      "Token price is moderately below the current PreStocks mark price.";
  } else {
    explanation =
      "Token price is relatively close to the current PreStocks mark price.";
  }

  return {
    score,
    level,
    direction,
    explanation,
  };
}
