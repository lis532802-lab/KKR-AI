export const initTheme = () => {
    const savedTheme = localStorage.getItem('kkr_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
};

export const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('kkr_theme', next);
};
