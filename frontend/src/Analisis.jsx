import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import instance from '../config/axiosConfig'; 
import { PDFDownloadLink } from '@react-pdf/renderer';
import InformePDF from './InformePDF';
import './Analisis.css';

const Analisis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [evaluacion, setEvaluacion] = useState(null);
  const [fotos, setFotos] = useState({});
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulación IA - Valores aleatorios
  const simularAnalisisIA = () => {
    const severidades = ['Leve', 'Moderado', 'Grave', 'No detectado'];
    return {
      severidad: severidades[Math.floor(Math.random() * severidades.length)],
      descripcion: "Resultado basado en análisis de imágenes"
    };
  };

  // Obtener datos de evaluación
  useEffect(() => {
    const fetchData = async () => {
      try {
        const evaluacionId = location.state?.evaluacionId;

        if (!evaluacionId) {
          navigate('/dashboard-publico');
          return;
        }

        const [evalRes, fotosRes] = await Promise.all([
          instance.get(`/evaluaciones/${evaluacionId}`),
          instance.get(`/evaluaciones/${evaluacionId}/fotografias`)
        ]);

        setEvaluacion(evalRes.data);
        setFotos(fotosRes.data);
      } catch (error) {
        console.error('Error:', error);
        alert('Error cargando datos: ' + (error.response?.data?.error || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.state?.evaluacionId, navigate]);

  // Handler para iniciar análisis
  const iniciarAnalisis = async () => {
    if (!window.confirm('¿Desea iniciar el análisis?') || !evaluacion) return;

    try {
      const resultadoIA = simularAnalisisIA();
      
      const response = await instance.post('/resultados', {
        evaluacionId: evaluacion.id,
        ...resultadoIA
      });

      if (response.data.success) {
        setResultado(resultadoIA);
        // Actualizar datos
        const [evalRes, fotosRes] = await Promise.all([
          instance.get(`/evaluaciones/${evaluacion.id}`),
          instance.get(`/evaluaciones/${evaluacion.id}/fotografias`)
        ]);
        setEvaluacion(evalRes.data);
        setFotos(fotosRes.data);
      }
      
    } catch (error) {
      let mensaje = 'Error desconocido';
      if (error.response) {
        mensaje = error.response.data.error || error.response.data.details;
      } else if (error.request) {
        mensaje = 'Sin respuesta del servidor';
      }
      alert(`Error al procesar el análisis: ${mensaje}`);
    }
  };

  if (loading) return <div className="loading">Cargando datos...</div>;

  return (
    <div className="analisis-container">
      {!resultado ? (
        <div className="iniciar-analisis-box">
          <h2>Análisis de Cataratas</h2>
          <button
            onClick={iniciarAnalisis}
            className="analizar-btn"
            disabled={!evaluacion}
          >
            {evaluacion ? 'Iniciar Análisis' : 'Cargando...'}
          </button>
        </div>
      ) : (
        <div className="resultados-box">
          <h3>Análisis Finalizado</h3>
          <div className="resultado-header">
            <div className={`severidad ${resultado.severidad.toLowerCase().replace(' ', '-')}`}>
              {resultado.severidad}
            </div>
            <p className="resultado-descripcion">{resultado.descripcion}</p>
          </div>

          <div className="acciones-informe">
            {evaluacion?.pdf_path && (
              <a
                href={`http://localhost:5000/uploads/${evaluacion.pdf_path}`}
                target="_blank"
                rel="noopener noreferrer"
                className="accion-btn ver-informe"
              >
                Ver Informe
              </a>
            )}

            <PDFDownloadLink 
              document={<InformePDF evaluacion={evaluacion} fotos={fotos} resultado={resultado} />}
              fileName="informe.pdf"
              className="descargar-btn"
            >
              {({ loading }) => (
                <button disabled={loading}>
                  {loading ? 'Generando PDF...' : 'Descargar Informe'}
                </button>
              )}
            </PDFDownloadLink>

            <button className="accion-btn enviar-btn" disabled>
              Enviar
            </button>

            <button 
              onClick={() => navigate('/dashboard-publico')} 
              className="accion-btn volver-btn"
            >
              Volver a Inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analisis;