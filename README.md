# StockPilot

**Solana-native tokenized stock intelligence dashboard**

StockPilot is a mobile-first analytics dashboard for tokenized private-market assets.

It compares live PreStocks token prices with PreStocks mark prices and turns the difference into a simple Divergence Intelligence score.

## Features

- Live PreStocks token prices
- PreStocks mark prices
- Mark and implied valuations
- Premium / discount percentage
- Divergence score from 0-100
- LOW / MEDIUM / HIGH / EXTREME levels
- Pyth Network Market Pulse
- BTC/USD and ETH/USD live oracle data
- Pyth confidence values
- Automatic 30-second refresh
- Mobile-first interface

## Data Sources

### PreStocks

PreStocks provides the primary tokenized private-market data used by the divergence engine.

StockPilot reads token price, mark price, valuations and token metadata from the PreStocks API.

### Pyth Network

Pyth Network Hermes provides an independent live market-data layer.

The current demo displays BTC/USD and ETH/USD prices together with confidence values.

Pyth Market Pulse is independent reference data. It is not used as the price source for the PreStocks assets.

## Divergence Engine

Premium or discount is calculated as:

    (tokenPrice / markPrice - 1) * 100

The absolute divergence is normalized to a 0-100 score:

    min(abs(premiumPct) / 25 * 100, 100)

Signal levels:

| Divergence | Level |
|---:|---|
| < 5% | LOW |
| 5-10% | MEDIUM |
| 10-25% | HIGH |
| >= 25% | EXTREME |

## Architecture

    Browser
       |
       v
    StockPilot Node server
       |
       +---- PreStocks API
       |        |
       |        +-- token price
       |        +-- mark price
       |        +-- valuations
       |
       +---- Pyth Hermes
                |
                +-- BTC/USD
                +-- ETH/USD

    PreStocks data
          |
          v
    Divergence Engine
          |
          v
    Intelligence Score
          |
          v
    Mobile Dashboard

## Technology

- Node.js
- JavaScript
- Solana ecosystem
- PreStocks API
- Pyth Network Hermes API
- HTML / CSS / JavaScript

## Run Locally

Install dependencies:

    npm install

Create `.env`:

    PYTH_API_KEY=your_pyth_api_key

Start:

    npm start

Dashboard:

    http://127.0.0.1:8787

API:

    http://127.0.0.1:8787/api/markets

## Security

API credentials are stored in environment variables.

`.env` is excluded from Git and must never be committed to a public repository.

## Current MVP

The current demo includes 8 live PreStocks markets and live Pyth BTC/USD and ETH/USD data.

StockPilot automatically refreshes market data every 30 seconds.

## Disclaimer

StockPilot is a market-data and analytics prototype.

Divergence signals are informational calculations based on available market data. They are not investment advice, price predictions, or recommendations to buy or sell assets.

## Hackathon

Built as a Solana ecosystem hackathon MVP connecting tokenized private-market data with independent oracle market data.
