const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(bodyParser.json());

// Configuración de la base de datos
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'MiRootPass123',
  database: 'db_webApp',
  port: 3306,
  waitForConnections: true,
});

// Verificar conexión a la BD
pool.getConnection()
  .then(conn => {
    console.log('✅ Conexión a MySQL establecida');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Error de conexión a MySQL:', err);
    process.exit(1);
  });

// Endpoint de login
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

    res.json({ message: 'Login exitoso', role: rows[0].role });

  } catch (error) {
    res.status(500).json({ error: 'Error del servidor' });
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
app.post('/api/evaluaciones', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Insertar datos personales
    const [resultEvaluacion] = await connection.query(
      'INSERT INTO evaluaciones SET ?',
      [req.body.datosPersonales]
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