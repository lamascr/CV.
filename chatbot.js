import { createChat } from 'https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.es.js';

/**
 * Configuración del Chatbot de Carlos Lamas
 * Estilo Burbuja Flotante (Desplegable)
 */
function updatePageContent(lang) {
    const translations = getTranslations();
    const elements = document.querySelectorAll('[data-translate]');

    elements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    // Retraso de 5 segundos para no ser intrusivo
    setTimeout(() => {
        const target = document.querySelector('#n8n-chat');
        if (!target) return;


        createChat({
            webhookUrl: 'https://production-n8n.fly.dev/webhook/18da2a38-8add-4d1e-99b8-6bd2c6f31d6c/chat',
            webhookConfig: {
                method: 'POST',
                headers: {}
            },
            target: '#n8n-chat',
            mode: 'bubble', // Burbuja flotante desplegable
            chatInputKey: 'chatInput',
            chatSessionKey: 'sessionId',
            loadPreviousSession: true,
            metadata: {
                source: 'web',
                channel: 'portfolio-carlos-lamas'
            },
            showWelcomeScreen: false,
            defaultLanguage: 'en',
            initialMessages: [
                'Hello! 👋 I am Carlos Lamas virtual assistant.',
                'How can I help you today? We can speak in your native language or in English if you prefer.'
            ],
            i18n: {
                es: {
                    title: 'Asistente Virtual 👋 ',
                    subtitle: "Ingeniero Carlos Lamas",
                    footer: '',
                    getStarted: 'Nueva conversación',
                    inputPlaceholder: 'Escribe tu mensaje aquí...',
                },
                en: {
                    title: 'Virtual Assistant 👋',
                    subtitle: "Engineer Carlos Lamas",
                    footer: '',
                    getStarted: 'New conversation',
                    inputPlaceholder: 'Write your message here...',
                },
            },
            enableStreaming: false,
        });
    }, 5000); // 5 segundos
});