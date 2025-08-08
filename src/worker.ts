import { Redis } from '@upstash/redis';
import { getFlightStatus } from './providers/aerodatabox';
import { getOpenSkyState } from './providers/opensky';
import { determinePhase, Phase } from './state';

// Worker process polls statuses and emits alerts when phase changes. In a
// production implementation this would send Telegram messages via bot.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL as string,
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
});

interface TrackedFlight {
  flight: string;
  date: string;
}

async function pollFlight(userFlightKey: string, obj: TrackedFlight): Promise<void> {
  const status = await getFlightStatus(obj.flight, obj.date);
  let phase: Phase = 'scheduled';
  if (status) {
    phase = determinePhase(status.status);
  }
  const saved = (await redis.get(`phase:${userFlightKey}`)) as Phase | null;
  if (saved !== phase) {
    await redis.set(`phase:${userFlightKey}`, phase);
    // Here we would send a Telegram notification; omitted for brevity.
    console.log(`${obj.flight} ${obj.date} changed phase to ${phase}`);
  }
}

async function run(): Promise<void> {
  while (true) {
    try {
      // List all user keys
      const keys = (await redis.keys('user:*:flights')) as unknown as string[];
      for (const key of keys) {
        const members = (await redis.smembers(key)) as unknown as string[];
        for (const m of members) {
          const obj = JSON.parse(m) as TrackedFlight;
          const uniqueKey = `${key}:${obj.flight}:${obj.date}`;
          await pollFlight(uniqueKey, obj);
        }
      }
    } catch (err) {
      console.error('Worker error:', err);
    }
    // Sleep for a minute. Adjust cadence per phase in a real implementation.
    await new Promise((res) => setTimeout(res, 60_000));
  }
}

if (require.main === module) {
  run().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}