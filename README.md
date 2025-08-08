# FlightWatcher

FlightWatcher is a Telegram bot for tracking commercial flights and receiving status updates. It uses the Telegraf framework for Telegram bots, Fastify for webhook handling, Upstash Redis for storing subscriptions and deduplicating notifications, and Render for hosting both the web service and a background worker.

## Features

- **Track flights** by IATA or ICAO flight number and date using the `/track` command.
- **Receive notifications** when a flight changes phase (scheduled, departed, airborne, enroute, approach, landed, diverted, delayed, canceled). The worker process polls providers and compares phases to send idempotent alerts.
- **Check status** of a flight with `/status <flight> <date>`.
- **Estimate arrival time** with `/eta <flight> <date>` using live position and speed (simplified).
- **List and manage** subscriptions with `/list` and `/unsubscribe <flight>`.
- **Health endpoint** at `/health` for monitoring.

## Providers

FlightWatcher combines multiple data sources to deliver accurate tracking:

- **OpenSky Network** – provides live aircraft states (position, speed, altitude). Anonymous usage allows ~400 API credits per day for recent states【108682530456351†screenshot】. An authenticated tier is available for higher limits.【108682530456351†screenshot】
- **AeroDataBox** – delivers scheduled and real‑time flight status. Their free and low‑cost tiers (via RapidAPI) offer up to ~600–1000 requests per day depending on promotions【108682530456351†screenshot】. We use this to determine scheduled, delayed, departed and landed states.
- **AviationStack** – optional fallback provider with a small free tier (100 requests/month). You can supply an API key as `AVIATIONSTACK_API_KEY` and implement a fallback provider if desired.

You must obtain API keys and supply them via environment variables. See **Environment variables** below.

## Environment variables

Create a `.env` file based on `.env.example` and fill in:

- `TELEGRAM_BOT_TOKEN` – token for your Telegram bot.
- `TELEGRAM_WEBHOOK_SECRET` – random secret appended to the webhook URL for security.
- `PUBLIC_URL` – the public HTTPS URL of your web service (e.g. Render service).
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` – credentials for your Upstash Redis database.
- `AERODATABOX_API_KEY` – RapidAPI key for the AeroDataBox API.

## Running locally

Install dependencies and build the TypeScript sources:

```bash
npm install
npm run build
```

Start the webhook server on port 3000:

```bash
npm start
```

Configure the Telegram webhook (requires that `PUBLIC_URL` is reachable by Telegram):

```bash
npm run set-webhook
```

Start the background worker in a separate process or container:

```bash
npm run worker
```

## Deployment to Render

The included `render.yaml` defines two services: a **web service** that runs the webhook server and a **worker service** that polls flights and sends notifications. Deploy both services from this repository in your Render dashboard and set the environment variables as described above. Use Upstash for Redis with its free tier (sufficient for small bots) and add the Upstash REST URL and token to your Render environment.

## Tests

Basic unit tests for the Haversine helper and the state machine are provided in the `test/` directory. Run them with:

```bash
npm test
```

## Upstash

This bot uses Upstash Redis to store user subscriptions and the last seen phase for each flight. The free tier offers a generous quota and simple REST API. Keys are structured as follows:

- `user:<telegram_id>:flights` – a set of `{ flight, date }` JSON strings representing active subscriptions.
- `phase:user:<telegram_id>:<flight>:<date>` – the last phase seen for the flight/date combination; used to deduplicate notifications.

Refer to the [Upstash documentation](https://docs.upstash.com/redis) for details on provisioning a Redis database.