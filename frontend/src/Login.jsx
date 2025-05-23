import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';
import './main.css';
import './fontawesome-all.min.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        return () => {
            setEmail('');
            setPassword('');
            setRole('');
            setError('');
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

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

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userRole', response.data.role);
            navigate(`/dashboard-${response.data.role}`);

        } catch (err) {
            if (err.response) {
                if (err.response.status === 401) {
                    setError('Credenciales inválidas. Por favor, verifica tu email, contraseña y rol.');
                } else {
                    setError(err.response.data.error || 'Error del servidor. Intenta más tarde.');
                }
            } else if (err.request) {
                setError('No se pudo conectar con el servidor. Verifica tu conexión o intenta más tarde.');
            } else {
                setError('Ocurrió un error inesperado al preparar la solicitud. Intenta de nuevo.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const sideImageUrl = "https://plus.unsplash.com/premium_photo-1664303515404-1e5a366eb188";

    return (
        <div id="page-wrapper" className="login-page-container spectral-landing-background">
            <section className="wrapper">
                <div className="inner">
                    <div className="row gtr-100 align-items-center">

                        {/* Columna Izquierda - Imagen y Texto */}
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
                                <h3>e-Paarvai</h3>
                                <p>
                                    Somos una fuente confiable de innovación médica, donde la inteligencia artificial 
                                    se une a la oftalmología para detectar cataratas de forma temprana, precisa y accesible.
                                </p>
                                <p>
                                    Si eres nuevo aquí, <Link to="/registro">crea tu cuenta</Link> en pocos pasos.
                                </p>
                            </div>
                        </div>

                        {/* Columna Derecha - Formulario */}
                        <div className="col-6 col-12-medium login-form-column">
                            <div className="login-form-wrapper">
                                <h2>INICIAR SESIÓN</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="row gtr-uniform">
                                        {/* Campo Email */}
                                        <div className="col-12">
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="Correo electrónico"
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        {/* Campo Contraseña */}
                                        <div className="col-12">
                                            <input
                                                type="password"
                                                name="password"
                                                id="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Contraseña"
                                                disabled={isSubmitting}
                                            />
                                        </div>

                                        {/* Selector de Rol */}
                                        <div className="col-12">
                                            <select
                                                name="role"
                                                id="role"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                disabled={isSubmitting}
                                            >
                                                <option value="" disabled>Selecciona un rol...</option>
                                                <option value="publico">Público</option>
                                                <option value="profesional">Profesional</option>
                                            </select>
                                        </div>

                                        {/* Mensajes de Error */}
                                        {error && (
                                            <div className="col-12">
                                                <p role="alert" className="error-message">
                                                    {error}
                                                </p>
                                            </div>
                                        )}

                                        {/* Botón de Ingreso */}
                                        <div className="col-12">
                                            <ul className="actions">
                                                <li>
                                                    <button
                                                        type="submit"
                                                        className="button primary"
                                                        disabled={isSubmitting}
                                                    >
                                                        {isSubmitting ? 'Procesando...' : 'INGRESAR'}
                                                    </button>
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Enlaces Inferiores */}
                                        <div className="col-12 links-inferiores">
                                            <p className="forgot-password-link">
                                                <Link to="/forgot-password">¿Olvidaste tu contraseña?</Link>
                                            </p>
                                            <p className="register-link">
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
        </div>
    );
};

export default Login;