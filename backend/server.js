const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const multer = require('multer');
const path = require('path');
app.use('/uploads', express.static('uploads')); // Servir archivos estáticos



app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  '/uploads',
  (req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET'); // Añade esto
    next();
  },
  express.static('uploads')
);


const SECRET_KEY = 'tu_clave_secreta_super_segura_123!';

// Configuración de la base de datos (sin cambios)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'MiRootPass123',
  database: 'db_webApp',
  port: 3306,
  waitForConnections: true,
});


// Middleware de autenticación (agregar después de la configuración de la BD)
const authenticate = async (req, res, next) => {
  const token = req.cookies.token ||
    req.headers.authorization?.split(' ')[1] ||
    req.headers['authorization']?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Acceso no autorizado' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = { id: decoded.userId, role: decoded.role };
    next();
  } catch (error) {
    console.error('Error de autenticación:', error.message);
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};


// Configurar almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Crear esta carpeta en el proyecto
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `evaluacion-${req.params.id}-${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Filtro para solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (JPEG/PNG)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite 5MB
});


const { generatePDF } = require('./pdfGenerator');
const UPLOADS_PATH = path.join(__dirname, 'uploads');

app.post('/api/resultados', authenticate, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('SET SESSION sql_mode = ""'); // Deshabilitar ONLY_FULL_GROUP_BY

    const { evaluacionId, severidad, descripcion } = req.body;

    // 1. Validar datos de entrada
    if (!evaluacionId || !severidad || !descripcion) {
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    // 2. Consulta SQL con validación de tablas
    const [evaluacion] = await connection.query(`
      SELECT 
        e.id,
        e.primer_nombre,
        e.segundo_nombre,
        e.primer_apellido,
        e.segundo_apellido,
        e.edad,
        e.genero,
        e.direccion,
        e.raza_etnia,
        ciu.nombre AS ciudad,
        pai.nombre AS pais,
        a.historial_familiar,
        a.cirugias_oculares,
        a.traumatismos_oculares,
        s.vision_borrosa,
        s.intensidad_borrosa,
        s.fotofobia,
        s.dificultad_noche,
        s.cambios_lentes,
        s.vision_doble,
        s.halos_luces,
        s.otros_sintomas,
        h.ultimo_examen,
        h.uso_lentes,
        h.tipo_lentes,
        GROUP_CONCAT(d.nombre SEPARATOR ', ') AS diagnosticos
      FROM evaluaciones e
      LEFT JOIN antecedentes_medicos a ON e.id = a.evaluacion_id
      LEFT JOIN sintomas_actuales s ON e.id = s.evaluacion_id
      LEFT JOIN historial_salud h ON e.id = h.evaluacion_id
      LEFT JOIN evaluacion_diagnosticos ed ON e.id = ed.evaluacion_id
      LEFT JOIN diagnosticos d ON ed.diagnostico_id = d.id
      LEFT JOIN ciudades ciu ON e.ciudad_id = ciu.id
      LEFT JOIN paises pai ON ciu.pais_id = pai.id
      WHERE e.id = ?
      GROUP BY e.id`, [evaluacionId]
    );

    if (evaluacion.length === 0) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }

    // 3. Procesar fotos
    const [fotos] = await connection.query(
      'SELECT tipo, url_imagen FROM fotografias WHERE evaluacion_id = ?',
      [evaluacionId]
    );

    const fotosObj = fotos.reduce((acc, foto) => ({
      ...acc,
      [foto.tipo]: foto.url_imagen?.split('/').pop() || ''
    }), {});

    // 4. Generar PDF
    const pdfFileName = await generatePDF(
      evaluacion[0],
      fotosObj,
      { severidad, descripcion },
      UPLOADS_PATH
    );

    // 5. Insertar resultado en la base de datos
    const [result] = await connection.query(
      `INSERT INTO resultados 
      (evaluacion_id, severidad, descripcion, pdf_path) 
      VALUES (?, ?, ?, ?)`,
      [evaluacionId, severidad, descripcion, pdfFileName]
    );

    await connection.query(
      `UPDATE evaluaciones 
      SET resultado_id = ?
      WHERE id = ?`,
      [result.insertId, evaluacionId]
    );

    await connection.commit();

    res.json({
      success: true,
      pdfUrl: `/uploads/${pdfFileName}`
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error en /api/resultados:', { // ← Log detallado
      message: error.message,
      stack: error.stack,
      body: req.body
    });
    res.status(500).json({
      success: false,
      error: 'Error procesando análisis',
      details: error.message // Solo en desarrollo
    });
  } finally {
    connection.release();
  }
});


// Endpoint para subir fotos - Versión corregida
app.post('/api/evaluaciones/:id/fotografias', authenticate, upload.fields([
  { name: 'ojo_izquierdo', maxCount: 1 },
  { name: 'ojo_derecho', maxCount: 1 }
]), async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Verificar permisos
    const [evaluacion] = await connection.query(
      `SELECT e.id 
       FROM evaluaciones e
       JOIN perfiles p ON e.perfil_id = p.perfil_id
       WHERE p.user_id = ? AND e.id = ?`,
      [req.user.id, req.params.id]
    );

    if (evaluacion.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para esta evaluación'
      });
    }

    const evaluacionId = evaluacion[0].id;

    // 2. Función para procesar cada ojo
    const procesarOjo = async (tipo) => {
      try {
        if (!req.files?.[tipo]) return null;

        const file = req.files[tipo][0];
        const [existente] = await connection.query(
          'SELECT id FROM fotografias WHERE evaluacion_id = ? AND tipo = ?',
          [evaluacionId, tipo]
        );

        // Actualizar o insertar registro
        if (existente.length > 0) {
          await connection.query(
            'UPDATE fotografias SET url_imagen = ? WHERE id = ?',
            [file.filename, existente[0].id]
          );
        } else {
          await connection.query(
            'INSERT INTO fotografias (evaluacion_id, url_imagen, tipo) VALUES (?, ?, ?)',
            [evaluacionId, file.filename, tipo]
          );
        }

        return `http://localhost:5000/uploads/${file.filename}`;
      } catch (error) {
        console.error(`Error procesando ${tipo}:`, error);
        throw error;
      }
    };

    // 3. Procesar ambos ojos
    const resultados = {
      ojo_izquierdo: await procesarOjo('ojo_izquierdo'),
      ojo_derecho: await procesarOjo('ojo_derecho')
    };

    await connection.commit();

    // 4. Construir respuesta detallada
    const responseData = {
      success: true,
      message: 'Fotos actualizadas correctamente',
      fotos: [
        {
          tipo: 'ojo_izquierdo',
          url: resultados.ojo_izquierdo || null,
          status: resultados.ojo_izquierdo ? 'success' : 'no_changes'
        },
        {
          tipo: 'ojo_derecho',
          url: resultados.ojo_derecho || null,
          status: resultados.ojo_derecho ? 'success' : 'no_changes'
        }
      ]
    };

    res.status(200).json(responseData);

  } catch (error) {
    await connection.rollback();
    console.error('Error en subida de fotos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  } finally {
    connection.release();
  }
});




