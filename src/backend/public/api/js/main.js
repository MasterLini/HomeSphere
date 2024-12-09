        // Translations
const translations = {
    de: {
        search: {
            placeholder: "Dokumentation durchsuchen...",
            shortcut: "ESC zum Schließen",
            noResults: "Keine Ergebnisse gefunden"
        },
        sections: {
            gettingStarted: "🚀 Erste Schritte",
            authentication: "🔐 Authentifizierung",
            todos: "📝 ToDos",
            errors: "⚠️ Fehlerbehandlung"
        },
        content: {
            welcome: "Willkommen bei der HomeSphere API! Diese Dokumentation hilft dir dabei, schnell mit unserer API zu starten.",
            baseUrl: "Basis URL",
            baseUrlDesc: "Alle API-Anfragen beginnen mit der folgenden Basis-URL:",
            authRequired: "Für alle API-Anfragen ist ein API-Schlüssel erforderlich. Dieser sollte im Header mitgesendet werden.",
            apiKeyHeader: "API-Schlüssel Header",
            todosDesc: "Verwalte deine ToDos mit unserer umfangreichen ToDo-API.",
            listTodos: "Liste alle ToDos auf",
            createTodo: "Erstelle ein neues ToDo",
            updateTodo: "Aktualisiere ein bestehendes ToDo",
            deleteTodo: "Lösche ein ToDo",
            errorCodes: "Häufige Statuscodes",
            errorDesc: "Unsere API verwendet standardmäßige HTTP-Statuscodes für Responses.",
            status200: "200 - Erfolgreiche Anfrage",
            status201: "201 - Ressource erfolgreich erstellt",
            status400: "400 - Ungültige Anfrage",
            status401: "401 - Nicht autorisiert",
            status404: "404 - Nicht gefunden",
            status500: "500 - Serverfehler"
        },
        theme: {
            light: "Light Mode",
            dark: "Dark Mode"
        },
        toc: "Inhalt"
    },
    en: {
        search: {
            placeholder: "Search documentation...",
            shortcut: "ESC to close",
            noResults: "No results found"
        },
        sections: {
            gettingStarted: "🚀 Getting Started",
            authentication: "🔐 Authentication",
            todos: "📝 ToDos",
            errors: "⚠️ Error Handling"
        },
        content: {
            welcome: "Welcome to the HomeSphere API! This documentation will help you get started with our API quickly.",
            baseUrl: "Base URL",
            baseUrlDesc: "All API requests start with the following base URL:",
            authRequired: "All API requests require an API key. This should be sent in the header.",
            apiKeyHeader: "API Key Header",
            todosDesc: "Manage your ToDos with our comprehensive ToDo API.",
            listTodos: "List all ToDos",
            createTodo: "Create a new ToDo",
            updateTodo: "Update an existing ToDo",
            deleteTodo: "Delete a ToDo",
            errorCodes: "Common Status Codes",
            errorDesc: "Our API uses standard HTTP status codes for responses.",
            status200: "200 - Successful request",
            status201: "201 - Resource created successfully",
            status400: "400 - Invalid request",
            status401: "401 - Unauthorized",
            status404: "404 - Not found",
            status500: "500 - Server error"
        },
        theme: {
            light: "Light Mode",
            dark: "Dark Mode"
        },
        toc: "Contents"
    }
};

// Language toggle
function toggleLanguage() {
    const body = document.body;
    const langToggle = document.querySelector('.lang-toggle');
    const langText = langToggle.querySelector('.lang-text');
    const currentLang = body.getAttribute('data-lang');
    const newLang = currentLang === 'de' ? 'en' : 'de';
    
    body.setAttribute('data-lang', newLang);
    langText.textContent = newLang.toUpperCase();
    
    // Update all translatable content
    updateTranslations(newLang);
}

function updateTranslations(lang) {
    const t = translations[lang];
    
    // Update all translatable elements
    document.querySelectorAll('.translatable').forEach(element => {
        const key = element.getAttribute('data-key');
        if (key) {
            // Split the key by dots to access nested properties
            const value = key.split('.').reduce((obj, k) => obj[k], t);
            if (value) {
                if (element.tagName.toLowerCase() === 'input') {
                    element.placeholder = value;
                } else {
                    element.textContent = value;
                }
            }
        }
    });
    
    // Update search
    document.getElementById('searchInput').placeholder = t.search.placeholder;
    document.querySelector('.search-shortcut').textContent = t.search.shortcut;
    
    // Update theme toggle
    const themeText = document.querySelector('.theme-text');
    themeText.textContent = document.documentElement.getAttribute('data-theme') === 'dark' 
        ? t.theme.dark 
        : t.theme.light;
    
    // Update table of contents
    document.querySelector('.toc h4').textContent = t.toc;
    
    // Update section headings
    document.querySelector('#getting-started h2').textContent = t.sections.gettingStarted;
    document.querySelector('#authentication h2').textContent = t.sections.authentication;
    document.querySelector('#todos h2').textContent = t.sections.todos;
    document.querySelector('#errors h2').textContent = t.sections.errors;

    // Update welcome message and other content
    document.querySelector('#getting-started .lead').textContent = t.content.welcome;
    document.querySelector('#getting-started .card h3').textContent = t.content.baseUrl;
    document.querySelector('#getting-started .card p').textContent = t.content.baseUrlDesc;
    
    // Update authentication section
    document.querySelector('#authentication > p').textContent = t.content.authRequired;
    document.querySelector('#authentication .card h3').textContent = t.content.apiKeyHeader;
    
    // Update todos section
    document.querySelector('#todos > p').textContent = t.content.todosDesc;
    document.querySelectorAll('#todos .endpoint p').forEach((p, index) => {
        const keys = ['listTodos', 'createTodo', 'updateTodo', 'deleteTodo'];
        p.textContent = t.content[keys[index]];
    });
    
    // Update errors section
    document.querySelector('#errors > p').textContent = t.content.errorDesc;
    document.querySelector('#errors .card h3').textContent = t.content.errorCodes;
    
    // Update status codes
    const statusCodes = ['status200', 'status201', 'status400', 'status401', 'status404', 'status500'];
    document.querySelectorAll('#errors .card ul li').forEach((li, index) => {
        li.textContent = t.content[statusCodes[index]];
    });
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    const initialLang = document.body.getAttribute('data-lang') || 'de';
    document.body.setAttribute('data-lang', initialLang);
    updateTranslations(initialLang);
});

