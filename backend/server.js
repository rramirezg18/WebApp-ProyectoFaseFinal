const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(cookieParser());

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
      { expiresIn: '2h' }
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