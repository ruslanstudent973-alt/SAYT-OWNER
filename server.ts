import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // MongoDB Connection disabled for now
  // const dbUri = process.env.DATABASE_URL || 'mongodb+srv://xayrullayevruslan07_db_user:Ruslan2026@cluster0.weduaay.mongodb.net/mission_control?compressors=zlib';
  // try {
  //   await mongoose.connect(dbUri);
  //   console.log('Connected to MongoDB Atlas');
  // } catch (err) {
  //   console.error('MongoDB connection error:', err);
  // }

  app.use(express.json());

  // API Routes (Migrated from vite.config.ts)
  app.get('/api/telegram/verify', async (req, res) => {
    const token = req.query.token as string;
    if (!token) {
      return res.status(400).json({ ok: false, error: 'Telegram Bot Token is required' });
    }

    try {
      const getMeRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const getMeData = await getMeRes.json();

      if (!getMeData.ok) {
        return res.status(400).json({ ok: false, error: getMeData.description || 'Invalid Telegram Bot Token' });
      }

      let webhookData: any = { ok: true, result: { url: '', pending_update_count: 0 } };
      try {
        const whRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`);
        webhookData = await whRes.json();
      } catch {}

      res.json({
        ok: true,
        bot: getMeData.result,
        webhook: webhookData.result || null,
      });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message || 'Telegram API request failed' });
    }
  });

  app.get('/api/ping', async (req, res) => {
    let targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ ok: false, error: 'Target URL is required' });
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    const startTime = performance.now();
    let statusCode = 200;

    try {
      const fetchRes = await fetch(targetUrl, {
        method: 'HEAD',
        headers: { 'User-Agent': 'BotPulse-MissionControl/1.0' },
      });
      statusCode = fetchRes.status;
    } catch {
      try {
        const getRes = await fetch(targetUrl, {
          method: 'GET',
          headers: { 'User-Agent': 'BotPulse-MissionControl/1.0' },
        });
        statusCode = getRes.status;
      } catch {
        statusCode = 502;
      }
    }

    const latencyMs = Math.round(performance.now() - startTime);
    res.json({
      ok: true,
      statusCode,
      latencyMs,
      url: targetUrl,
      checkedAt: new Date().toISOString(),
    });
  });
  app.get('/api/logs/:type/:id', (req, res) => {
    const { type, id } = req.params;
    const logs = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() - i * 1000,
      timestamp: new Date().toISOString(),
      level: Math.random() > 0.9 ? 'ERROR' : Math.random() > 0.7 ? 'WARN' : 'INFO',
      message: `${type.toUpperCase()} [${id}]: ${
        type === 'bot' 
          ? ['Received update', 'Processed command', 'Webhook ping', 'Queue processed'][Math.floor(Math.random() * 4)]
          : ['Health check passed', 'Response time: 45ms', 'SSL valid', 'Edge traffic received'][Math.floor(Math.random() * 4)]
      }`,
    }));
    res.json(logs);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
    app.use(async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.startsWith('/@')) {
        return next();
      }
      try {
        let template = await import('fs/promises').then(fs => fs.readFile(path.resolve(__dirname, 'index.html'), 'utf-8'));
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
