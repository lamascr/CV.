// ============================================
// INICIALIZACIÓN Y CONFIGURACIÓN GLOBAL
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

function initializeApp() {
    // Inicializar todas las funcionalidades
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initDarkMode();
    initLanguageToggle();
    initParticleSystem();
    initContactForm();
    initTypingEffect();
    initProgressBars();
    initParallaxEffects();

    // Configurar el tema inicial
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    // Configurar idioma inicial
    const savedLanguage = localStorage.getItem('language') || 'es';
    setLanguage(savedLanguage);
}

// ============================================
// SISTEMA DE PARTÍCULAS
// ============================================
function initParticleSystem() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: 0, y: 0 };

    // Redimensionar canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Clase Partícula
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.color = getComputedStyle(document.documentElement)
                .getPropertyValue('--primary-500').trim() || '#0057B7';
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Rebotar en los bordes
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            // Mantener dentro de los límites
            this.x = Math.max(0, Math.min(canvas.width, this.x));
            this.y = Math.max(0, Math.min(canvas.height, this.y));
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color + Math.floor(this.opacity * 255).toString(16).padStart(2, '0');
            ctx.fill();
        }

        connect(other) {
            const dx = this.x - other.x;
            const dy = this.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(other.x, other.y);
                ctx.strokeStyle = this.color + '20';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }
    }

    // Crear partículas
    function createParticles() {
        const particleCount = Math.min(50, Math.floor(canvas.width * canvas.height / 10000));
        particles = [];

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // Animación
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dibujar y actualizar partículas
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // Dibujar conexiones
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                particles[i].connect(particles[j]);
            }
        }

        requestAnimationFrame(animate);
    }

    // Eventos
    window.addEventListener('resize', () => {
        resizeCanvas();
        createParticles();
    });

    canvas.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        // Interacción con el mouse
        particles.forEach(particle => {
            const dx = mouse.x - particle.x;
            const dy = mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx += (dx / distance) * force * 0.01;
                particle.vy += (dy / distance) * force * 0.01;
            }
        });
    });

    // Inicializar
    resizeCanvas();
    createParticles();
    animate();
}

// ============================================
// DARK MODE
// ============================================
function initDarkMode() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;

    themeToggle.addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Animar el toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.style.transform = 'scale(0.8)';
        setTimeout(() => {
            themeToggle.style.transform = 'scale(1)';
        }, 150);
    }

    // Actualizar favicon si existe
    updateFavicon(theme);
}

function updateFavicon(theme) {
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
        // Aquí podrías cambiar el favicon basado en el tema
        // favicon.href = theme === 'dark' ? 'favicon-dark.ico' : 'favicon-light.ico';
    }
}

// ============================================
// TOGGLE DE IDIOMAS
// ============================================
function initLanguageToggle() {
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            setLanguage(lang);
        });
    });
}

function setLanguage(lang) {
    localStorage.setItem('language', lang);

    // Actualizar botones
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    // Actualizar contenido
    updatePageContent(lang);

    // Animar el cambio
    const languageToggle = document.querySelector('.language-toggle');
    if (languageToggle) {
        languageToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            languageToggle.style.transform = 'scale(1)';
        }, 150);
    }
}

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

