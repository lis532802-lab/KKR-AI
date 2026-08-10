import { renderMarkdown } from './utils.js';
import { saveChatMessages } from '../../firebase/firestore.js';

export class ChatEngine {
    constructor(chatId, userId) {
        this.chatId = chatId;
        this.userId = userId;
        this.messages = [];
        this.backendUrl = 'http://localhost:5000/api/chat/stream';
    }

    async sendMessage(userContent, options = {}) {
        const userMsg = { role: 'user', content: userContent };
        this.messages.push(userMsg);
        this.appendMessageToUI(userMsg);

        const assistantMsg = { role: 'assistant', content: '' };
        const assistantBubble = this.appendMessageToUI(assistantMsg);

        try {
            const response = await fetch(this.backendUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: this.messages,
                    model: options.model || 'gpt-4o-mini',
                    thinkingMode: options.thinkingMode || false,
                    webSearch: options.webSearch || false
                })
            });

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
                            // Non-json chunk stream parser safety
                        }
                    }
                }
            }

            assistantMsg.content = fullText;
            this.messages.push(assistantMsg);

            if (this.chatId) {
                const title = this.messages[0]?.content.substring(0, 28) + '...';
                await saveChatMessages(this.chatId, this.messages, title);
            }

        } catch (err) {
            assistantBubble.innerHTML = `<span style="color:#ef4444;">Error generating response. Ensure backend server is running on port 5000.</span>`;
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
