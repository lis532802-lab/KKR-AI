import { listenAuthState } from '../firebase/auth.js';
import { initTheme } from './theme.js';

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    listenAuthState((user) => {
        const path = window.location.pathname;
        if (!user && (path.includes('chat.html') || path.includes('profile.html') || path.includes('settings.html'))) {
            window.location.href = 'login.html';
        }
    });
});