function getTranslations() {
    return {
        es: {
            // Navegación
            'nav-home': 'Inicio',
            'nav-about': 'Acerca',
            'nav-experience': 'Experiencia',
            'nav-education': 'Educación',
            'nav-skills': 'Habilidades',
            'nav-projects': 'Proyectos',
            'nav-contact': 'Contacto',

            // Hero Section
            'hero-greeting': 'Hola, soy',
            'hero-name': 'Carlos Lamas',
            'hero-title': 'Ingeniero Mecánico',
            'hero-subtitle': 'Especialista en CAD, Mantenimiento y Energía',
            'hero-description': 'Ingeniero Mecánico especializado en diseño CAD, análisis estructural y control de calidad. Experto en gestión de proyectos de energía renovable y mantenimiento para maximizar la fiabilidad de activos industriales.',
            'hero-cta-primary': 'Ver Mi Experiencia',
            'hero-cta-secondary': 'Descargar CV',

            // About
            'about-title': 'Acerca de Mí',
            'about-subtitle': 'Conoce más sobre mi trayectoria profesional',
            'about-intro-title': 'Ingeniero Mecánico Especialista en Calidad y Mantenimiento',
            'about-text-1': 'Como ingeniero mecánico especializado en diseño CAD, análisis estructural y control de calidad, me enfoco en maximizar la fiabilidad y seguridad de activos industriales mediante la ingeniería de mantenimiento y gestión operativa.',
            'about-text-2': 'He desarrollado mi carrera en sectores clave como la educación superior y la industria de válvulas, especializándome en la gestión de proyectos de energía renovable y sistemas mecánicos complejos bajo normas internacionales de calidad.',
            'about-stat-1-number': '2+',
            'about-stat-1-label': 'Años de Experiencia',
            'about-stat-2-number': '5+',
            'about-stat-2-label': 'Proyectos Completados',
            'about-stat-3-number': '3',
            'about-stat-3-label': 'Idiomas',
            'about-stat-4-number': '15+',
            'about-stat-4-label': 'Habilidades Técnicas',

            // Experience
            'experience-title': 'Experiencia Profesional',
            'experience-subtitle': 'Mi trayectoria profesional y logros',
            'experience-1-date': 'Marzo 2025 - Presente',
            'experience-1-title': 'Ingeniero de Calidad',
            'experience-1-company': 'Borja Valves',
            'experience-1-description': 'Gestión de operaciones diarias y supervisión de equipos. Control de inventarios, pedidos y reportes. Cumplimiento de protocolos de calidad/seguridad e implementación de sistemas ISO 9001.',
            'experience-2-date': 'Enero 2023 - Septiembre 2024',
            'experience-2-title': 'Profesor de Ingeniería',
            'experience-2-company': 'Universidad Oscar Lucero',
            'experience-2-description': 'Impartición de clases en tecnología energética y sistemas renovables. Diseño mecánico avanzado con herramientas CAD/FEA y gestión académica departamental.',

            // Education
            'education-title': 'Educación',
            'education-subtitle': 'Mi formación académica y certificaciones',
            'education-1-year': 'Jul 2025 - Presente',
            'education-1-degree': 'Máster Universitario en Ingeniería del Mantenimiento',
            'education-1-institution': 'Universidad Politécnica de Valencia (UPV)',
            'education-1-description': 'Competencias en gestión de fiabilidad (RAMS), mantenimiento predictivo y basado en condición, gestión económica y diseños de estrategias.',
            'education-2-year': 'Sep 2016 - Dic 2022',
            'education-2-degree': 'Ingeniero Mecánico',
            'education-2-institution': 'Universidad Oscar Lucero, Holguín, Cuba',
            'education-2-description': 'Formación integral en diseño mecánico (CAD), análisis estructural, termodinámica, mecánica de fluidos, control de calidad y manufactura.',

            // Skills
            'skills-title': 'Habilidades Técnicas',
            'skills-subtitle': 'Competencias y especialidades profesionales',
            'skills-1-title': 'Software CAD',
            'skills-1-skill-1': 'SolidWorks - Avanzado',
            'skills-1-skill-2': 'Autodesk Inventor - Avanzado',
            'skills-1-skill-3': 'AutoCAD - Intermedio',
            'skills-2-title': 'Análisis y Simulación',
            'skills-2-skill-1': 'Análisis Estructural',
            'skills-2-skill-2': 'Simulación y Modelado',
            'skills-2-skill-3': 'Análisis por Elementos Finitos (FEA)',
            'skills-3-title': 'Mantenimiento y Energía',
            'skills-3-skill-1': 'Mantenimiento Industrial',
            'skills-3-skill-2': 'Sistemas de Energía Renovable',
            'skills-3-skill-3': 'Termodinámica y Mecánica de Fluidos',
            'skills-4-title': 'Gestión y Control',
            'skills-4-skill-1': 'ISO 9001 y Calidad',
            'skills-4-skill-2': 'Control de Procesos',
            'skills-4-skill-3': 'Gestión Operativa',

            // Certifications
            'certs-title': 'Cursos y Certificaciones',
            'certs-subtitle': 'Formación complementaria y técnica',
            'cert-1-name': 'Mantenimiento de Centros de Procesos de Datos (CPD)',
            'cert-1-description': 'Infraestructura eléctrica (SAI/UPS), climatización de precisión, normativa F-Gas y protocolos de alta disponibilidad (Tiers).',

            // Contact
            'contact-title': 'Contacto',
            'contact-subtitle': '¿Tienes un proyecto en mente? Hablemos',
            'contact-name': 'Nombre',
            'contact-email': 'Correo Electrónico',
            'contact-subject': 'Asunto',
            'contact-message': 'Mensaje',
            'contact-send': 'Enviar Mensaje',
            'contact-info-1-title': 'Email',
            'contact-info-1-text': 'lamascpo@gmail.com',
            'contact-info-2-title': 'Ubicación',
            'contact-info-2-text': 'Dos de Mayo, 46920 Mislata (Valencia)',
            'contact-info-3-title': 'LinkedIn',
            'contact-info-3-text': 'Carlos Lamas',
            'contact-info-4-title': 'Teléfono',
            'contact-info-4-text': '+34 672 867 117',

            // Footer
            'footer-text': 'Gracias por visitar mi portafolio. Siempre estoy interesado en nuevas oportunidades y proyectos emocionantes.',
            'footer-copyright': '© 2025 Carlos Lamas. Todos los derechos reservados.'
        },
        en: {
            // Navigation
            'nav-home': 'Home',
            'nav-about': 'About',
            'nav-experience': 'Experience',
            'nav-education': 'Education',
            'nav-skills': 'Skills',
            'nav-projects': 'Projects',
            'nav-contact': 'Contact',

            // Hero Section
            'hero-greeting': 'Hello, I\'m',
            'hero-name': 'Carlos Lamas',
            'hero-title': 'Mechanical Engineer',
            'hero-subtitle': 'CAD, Maintenance & Energy Specialist',
            'hero-description': 'Mechanical Engineer specialized in CAD design, structural analysis, and quality control. Expert in renewable energy project management and maintenance to maximize industrial asset reliability.',
            'hero-cta-primary': 'View My Experience',
            'hero-cta-secondary': 'Download CV',

            // About
            'about-title': 'About Me',
            'about-subtitle': 'Learn more about my professional background',
            'about-intro-title': 'Mechanical Engineer Specialist in Quality and Maintenance',
            'about-text-1': 'As a mechanical engineer specializing in CAD design, structural analysis, and quality control, I focus on maximizing the reliability and safety of industrial assets through maintenance engineering and operational management.',
            'about-text-2': 'I have developed my career in key sectors such as higher education and the valve industry, specializing in the management of renewable energy projects and complex mechanical systems under international quality standards.',
            'about-stat-1-number': '5+',
            'about-stat-1-label': 'Years of Experience',
            'about-stat-2-number': '5+',
            'about-stat-2-label': 'Completed Projects',
            'about-stat-3-number': '3',
            'about-stat-3-label': 'Languages',
            'about-stat-4-number': '15+',
            'about-stat-4-label': 'Technical Skills',

            // Experience
            'experience-title': 'Professional Experience',
            'experience-subtitle': 'My professional career and achievements',
            'experience-1-date': 'March 2025 - Present',
            'experience-1-title': 'Quality Engineer',
            'experience-1-company': 'Borja Valves',
            'experience-1-description': 'Management of daily operations and team supervision. Inventory control, orders, and reports. Compliance with quality/safety protocols and implementation of ISO 9001 systems.',
            'experience-2-date': 'January 2023 - September 2024',
            'experience-2-title': 'Engineering Professor',
            'experience-2-company': 'Oscar Lucero University',
            'experience-2-description': 'Teaching classes in energy technology and renewable systems. Advanced mechanical design with CAD/FEA tools and departmental academic management.',

            // Education
            'education-title': 'Education',
            'education-subtitle': 'My academic training and certifications',
            'education-1-year': 'Jul 2025 - Present',
            'education-1-degree': 'Master\'s Degree in Maintenance Engineering',
            'education-1-institution': 'Polytechnic University of Valencia (UPV)',
            'education-1-description': 'Competencies in reliability management (RAMS), predictive and condition-based maintenance, economic management, and strategy design.',
            'education-2-year': 'Sep 2016 - Dec 2022',
            'education-2-degree': 'Mechanical Engineer',
            'education-2-institution': 'Oscar Lucero University, Holguín, Cuba',
            'education-2-description': 'Comprehensive training in mechanical design (CAD), structural analysis, thermodynamics, fluid mechanics, quality control, and manufacturing.',

            // Skills
            'skills-title': 'Technical Skills',
            'skills-subtitle': 'Competencies and professional specialties',
            'skills-1-title': 'CAD Software',
            'skills-1-skill-1': 'SolidWorks - Advanced',
            'skills-1-skill-2': 'Autodesk Inventor - Advanced',
            'skills-1-skill-3': 'AutoCAD - Intermediate',
            'skills-2-title': 'Analysis & Simulation',
            'skills-2-skill-1': 'Structural Analysis',
            'skills-2-skill-2': 'Simulation & Modeling',
            'skills-2-skill-3': 'Finite Element Analysis (FEA)',
            'skills-3-title': 'Maintenance & Energy',
            'skills-3-skill-1': 'Industrial Maintenance',
            'skills-3-skill-2': 'Renewable Energy Systems',
            'skills-3-skill-3': 'Thermodynamics & Fluid Mechanics',
            'skills-4-title': 'Management & Control',
            'skills-4-skill-1': 'ISO 9001 & Quality',
            'skills-4-skill-2': 'Process Control',
            'skills-4-skill-3': 'Operational Management',

            // Certifications
            'certs-title': 'Courses & Certifications',
            'certs-subtitle': 'Technical and complementary training',
            'cert-1-name': 'Data Center Maintenance (CPD)',
            'cert-1-description': 'Electrical infrastructure (UPS), precision cooling, F-Gas regulations, and high availability protocols (Tiers).',

            // Contact
            'contact-title': 'Contact',
            'contact-subtitle': 'Have a project in mind? Let\'s talk',
            'contact-name': 'Name',
            'contact-email': 'Email',
            'contact-subject': 'Subject',
            'contact-message': 'Message',
            'contact-send': 'Send Message',
            'contact-info-1-title': 'Email',
            'contact-info-1-text': 'lamascpo@gmail.com',
            'contact-info-2-title': 'Location',
            'contact-info-2-text': 'Dos de Mayo, 46920 Mislata (Valencia)',
            'contact-info-3-title': 'LinkedIn',
            'contact-info-3-text': 'Carlos Lamas',
            'contact-info-4-title': 'Phone',
            'contact-info-4-text': '+34 672 867 117',

            // Footer
            'footer-text': 'Thank you for visiting my portfolio. I am always interested in new opportunities and exciting projects.',
            'footer-copyright': '© 2025 Carlos Lamas. All rights reserved.'
        }
    };
}

