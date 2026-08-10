const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '25mb' }));

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', service: 'KKR AI Backend Core' });
});

// Secure Streaming Endpoint for OpenAI Chat Completions
app.post('/api/chat/stream', async (req, res) => {
    const { messages, model = 'gpt-4o-mini', thinkingMode = false, webSearch = false } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid prompt structure.' });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Server API key missing configuration.' });
    }

    // Dynamic System Prompt Enhancement for KKR AI Brand
    const systemPrompt = {
        role: "system",
        content: `You are KKR AI, an ultra-advanced, futuristic AI assistant platform crafted with supreme design and intellect. 
        Provide elegant, accurate, visually formatted responses using Markdown, LaTeX math symbols where relevant, and structured code blocks. 
        Current options enabled: ${thinkingMode ? '[Thinking Mode: High Reasoning]' : ''} ${webSearch ? '[Web Search Realtime Focus]' : ''}.`
    };

    const formattedMessages = [systemPrompt, ...messages];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model === 'gpt-4' ? 'gpt-4o' : 'gpt-4o-mini',
                messages: formattedMessages,
                stream: true,
                temperature: thinkingMode ? 0.2 : 0.7
            })
        });

        if (!openaiResponse.ok) {
            const errBody = await openaiResponse.text();
            res.write(`data: ${JSON.stringify({ error: "OpenAI Gateway error: " + errBody })}\n\n`);
            return res.end();
        }

        openaiResponse.body.on('data', chunk => {
            res.write(chunk);
        });

        openaiResponse.body.on('end', () => {
            res.write('data: [DONE]\n\n');
            res.end();
        });

        openaiResponse.body.on('error', (err) => {
            console.error('Stream error:', err);
            res.end();
        });

    } catch (err) {
        console.error('Backend Server Error:', err);
        res.status(500).write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
    }
});

app.listen(PORT, () => {
    console.log(`⚡ KKR AI Backend Core online at http://localhost:${PORT}`);
});
