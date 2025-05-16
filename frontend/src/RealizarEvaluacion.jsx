import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const RealizarEvaluacion = () => {
  const navigate = useNavigate();
  const [paises, setPaises] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [diagnosticos, setDiagnosticos] = useState([]);


  // Estado inicial del formulario
  const [formData, setFormData] = useState({
    // Datos Personales
    datosPersonales: {
      primer_nombre: '',
      segundo_nombre: '',
      primer_apellido: '',
      segundo_apellido: '',
      edad: '',
      genero: '',
      ciudad_id: '',
      direccion: '',
      raza_etnia: ''
    },

    // Antecedentes Médicos
    antecedentes: {
      historial_familiar: '',
      cirugias_oculares: '',
      traumatismos_oculares: ''
    },

    // Síntomas Actuales
    sintomas: {
      vision_borrosa: '',
      intensidad_borrosa: '',
      fotofobia: '',
      dificultad_noche: '',
      cambios_lentes: '',
      vision_doble: '',
      halos_luces: '',
      otros_sintomas: ''
    },

    // Historial de Salud
    historial: {
      ultimo_examen: '',
      uso_lentes: '',
      tipo_lentes: '',
      diagnosticos: []
    }
  });

  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState(null);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [paisesRes, diagnosticosRes] = await Promise.all([
          axios.get('http://localhost:5000/api/paises'),
          axios.get('/api/diagnosticos')
        ]);

        // Debug: Imprime la respuesta de la API
        console.log('Respuesta de /api/paises:', paisesRes.data);

        if (!Array.isArray(paisesRes.data)) {
          throw new Error(`Formato inválido. Se recibió: ${typeof paisesRes.data}`);
        }

        setPaises(paisesRes.data);
        setDiagnosticos(diagnosticosRes.data);
        setErrorCarga(null);
      } catch (error) {
        setErrorCarga(error.message);
      } finally {
        setCargando(false);
      }
    };
    cargarDatos();
  }, []);

  // Cargar ciudades cuando se selecciona país
  useEffect(() => {
    if (formData.datosPersonales.pais_id) {
      axios.get(`http://localhost:5000/api/paises/${formData.datosPersonales.pais_id}/ciudades`)
        .then(res => {
          console.log('Ciudades recibidas:', res.data); // ← Añade este log
          setCiudades(res.data);
        })
        .catch(error => {
          console.error('Error cargando ciudades:', error.response?.data);
          setCiudades([]);
        });
    }
  }, [formData.datosPersonales.pais_id]);

  // Manejador de cambios genérico
  const handleChange = (seccion, campo) => (e) => {
    setFormData(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion],
        [campo]: e.target.value
      }
    }));
  };

  // Validación de campos obligatorios
  const validarFormulario = () => {
    const nuevosErrores = {};

    // Validación de datos personales
    const camposPersonalesRequeridos = {
      primer_nombre: 'Primer nombre es requerido',
      primer_apellido: 'Primer apellido es requerido',
      edad: 'Edad inválida',
      ciudad_id: 'Seleccione una ciudad',
      genero: 'Seleccione género'
    };

    Object.entries(camposPersonalesRequeridos).forEach(([campo, mensaje]) => {
      if (!formData.datosPersonales[campo]?.toString().trim()) {
        nuevosErrores[campo] = mensaje;
      }
    });

    // Validación de antecedentes médicos
    if (!formData.antecedentes.historial_familiar) {
      nuevosErrores.historial_familiar = 'Campo obligatorio';
    }

    // Validación de síntomas
    const sintomasRequeridos = {
      vision_borrosa: 'Campo obligatorio',
      fotofobia: 'Campo obligatorio',
      dificultad_noche: 'Campo obligatorio'
    };

    Object.entries(sintomasRequeridos).forEach(([campo, mensaje]) => {
      if (!formData.sintomas[campo]) {
        nuevosErrores[campo] = mensaje;
      }
    });

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // Enviar formulario
  // En el handleSubmit, modifica el payload:
  // Enviar formulario
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validarFormulario()) return;

  // Crear payload con estructura específica
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
    await axios.post('/api/evaluaciones', payload);
    alert('Evaluación guardada exitosamente!');
    navigate('/subir-fotografias');
  } catch (error) {
    console.error('Error detallado:', error.response?.data);
    alert('Error al guardar: ' + (error.response?.data?.details || 'Error desconocido'));
  }
};
  return (
    <div className="form-container">
      {cargando ? (
        <p>Cargando formulario...</p>
      ) : errorCarga ? (
        <div className="error-message">
          Error al cargar datos: {errorCarga}
        </div>
      ) : (
        <>
          <h2>Autoevaluación de Cataratas</h2>

          <form onSubmit={handleSubmit}>
            {/* Sección: Datos Personales */}
            <fieldset>
              <legend>Datos Personales</legend>

              <div className="form-group">
                <label>Primer Nombre*</label>
                <input
                  value={formData.datosPersonales.primer_nombre}
                  onChange={handleChange('datosPersonales', 'primer_nombre')}
                />
                {errores.primer_nombre && <span className="error">{errores.primer_nombre}</span>}
              </div>
              <div className="form-group">
                <label>Segundo Nombre</label>
                <input
                  value={formData.datosPersonales.segundo_nombre}
                  onChange={handleChange('datosPersonales', 'segundo_nombre')}
                />
              </div>
              <div className="form-group">
                <label>Primer Apellido</label>
                <input
                  value={formData.datosPersonales.primer_apellido}
                  onChange={handleChange('datosPersonales', 'primer_apellido')}
                />
              </div>
              <div className="form-group">
                <label>Segundo Apellido</label>
                <input
                  value={formData.datosPersonales.segundo_apellido}
                  onChange={handleChange('datosPersonales', 'segundo_apellido')}
                />
              </div>

              <div className="form-group">
                <label>Edad*</label>
                <input
                  type="number"
                  value={formData.datosPersonales.edad}
                  onChange={handleChange('datosPersonales', 'edad')}
                />
                {errores.edad && <span className="error">{errores.edad}</span>}
              </div>

              <div className="form-group">
                <label>Género</label>
                <select
                  value={formData.datosPersonales.genero}
                  onChange={handleChange('datosPersonales', 'genero')}
                  required
                >
                  <option value="">Seleccione</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro/Prefiero no decir">Otro/Prefiero no decir</option>
                </select>
              </div>

              <div className="form-group">
                <label>Dirección</label>
                <input
                  value={formData.datosPersonales.direccion}
                  onChange={handleChange('datosPersonales', 'direccion')}
                />
              </div>

              <div className="form-group">
                <label>Raza/Etnia</label>
                <input
                  value={formData.datosPersonales.raza_etnia}
                  onChange={handleChange('datosPersonales', 'raza_etnia')}
                />
              </div>


              {/* Selector de País y Ciudad */}
              <div className="form-group">
                <label>País*</label>
                <select
                  value={formData.datosPersonales.pais_id}
                  onChange={handleChange('datosPersonales', 'pais_id')}
                >
                  <option value="">Seleccione país</option>
                  {Array.isArray(paises) && paises.map(pais => (
                    <option key={pais.id} value={pais.id}>{pais.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Ciudad*</label>
                <select
                  value={formData.datosPersonales.ciudad_id}
                  onChange={handleChange('datosPersonales', 'ciudad_id')}
                  disabled={!formData.datosPersonales.pais_id}
                >
                  <option value="">Seleccione ciudad</option>
                  {ciudades.map(ciudad => (
                    <option key={ciudad.id} value={ciudad.id}>{ciudad.nombre}</option>
                  ))}
                </select>
                {errores.ciudad && <span className="error">{errores.ciudad}</span>}
              </div>

              {/* ... Agrega más campos según el modelo ... */}
            </fieldset>

            {/* Sección: Síntomas Actuales */}
            <fieldset>
              <legend>Síntomas Actuales</legend>

              {/* Dentro del fieldset de Síntomas Actuales */}
              <div className="form-group">
                <label>¿Visión borrosa o nublada?*</label>
                <select
                  value={formData.sintomas.vision_borrosa}
                  onChange={handleChange('sintomas', 'vision_borrosa')}
                  required
                >
                  <option value="">Seleccione</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
                {errores.vision_borrosa && <span className="error">{errores.vision_borrosa}</span>}
              </div>

              <div className="form-group">
                <label>Intensidad de visión borrosa (1-5)*</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.sintomas.intensidad_borrosa}
                  onChange={handleChange('sintomas', 'intensidad_borrosa')}
                  required
                />
              </div>

              <div className="form-group">
                <label>¿Experimenta fotofobia?*</label>
                <select
                  value={formData.sintomas.fotofobia}
                  onChange={handleChange('sintomas', 'fotofobia')}
                  required
                >
                  <option value="">Seleccione</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="form-group">
                <label>¿Dificultad para ver de noche?*</label>
                <select
                  value={formData.sintomas.dificultad_noche}
                  onChange={handleChange('sintomas', 'dificultad_noche')}
                  required
                >
                  <option value="">Seleccione</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="form-group">
                <label>¿Ha cambiado de lentes recientemente?</label>
                <select
                  value={formData.sintomas.cambios_lentes}
                  onChange={handleChange('sintomas', 'cambios_lentes')}
                >
                  <option value="">Seleccione</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="form-group">
                <label>¿Visión doble?</label>
                <select
                  value={formData.sintomas.vision_doble}
                  onChange={handleChange('sintomas', 'vision_doble')}
                >
                  <option value="">Seleccione</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="form-group">
                <label>¿Ve halos alrededor de las luces?</label>
                <select
                  value={formData.sintomas.halos_luces}
                  onChange={handleChange('sintomas', 'halos_luces')}
                >
                  <option value="">Seleccione</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="form-group">
                <label>Otros síntomas (describa)</label>
                <textarea
                  value={formData.sintomas.otros_sintomas}
                  onChange={handleChange('sintomas', 'otros_sintomas')}
                  rows="3"
                />
              </div>

              {/* ... Agrega más campos según el modelo ... */}
            </fieldset>

            <fieldset>
              <legend>Diagnósticos Anteriores</legend>
              <div className="form-group">
                <label>Seleccione diagnósticos:</label>
                {diagnosticos.map(diagnostico => (
                  <div key={diagnostico.id}>
                    <label>
                      <input
                        type="checkbox"
                        value={diagnostico.id}
                        checked={formData.historial.diagnosticos.includes(diagnostico.id)}
                        onChange={(e) => {
                          const nuevosDiagnosticos = e.target.checked
                            ? [...formData.historial.diagnosticos, parseInt(e.target.value)]
                            : formData.historial.diagnosticos.filter(id => id !== parseInt(e.target.value));

                          setFormData(prev => ({
                            ...prev,
                            historial: {
                              ...prev.historial,
                              diagnosticos: nuevosDiagnosticos
                            }
                          }));
                        }}
                      />
                      {diagnostico.nombre}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>

            {/* Sección: Antecedentes Médicos */}
            <fieldset>
              <legend>Antecedentes Médicos</legend>

              <div className="form-group">
                <label>¿Historial familiar de cataratas?*</label>
                <select
                  value={formData.antecedentes.historial_familiar}
                  onChange={handleChange('antecedentes', 'historial_familiar')}
                  required
                >
                  <option value="">Seleccione</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="form-group">
                <label>Cirugías oculares previas</label>
                <textarea
                  value={formData.antecedentes.cirugias_oculares}
                  onChange={handleChange('antecedentes', 'cirugias_oculares')}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Traumatismos oculares</label>
                <textarea
                  value={formData.antecedentes.traumatismos_oculares}
                  onChange={handleChange('antecedentes', 'traumatismos_oculares')}
                  rows="3"
                />
              </div>
            </fieldset>

            {/* Sección: Historial de Salud */}
            <fieldset>
              <legend>Historial de Salud Ocular</legend>

              <div className="form-group">
                <label>Fecha último examen ocular</label>
                <input
                  type="date"
                  value={formData.historial.ultimo_examen}
                  onChange={handleChange('historial', 'ultimo_examen')}
                />
              </div>

              <div className="form-group">
                <label>¿Usa lentes correctivos?*</label>
                <select
                  value={formData.historial.uso_lentes}
                  onChange={handleChange('historial', 'uso_lentes')}
                  required
                >
                  <option value="">Seleccione</option>
                  <option value="Sí">Sí</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="form-group">
                <label>Tipo de lentes</label>
                <select
                  value={formData.historial.tipo_lentes}
                  onChange={handleChange('historial', 'tipo_lentes')}
                  disabled={formData.historial.uso_lentes !== 'Sí'}
                >
                  <option value="">Seleccione</option>
                  <option value="Gafas">Gafas</option>
                  <option value="Lentes de contacto">Lentes de contacto</option>
                  <option value="Ambos">Ambos</option>
                </select>
              </div>
            </fieldset>


            {/* Botones de acción */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Seguro que desea cancelar?')) {
                    navigate('/dashboard-publico');
                  }
                }}
              >
                Cancelar
              </button>

              <button type="submit">
                Guardar y Continuar
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default RealizarEvaluacion;