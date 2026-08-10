// Lightweight Markdown Renderer & HTML Escaper
export const renderMarkdown = (text) => {
    if (!text) return '';
    let html = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

    // Code Blocks
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`;
    });

    // Inline Code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold & Italics
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Line breaks
    return html.replace(/\n/g, '<br>');
};

export const copyToClipboard = async (content) => {
    try {
        await navigator.clipboard.writeText(content);
        return true;
    } catch (err) {
        return false;
    }
};