app.get('/api/evaluaciones/:id/fotografias', authenticate, async (req, res) => {
  try {
    const [fotos] = await pool.query(
      'SELECT tipo, url_imagen FROM fotografias WHERE evaluacion_id = ?',
      [req.params.id]
    );

    // Convertir array a objeto { ojo_izquierdo: url, ojo_derecho: url }
    const fotosObj = fotos.reduce((acc, foto) => {
      acc[foto.tipo] = `http://localhost:5000/uploads/${foto.url_imagen}`;
      return acc;
    }, {});

    res.json(fotosObj);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo fotografías' });
  }
});






app.get('/api/evaluaciones/:id', authenticate, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [evaluacion] = await connection.query(
      `SELECT 
        e.*,
        a.historial_familiar, 
        a.cirugias_oculares, 
        a.traumatismos_oculares,
        s.vision_borrosa, 
        s.intensidad_borrosa, 
        s.fotofobia, 
        s.dificultad_noche,
        h.ultimo_examen, 
        h.uso_lentes, 
        h.tipo_lentes,
        r.severidad, 
        r.descripcion as resultado_descripcion,
        r.pdf_path
      FROM evaluaciones e
      LEFT JOIN antecedentes_medicos a ON e.id = a.evaluacion_id
      LEFT JOIN sintomas_actuales s ON e.id = s.evaluacion_id
      LEFT JOIN historial_salud h ON e.id = h.evaluacion_id
      LEFT JOIN resultados r ON e.resultado_id = r.id
      WHERE e.id = ?`,
      [req.params.id]
    );

    if (evaluacion.length === 0) {
      return res.status(404).json({ error: 'Evaluación no encontrada' });
    }

    // Formatear datos para incluir valores por defecto
    const evaluacionData = {
      ...evaluacion[0],
      severidad: evaluacion[0].severidad || 'No analizado',
      resultado_descripcion: evaluacion[0].resultado_descripcion || 'Análisis pendiente',
      pdf_path: evaluacion[0].pdf_path || null
    };

    await connection.commit();
    res.json(evaluacionData);

  } catch (error) {
    await connection.rollback();
    console.error('Error en GET evaluación:', error);
    res.status(500).json({
      error: 'Error obteniendo evaluación',
      details: error.message
    });
  } finally {
    connection.release();
  }
});













