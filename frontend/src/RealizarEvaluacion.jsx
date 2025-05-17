import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RealizarEvaluacion.css'; // Asegúrate de que este archivo CSS contenga los estilos del layout y del formulario.
import './main.css'; // Estilos globales de Spectral
import './fontawesome-all.min.css'; // Iconos de FontAwesome

// Es crucial que los CSS globales de Spectral (main.css, fontawesome-all.min.css)
// y la clase .spectral-landing-background (para el fondo "nublado")
// estén siendo importados en tu App.js o index.js, o referenciados correctamente.

const RealizarEvaluacion = () => {
  const navigate = useNavigate();
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [diagnosticos, setDiagnosticos] = useState([]); // Para cargar la lista de diagnósticos disponibles

  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    datosPersonales: {
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      edad: '',
      genero: '',
      pais_id: '', // ID del país seleccionado
      ciudad_id: '', // ID de la ciudad seleccionada
      direccion: '',
      raza_etnia: ''
    },
    antecedentes: { // Cambiado de antecedentes_medicos para coincidir con el Código 1
      historial_familiar: '',
      cirugias_oculares: '',
      traumatismos_oculares: ''
    },
    sintomas: { // Cambiado de sintomas_actuales para coincidir con el Código 1
      vision_borrosa: '',
      intensidad_borrosa: '',
      fotofobia: '',
      dificultad_noche: '',
      cambios_lentes: '',
      vision_doble: '',
      halos_luces: '',
      otros_sintomas: ''
    },
    historial: { // Cambiado de historial_salud para coincidir con el Código 1
      ultimo_examen: '',
      uso_lentes: '',
      tipo_lentes: '',
      diagnosticos: [] // CORREGIDO: Nombre de la propiedad para los IDs de diagnósticos seleccionados, para coincidir con el Código 1
    }
  });

  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  // --- Lógica del Menú Lateral ---
  const toggleMenu = (e) => {
    if (e) e.preventDefault();
    setIsMenuVisible(!isMenuVisible);
  };

  useEffect(() => {
    const pageWrapper = document.getElementById('realizar-evaluacion-page-wrapper');
    if (pageWrapper) {
      if (isMenuVisible) {
        pageWrapper.classList.add('is-menu-visible-layout');
      } else {
        pageWrapper.classList.remove('is-menu-visible-layout');
      }
    }
  }, [isMenuVisible]);

  const handleLogout = () => {
    localStorage.removeItem('userRole'); // O el nombre de tu item de rol
    localStorage.removeItem('token'); // Asegúrate de limpiar el token también
    setIsMenuVisible(false);
    navigate('/'); // O a la página de login
  };

  const menuItems = [
    { to: '/citas', label: 'Citas' },
    { to: '/realizar-evaluacion', label: 'Realizar Evaluación' },
    { to: '/historial', label: 'Historial' },
    { to: '/perfil', label: 'Mi Perfil' },
    { type: 'button', label: 'Cerrar Sesión', action: handleLogout, className: 'button small fit logout-button-sidemenu' }
  ];

  const pageTitle = "Autoevaluación de Cataratas";
  const pageSubtitle = "Complete el siguiente formulario detalladamente";
  const headerClassName = 'header-solid'; // O 'alt' dependiendo del diseño de la página

  // --- Carga de Datos Iniciales (Países, Diagnósticos) ---
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      setCargando(true);
      try {
        // Asegúrate que las URLs sean correctas y accesibles
        const [paisesRes, diagnosticosRes] = await Promise.all([
          axios.get('http://localhost:5000/api/paises'),
          axios.get('http://localhost:5000/api/diagnosticos')
        ]);

        if (!Array.isArray(paisesRes.data)) {
          console.error('Respuesta de /api/paises no es un array:', paisesRes.data);
          throw new Error(`Formato de países inválido. Se recibió: ${typeof paisesRes.data}`);
        }
        setPaises(paisesRes.data);

        if (!Array.isArray(diagnosticosRes.data)) {
          console.error('Respuesta de /api/diagnosticos no es un array:', diagnosticosRes.data);
          throw new Error(`Formato de diagnósticos inválido. Se recibió: ${typeof diagnosticosRes.data}`);
        }
        setDiagnosticos(diagnosticosRes.data); // Estos son los diagnósticos disponibles para seleccionar
        setErrorCarga(null);
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
        setErrorCarga(error.message || "Error al cargar datos iniciales del formulario.");
      } finally {
        setCargando(false);
      }
    };
    cargarDatosIniciales();
  }, []);

  // --- Carga de Ciudades cuando se selecciona un País ---
  useEffect(() => {
    if (formData.datosPersonales.pais_id) {
      setFormData(prev => ({ ...prev, datosPersonales: { ...prev.datosPersonales, ciudad_id: '' } }));
      axios.get(`http://localhost:5000/api/paises/${formData.datosPersonales.pais_id}/ciudades`)
        .then(res => {
          if (Array.isArray(res.data)) {
            setCiudades(res.data);
          } else {
            console.error('Respuesta de ciudades no es un array:', res.data);
            setCiudades([]);
          }
        })
        .catch(error => {
          console.error('Error cargando ciudades:', error.response?.data || error.message);
          setCiudades([]);
        });
    } else {
      setCiudades([]);
    }
  }, [formData.datosPersonales.pais_id]);

  // --- Manejadores de Cambios en el Formulario ---
  const handleChange = (seccion, campo) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: value
      }
    }));
  };

  // CORREGIDO: Manejador para los checkboxes de diagnósticos
  const handleDiagnosticosChange = (e) => {
    const { value, checked } = e.target;
    const diagnosticoId = parseInt(value); // El ID del diagnóstico
    setFormData(prev => {
      // Accede a prev.historial.diagnosticos (array de IDs seleccionados)
      const currentDiagnosticosSeleccionados = prev.historial.diagnosticos || [];
      let newDiagnosticosSeleccionados;
      if (checked) {
        newDiagnosticosSeleccionados = [...currentDiagnosticosSeleccionados, diagnosticoId];
      } else {
        newDiagnosticosSeleccionados = currentDiagnosticosSeleccionados.filter(id => id !== diagnosticoId);
      }
      return {
        ...prev,
        historial: {
          ...prev.historial,
          diagnosticos: newDiagnosticosSeleccionados // Actualiza el array de IDs
        }
      };
    });
  };

  // --- Validación del Formulario ---
  const validarFormulario = () => {
    const nuevosErrores = {};
    // Datos Personales
    if (!formData.datosPersonales.primer_nombre.trim()) nuevosErrores.primer_nombre = "Primer nombre es requerido";
    if (!formData.datosPersonales.primer_apellido.trim()) nuevosErrores.primer_apellido = "Primer apellido es requerido";
    if (!formData.datosPersonales.edad.toString().trim()) nuevosErrores.edad = "Edad es requerida";
    else if (isNaN(formData.datosPersonales.edad) || Number(formData.datosPersonales.edad) <= 0 || Number(formData.datosPersonales.edad) > 120) nuevosErrores.edad = "Edad inválida (1-120)";
    if (!formData.datosPersonales.genero) nuevosErrores.genero = "Género es requerido";
    if (!formData.datosPersonales.pais_id) nuevosErrores.pais_id = "País es requerido";
    if (!formData.datosPersonales.ciudad_id) nuevosErrores.ciudad_id = "Ciudad es requerida";

    // Antecedentes Médicos
    if (!formData.antecedentes.historial_familiar) { // Ajustado a la nueva estructura de formData
      nuevosErrores.historial_familiar = 'Respuesta requerida';
    }

    // Síntomas Actuales
    if (!formData.sintomas.vision_borrosa) nuevosErrores.vision_borrosa = 'Respuesta requerida'; // Ajustado
    if (formData.sintomas.vision_borrosa === 'Sí' && !formData.sintomas.intensidad_borrosa) {
      nuevosErrores.intensidad_borrosa = 'Indique intensidad';
    } else if (formData.sintomas.vision_borrosa === 'Sí' && (parseInt(formData.sintomas.intensidad_borrosa) < 1 || parseInt(formData.sintomas.intensidad_borrosa) > 5)) {
      nuevosErrores.intensidad_borrosa = 'Valor entre 1 y 5';
    }
    if (!formData.sintomas.fotofobia) nuevosErrores.fotofobia = 'Respuesta requerida';
    if (!formData.sintomas.dificultad_noche) nuevosErrores.dificultad_noche = 'Respuesta requerida';

    // Historial de Salud Ocular
    if (!formData.historial.uso_lentes) nuevosErrores.uso_lentes = 'Respuesta requerida'; // Ajustado
    if (formData.historial.uso_lentes === 'Sí' && !formData.historial.tipo_lentes) {
      nuevosErrores.tipo_lentes = 'Indique tipo de lentes';
    }
    // Podrías añadir validación para formData.historial.diagnosticos si es necesario

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    // Crear payload primero
    const payload = {
      datosPersonales: {
        primer_nombre: formData.datosPersonales.primer_nombre,
        segundo_nombre: formData.datosPersonales.segundo_nombre,
        primer_apellido: formData.datosPersonales.primer_apellido,
        segundo_apellido: formData.datosPersonales.segundo_apellido,
        edad: formData.datosPersonales.edad,
        genero: formData.datosPersonales.genero,
        ciudad_id: formData.datosPersonales.ciudad_id,
        direccion: formData.datosPersonales.direccion,
        raza_etnia: formData.datosPersonales.raza_etnia
      },
      antecedentes: formData.antecedentes,
      sintomas: {
        ...formData.sintomas,
        intensidad_borrosa: parseInt(formData.sintomas.intensidad_borrosa) || null
      },
      historial: formData.historial,
      diagnosticos: formData.historial.diagnosticos
    };

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        alert('No estás autenticado');
        navigate('/login');
        return;
      }

      const response = await axios.post('/api/evaluaciones', payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        alert('Evaluación guardada exitosamente!');
        navigate('/subir-fotografias');
      }
    } catch (error) {
      console.error('Error detallado:', error.response?.data);

      const errorMessage = error.response?.data?.error ||
        error.response?.data?.details ||
        'Error desconocido';

      if (error.response?.status === 401) {
        alert('Sesión expirada. Por favor inicia sesión nuevamente');
        navigate('/login');
      } else {
        alert(`Error al guardar: ${errorMessage}`);
      }
    }
  };

  // URL del video de YouTube para incrustar (no usado actualmente en el JSX)
  // const youtubeEmbedUrl = "https://www.youtube.com/embed/KS1XIhUsA90?si=ZJoDDOguY1SS9MsZ"; 

  // --- Renderizado Condicional (Cargando, Error, Formulario) ---
  if (cargando) {
    return (
      <div id="realizar-evaluacion-page-wrapper" className={`spectral-landing-background is-loading-placeholder`}>
        <header id="header" className={headerClassName}><h1><Link to="/">E-PAARVARI</Link></h1></header>
        <article id="main"><section className="wrapper style5"><div className="inner"><p>Cargando formulario...</p></div></section></article>
        <footer id="footer"><ul className="copyright"><li>© E-PAARVARI</li></ul></footer>
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div id="realizar-evaluacion-page-wrapper" className={`spectral-landing-background is-loading-placeholder`}>
        <header id="header" className={headerClassName}><h1><Link to="/">E-PAARVARI</Link></h1></header>
        <article id="main"><section className="wrapper style5"><div className="inner"><div className="error-message">Error al cargar datos: {errorCarga}</div></div></section></article>
        <footer id="footer"><ul className="copyright"><li>© E-PAARVARI</li></ul></footer>
      </div>
    );
  }

  return (
    <div id="realizar-evaluacion-page-wrapper" className={`spectral-landing-background ${isMenuVisible ? 'is-menu-visible-layout' : ''}`}>
      {/* Header */}
      <header id="header" className={headerClassName}>
        <h1><Link to="/">E-PAARVARI</Link></h1>
        <nav id="nav">
          <ul>
            <li className="special">
              <a href="#menu-dashboard" className="menuToggle" onClick={toggleMenu}>
                <span>Menu</span>
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Menu Desplegable */}
      <nav id="menu-dashboard">
        <a href="#menu-dashboard-close" className="close" onClick={toggleMenu}></a> {/* Mejorada accesibilidad del enlace de cierre */}
        <ul>
          <li><Link to="/" onClick={() => setIsMenuVisible(false)}>Inicio</Link></li>
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.type === 'button' ? (
                <button
                  className={item.className || "button small fit"}
                  onClick={() => {
                    if (item.action) item.action();
                    setIsMenuVisible(false);
                  }}
                >
                  {item.label}
                </button>
              ) : (
                <Link to={item.to} onClick={() => setIsMenuVisible(false)}>{item.label}</Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Contenido Principal de la Página */}
      <article id="main">
        <header className="page-header-main">
          <h2>{pageTitle}</h2>
          {pageSubtitle && <p>{pageSubtitle}</p>}
        </header>
        <section className="wrapper style5">
          <div className="inner">
            <form onSubmit={handleSubmit} className="evaluation-form">
              {/* Sección 1: Datos Personales */}
              <fieldset className="form-section">
                <legend>1. Datos Personales</legend>
                <div className="row gtr-uniform">
                  <div className="col-6 col-12-xsmall">
                    <label htmlFor="primer_nombre">Primer Nombre*</label>
                    <input type="text" name="primer_nombre" id="primer_nombre" value={formData.datosPersonales.primer_nombre} onChange={handleChange('datosPersonales', 'primer_nombre')} />
                    {errores.primer_nombre && <span className="error-text">{errores.primer_nombre}</span>}
                  </div>
                  <div className="col-6 col-12-xsmall">
                    <label htmlFor="segundo_nombre">Segundo Nombre</label>
                    <input type="text" name="segundo_nombre" id="segundo_nombre" value={formData.datosPersonales.segundo_nombre} onChange={handleChange('datosPersonales', 'segundo_nombre')} />
                  </div>
                  <div className="col-6 col-12-xsmall">
                    <label htmlFor="primer_apellido">Primer Apellido*</label>
                    <input type="text" name="primer_apellido" id="primer_apellido" value={formData.datosPersonales.primer_apellido} onChange={handleChange('datosPersonales', 'primer_apellido')} />
                    {errores.primer_apellido && <span className="error-text">{errores.primer_apellido}</span>}
                  </div>
                  <div className="col-6 col-12-xsmall">
                    <label htmlFor="segundo_apellido">Segundo Apellido</label>
                    <input type="text" name="segundo_apellido" id="segundo_apellido" value={formData.datosPersonales.segundo_apellido} onChange={handleChange('datosPersonales', 'segundo_apellido')} />
                  </div>
                  <div className="col-4 col-12-xsmall">
                    <label htmlFor="edad">Edad*</label>
                    <input type="number" name="edad" id="edad" value={formData.datosPersonales.edad} onChange={handleChange('datosPersonales', 'edad')} />
                    {errores.edad && <span className="error-text">{errores.edad}</span>}
                  </div>
                  <div className="col-4 col-12-xsmall">
                    <label htmlFor="genero">Género*</label>
                    <select name="genero" id="genero" value={formData.datosPersonales.genero} onChange={handleChange('datosPersonales', 'genero')} >
                      <option value="">Seleccione...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro/Prefiero no decir">Otro/Prefiero no decir</option>
                    </select>
                    {errores.genero && <span className="error-text">{errores.genero}</span>}
                  </div>
                  <div className="col-4 col-12-xsmall">
                    <label htmlFor="raza_etnia">Raza/Etnia</label>
                    <input type="text" name="raza_etnia" id="raza_etnia" value={formData.datosPersonales.raza_etnia} onChange={handleChange('datosPersonales', 'raza_etnia')} />
                  </div>
                  <div className="col-6 col-12-xsmall">
                    <label htmlFor="pais_id">País*</label>
                    <select name="pais_id" id="pais_id" value={formData.datosPersonales.pais_id} onChange={handleChange('datosPersonales', 'pais_id')}>
                      <option value="">Seleccione país...</option>
                      {paises.map(pais => (<option key={pais.id} value={pais.id}>{pais.nombre}</option>))}
                    </select>
                    {errores.pais_id && <span className="error-text">{errores.pais_id}</span>}
                  </div>
                  <div className="col-6 col-12-xsmall">
                    <label htmlFor="ciudad_id">Ciudad*</label>
                    <select name="ciudad_id" id="ciudad_id" value={formData.datosPersonales.ciudad_id} onChange={handleChange('datosPersonales', 'ciudad_id')} disabled={!formData.datosPersonales.pais_id || ciudades.length === 0}>
                      <option value="">Seleccione ciudad...</option>
                      {ciudades.map(ciudad => (<option key={ciudad.id} value={ciudad.id}>{ciudad.nombre}</option>))}
                    </select>
                    {errores.ciudad_id && <span className="error-text">{errores.ciudad_id}</span>}
                  </div>
                  <div className="col-12">
                    <label htmlFor="direccion">Dirección</label>
                    <input type="text" name="direccion" id="direccion" value={formData.datosPersonales.direccion} onChange={handleChange('datosPersonales', 'direccion')} />
                  </div>
                </div>
              </fieldset>

              {/* Sección 2: Antecedentes Médicos */}
              <fieldset className="form-section">
                <legend>2. Antecedentes Médicos</legend>
                <div className="row gtr-uniform">
                  <div className="col-12">
                    <label htmlFor="historial_familiar">¿Historial familiar de cataratas?*</label>
                    <select name="historial_familiar" id="historial_familiar" value={formData.antecedentes.historial_familiar} onChange={handleChange('antecedentes', 'historial_familiar')}>
                      <option value="">Seleccione...</option><option value="Sí">Sí</option><option value="No">No</option>
                    </select>
                    {errores.historial_familiar && <span className="error-text">{errores.historial_familiar}</span>}
                  </div>
                  <div className="col-12">
                    <label htmlFor="cirugias_oculares">Cirugías oculares previas (describa)</label>
                    <textarea name="cirugias_oculares" id="cirugias_oculares" value={formData.antecedentes.cirugias_oculares} onChange={handleChange('antecedentes', 'cirugias_oculares')} rows="3"></textarea>
                  </div>
                  <div className="col-12">
                    <label htmlFor="traumatismos_oculares">Traumatismos oculares (describa)</label>
                    <textarea name="traumatismos_oculares" id="traumatismos_oculares" value={formData.antecedentes.traumatismos_oculares} onChange={handleChange('antecedentes', 'traumatismos_oculares')} rows="3"></textarea>
                  </div>
                </div>
              </fieldset>

              {/* Sección 3: Síntomas Actuales */}
              <fieldset className="form-section">
                <legend>3. Síntomas Actuales</legend>
                <div className="row gtr-uniform">
                  <div className="col-6 col-12-xsmall">
                    <label htmlFor="vision_borrosa">¿Visión borrosa o nublada?*</label>
                    <select name="vision_borrosa" id="vision_borrosa" value={formData.sintomas.vision_borrosa} onChange={handleChange('sintomas', 'vision_borrosa')}>
                      <option value="">Seleccione...</option><option value="Sí">Sí</option><option value="No">No</option>
                    </select>
                    {errores.vision_borrosa && <span className="error-text">{errores.vision_borrosa}</span>}
                  </div>
                  <div className="col-6 col-12-xsmall">
                    <label htmlFor="intensidad_borrosa">Intensidad de visión borrosa (1-5)</label>
                    <input type="number" name="intensidad_borrosa" id="intensidad_borrosa" min="1" max="5" value={formData.sintomas.intensidad_borrosa} onChange={handleChange('sintomas', 'intensidad_borrosa')} disabled={formData.sintomas.vision_borrosa !== 'Sí'} />
                    {errores.intensidad_borrosa && <span className="error-text">{errores.intensidad_borrosa}</span>}
                  </div>
                  <div className="col-6 col-12-xsmall">
                    <label htmlFor="fotofobia">¿Experimenta fotofobia (sensibilidad a la luz)?*</label>
                    <select name="fotofobia" id="fotofobia" value={formData.sintomas.fotofobia} onChange={handleChange('sintomas', 'fotofobia')}>
                      <option value="">Seleccione...</option><option value="Sí">Sí</option><option value="No">No</option>
                    </select>
                    {errores.fotofobia && <span className="error-text">{errores.fotofobia}</span>}
                  </div>
                  <div className="col-6 col-12-xsmall">
                    <label htmlFor="dificultad_noche">¿Dificultad para ver de noche?*</label>
                    <select name="dificultad_noche" id="dificultad_noche" value={formData.sintomas.dificultad_noche} onChange={handleChange('sintomas', 'dificultad_noche')}>
                      <option value="">Seleccione...</option><option value="Sí">Sí</option><option value="No">No</option>
                    </select>
                    {errores.dificultad_noche && <span className="error-text">{errores.dificultad_noche}</span>}
                  </div>
                  <div className="col-6 col-12-xsmall">
                    <label htmlFor="cambios_lentes">¿Ha cambiado de lentes recientemente?</label>
                    <select name="cambios_lentes" id="cambios_lentes" value={formData.sintomas.cambios_lentes} onChange={handleChange('sintomas', 'cambios_lentes')}>
                      <option value="">Seleccione...</option><option value="Sí">Sí</option><option value="No">No</option>
                    </select>
                  </div>
                  <div className="col-6 col-12-xsmall">
                    <label htmlFor="vision_doble">¿Visión doble?</label>
                    <select name="vision_doble" id="vision_doble" value={formData.sintomas.vision_doble} onChange={handleChange('sintomas', 'vision_doble')}>
                      <option value="">Seleccione...</option><option value="Sí">Sí</option><option value="No">No</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label htmlFor="halos_luces">¿Ve halos alrededor de las luces?</label>
                    <select name="halos_luces" id="halos_luces" value={formData.sintomas.halos_luces} onChange={handleChange('sintomas', 'halos_luces')}>
                      <option value="">Seleccione...</option><option value="Sí">Sí</option><option value="No">No</option>
                    </select>
                  </div>
                  <div className="col-12">
                    <label htmlFor="otros_sintomas">Otros síntomas (describa)</label>
                    <textarea name="otros_sintomas" id="otros_sintomas" value={formData.sintomas.otros_sintomas} onChange={handleChange('sintomas', 'otros_sintomas')} rows="3"></textarea>
                  </div>
                </div>
              </fieldset>

              {/* Sección 4: Historial de Salud Ocular */}
              <fieldset className="form-section">
                <legend>4. Historial de Salud Ocular</legend>
                <div className="row gtr-uniform">
                  <div className="col-6 col-12-xsmall">
                    <label htmlFor="ultimo_examen">Fecha último examen ocular</label>
                    <input type="date" name="ultimo_examen" id="ultimo_examen" value={formData.historial.ultimo_examen} onChange={handleChange('historial', 'ultimo_examen')} />
                  </div>
                  <div className="col-6 col-12-xsmall">
                    <label htmlFor="uso_lentes">¿Usa lentes correctivos?*</label>
                    <select name="uso_lentes" id="uso_lentes" value={formData.historial.uso_lentes} onChange={handleChange('historial', 'uso_lentes')}>
                      <option value="">Seleccione...</option><option value="Sí">Sí</option><option value="No">No</option>
                    </select>
                    {errores.uso_lentes && <span className="error-text">{errores.uso_lentes}</span>}
                  </div>
                  <div className="col-12">
                    <label htmlFor="tipo_lentes">Tipo de lentes</label>
                    <select name="tipo_lentes" id="tipo_lentes" value={formData.historial.tipo_lentes} onChange={handleChange('historial', 'tipo_lentes')} disabled={formData.historial.uso_lentes !== 'Sí'}>
                      <option value="">Seleccione...</option><option value="Gafas">Gafas</option><option value="Lentes de contacto">Lentes de contacto</option><option value="Ambos">Ambos</option>
                    </select>
                    {errores.tipo_lentes && <span className="error-text">{errores.tipo_lentes}</span>}
                  </div>
                  <div className="col-12">
                    <label>Diagnósticos Anteriores (Seleccione los que apliquen):</label>
                    <div className="checkbox-group"> {/* Contenedor para mejor layout de checkboxes si es necesario */}
                      {diagnosticos.map(diag => ( // 'diagnosticos' es la lista de todos los diagnósticos disponibles
                        <div key={diag.id} className="col-4 col-6-small col-12-xsmall checkbox-option"> {/* Ajusta clases de columna según tu CSS */}
                          <input
                            type="checkbox"
                            id={`diag-${diag.id}`}
                            name={`diag-${diag.id}`} // Útil para algunas estrategias de forms, no crucial aquí
                            value={diag.id} // El valor es el ID del diagnóstico
                            // 'formData.historial.diagnosticos' es el array de IDs seleccionados
                            checked={formData.historial.diagnosticos.includes(diag.id)}
                            onChange={handleDiagnosticosChange}
                          />
                          <label htmlFor={`diag-${diag.id}`}>{diag.nombre}</label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Botones de Acción */}
              <ul className="actions special stacked" style={{ marginTop: '2.5em' }}>
                <li>
                  <button type="submit" className="button primary fit large">
                    Guardar y Continuar a Subir Fotografías
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="button fit large"
                    onClick={() => {
                      if (window.confirm('¿Está seguro que desea cancelar? Los datos no guardados se perderán.')) {
                        navigate('/dashboard-publico');
                      }
                    }}
                  >
                    Cancelar
                  </button>
                </li>
              </ul>
            </form>
          </div>
        </section>
      </article>

      {/* Footer */}
      <footer id="footer">
        <ul className="icons">
          {/* Estos enlaces son placeholders, actualízalos a tus redes sociales reales */}
          <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="icon brands fa-twitter"><span className="label">Twitter</span></a></li>
          <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="icon brands fa-facebook-f"><span className="label">Facebook</span></a></li>
          <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="icon brands fa-instagram"><span className="label">Instagram</span></a></li>
          <li><a href="mailto:info@example.com" className="icon solid fa-envelope"><span className="label">Email</span></a></li>
        </ul>
        <ul className="copyright">
          <li>© E-PAARVARI {new Date().getFullYear()}</li><li>Diseño: <a href="http://html5up.net" target="_blank" rel="noopener noreferrer">HTML5 UP</a></li>
        </ul>
      </footer>
    </div>
  );
};

export default RealizarEvaluacion;