// Theme toggle with improved handling
function toggleTheme() {
    const html = document.documentElement;
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const themeText = themeToggle.querySelector('.theme-text');
    const currentLang = document.body.getAttribute('data-lang');
    const t = translations[currentLang];
    
    if (html.getAttribute('data-theme') === 'dark') {
        html.setAttribute('data-theme', 'light');
        themeIcon.textContent = '☀️';
        themeText.textContent = t.theme.light;
    } else {
        html.setAttribute('data-theme', 'dark');
        themeIcon.textContent = '🌙';
        themeText.textContent = t.theme.dark;
    }
}

// Search functionality
const searchOverlay = document.getElementById('searchOverlay');
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

// Search data structure - all searchable content
const searchableContent = [
    { title: 'Erste Schritte', section: 'getting-started', emoji: '🚀' },
    { title: 'Login', section: 'authentication', emoji: '🔐', type: 'POST', endpoint: '/auth/login' },
    { title: 'Registrierung', section: 'authentication', emoji: '🔐', type: 'POST', endpoint: '/auth/register' },
    { title: 'Alle ToDos abrufen', section: 'todos', emoji: '📝', type: 'GET', endpoint: '/todos' },
    { title: 'Neues ToDo erstellen', section: 'todos', emoji: '📝', type: 'POST', endpoint: '/todos' },
    { title: 'ToDo aktualisieren', section: 'todos', emoji: '📝', type: 'PUT', endpoint: '/todos/:id' },
    { title: 'ToDo löschen', section: 'todos', emoji: '📝', type: 'DELETE', endpoint: '/todos/:id' },
    { title: 'Fehlerbehandlung', section: 'errors', emoji: '⚠️' }
];

// Search function
function performSearch(query) {
    const results = searchableContent.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.endpoint && item.endpoint.toLowerCase().includes(query.toLowerCase())) ||
        (item.type && item.type.toLowerCase().includes(query.toLowerCase()))
    );

    searchResults.innerHTML = results.length ? results.map(item => `
        <a href="#${item.section}" class="search-result-item" onclick="closeSearch()">
            <span>${item.emoji}</span>
            <span>${item.title}</span>
            ${item.type ? `<span class="method-badge ${item.type.toLowerCase()}">${item.type}</span>` : ''}
            ${item.endpoint ? `<code class="endpoint">${item.endpoint}</code>` : ''}
        </a>
    `).join('') : '<div class="no-results">Keine Ergebnisse gefunden</div>';
}

// Open search with Ctrl+K
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
    }
    if (e.key === 'Escape') {
        closeSearch();
    }
});

function openSearch() {
    searchOverlay.classList.add('active');
    searchInput.focus();
}

function closeSearch() {
    searchOverlay.classList.remove('active');
    searchInput.value = '';
    searchResults.innerHTML = '';
}

// Live search as user types
searchInput.addEventListener('input', (e) => {
    performSearch(e.target.value);
});

// Close search when clicking outside
searchOverlay.addEventListener('click', (e) => {
    if (e.target === searchOverlay) {
        closeSearch();
    }
});

// Add smooth scrolling to all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Copy button functionality
document.querySelectorAll('pre').forEach((pre) => {
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.innerHTML = '📋 Kopieren';
    
    button.addEventListener('click', async () => {
        const code = pre.querySelector('code').textContent;
        try {
            await navigator.clipboard.writeText(code);
            button.innerHTML = '✅ Kopiert!';
            button.classList.add('copied');
            setTimeout(() => {
                button.innerHTML = '📋 Kopieren';
                button.classList.remove('copied');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    });
    
    pre.appendChild(button);
});

// Table of contents
const tocList = document.getElementById('tocList');
const sections = document.querySelectorAll('section[id]');

sections.forEach(section => {
    const li = document.createElement('li');
    li.className = 'toc-item';
    const link = document.createElement('a');
    link.href = `#${section.id}`;
    link.className = 'toc-link';
    const heading = section.querySelector('h2');
    link.innerHTML = heading.innerHTML;
    li.appendChild(link);
    tocList.appendChild(li);
});

// Active section tracking
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.toc-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${entry.target.id}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => observer.observe(section));

// Reading progress bar
function updateProgressBar() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

window.addEventListener('scroll', updateProgressBar);
updateProgressBar();
