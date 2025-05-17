import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css'; // Your custom CSS for login page
import './main.css'; // Assuming this file exists in your project structure
import './fontawesome-all.min.css'; // Assuming this file exists

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState(''); // Initialize role as empty to show placeholder
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Cleanup function to reset state when the component unmounts or before re-render if dependencies change
        return () => {
            setEmail('');
            setPassword('');
            setRole('');
            setError('');
            // setIsSubmitting(false); // Generally not needed to reset isSubmitting on unmount
        };
    }, []); // Empty dependency array means this effect runs once on mount and cleanup on unmount

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(''); // Clear previous errors

        // Frontend validation
        if (!email || !password || !role) {
            setError('Por favor, completa todos los campos, incluyendo el rol.');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                email,
                password,
                role
            });

            // Save token and role in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userRole', response.data.role);
            
            // Navigate to the role-specific dashboard
            navigate(`/dashboard-${response.data.role}`);

        } catch (err) {
            if (err.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                if (err.response.status === 401) {
                    setError('Credenciales inválidas. Por favor, verifica tu email, contraseña y rol.');
                } else {
                    // Other server errors (e.g., 400, 403, 500)
                    setError(err.response.data.error || 'Error del servidor. Intenta más tarde.');
                }
            } else if (err.request) {
                // The request was made but no response was received
                setError('No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde.');
            } else {
                // Something happened in setting up the request that triggered an Error
                setError('Ocurrió un error inesperado al preparar la solicitud. Intenta de nuevo.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Image URL for the informational side of the login page
    const sideImageUrl = "https://plus.unsplash.com/premium_photo-1664303515404-1e5a366eb188?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

    return (
        // This div will have the Spectral landing page style background
        <div id="page-wrapper" className="login-page-container spectral-landing-background">
            {/* Optional Spectral Header */}
            {/* <header id="header" className="alt"> ... </header> */}

            {/* The wrapper no longer needs style2, background is handled by parent container */}
            <section className="wrapper">
                <div className="inner">
                    <div className="row gtr-100 align-items-center"> {/* gtr-100 for more space */}

                        {/* Left Column: Image and Text */}
                        <div className="col-6 col-12-medium login-info-column">
                            <div className="login-info-content">
                                <span className="image main">
                                    <img 
                                        src={sideImageUrl} 
                                        alt="Información Adicional" 
                                        onError={(e) => { 
                                            e.target.onerror = null; 
                                            e.target.src='https://placehold.co/600x400/cccccc/969696?text=Error+Al+Cargar+Imagen'; 
                                        }} 
                                    />
                                </span>
                                <h3 style={{ marginTop: '1.5em' }}>e-Paarvai</h3>
                                <p>
                                    Somos una fuente confiable de innovación médica, donde la inteligencia artificial se une a la oftalmología para detectar cataratas de forma temprana, precisa y accesible. Con E-Paarvari, acercamos el futuro del diagnóstico visual a quienes más lo necesitan.
                                </p>
                                <p>
                                    Si eres nuevo aquí, <Link to="/registro">crea tu cuenta</Link> en pocos pasos.
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Login Form */}
                        <div className="col-6 col-12-medium login-form-column">
                            <div className="login-form-wrapper">
                                <h2>Iniciar Sesión</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="row gtr-uniform">
                                        <div className="col-12">
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Correo electrónico"
                                                // required // HTML5 validation, JS validation is primary
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <input
                                                type="password"
                                                name="password"
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Contraseña"
                                                // required
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <select
                                                name="role"
                                                id="role"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                disabled={isSubmitting}
                                                // required
                                            >
                                                <option value="" disabled>Selecciona un rol...</option>
                                                <option value="publico">Público General</option>
                                                <option value="profesional">Profesional</option>
                                            </select>
                                        </div>
                                        {error && (
                                            <div className="col-12">
                                                <p role="alert" className="error-message">
                                                    {error}
                                                </p>
                                            </div>
                                        )}
                                        <div className="col-12">
                                            <ul className="actions">
                                                <li>
                                                    <button
                                                        type="submit"
                                                        className="button primary"
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting ? 'Procesando...' : 'Ingresar'}
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="col-12" style={{ marginTop: '1em' }}>
                                            <p>
                                                ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
                                            </p>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Optional Spectral Footer */}
            {/* <footer id="footer"> ... </footer> */}
        </div>
    );
};

export default Login;