// Modificar endpoint de login
app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, role]
    );

    if (rows.length === 0) return res.status(400).json({ error: 'Usuario no encontrado o rol incorrecto' });

    const validPassword = await bcrypt.compare(password, rows[0].password);
    if (!validPassword) return res.status(400).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { userId: rows[0].id, role: rows[0].role },
      SECRET_KEY,
      { expiresIn: '4h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // Cambiar a false para desarrollo local
      sameSite: 'Lax', // Cambiar de 'strict' a 'Lax'
      maxAge: 7200000 // 2 horas en milisegundos
    });

    res.json({
      message: 'Login exitoso',
      role: rows[0].role,
      userId: rows[0].id,
      token: token  // <-- Esta línea es crucial
    });

  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Agregar endpoints de perfil
app.get('/api/perfil', authenticate, async (req, res) => {
  try {
    const [perfil] = await pool.query(
      'SELECT * FROM perfiles WHERE user_id = ?',
      [req.user.id]
    );

    if (perfil.length === 0) return res.json({});
    res.json(perfil[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo perfil' });
  }
});

app.post('/api/perfil', authenticate, async (req, res) => {
  try {
    const { primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono } = req.body;

    await pool.query(
      `INSERT INTO perfiles 
        (user_id, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        primer_nombre = VALUES(primer_nombre),
        segundo_nombre = VALUES(segundo_nombre),
        primer_apellido = VALUES(primer_apellido),
        segundo_apellido = VALUES(segundo_apellido),
        telefono = VALUES(telefono)`,
      [req.user.id, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, telefono]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error guardando perfil:', error);
    res.status(500).json({ error: 'Error guardando perfil' });
  }
});


// Endpoint de registro
app.post('/api/register', async (req, res) => {
  const { email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );
    res.json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    res.status(400).json({ error: 'El correo ya está registrado' });
  }
});


// Obtener ciudades por país
app.get('/api/paises', async (req, res) => {
  try {
    const [paises] = await pool.query('SELECT * FROM paises');
    res.json(paises);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener países',
      details: error.message
    });
  }
});

app.get('/api/paises/:paisId/ciudades', async (req, res) => {
  try {
    const [ciudades] = await pool.query(
      'SELECT * FROM ciudades WHERE pais_id = ?',
      [req.params.paisId] // ← Asegúrate de usar "paisId"
    );
    console.log('Ciudades consultadas:', ciudades); // ← Añade este log
    res.json(ciudades);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener ciudades',
      details: error.message
    });
  }
});

// Obtener todos los diagnósticos
app.get('/api/diagnosticos', async (req, res) => {
  try {
    const [diagnosticos] = await pool.query('SELECT * FROM diagnosticos');
    res.json(diagnosticos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener diagnósticos' });
  }
});

// Guardar evaluación completa
app.post('/api/evaluaciones', authenticate, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Obtener perfil_id del usuario autenticado
    const [perfil] = await connection.query(
      'SELECT perfil_id FROM perfiles WHERE user_id = ?',
      [req.user.id]
    );

    if (perfil.length === 0) {
      throw new Error('Perfil no encontrado');
    }

    const perfil_id = perfil[0].perfil_id;

    // 1. Insertar datos personales CON perfil_id
    const datosEvaluacion = {
      ...req.body.datosPersonales,
      perfil_id // ← Añadir el perfil_id
    };

    const [resultEvaluacion] = await connection.query(
      'INSERT INTO evaluaciones SET ?',
      [datosEvaluacion]
    );

    const evaluacionId = resultEvaluacion.insertId;

    // 2. Insertar antecedentes médicos
    await connection.query(
      'INSERT INTO antecedentes_medicos SET ?',
      { evaluacion_id: evaluacionId, ...req.body.antecedentes }
    );

    // 3. Insertar síntomas actuales
    await connection.query(
      'INSERT INTO sintomas_actuales SET ?',
      { evaluacion_id: evaluacionId, ...req.body.sintomas }
    );

    // 4. Insertar historial de salud
    // Separamos diagnosticos del resto de campos de historial
    const { diagnosticos, ...historialDatos } = req.body.historial || {};
    await connection.query(
      'INSERT INTO historial_salud SET ?',
      { evaluacion_id: evaluacionId, ...historialDatos }
    );

    // 5. Insertar diagnósticos en la tabla de relación
    // Usamos el array que recibimos en req.body.diagnosticos (payload)
    if (Array.isArray(req.body.diagnosticos) && req.body.diagnosticos.length > 0) {
      const values = req.body.diagnosticos.map(d => [evaluacionId, d]);
      await connection.query(
        'INSERT INTO evaluacion_diagnosticos (evaluacion_id, diagnostico_id) VALUES ?',
        [values]
      );
    }

    await connection.commit();
    res.json({ success: true, evaluacionId });

  } catch (error) {
    await connection.rollback();
    console.error('Error en transacción:', error);
    res.status(500).json({
      error: 'Error al guardar evaluación',
      details: error.message
    });
  } finally {
    connection.release();
  }
});


app.listen(5000, () => {
  console.log('🚀 Servidor backend corriendo en puerto 5000');
});