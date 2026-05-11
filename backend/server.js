const express = require('express');
const cors    = require('cors');
const app     = express();

// ⚠️ 本番環境では CORS のオリジンを適切に制限してください
app.use(cors());
app.use(express.json());

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error('❌ ANTHROPIC_API_KEY が設定されていません');
  console.error('   ANTHROPIC_API_KEY=sk-ant-... node server.js');
  process.exit(1);
}

app.post('/api/chat', async (req, res) => {
  try {
    const { model, max_tokens, messages } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-api-key':        ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model, max_tokens, messages }),
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json(err);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('API エラー:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ バックエンド起動: http://localhost:${PORT}`);
  console.log(`   APIキー: ${ANTHROPIC_API_KEY.slice(0, 12)}...`);
});