// ============================================
// NAVEGACIÓN MÓVIL
// ============================================
function initMobileMenu() {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function () {
            navLinks.classList.toggle('active');

            // Animar el icono del menú
            const icon = this.querySelector('svg');
            if (navLinks.classList.contains('active')) {
                icon.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>';
            } else {
                icon.innerHTML = '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>';
            }
        });

        // Cerrar el menú al hacer clic en un enlace
        const navItems = navLinks.querySelectorAll('a');
        navItems.forEach(item => {
            item.addEventListener('click', function () {
                navLinks.classList.remove('active');
                const icon = mobileMenuToggle.querySelector('svg');
                icon.innerHTML = '<line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>';
            });
        });
    }
}

// ============================================
// SCROLL SUAVE
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navHeight = document.querySelector('.nav').offsetHeight;
                const targetPosition = targetElement.offsetTop - navHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// INTERSECTION OBSERVER PARA ANIMACIONES
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');

                // Animaciones específicas por tipo
                if (entry.target.classList.contains('skill-progress')) {
                    animateSkillBar(entry.target);
                }

                if (entry.target.classList.contains('stat-number')) {
                    animateCounter(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observar elementos animables
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));
}

function animateSkillBar(bar) {
    const level = bar.getAttribute('data-level') || 0;
    setTimeout(() => {
        bar.style.width = level + '%';
    }, 200);
}

