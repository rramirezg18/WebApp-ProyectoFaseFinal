import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('publico');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // Limpiar campos al salir de la página
    useEffect(() => {
        return () => {
            setEmail('');
            setPassword('');
            setError('');
        };
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                email,
                password,
                role
            });

            localStorage.setItem('userRole', response.data.role);
            navigate(`/dashboard-${response.data.role}`);

        } catch (err) {
            if (!err.response) {
                setError('Error de conexión con el servidor');
            } else {
                setError(err.response?.data?.error || 'Error al iniciar sesión');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-content">
                <h1 className="login-title">Iniciar Sesión</h1>

                <form className="login-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Correo electrónico:</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            value={email} // Agrega esto
                            onChange={(e) => setEmail(e.target.value)} // Y esto
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Contraseña:</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            value={password} // Agrega esto
                            onChange={(e) => setPassword(e.target.value)} // Y esto
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role" className="form-label">Rol:</label>
                        <select
                            id="role"
                            className="form-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)} // Agrega esto
                        >
                            <option value="publico">Público General</option>
                            <option value="profesional">Profesional</option>
                        </select>
                    </div>

                    {error && <div className="error-message" role="alert">{error}</div>}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Procesando...' : 'Ingresar'}
                    </button>

                    <div className="navigation-links">
                        <Link to="/registro" className="link-button">Registrarse</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;


