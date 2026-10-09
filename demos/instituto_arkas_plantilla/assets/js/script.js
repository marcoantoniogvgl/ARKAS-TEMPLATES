// ==========================================================================
// FUNCIONALIDADES PRINCIPALES
// ==========================================================================

const menuToggle = document.querySelector('.mobile-menu-toggle');
const mainNav = document.querySelector('.main-nav');
const logoNavContainer = document.querySelector('.logo-nav-container');

if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
        const isOpen = mainNav.classList.toggle('is-open');
        if (logoNavContainer) {
            logoNavContainer.classList.toggle('is-open', isOpen);
        }
        this.classList.toggle('is-open', isOpen);
        this.setAttribute('aria-expanded', String(isOpen));
    });
}

if (window.innerWidth <= 768) {
    document.querySelectorAll('.dropdown > a').forEach(function (link) {
        link.addEventListener('click', function (event) {
            const parent = this.parentElement;
            const menu = this.nextElementSibling;

            if (menu && menu.classList.contains('dropdown-menu')) {
                event.preventDefault();
                const shouldOpen = !parent.classList.contains('open');

                document.querySelectorAll('.dropdown').forEach(function (item) {
                    item.classList.remove('open');
                });

                if (shouldOpen) {
                    parent.classList.add('open');
                }
            }
        });
    });

    document.addEventListener('click', function (event) {
        if (!event.target.closest('.mobile-menu-toggle') && !event.target.closest('.main-nav')) {
            mainNav.classList.remove('is-open');
            if (logoNavContainer) {
                logoNavContainer.classList.remove('is-open');
            }
            menuToggle.classList.remove('is-open');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// Modal de login para el aula virtual
const modalLogin = document.getElementById("loginModal");
const abrirModalLogin = document.getElementById("openLoginModal");
const cerrarModalLogin = document.getElementById("closeLoginModal");

// Abrir modal de login
if (abrirModalLogin) {
    abrirModalLogin.addEventListener("click", function () {
        modalLogin.style.display = "flex";
        document.body.style.overflow = "hidden";
    });
}

// Cerrar modal de login
if (cerrarModalLogin) {
    cerrarModalLogin.addEventListener("click", function () {
        modalLogin.style.display = "none";
        document.body.style.overflow = "auto";
    });
}

// Cerrar modal al hacer clic fuera
if (modalLogin) {
    window.addEventListener("click", function (evento) {
        if (evento.target === modalLogin) {
            modalLogin.style.display = "none";
            document.body.style.overflow = "auto";
        }
    });
}

// Manejo del formulario de login
const formularioLogin = document.getElementById("login-form");
if (formularioLogin) {
    formularioLogin.addEventListener("submit", function (e) {
        e.preventDefault();
        
        alert("Este apartado nos conectaria con la base de datos y nos redirigiria al aula virtual.");
        modalLogin.style.display = "none";
        document.body.style.overflow = "auto";
        
        // Limpiar formulario
        this.reset();
    });
}

// Manejo del formulario de contacto
const formularioContacto = document.getElementById("contact-form");
if (formularioContacto) {
    formularioContacto.addEventListener("submit", function (e) {
        e.preventDefault();
        
        alert("Este apartado nos conectaria con la base de datos y enviaria el mensaje de contacto.");
        
        // Limpiar formulario
        this.reset();
    });
}
// Animación para timeline
function animateTimeline() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    timelineItems.forEach(item => {
        item.style.animationPlayState = 'paused';
        observer.observe(item);
    });
}

// Inicializar animaciones cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.hash === '#historia' || 
        document.getElementById('historia').getBoundingClientRect().top < window.innerHeight) {
        animateTimeline();
    }
    
    // Reanimar al hacer scroll
    window.addEventListener('scroll', function() {
        const historiaSection = document.getElementById('historia');
        const rect = historiaSection.getBoundingClientRect();
        
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            animateTimeline();
        }
    });
});
// ==========================================================================
// SCROLL SUAVE PARA ENLACES INTERNOS
// ==========================================================================
document.querySelectorAll('a[href^="#"]').forEach((enlace) => {
    enlace.addEventListener("click", function (e) {
        e.preventDefault();

        const idObjetivo = this.getAttribute("href");
        
        // Si es un enlace vacío, no hacer nada
        if (idObjetivo === "#") return;

        const elementoObjetivo = document.querySelector(idObjetivo);
        
        // Si el elemento objetivo existe, hacer scroll suave
        if (elementoObjetivo) {
            const alturaEncabezado = document.querySelector('.encabezado').offsetHeight;
            const posicionObjetivo = elementoObjetivo.offsetTop - alturaEncabezado - 20;
            
            window.scrollTo({
                top: posicionObjetivo,
                behavior: "smooth",
            });
        }
    });
});

// ==========================================================================
// EFECTOS ADICIONALES PARA MEJORAR LA EXPERIENCIA
// ==========================================================================

