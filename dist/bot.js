"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telegraf_1 = require("telegraf");
const redis_1 = require("@upstash/redis");
const aerodatabox_1 = require("./providers/aerodatabox");
const opensky_1 = require("./providers/opensky");
// Ensure required env vars are present
if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN');
}
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error('Missing Upstash Redis configuration');
}
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new telegraf_1.Telegraf(token);
const redis = new redis_1.Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
// Helper to build a Redis key for a user's flight set
function userFlightsKey(userId) {
    return `user:${userId}:flights`;
}
/**
 * /help command handler. Explains available commands.
 */
bot.command('help', (ctx) => {
    ctx.replyWithMarkdownV2('*FlightWatcher*\n' +
        'Track flights and receive updates.\n' +
        'Commands:\n' +
        '/track <flight> <YYYY\-MM\-DD> \- start tracking a flight\n' +
        '/status <flight> <YYYY\-MM\-DD> \- get current status\n' +
        '/eta <flight> <YYYY\-MM\-DD> \- estimate time to arrival\n' +
        '/list \- list tracked flights\n' +
        '/unsubscribe <flight> \- stop tracking a flight\n' +
        '/help \- show this help message');
});
/**
 * /track command handler. Adds a flight/date pair to the user's tracked set.
 */
bot.command('track', async (ctx) => {
    const parts = ctx.message.text.split(/\s+/).slice(1);
    if (parts.length < 2) {
        ctx.reply('Usage: /track <flight> <YYYY-MM-DD>');
        return;
    }
    const flight = parts[0].toUpperCase();
    const date = parts[1];
    const key = userFlightsKey(ctx.from?.id);
    await redis.sadd(key, JSON.stringify({ flight, date }));
    await ctx.reply(`Tracking ${flight} on ${date}.`);
});
/**
 * /list command handler. Shows tracked flights for the user.
 */
bot.command('list', async (ctx) => {
    const key = userFlightsKey(ctx.from?.id);
    const members = await redis.smembers(key);
    if (!members || members.length === 0) {
        ctx.reply('No tracked flights.');
        return;
    }
    const lines = members.map((m) => {
        const obj = JSON.parse(m);
        return `${obj.flight} on ${obj.date}`;
    });
    ctx.reply(lines.join('\n'));
});
/**
 * /unsubscribe command handler. Removes a flight from the user's set.
 */
bot.command('unsubscribe', async (ctx) => {
    const parts = ctx.message.text.split(/\s+/).slice(1);
    if (parts.length < 1) {
        ctx.reply('Usage: /unsubscribe <flight>');
        return;
    }
    const flight = parts[0].toUpperCase();
    const key = userFlightsKey(ctx.from?.id);
    const members = await redis.smembers(key);
    for (const m of members) {
        const obj = JSON.parse(m);
        if (obj.flight === flight) {
            await redis.srem(key, m);
        }
    }
    ctx.reply(`Unsubscribed from ${flight}.`);
});
/**
 * /status command handler. Fetches the current status for a flight/date.
 */
bot.command('status', async (ctx) => {
    const parts = ctx.message.text.split(/\s+/).slice(1);
    if (parts.length < 2) {
        ctx.reply('Usage: /status <flight> <YYYY-MM-DD>');
        return;
    }
    const flight = parts[0].toUpperCase();
    const date = parts[1];
    const status = await (0, aerodatabox_1.getFlightStatus)(flight, date);
    if (!status) {
        ctx.reply('Status unavailable.');
        return;
    }
    const dep = status.departure.estimatedTimeUtc ?? status.departure.scheduledTimeUtc;
    const arr = status.arrival.estimatedTimeUtc ?? status.arrival.scheduledTimeUtc;
    ctx.reply(`Status: ${status.status}\nDeparture: ${dep}\nArrival: ${arr}`);
});
/**
 * /eta command handler. Estimates time to arrival using live position and speed.
 * This implementation is simplistic: it divides the great-circle distance by
 * groundspeed to compute time to go.
 */
bot.command('eta', async (ctx) => {
    const parts = ctx.message.text.split(/\s+/).slice(1);
    if (parts.length < 2) {
        ctx.reply('Usage: /eta <flight> <YYYY-MM-DD>');
        return;
    }
    const flight = parts[0].toUpperCase();
    const date = parts[1];
    const status = await (0, aerodatabox_1.getFlightStatus)(flight, date);
    // We need arrival airport coordinates to compute ETA; without schedule we cannot do this.
    if (!status) {
        ctx.reply('ETA unavailable.');
        return;
    }
    const live = await (0, opensky_1.getOpenSkyState)(flight.toLowerCase());
    if (!live || live.latitude == null || live.longitude == null || !live.velocity) {
        ctx.reply('Live position unavailable.');
        return;
    }
    // Dummy fallback: assume 500 km remaining and speed in m/s.
    const velocityKmH = live.velocity * 3.6; // convert m/s to km/h
    const remainingKm = 500;
    const hours = remainingKm / (velocityKmH || 800);
    const etaMinutes = Math.round(hours * 60);
    ctx.reply(`Estimated time to arrival: ${etaMinutes} minutes (approx).`);
});
exports.default = bot;
