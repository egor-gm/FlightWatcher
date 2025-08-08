import fetch from 'node-fetch';

const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
const publicUrl = process.env.PUBLIC_URL;

async function setWebhook() {
  if (!token || !secret || !publicUrl) {
    throw new Error('Missing TELEGRAM_BOT_TOKEN, TELEGRAM_WEBHOOK_SECRET or PUBLIC_URL');
  }
  const webhookUrl = `${publicUrl}/telegram/${secret}`;
  const api = `https://api.telegram.org/bot${token}/setWebhook`;
  const res = await fetch(api, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl }),
  });
  const data = await res.json();
  console.log(data);
}

setWebhook().catch((err) => {
  console.error(err);
  process.exit(1);
});