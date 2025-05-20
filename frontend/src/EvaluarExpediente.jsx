// EvaluarExpediente.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import instance from '../config/axiosConfig';
import './HistorialEvaluaciones.css'; // Reutilizar estilos

const EvaluarExpediente = () => {
  const navigate = useNavigate();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEvaluaciones = async () => {
      try {
        const response = await instance.get('/evaluaciones-profesional');
        setEvaluaciones(response.data);
      } catch (error) {
        console.error('Error cargando evaluaciones:', error);
        alert('Error al cargar evaluaciones');
      } finally {
        setLoading(false);
      }
    };

    cargarEvaluaciones();
  }, []);

  if (loading) return <div className="loading">Cargando evaluaciones...</div>;

  return (
    <div className="historial-container">
      <div className="header-historial">
        <h2>Evaluar Expedientes</h2>
        <button 
          onClick={() => navigate('/dashboard-profesional')}
          className="btn-volver"
        >
          ← Volver al Panel
        </button>
      </div>

      <div className="tabla-historial">
        <div className="fila-header">
          <div className="columna">Paciente</div>
          <div className="columna">Fecha</div>
          <div className="columna">Resultado</div>
          <div className="columna">Acciones</div>
        </div>

        {evaluaciones.length > 0 ? (
          evaluaciones.map((evaluacion) => (
            <div className="fila-evaluacion" key={evaluacion.id}>
              <div className="columna">
                {evaluacion.paciente_completo || 'Nombre no disponible'}
              </div>
              <div className="columna">
                {evaluacion.fecha || 'Fecha no disponible'}
              </div>
              <div className={`columna resultado ${(evaluacion.severidad || '').toLowerCase()}`}>
                {evaluacion.severidad || 'Pendiente'}
              </div>
              <div className="columna acciones">
                <button 
                  className="btn-informe"
                  onClick={() => navigate(`/analisis/${evaluacion.id}`)}
                >
                  Evaluar
                </button>
                {evaluacion.pdf_path && (
                  <a
                    href={`http://localhost:5000/uploads/${evaluacion.pdf_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-informe"
                  >
                    Ver PDF
                  </a>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="sin-resultados">
            No hay evaluaciones pendientes
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluarExpediente;