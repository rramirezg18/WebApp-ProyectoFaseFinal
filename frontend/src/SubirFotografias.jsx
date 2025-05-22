import React, { useState, useEffect, useRef } from 'react';
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
      setFotos(prev => ({
        ...prev, [tipo]: {
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

  const UploadSection = ({ tipo, label }) => {
    const { url, subiendo, error } = fotos[tipo];
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    // const [mediaStream, setMediaStream] = useState(null);

    useEffect(() => {
      let stream;

      const startCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true // Cambiado a cámara frontal por defecto
          });

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            //setMediaStream(stream);
          }
        } catch (err) {
          console.error('Error al acceder a la cámara:', err);
          setFotos(prev => ({
            ...prev,
            [tipo]: {
              ...prev[tipo],
              error: 'Permiso de cámara denegado o dispositivo no disponible'
            }
          }));
          setIsCameraActive(false);
        }
      };

      if (isCameraActive) {
        startCamera();
      }

      return () => {
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      };
    }, [isCameraActive]);

    const toggleCamera = () => {
      setIsCameraActive(prev => !prev);
    };

    const capturePhoto = () => {
      if (videoRef.current && canvasRef.current) {
        const context = canvasRef.current.getContext('2d');
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        const imageDataUrl = canvasRef.current.toDataURL('image/png');
        setCapturedImage(imageDataUrl);
        setIsCameraActive(false);
      }
    };

    const confirmPhoto = () => {
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `${tipo}-captura.png`, { type: 'image/png' });
          handleFile(tipo, file);
          setCapturedImage(null);
        });
    };

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
                ) : capturedImage ? (
                  <div className="captured-preview">
                    <img src={capturedImage} alt="Vista previa" />
                    <div className="captured-actions">
                      <button onClick={confirmPhoto} className="confirm-btn">
                        Confirmar
                      </button>
                      <button
                        onClick={() => setCapturedImage(null)}
                        className="retry-btn"
                      >
                        Volver a tomar
                      </button>
                    </div>
                  </div>
                ) : isCameraActive ? (
                  <div className="camera-preview">
                    <div className="video-container">
                      <video ref={videoRef} autoPlay playsInline />
                    </div>
                    <div className="camera-controls">
                      <button onClick={capturePhoto} className="capture-btn">
                        Capturar
                      </button>
                      <button onClick={toggleCamera} className="cancel-camera-btn">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="upload-icon"></span>
                    <span className="upload-text">Seleccionar foto ojo {label}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </label>
        <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
        <button
          className="camera-button"
          onClick={toggleCamera}
          disabled={subiendo}
        >
          {isCameraActive ? 'Cancelar cámara' : 'Tomar foto'}
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