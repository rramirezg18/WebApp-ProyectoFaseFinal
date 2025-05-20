import { Link, useNavigate } from 'react-router-dom';
import './DashboardProfesional.css'; // Reutilizar estilos

const DashboardPublico = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      <nav className="main-menu">
        <h2 className="menu-title">Menú Principal</h2>
        <ul className="menu-list">
          {/* Usar rutas absolutas */}
          <li className="menu-item">
            <Link to="/evaluar-expediente" className="menu-link">Evaluar Expediente</Link>
          </li>
          <li className="menu-item">
            <Link to="/registrar-paciente" className="menu-link">Registrar Paciente</Link>
          </li>
          <li className="menu-item">
            <Link to="/historial" className="menu-link">Historial</Link>
          </li>
          <li className="menu-item">
            <Link to="/perfil" className="menu-link">Mi Perfil</Link>
          </li>
          <li className="menu-item">
            <button className="logout-button" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default DashboardPublico;