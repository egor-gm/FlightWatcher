"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const fastify_1 = __importDefault(require("fastify"));
const bot_1 = __importDefault(require("./bot"));
const fastify = (0, fastify_1.default)({ logger: true });
// Telegram webhook handler. The secret must be part of the URL to protect
// against others sending updates to the bot.
fastify.post('/telegram/:secret', async (request, reply) => {
    const secret = request.params.secret;
    if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
        reply.code(403).send({ ok: false });
        return;
    }
    // Telegraf processes the update and sends a response via Fastify's raw res
    await bot_1.default.handleUpdate(request.body);
    reply.send({ ok: true });
});
// Simple health endpoint for Render to check liveness
fastify.get('/health', async () => {
    return { status: 'ok' };
});
async function startServer() {
    const port = parseInt(process.env.PORT || '3000', 10);
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Server listening on ${port}`);
}
if (require.main === module) {
    startServer().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
