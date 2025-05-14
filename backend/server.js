const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Origen de tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());

// Configuración de la base de datos
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // tu usuario de MySQL
  password: 'MiRootPass123', // tu contraseña
  database: 'db_webApp',
  port: 3306,
  waitForConnections: true,
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

app.listen(5000, () => {
  console.log('Servidor backend corriendo en puerto 5000');
});