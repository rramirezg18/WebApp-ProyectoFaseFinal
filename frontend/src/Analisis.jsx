import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { PDFDownloadLink } from '@react-pdf/renderer';
import InformePDF from './InformePDF'; // Componente para generar PDFs
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
      descripcion: "Simulación de resultado basado en análisis de imágenes..."
    };
  };

  // Generar PDF
  const generarInforme = () => (
    <InformePDF 
      evaluacion={evaluacion}
      fotos={fotos}
      resultado={resultado}
    />
  );

  // Obtener datos de evaluación
  useEffect(() => {
    const fetchData = async () => {
      try {
        const evaluacionId = location.state?.evaluacionId;
        const [evalRes, fotosRes] = await Promise.all([
          axios.get(`/api/evaluaciones/${evaluacionId}`),
          axios.get(`/api/evaluaciones/${evaluacionId}/fotografias`)
        ]);
        
        setEvaluacion(evalRes.data);
        setFotos(fotosRes.data);
      } catch (error) {
        navigate('/dashboard-publico');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handler para iniciar análisis
  const iniciarAnalisis = async () => {
    if (!window.confirm('¿Desea iniciar el análisis?')) return;
    
    try {
      const resultadoIA = simularAnalisisIA();
      
      // Guardar en BD
      await axios.post('/api/resultados', {
        evaluacionId: evaluacion.id,
        ...resultadoIA
      });
      
      setResultado(resultadoIA);
    } catch (error) {
      alert('Error al procesar el análisis');
    }
  };

  if (loading) return <div className="loading">Cargando datos...</div>;

  return (
    <div className="analisis-container">
      {!resultado ? (
        <div className="iniciar-analisis-box">
          <h2>Análisis de Cataratas</h2>
          <button onClick={iniciarAnalisis} className="analizar-btn">
            Iniciar Análisis
          </button>
        </div>
      ) : (
        <div className="resultados-box">
          <h3>Resultados del Análisis</h3>
          <div className={`severidad ${resultado.severidad.toLowerCase().replace(' ', '-')}`}>
            {resultado.severidad}
          </div>
          <p>{resultado.descripcion}</p>
          
          <div className="acciones-informe">
            <PDFDownloadLink document={generarInforme()} fileName="informe.pdf">
              {({ loading }) => (
                <button className="descargar-btn">
                  {loading ? 'Generando PDF...' : 'Descargar Informe'}
                </button>
              )}
            </PDFDownloadLink>
            <button onClick={() => navigate('/dashboard-publico')} className="volver-btn">
              Volver al Inicio
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analisis;