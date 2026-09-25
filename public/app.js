const marketsEl = document.getElementById("markets");
const countEl = document.getElementById("marketCount");
const topPremiumEl = document.getElementById("topPremium");
const topDiscountEl = document.getElementById("topDiscount");
const refreshBtn = document.getElementById("refresh");
const pythPulseEl = document.getElementById("pythPulse");

const money = (n) =>
  Number(n).toLocaleString("en-US", {
    maximumFractionDigits: 2
  });

const valuation = (n) => {
  const v = Number(n);
  if (v >= 1e12) return "$" + (v / 1e12).toFixed(2) + "T";
  if (v >= 1e9) return "$" + (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(2) + "M";
  return "$" + money(v);
};

async function loadMarkets() {
  marketsEl.innerHTML = '<div class="loading">Refreshing market data...</div>';

  try {
    const response = await fetch("/api/markets", { cache: "no-store" });
    const result = await response.json();

    if (!result.ok) throw new Error(result.error || "API error");

    const pyth = result.pyth || [];

    if (pythPulseEl) {
      const names = ["BTC/USD", "ETH/USD"];

      pythPulseEl.innerHTML = pyth.length
        ? pyth.map((feed, index) => `
            <article class="pyth-card">
              <div class="pyth-card-top">
                <span class="pyth-symbol">${names[index] || "PYTH FEED"}</span>
                <span class="pyth-live">LIVE</span>
              </div>
              <div class="pyth-price">$${money(feed.price)}</div>
              <div class="pyth-meta">
                <span>Confidence ±$${money(feed.confidence)}</span>
                <span>Pyth Network</span>
              </div>
            </article>
          `).join("")
        : '<div class="loading">Pyth data unavailable</div>';
    }

    const markets = [...result.markets].sort(
      (a, b) => Math.abs(b.premiumPct) - Math.abs(a.premiumPct)
    );

    countEl.textContent = markets.length;

    const highest = [...markets].sort(
      (a, b) => b.premiumPct - a.premiumPct
    )[0];

    const lowest = [...markets].sort(
      (a, b) => a.premiumPct - b.premiumPct
    )[0];

    topPremiumEl.textContent =
      `${highest.symbol} ${highest.premiumPct >= 0 ? "+" : ""}${highest.premiumPct.toFixed(2)}%`;

    topDiscountEl.textContent =
      `${lowest.symbol} ${lowest.premiumPct.toFixed(2)}%`;

    marketsEl.innerHTML = markets.map(token => {
      const positive = token.premiumPct >= 0;
      const cls = positive ? "positive" : "negative";
      const sign = positive ? "+" : "";

      return `
        <article class="market">
          <div class="market-main">
            <div class="company">
              <img class="logo" src="${token.image}" alt="">
              <div>
                <div class="symbol">${token.symbol}</div>
                <div class="name">PreStocks</div>
              </div>
            </div>

            <div class="price">
              <div class="token-price">$${money(token.tokenPrice)}</div>
              <div class="premium ${cls}">
                ${sign}${token.premiumPct.toFixed(2)}%
              </div>
            </div>
          </div>

          <div class="details">
            <div class="detail">
              <span>Mark Price</span>
              <strong>$${money(token.markPrice)}</strong>
            </div>
            <div class="detail">
              <span>Mark Valuation</span>
              <strong>${valuation(token.markValuation)}</strong>
            </div>
            <div class="detail">
              <span>Implied Valuation</span>
              <strong>${valuation(token.impliedValuation)}</strong>
            </div>
          </div>

          <div class="intelligence">
            <div class="intel-top">
              <div>
                <span class="intel-label">DIVERGENCE INTELLIGENCE</span>
                <strong>${token.divergence.level}</strong>
              </div>
              <div class="score">${token.divergence.score}/100</div>
            </div>

            <div class="scorebar">
              <div style="width:${token.divergence.score}%"></div>
            </div>

            <p>${token.divergence.explanation}</p>
          </div>
        </article>
      `;
    }).join("");
  } catch (error) {
    marketsEl.innerHTML =
      `<div class="loading">Unable to load markets: ${error.message}</div>`;
  }
}

refreshBtn.addEventListener("click", loadMarkets);
loadMarkets();
setInterval(loadMarkets, 30000);
