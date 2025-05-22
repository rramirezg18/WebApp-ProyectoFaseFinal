import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './SubirFotografias.css';

const SubirFotografias = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [evaluacionId, setEvaluacionId] = useState(null);
  const [fotos, setFotos] = useState({
    ojo_izquierdo: { url: null, subiendo: false, error: null },
    ojo_derecho: { url: null, subiendo: false, error: null }
  });

  useEffect(() => {
    if (!state?.evaluacionId) navigate('/dashboard-publico');
    setEvaluacionId(state.evaluacionId);
  }, [state, navigate]);

  const handleFile = async (tipo, file) => {
    if (!file) return;
    
    setFotos(prev => ({ ...prev, [tipo]: { ...prev[tipo], error: null, subiendo: true } }));
    
    try {
      const formData = new FormData();
      formData.append(tipo, file);
      
      const { data } = await axios.post(`/api/evaluaciones/${evaluacionId}/fotografias`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const foto = data.fotos.find(f => f.tipo === tipo);
      setFotos(prev => ({ ...prev, [tipo]: { url: foto?.url, subiendo: false, error: null } }));
      
    } catch (error) {
      setFotos(prev => ({ ...prev, [tipo]: { 
        url: null, 
        subiendo: false, 
        error: error.response?.data?.error || 'Error subiendo la foto' 
      }}));
    }
  };

  const handleCancelar = () => {
    if (window.confirm('¿Estás seguro de cancelar? Se perderán los avances.')) {
      navigate('/dashboard-publico');
    }
  };

  const UploadSection = ({ tipo, label }) => {
    const { url, subiendo, error } = fotos[tipo];
    
    return (
      <div className={`upload-box ${url ? 'success' : ''} ${error ? 'error' : ''}`}>
        <label>
          <input
            type="file"
            accept="image/jpeg, image/png"
            onChange={e => handleFile(tipo, e.target.files[0])}
            disabled={subiendo}
          />
          <div className="upload-content">
            {url ? (
              <>
                <img src={url} alt={`Ojo ${label}`} className="preview-imagen" />
                <span className="success-text">✓ Subida exitosa</span>
              </>
            ) : (
              <div className="upload-placeholder">
                {subiendo ? (
                  <div className="uploading-indicator">
                    <div className="spinner" />
                    <span>Subiendo...</span>
                  </div>
                ) : (
                  <>
                    <span className="upload-icon">⬆️</span>
                    <span className="upload-text">Seleccionar foto ojo {label}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </label>
        <button className="camera-button" disabled={subiendo}>
          📸 Tomar foto
        </button>
        {error && <div className="error-message">{error}</div>}
      </div>
    );
  };

  return (
    <div className="subir-fotografias-container">
      <h1>Subir Fotografías para Análisis</h1>
      <div className="instrucciones">
        <p>Por favor sube una foto clara de cada ojo (formatos aceptados: JPEG, PNG)</p>
      </div>

      <div className="foto-secciones">
        <UploadSection tipo="ojo_izquierdo" label="izquierdo" />
        <UploadSection tipo="ojo_derecho" label="derecho" />
      </div>

      <div className="acciones">
        <button
          className="cancelar-btn"
          onClick={handleCancelar}
          disabled={fotos.ojo_izquierdo.subiendo || fotos.ojo_derecho.subiendo}
        >
          Cancelar
        </button>
        
        <button
          className={`analizar-btn ${fotos.ojo_izquierdo.url && fotos.ojo_derecho.url ? 'active' : 'disabled'}`}
          disabled={!(fotos.ojo_izquierdo.url && fotos.ojo_derecho.url)}
          onClick={() => navigate('/analisis', { state: { evaluacionId } })}
        >
          Iniciar Análisis...
        </button>
      </div>
    </div>
  );
};

export default SubirFotografias;