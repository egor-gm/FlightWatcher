"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("@upstash/redis");
const aerodatabox_1 = require("./providers/aerodatabox");
const state_1 = require("./state");
// Worker process polls statuses and emits alerts when phase changes. In a
// production implementation this would send Telegram messages via bot.
const redis = new redis_1.Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
async function pollFlight(userFlightKey, obj) {
    const status = await (0, aerodatabox_1.getFlightStatus)(obj.flight, obj.date);
    let phase = 'scheduled';
    if (status) {
        phase = (0, state_1.determinePhase)(status.status);
    }
    const saved = (await redis.get(`phase:${userFlightKey}`));
    if (saved !== phase) {
        await redis.set(`phase:${userFlightKey}`, phase);
        // Here we would send a Telegram notification; omitted for brevity.
        console.log(`${obj.flight} ${obj.date} changed phase to ${phase}`);
    }
}
async function run() {
    while (true) {
        try {
            // List all user keys
            const keys = (await redis.keys('user:*:flights'));
            for (const key of keys) {
                const members = (await redis.smembers(key));
                for (const m of members) {
                    const obj = JSON.parse(m);
                    const uniqueKey = `${key}:${obj.flight}:${obj.date}`;
                    await pollFlight(uniqueKey, obj);
                }
            }
        }
        catch (err) {
            console.error('Worker error:', err);
        }
        // Sleep for a minute. Adjust cadence per phase in a real implementation.
        await new Promise((res) => setTimeout(res, 60000));
    }
}
if (require.main === module) {
    run().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
