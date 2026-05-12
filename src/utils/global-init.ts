function initGlobalFeatures(): void {
    document.addEventListener('DOMContentLoaded', () => {
        initializeTheme();
        initializeAnalytics();
        initializeKeyboardShortcuts();
    });

    document.addEventListener('astro:page-load', () => {
        initializeTheme();
        initializeAnalytics();
        initializeKeyboardShortcuts();
    });
}

function initializeTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
}

function initializeAnalytics(): void {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('js', new Date());
        window.gtag('config', import.meta.env.GOOGLE_ANALYTICS_ID || '');
    }
}

function initializeKeyboardShortcuts(): void {
    const shortcuts = [
        { key: 'Escape', handler: () => closeModals() },
        { key: '?', handler: () => showKeyboardHelp() },
    ];

    document.addEventListener('keydown', (e) => {
        const shortcut = shortcuts.find(s => s.key === e.key);
        if (shortcut) {
            e.preventDefault();
            shortcut.handler();
        }
    });
}

function closeModals(): void {
    document.querySelectorAll('[role="dialog"]').forEach(dialog => {
        dialog.removeAttribute('open');
    });
}

function showKeyboardHelp(): void {
    console.log('Keyboard shortcuts help');
}

export function setupGlobalInit(): void {
    if (typeof document === 'undefined') return;

    const init = () => {
        initGlobalFeatures();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }

    document.addEventListener('astro:page-load', init);
}