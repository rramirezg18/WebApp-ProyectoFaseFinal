import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './SubirFotografias.css';

const SubirFotografias = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [evaluacionId, setEvaluacionId] = useState(null);
  const [fotosSubidas, setFotosSubidas] = useState({
    ojo_izquierdo: { url: null, subiendo: false, error: null },
    ojo_derecho: { url: null, subiendo: false, error: null }
  });

  // Obtener ID de evaluación del estado de navegación
  useEffect(() => {
    if (!location.state?.evaluacionId) {
      navigate('/dashboard-publico');
    }
    setEvaluacionId(location.state.evaluacionId);
  }, [location, navigate]);

  const handleFileChange = async (tipo, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Resetear estado y activar carga
    setFotosSubidas(prev => ({
      ...prev,
      [tipo]: { ...prev[tipo], error: null, subiendo: true }
    }));

    try {
      const formData = new FormData();
      formData.append(tipo, file);

      const response = await axios.post(
        `/api/evaluaciones/${evaluacionId}/fotografias`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Actualizar estado con la respuesta
      const fotoActualizada = response.data.fotos.find(f => f.tipo === tipo);
      
      setFotosSubidas(prev => ({
        ...prev,
        [tipo]: {
          url: fotoActualizada?.url || null,
          subiendo: false,
          error: null
        }
      }));

    } catch (error) {
      setFotosSubidas(prev => ({
        ...prev,
        [tipo]: { 
          url: null, 
          subiendo: false, 
          error: error.response?.data?.error || 'Error subiendo la foto' 
        }
      }));
    }
  };

  const handleCancelar = () => {
    if (window.confirm('¿Estás seguro de cancelar? Se perderán los avances.')) {
      navigate('/dashboard-publico');
    }
  };

  // Variable computada para controlar el botón
  const ambosOjosSubidos = fotosSubidas.ojo_izquierdo.url && fotosSubidas.ojo_derecho.url;

  return (
    <div className="subir-fotografias-container">
      <h1>Subir Fotografías para Análisis</h1>

      <div className="instrucciones">
        <p>Por favor sube una foto clara de cada ojo (formatos aceptados: JPEG, PNG)</p>
      </div>

      <div className="foto-secciones">
        {/* Ojo Izquierdo */}
        <div className={`upload-box ${fotosSubidas.ojo_izquierdo.url ? 'success' : ''} ${fotosSubidas.ojo_izquierdo.error ? 'error' : ''}`}>
          <label>
            <input
              type="file"
              accept="image/jpeg, image/png"
              onChange={(e) => handleFileChange('ojo_izquierdo', e)}
              disabled={fotosSubidas.ojo_izquierdo.subiendo}
            />
            <div className="upload-content">
              {fotosSubidas.ojo_izquierdo.url ? (
                <>
                  <img
                    src={fotosSubidas.ojo_izquierdo.url}
                    alt="Ojo izquierdo subido"
                    className="preview-imagen"
                  />
                  <span className="success-text">✓ Subida exitosa</span>
                </>
              ) : (
                <div className="upload-placeholder">
                  {fotosSubidas.ojo_izquierdo.subiendo ? (
                    <div className="uploading-indicator">
                      <div className="spinner"></div>
                      <span>Subiendo...</span>
                    </div>
                  ) : (
                    <>
                      <span className="upload-icon">⬆️</span>
                      <span className="upload-text">Seleccionar foto ojo izquierdo</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </label>
          {fotosSubidas.ojo_izquierdo.error && (
            <div className="error-message">{fotosSubidas.ojo_izquierdo.error}</div>
          )}
        </div>

        {/* Ojo Derecho */}
        <div className={`upload-box ${fotosSubidas.ojo_derecho.url ? 'success' : ''} ${fotosSubidas.ojo_derecho.error ? 'error' : ''}`}>
          <label>
            <input
              type="file"
              accept="image/jpeg, image/png"
              onChange={(e) => handleFileChange('ojo_derecho', e)}
              disabled={fotosSubidas.ojo_derecho.subiendo}
            />
            <div className="upload-content">
              {fotosSubidas.ojo_derecho.url ? (
                <>
                  <img
                    src={fotosSubidas.ojo_derecho.url}
                    alt="Ojo derecho subido"
                    className="preview-imagen"
                  />
                  <span className="success-text">✓ Subida exitosa</span>
                </>
              ) : (
                <div className="upload-placeholder">
                  {fotosSubidas.ojo_derecho.subiendo ? (
                    <div className="uploading-indicator">
                      <div className="spinner"></div>
                      <span>Subiendo...</span>
                    </div>
                  ) : (
                    <>
                      <span className="upload-icon">⬆️</span>
                      <span className="upload-text">Seleccionar foto ojo derecho</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </label>
          {fotosSubidas.ojo_derecho.error && (
            <div className="error-message">{fotosSubidas.ojo_derecho.error}</div>
          )}
        </div>
      </div>

      <div className="acciones">
        <button
          className="cancelar-btn"
          onClick={handleCancelar}
          disabled={fotosSubidas.ojo_izquierdo.subiendo || fotosSubidas.ojo_derecho.subiendo}
        >
          Cancelar
        </button>

        <button
          className={`analizar-btn ${ambosOjosSubidos ? 'active' : 'disabled'}`}
          disabled={!ambosOjosSubidos || fotosSubidas.ojo_izquierdo.subiendo || fotosSubidas.ojo_derecho.subiendo}
          onClick={() => navigate('/analisis', { state: { evaluacionId } })}
        >
          Iniciar Análisis...
        </button>
      </div>
    </div>
  );
};

export default SubirFotografias;