function animateCounter(element) {
    const target = parseInt(element.textContent);
    const increment = target / 50;
    let current = 0;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + (element.textContent.includes('+') ? '+' : '');
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + (element.textContent.includes('+') ? '+' : '');
        }
    }, 30);
}

// ============================================
// EFECTO DE MÁQUINA DE ESCRIBIR
// ============================================
function initTypingEffect() {
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (!heroSubtitle) return;

    const texts = [
        '🔧 Ingeniero Mecánico multidisciplinar',
        '📐 Especialista en CAD y Simulación',
        '⚙️ Experto en Mantenimiento Industrial',
        '💡 Apasionado por la Innovación',
        '🌍 Profesional Internacional'
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        const currentText = texts[textIndex];

        if (isDeleting) {
            heroSubtitle.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            heroSubtitle.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 500;
        }

        setTimeout(typeEffect, typeSpeed);
    }

    typeEffect();
}

// ============================================
// BARRAS DE PROGRESO DE HABILIDADES
// ============================================
function initProgressBars() {
    const skillBars = document.querySelectorAll('.skill-progress');

    skillBars.forEach(bar => {
        const level = Math.floor(Math.random() * 30) + 70; // 70-100%
        bar.setAttribute('data-level', level);
    });
}

// ============================================
// EFECTOS DE PARALAJE
// ============================================
function initParallaxEffects() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-element');

        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// ============================================
// FORMULARIO DE CONTACTO
// ============================================
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Obtener datos del formulario
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        // Simular envío
        showFormStatus('success', '¡Mensaje enviado correctamente!');
        this.reset();
    });
}

function showFormStatus(type, message) {
    // Crear elemento de estado
    const statusElement = document.createElement('div');
    statusElement.className = `form-status form-status-${type}`;
    statusElement.textContent = message;

    // Estilos inline para el estado
    statusElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        background: ${type === 'success' ? '#28A745' : '#DC3545'};
    `;

    document.body.appendChild(statusElement);

    // Remover después de 3 segundos
    setTimeout(() => {
        statusElement.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            document.body.removeChild(statusElement);
        }, 300);
    }, 3000);
}

// ============================================
// UTILIDADES ADICIONALES
// ============================================

// Detectar tipo de dispositivo
function isMobile() {
    return window.innerWidth <= 768;
}

// Lazy loading para imágenes
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Preloader
function initPreloader() {
    const preloader = document.querySelector('.preloader');
    if (!preloader) return;

    window.addEventListener('load', () => {
        preloader.style.opacity = '0';
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    });
}

// Contador de visitas (localStorage)
function initVisitCounter() {
    const visits = localStorage.getItem('visits') || 0;
    const newVisits = parseInt(visits) + 1;
    localStorage.setItem('visits', newVisits);

    console.log(`Visit number: ${newVisits}`);
}

// Manejo de errores
window.addEventListener('error', (e) => {
    console.error('JavaScript Error:', e.error);
});

// Performance monitoring
window.addEventListener('load', () => {
    const loadTime = performance.now();
    console.log(`Page loaded in ${Math.round(loadTime)}ms`);
});

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + D = Toggle Dark Mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
    }

    // Ctrl/Cmd + L = Toggle Language
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        const currentLang = localStorage.getItem('language') || 'es';
        const newLang = currentLang === 'es' ? 'en' : 'es';
        setLanguage(newLang);
    }

    // Escape = Close mobile menu
    if (e.key === 'Escape') {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }
    }
});

// ============================================
// INICIALIZACIÓN FINAL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar lazy loading
    initLazyLoading();

    // Inicializar preloader
    initPreloader();

    // Inicializar contador de visitas
    initVisitCounter();

    // Añadir clase de loaded al body
    document.body.classList.add('loaded');
});

// CSS adicional para animaciones
const additionalStyles = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .loaded .animate-on-scroll {
        opacity: 1;
        transform: translateY(0);
    }
`;

// Añadir estilos dinámicamente
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);