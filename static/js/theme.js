/* ----------------------------------------------------
   DELHI DARSHAN - THEME TOGGLE ENGINE (DARK GLOW / PASTEL LIGHT)
   ---------------------------------------------------- */

let currentTheme = localStorage.getItem('delhi_theme') || 'dark';

function applyTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('delhi_theme', theme);

    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');

    if (theme === 'light') {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        if (themeIcon) {
            themeIcon.className = 'fa-solid fa-sun';
            themeIcon.style.color = '#f59e0b';
        }
    } else {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        if (themeIcon) {
            themeIcon.className = 'fa-solid fa-moon';
            themeIcon.style.color = '#a5b4fc';
        }
    }
}

function toggleTheme() {
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
}

document.addEventListener('DOMContentLoaded', () => {
    applyTheme(currentTheme);
});
