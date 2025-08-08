import Fastify from 'fastify';
import bot from './bot';

const fastify = Fastify({ logger: true });

// Telegram webhook handler. The secret must be part of the URL to protect
// against others sending updates to the bot.
fastify.post<{ Body: any; Params: { secret: string } }>('/telegram/:secret', async (request, reply) => {
  const secret = request.params.secret;
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    reply.code(403).send({ ok: false });
    return;
  }
  // Telegraf processes the update and sends a response via Fastify's raw res
  await bot.handleUpdate(request.body as any);
  reply.send({ ok: true });
});

// Simple health endpoint for Render to check liveness
fastify.get('/health', async () => {
  return { status: 'ok' };
});

export async function startServer(): Promise<void> {
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