// Efecto de aparición suave para las secciones al hacer scroll
const opcionesObservador = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observador = new IntersectionObserver((entradas) => {
    entradas.forEach(entrada => {
        if (entrada.isIntersecting) {
            entrada.target.style.opacity = 1;
            entrada.target.style.transform = 'translateY(0)';
        }
    });
}, opcionesObservador);

// Aplicar efecto a las secciones principales
document.addEventListener('DOMContentLoaded', function() {
    const secciones = document.querySelectorAll('.seccion');
    
    secciones.forEach(seccion => {
        seccion.style.opacity = 0;
        seccion.style.transform = 'translateY(20px)';
        seccion.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observador.observe(seccion);
    });
});

// ==========================================================================
// MEJORAS PARA EL MENÚ DESPLEGABLE - CORREGIDO
// ==========================================================================

// Cerrar menús desplegables al hacer clic fuera - CORREGIDO
document.addEventListener('click', function(e) {
    const desplegables = document.querySelectorAll('.desplegable');
    
    desplegables.forEach(desplegable => {
        // Solo cerrar si el clic NO fue dentro del desplegable
        if (!desplegable.contains(e.target)) {
            const menuDesplegable = desplegable.querySelector('.menu-desplegable');
            if (menuDesplegable) {
                menuDesplegable.style.display = 'none';
            }
        }
    });
});

// Mostrar menús desplegables al hacer hover (solo en escritorio)
document.querySelectorAll('.desplegable').forEach(desplegable => {
    desplegable.addEventListener('mouseenter', function() {
        if (window.innerWidth > 768) {
            const menuDesplegable = this.querySelector('.menu-desplegable');
            if (menuDesplegable) {
                menuDesplegable.style.display = 'block';
            }
        }
    });
    
    desplegable.addEventListener('mouseleave', function() {
        if (window.innerWidth > 768) {
            const menuDesplegable = this.querySelector('.menu-desplegable');
            if (menuDesplegable) {
                // Pequeño retraso para evitar parpadeo
                setTimeout(() => {
                    if (!menuDesplegable.matches(':hover')) {
                        menuDesplegable.style.display = 'none';
                    }
                }, 100);
            }
        }
    });
});

// También cerrar el menú cuando el mouse sale del menú desplegable
document.querySelectorAll('.menu-desplegable').forEach(menu => {
    menu.addEventListener('mouseleave', function() {
        if (window.innerWidth > 768) {
            this.style.display = 'none';
        }
    });
});

// Alternar menús desplegables en móviles - CORREGIDO
document.querySelectorAll('.desplegable > a').forEach(enlaceDesplegable => {
    enlaceDesplegable.addEventListener('click', function (e) {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            const menuDesplegable = this.nextElementSibling;
            
            if (menuDesplegable && menuDesplegable.classList.contains('menu-desplegable')) {
                // Cerrar otros menús desplegables abiertos
                document.querySelectorAll('.menu-desplegable').forEach(menu => {
                    if (menu !== menuDesplegable) {
                        menu.style.display = 'none';
                    }
                });
                
                // Alternar el menú actual
                const estaVisible = menuDesplegable.style.display === 'block';
                menuDesplegable.style.display = estaVisible ? 'none' : 'block';
            }
        }
    });
});

// Efecto de scroll en encabezado
window.addEventListener('scroll', function() {
    const encabezado = document.querySelector('.encabezado');
    if (encabezado) {
        if (window.scrollY > 100) {
            encabezado.style.background = 'rgba(255, 255, 255, 0.95)';
            encabezado.style.backdropFilter = 'blur(10px)';
        } else {
            encabezado.style.background = 'var(--color-blanco)';
            encabezado.style.backdropFilter = 'none';
        }
    }
});

// ==========================================================================
// ANIMACIONES PARA EL CÍRCULO DEL LOGO
// ==========================================================================
document.addEventListener('DOMContentLoaded', function() {
    const circuloLogo = document.querySelector('.circulo-logo');
    
    // Efecto hover en el círculo del logo
    if (circuloLogo) {
        circuloLogo.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 6px 25px rgba(212, 175, 55, 0.3)';
        });
        
        circuloLogo.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
        });
    }
});

// ==========================================================================
// FUNCIONALIDADES PARA PÁGINAS ESPECÍFICAS
// ==========================================================================

// Funcionalidad para pestañas en Orientación
function inicializarPestanas() {
    const botonesPestana = document.querySelectorAll('.boton-pestana');
    const contenidosPestana = document.querySelectorAll('.contenido-pestana');
    
    if (botonesPestana.length > 0) {
        botonesPestana.forEach(boton => {
            boton.addEventListener('click', function() {
                const pestanaObjetivo = this.getAttribute('data-tab');
                
                // Remover clase activo de todos los botones y paneles
                botonesPestana.forEach(btn => btn.classList.remove('activo'));
                contenidosPestana.forEach(contenido => contenido.classList.remove('activo'));
                
                // Agregar clase activo al botón clickeado y panel correspondiente
                this.classList.add('activo');
                const contenidoObjetivo = document.getElementById(pestanaObjetivo);
                if (contenidoObjetivo) {
                    contenidoObjetivo.classList.add('activo');
                }
            });
        });
    }
}

