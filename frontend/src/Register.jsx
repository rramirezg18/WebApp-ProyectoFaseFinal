import React, { useState, useEffect } from 'react'; // Importar React
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css'; // Necesitarás este archivo CSS

// Asegúrate de que los CSS globales de Spectral (main.css, fontawesome-all.min.css)
// y la clase .spectral-landing-background (para el fondo "nublado")
// estén siendo importados en tu App.js o index.js.

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('publico'); // Valor por defecto
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // --- Lógica del Menú Lateral ---
    const [isMenuVisible, setIsMenuVisible] = useState(false);

    const toggleMenu = (e) => {
        if (e) e.preventDefault();
        setIsMenuVisible(!isMenuVisible);
    };

    useEffect(() => {
        // Este efecto es para la clase del menú en el page-wrapper
        const pageWrapper = document.getElementById('register-page-wrapper'); // ID único para esta página
        if (pageWrapper) {
            if (isMenuVisible) {
                pageWrapper.classList.add('is-menu-visible-layout');
            } else {
                pageWrapper.classList.remove('is-menu-visible-layout');
            }
        }
    }, [isMenuVisible]);

    // Items del menú para la página de registro
    const menuItems = [
        { to: '/', label: 'Inicio' }, // Enlace a la página principal (o tu página de login si es diferente)
        { to: '/login', label: 'Iniciar Sesión' } // Enlace a la página de login
    ];
    
    const pageTitle = "Crear Nueva Cuenta";
    const pageSubtitle = "Únete a la comunidad E-PAARVARI";
    const headerClassName = 'header-solid'; // Header sólido para páginas internas
    // --- Fin de Lógica del Menú Lateral ---


    // Limpiar campos al salir (tu lógica original)
    useEffect(() => {
        return () => {
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setError('');
        };
    }, []); // El array de dependencias vacío significa que se ejecuta solo al montar y desmontar.

    const validatePassword = (pass) => {
        const hasNumber = /\d/.test(pass);
        const hasUpper = /[A-Z]/.test(pass);
        return pass.length >= 6 && hasNumber && hasUpper;
    };

    // handleSubmit original proporcionado por ti
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(''); // Limpiar errores previos

        try {
            if (!email.includes('@') || !email.trim()) {
                throw new Error('Correo electrónico inválido');
            }

            if (!validatePassword(password)) {
                throw new Error('La contraseña debe tener mínimo 6 caracteres, al menos 1 número y 1 mayúscula');
            }

            if (password !== confirmPassword) {
                throw new Error('Las contraseñas no coinciden');
            }

            // Llamada a tu API de registro
            await axios.post('http://localhost:5000/api/register', {
                email,
                password,
                role
            });

            alert('¡Registro exitoso! Redirigiendo...');
            navigate('/'); // Redirigir a la página de login (o a donde corresponda)

        } catch (err) {
            // Tu manejo de errores original
            setError(err.message || 'Error al registrarse');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div id="register-page-wrapper" className={`spectral-landing-background ${isMenuVisible ? 'is-menu-visible-layout' : ''}`}>
            {/* Header */}
            <header id="header" className={headerClassName}>
                <h1><Link to="/">E-PAARVARI</Link></h1>
                <nav id="nav">
                    <ul>
                        <li className="special">
                            <a href="#menu-register" className="menuToggle" onClick={toggleMenu}>
                                <span>Menu</span>
                            </a>
                        </li>
                    </ul>
                </nav>
            </header>

            {/* Menu Desplegable */}
            <nav id="menu-register"> {/* ID único para el menú de esta página */}
                <a href="#menu-register" className="close" onClick={toggleMenu}></a>
                <ul>
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            {/* No hay botón de logout aquí, ya que es una página de registro */}
                            <Link to={item.to} onClick={() => setIsMenuVisible(false)}>{item.label}</Link>
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
                <section className="wrapper style5"> {/* style5 para contenido en fondo blanco */}
                    <div className="inner">
                        {/* Contenedor del formulario de registro, similar al de Login */}
                        <div className="form-wrapper-general"> {/* Clase para centrar y estilizar el contenedor del form */}
                            
                            <form className="user-form" onSubmit={handleSubmit}> {/* Clase para el formulario en sí */}
                                <div className="row gtr-uniform"> {/* Usar la rejilla de Spectral */}
                                    
                                    {/* Email */}
                                    <div className="col-12"> {/* Ocupa toda la fila */}
                                        <label htmlFor="reg-email">Correo electrónico*</label>
                                        <input
                                            type="email"
                                            id="reg-email"
                                            name="email" 
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="tu@correo.com"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="col-12">
                                        <label htmlFor="reg-password">Contraseña*</label>
                                        <input
                                            type="password"
                                            id="reg-password"
                                            name="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Mínimo 6 caracteres, 1 número, 1 mayúscula"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="col-12">
                                        <label htmlFor="reg-confirm-password">Confirmar Contraseña*</label>
                                        <input
                                            type="password"
                                            id="reg-confirm-password"
                                            name="confirmPassword"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repite tu contraseña"
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* Role */}
                                    <div className="col-12">
                                        <label htmlFor="reg-role">Registrarse como:</label>
                                        <select
                                            id="reg-role"
                                            name="role"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            disabled={isSubmitting}
                                        >
                                            <option value="publico">Público General</option>
                                            <option value="profesional">Profesional de la Salud</option>
                                        </select>
                                    </div>

                                    {/* Mensaje de Error */}
                                    {error && (
                                        <div className="col-12">
                                            <p role="alert" className="error-message-form">
                                                {error}
                                            </p>
                                        </div>
                                    )}

                                    {/* Botón de Submit */}
                                    <div className="col-12">
                                        <ul className="actions special" style={{ marginTop: '1.5em' }}>
                                            <li>
                                                <button
                                                    type="submit"
                                                    className="button primary fit large" // Clases de Spectral
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? 'Registrando...' : 'Crear Cuenta'}
                                                </button>
                                            </li>
                                        </ul>
                                    </div>

                                    {/* Enlace a Login */}
                                    <div className="col-12" style={{ textAlign: 'center', marginTop: '1em' }}>
                                        <p>
                                            ¿Ya tienes una cuenta? <Link to="/">Inicia Sesión Aquí</Link>
                                        </p>
                                    </div>
                                </div>
                            </form>
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
                    <li>© E-PAARVARI {new Date().getFullYear()}</li><li>Diseño: <a href="http://html5up.net">HTML5 UP</a></li>
                </ul>
            </footer>
        </div>
    );
};

export default Register;