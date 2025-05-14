import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('publico');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // Limpiar campos al salir
    useEffect(() => {
        return () => {
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setError('');
        };
    }, []);

    const validatePassword = (pass) => {
        const hasNumber = /\d/.test(pass);
        const hasUpper = /[A-Z]/.test(pass);
        return pass.length >= 6 && hasNumber && hasUpper;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!email.includes('@')) {
                throw new Error('Correo electrónico inválido');
            }

            if (!validatePassword(password)) {
                throw new Error('Mínimo 6 caracteres, 1 número y 1 mayúscula');
            }

            if (password !== confirmPassword) {
                throw new Error('Las contraseñas no coinciden');
            }

            await axios.post('http://localhost:5000/api/register', {
                email,
                password,
                role
            });

            alert('¡Registro exitoso! Redirigiendo...');
            navigate('/');

        } catch (err) {
            setError(err.message || 'Error al registrarse');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-content">
                <h1 className="register-title">Registro</h1>

                <form className="register-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label htmlFor="reg-email" className="form-label">Correo electrónico:</label>
                        <input
                            type="email"
                            id="reg-email"
                            className="form-input"
                            value={email} // Agrega esto
                            onChange={(e) => setEmail(e.target.value)} // Y esto
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-password" className="form-label">Contraseña:</label>
                        <input
                            type="password"
                            id="reg-password"
                            className="form-input"
                            value={password} // Agrega esto
                            onChange={(e) => setPassword(e.target.value)} // Y esto
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-confirm-password" className="form-label">Confirmar Contraseña:</label>
                        <input
                            type="password"
                            id="reg-confirm-password"
                            className="form-input"
                            value={confirmPassword} // Agrega esto
                            onChange={(e) => setConfirmPassword(e.target.value)} // Y esto
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="reg-role" className="form-label">Rol:</label>
                        <select
                            id="reg-role"
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
                        {isSubmitting ? 'Registrando...' : 'Registrarse'}
                    </button>

                    <div className="navigation-links">
                        <Link to="/" className="link-button">Volver al Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;