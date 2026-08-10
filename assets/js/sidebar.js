import { getUserChats, deleteChatSession, togglePinChat } from '../../firebase/firestore.js';

export const renderSidebarChats = async (userId, activeChatId, onSelectChat) => {
    const chatListContainer = document.getElementById('chat-history-list');
    if (!chatListContainer) return;

    chatListContainer.innerHTML = `<div style="text-align:center; padding:15px; color:var(--text-muted);">Loading history...</div>`;
    
    try {
        const chats = await getUserChats(userId);
        chatListContainer.innerHTML = '';

        if (chats.length === 0) {
            chatListContainer.innerHTML = `<div style="text-align:center; padding:15px; color:var(--text-muted); font-size:0.85rem;">No conversations yet</div>`;
            return;
        }

        chats.forEach(chat => {
            const item = document.createElement('div');
            item.className = `chat-item ${chat.id === activeChatId ? 'active' : ''}`;
            item.innerHTML = `
                <div class="chat-item-title">${chat.title || 'Conversation'}</div>
                <div style="display:flex; gap:6px;">
                    <button class="action-btn pin-btn">${chat.pinned ? '📌' : '📍'}</button>
                    <button class="action-btn delete-btn">🗑️</button>
                </div>
            `;

            item.querySelector('.chat-item-title').addEventListener('click', () => onSelectChat(chat.id));
            item.querySelector('.delete-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                await deleteChatSession(chat.id);
                renderSidebarChats(userId, activeChatId, onSelectChat);
            });
            item.querySelector('.pin-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                await togglePinChat(chat.id, chat.pinned);
                renderSidebarChats(userId, activeChatId, onSelectChat);
            });

            chatListContainer.appendChild(item);
        });
    } catch (err) {
        console.error("Failed to render sidebar chats:", err);
    }
};
