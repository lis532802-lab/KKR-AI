import { renderMarkdown } from './utils.js';
import { saveChatMessages } from '../../firebase/firestore.js';

export class ChatEngine {
    constructor(chatId, userId) {
        this.chatId = chatId;
        this.userId = userId;
        this.messages = [];
        this.backendUrl = 'http://localhost:5000/api/chat/stream';
        // Direct Fallback OpenAI Key
        this.apiKey = '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';
    }

    async sendMessage(userContent, options = {}) {
        const userMsg = { role: 'user', content: userContent };
        this.messages.push(userMsg);
        this.appendMessageToUI(userMsg);

        const assistantMsg = { role: 'assistant', content: '' };
        const assistantBubble = this.appendMessageToUI(assistantMsg);

        let response = null;

        // Step 1: Try Local Backend Server First
        try {
            response = await fetch(this.backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: this.messages,
                    model: options.model || 'gpt-4o-mini',
                    thinkingMode: options.thinkingMode || false,
                    webSearch: options.webSearch || false
                })
            });
        } catch (backendError) {
            console.warn('Backend server offline. Switching to Direct OpenAI Mode...');
        }

        // Step 2: Fallback to Direct OpenAI API Stream if Backend Server is not running
        if (!response || !response.ok) {
            try {
                const systemPrompt = {
                    role: "system",
                    content: `You are KKR AI, an ultra-advanced AI assistant. Format responses using Markdown. ${options.thinkingMode ? '[Thinking Mode Active]' : ''}`
                };

                response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: options.model === 'gpt-4' ? 'gpt-4o' : 'gpt-4o-mini',
                        messages: [systemPrompt, ...this.messages],
                        stream: true
                    })
                });
            } catch (directErr) {
                assistantBubble.innerHTML = `<span style="color:#ef4444;">Error: Unable to connect to AI API. Check internet connection.</span>`;
                return;
            }
        }

        // Step 3: Parse Stream Response
        try {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullText = '';

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '').trim();
                        if (dataStr === '[DONE]') break;
                        try {
                            const parsed = JSON.parse(dataStr);
                            const content = parsed.choices?.[0]?.delta?.content || '';
                            fullText += content;
                            assistantBubble.innerHTML = renderMarkdown(fullText);
                        } catch (e) {
                            // Ignored stream chunk parse buffer
                        }
                    }
                }
            }

            assistantMsg.content = fullText;
            this.messages.push(assistantMsg);

            // Save conversation to Firebase Firestore
            if (this.chatId) {
                const title = this.messages[0]?.content.substring(0, 28) + '...';
                await saveChatMessages(this.chatId, this.messages, title);
            }

        } catch (err) {
            console.error('Stream processing error:', err);
            assistantBubble.innerHTML = `<span style="color:#ef4444;">Error processing response stream.</span>`;
        }
    }

    appendMessageToUI(msg) {
        const container = document.getElementById('messages-container');
        const row = document.createElement('div');
        row.className = `message-row ${msg.role}`;

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerText = msg.role === 'user' ? 'U' : 'K';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = renderMarkdown(msg.content);

        row.appendChild(avatar);
        row.appendChild(bubble);
        container.appendChild(row);
        container.scrollTop = container.scrollHeight;

        return bubble;
    }
}
