import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './DashboardPublico.css';
import './main.css';
import './fontawesome-all.min.css';

const DashboardPublico = () => {
    const navigate = useNavigate();
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const toggleMenu = (e) => {
        if (e) e.preventDefault();
        setIsMenuVisible(!isMenuVisible);
    };

    useEffect(() => {
        const pageWrapper = document.getElementById('dashboard-publico-page-wrapper');
        if (pageWrapper) {
            if (isMenuVisible) {
                pageWrapper.classList.add('is-menu-visible-layout');
            } else {
                pageWrapper.classList.remove('is-menu-visible-layout');
            }
        }
    }, [isMenuVisible]);

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        setIsMenuVisible(false);
        navigate('/');
    };

    const menuItems = [
        { to: '/citas', label: 'Citas' },
        { to: '/realizar-evaluacion', label: 'Realizar Evaluación' },
        { to: '/historial', label: 'Historial' },
        { to: '/perfil', label: 'Mi Perfil' },
        { type: 'button', label: 'Cerrar Sesión', action: handleLogout, className: 'button small fit logout-button-sidemenu' }
    ];

    const pageTitle = "E-PAARVAI";
    const pageSubtitle = "Innovación y Cuidado Visual al Alcance de Todos";
    const headerClassName = pageTitle ? 'header-solid' : 'alt';

    // URL del video de YouTube para incrustar, extraída de tu iframe.
    const youtubeEmbedUrl = "https://www.youtube.com/embed/KS1XIhUsA90?si=ZJoDDOguY1SS9MsZ";

    return (
        <div id="dashboard-publico-page-wrapper" className={`spectral-landing-background ${isMenuVisible ? 'is-menu-visible-layout' : ''}`}>
            {/* Header */}
            <header id="header" className={headerClassName}>
                <h1><Link to="/">E-PAARVAI</Link></h1>
                <nav id="nav">
                    <ul>
                        <li className="special">
                            <a href="#menu-dashboard" className="menuToggle" onClick={toggleMenu}>
                                <span>Menu</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </header>

            {/* Menu Desplegable */}
            <nav id="menu-dashboard">
                <a href="#menu-dashboard" className="close" onClick={toggleMenu}></a>
                <ul>
                    <li><Link to="/" onClick={() => setIsMenuVisible(false)}>Inicio</Link></li>
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            {item.type === 'button' ? (
                                <button
                                    className={item.className || "button small fit"}
                                    onClick={() => {
                                        if (item.action) item.action();
                                        setIsMenuVisible(false);
                                    }}
                                >
                                    {item.label}
                                </button>
                            ) : (
                                <Link to={item.to} onClick={() => setIsMenuVisible(false)}>{item.label}</Link>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Contenido Principal de la Página */}
            <article id="main">
                <header className="page-header-main">
                    <h2>{pageTitle}</h2>
                    {pageSubtitle && <p>{pageSubtitle}</p>}
                </header>
                <section className="wrapper style5">
                    <div className="inner">
                        <div className="dashboard-content">

                            {/* Sección de Bienvenida y Video */}
                            <section className="dashboard-section">
                                <header className="major">
                                    <h3>Bienvenido a E-PAARVAI</h3>
                                    <p>Somos una fuente confiable de innovación médica, donde la inteligencia artificial se une a la oftalmología para detectar cataratas de forma temprana, precisa y accesible. Con E-Paarvari, acercamos el futuro del diagnóstico visual a quienes más lo necesitan.</p>
                                </header>

                                {/* Video de YouTube Incrustado */}
                                <div className="video-placeholder-container">
                                    <h4>Descubre Más Sobre Nosotros</h4>
                                    <div className="video-responsive-wrapper">
                                        <iframe
                                            width="560"
                                            height="315"
                                            src={youtubeEmbedUrl} // URL actualizada
                                            title="YouTube video player" // Puedes cambiar este título
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen // 'allowfullscreen' es el atributo HTML correcto, React lo maneja bien
                                            referrerPolicy="strict-origin-when-cross-origin" // Añadido desde tu iframe
                                        ></iframe>
                                    </div>
                                </div>
                            </section>

                            <hr className="major" />

                            {/* Sección de Características */}
                            <section className="dashboard-section">
                                <header className="major">
                                    <h3>¿Cómo te Ayudamos?</h3>
                                </header>
                                <ul className="features">
                                    <li className="icon solid fa-eye">
                                        <h4>Detección Temprana</h4>
                                        <p>Utilizamos IA avanzada para identificar signos de cataratas en etapas iniciales, permitiendo un tratamiento oportuno.</p>
                                    </li>
                                    <li className="icon solid fa-brain">
                                        <h4>Precisión Diagnóstica</h4>
                                        <p>Nuestros algoritmos están entrenados con miles de imágenes para ofrecer resultados confiables y precisos.</p>
                                    </li>
                                    <li className="icon solid fa-mobile-alt">
                                        <h4>Acceso Simplificado</h4>
                                        <p>Realiza una pre-evaluación desde la comodidad de tu hogar o en centros asociados de forma rápida y sencilla.</p>
                                    </li>
                                    <li className="icon solid fa-history">
                                        <h4>Seguimiento Continuo</h4>
                                        <p>Guarda y consulta tu historial de evaluaciones para un mejor monitoreo de tu salud visual a lo largo del tiempo.</p>
                                    </li>
                                </ul>
                            </section>

                            <hr className="major" />

                            {/* Sección de Acciones Rápidas (Estilo Tarjetas) */}
                            <section className="dashboard-section">
                                <header className="major">
                                    <h3>Comienza Ahora</h3>
                                </header>
                                <div className="row gtr-uniform">
                                    <div className="col-4 col-6-medium col-12-xsmall">
                                        <div className="action-card">
                                            <span className="icon solid fa-calendar-check style1"></span>
                                            <h4>Agendar Cita</h4>
                                            <p>Encuentra un especialista y programa tu próxima revisión.</p>
                                            <Link to="/citas" className="button primary small fit">Ir a Citas</Link>
                                        </div>
                                    </div>
                                    <div className="col-4 col-6-medium col-12-xsmall">
                                        <div className="action-card">
                                            <span className="icon solid fa-camera-retro style2"></span>
                                            <h4>Realizar Evaluación</h4>
                                            <p>Sube tus imágenes y obtén una pre-evaluación rápida.</p>
                                            <Link to="/realizar-evaluacion" className="button primary small fit">Iniciar Evaluación</Link>
                                        </div>
                                    </div>
                                    <div className="col-4 col-12-medium col-12-xsmall">
                                        <div className="action-card">
                                            <span className="icon solid fa-user-circle style3"></span>
                                            <h4>Mi Perfil</h4>
                                            <p>Actualiza tu información personal y preferencias.</p>
                                            <Link to="/perfil" className="button primary small fit">Ver Perfil</Link>
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>
                    </div>
                </section>
            </article>

            {/* Footer */}
            <footer id="footer">
                <ul className="icons">
                    <li><a href="#" className="icon brands fa-twitter"><span className="label">Twitter</span></a></li>
                    <li><a href="#" className="icon brands fa-facebook-f"><span className="label">Facebook</span></a></li>
                    <li><a href="#" className="icon brands fa-instagram"><span className="label">Instagram</span></a></li>
                    <li><a href="#" className="icon solid fa-envelope"><span className="label">Email</span></a></li>
                </ul>
                <ul className="copyright">
                    <li>© E-PAARVAI {new Date().getFullYear()}</li><li>Diseño: <a href="http://html5up.net">HTML5 UP</a></li>
                </ul>
            </footer>
        </div>
    );
};

export default DashboardPublico;