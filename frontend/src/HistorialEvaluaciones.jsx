import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import instance from '../config/axiosConfig';
import './HistorialEvaluaciones.css';

const HistorialEvaluaciones = () => {
  const navigate = useNavigate();
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Obtener historial de evaluaciones
  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const response = await instance.get('/evaluaciones');
        setEvaluaciones(response.data);
        console.log('Datos recibidos:', response.data);
      } catch (error) {
        console.error('Error cargando historial:', error);
        alert('Error al cargar el historial');
      } finally {
        setLoading(false);
      }
    };

    cargarHistorial();
  }, []);

  if (loading) return <div className="loading">Cargando historial...</div>;

  return (
    <div className="historial-container">
      <div className="header-historial">
        <h2>Historial de Evaluaciones</h2>
        <button
          onClick={() => navigate('/dashboard-publico')}
          className="btn-volver"
        >
          ← Volver al Inicio
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
                {evaluacion.paciente || 'Nombre no disponible'}
              </div>
              <div className="columna">
                {evaluacion.fecha || 'Fecha no disponible'}
              </div>
              <div className={`columna resultado ${(evaluacion.severidad || '').toLowerCase().replace(' ', '-')}`}>
                {evaluacion.severidad || 'Sin análisis'}
              </div>
              <div className="columna acciones">
                {evaluacion.pdf_path ? (
                  <a
                    href={`http://localhost:5000/uploads/${evaluacion.pdf_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-informe"
                  >
                    Ver Informe
                  </a>
                ) : 'N/A'}
              </div>
            </div>
          ))
        ) : (
          <div className="sin-resultados">
            No se encontraron evaluaciones registradas
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialEvaluaciones; // Exportación movida fuera del return