// Manejo del formulario de cita de orientación
const formularioCitaOrientacion = document.getElementById('cita-orientacion-form');
if (formularioCitaOrientacion) {
    formularioCitaOrientacion.addEventListener('submit', function(e) {
        e.preventDefault();
        
        alert('Cita solicitada correctamente. Nos pondremos en contacto contigo para confirmar la fecha y hora.');
        
        // Limpiar formulario
        this.reset();
    });
}

// Botón de mapa interactivo
const botonesMapa = document.querySelectorAll('.boton-mapa');
if (botonesMapa) {
    botonesMapa.forEach(boton => {
        boton.addEventListener('click', function() {
            alert('En una implementación real, esto abriría Google Maps con la ubicación exacta del instituto.');
        });
    });
}

// Inicializar todas las funcionalidades cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    inicializarPestanas();
    
    // Aplicar efecto de aparición a los nuevos elementos
    const nuevosElementos = document.querySelectorAll('.contenido-educativo, .contenido-administracion, .contenido-orientacion, .contenido-historia, .contenido-ubicacion, .intro-aulas, .intro-instalaciones');
    
    nuevosElementos.forEach(elemento => {
        elemento.style.opacity = '0';
        elemento.style.transform = 'translateY(20px)';
        elemento.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    // Observador para los nuevos elementos
    const nuevoObservador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (entrada.isIntersecting) {
                entrada.target.style.opacity = '1';
                entrada.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    nuevosElementos.forEach(elemento => {
        nuevoObservador.observe(elemento);
    });
});

// ==========================================================================
// MEJORAS DE USABILIDAD
// ==========================================================================

// Prevenir envío de formularios con Enter accidental
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
        const formulario = e.target.closest('form');
        if (formulario && !formulario.classList.contains('permitir-enter')) {
            e.preventDefault();
        }
    }
});

// Mejorar accesibilidad de los desplegables
document.querySelectorAll('.desplegable > a').forEach(enlaceDesplegable => {
    enlaceDesplegable.setAttribute('aria-haspopup', 'true');
    enlaceDesplegable.setAttribute('aria-expanded', 'false');
    
    enlaceDesplegable.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            const estaExpandido = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !estaExpandido);
        }
    });
});

// Estados de carga para botones
document.querySelectorAll('form').forEach(formulario => {
    formulario.addEventListener('submit', function() {
        const botonEnviar = this.querySelector('button[type="submit"]');
        if (botonEnviar) {
            botonEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            botonEnviar.disabled = true;
            
            // Simular envío (en realidad se resetea en el alert)
            setTimeout(() => {
                botonEnviar.innerHTML = 'Enviar';
                botonEnviar.disabled = false;
            }, 2000);
        }
    });
});

// ==========================================================================
// CORRECCIÓN ESPECÍFICA PARA EL MENÚ DESPLEGABLE
// ==========================================================================

// Asegurar que los menús desplegables funcionen correctamente en todos los dispositivos
function corregirMenuDesplegable() {
    const desplegables = document.querySelectorAll('.desplegable');
    
    desplegables.forEach(desplegable => {
        const enlace = desplegable.querySelector('a');
        const menu = desplegable.querySelector('.menu-desplegable');
        
        if (enlace && menu) {
            // Para escritorio: hover
            desplegable.addEventListener('mouseenter', function() {
                if (window.innerWidth > 768) {
                    menu.style.display = 'block';
                }
            });
            
            desplegable.addEventListener('mouseleave', function() {
                if (window.innerWidth > 768) {
                    setTimeout(() => {
                        if (!menu.matches(':hover') && !desplegable.matches(':hover')) {
                            menu.style.display = 'none';
                        }
                    }, 100);
                }
            });
            
            // Para móviles: click
            enlace.addEventListener('click', function(e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const menusAbiertos = document.querySelectorAll('.menu-desplegable[style="display: block"]');
                    
                    // Cerrar otros menús
                    menusAbiertos.forEach(menuAbierto => {
                        if (menuAbierto !== menu) {
                            menuAbierto.style.display = 'none';
                        }
                    });
                    
                    // Alternar este menú
                    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                }
            });
        }
    });
}

// Inicializar la corrección del menú cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', corregirMenuDesplegable);

// También corregir cuando la ventana cambie de tamaño
window.addEventListener('resize', function() {
    // En móviles, cerrar todos los menús desplegables al cambiar a escritorio
    if (window.innerWidth > 768) {
        document.querySelectorAll('.menu-desplegable').forEach(menu => {
            menu.style.display = 'none';
        });
    }
});