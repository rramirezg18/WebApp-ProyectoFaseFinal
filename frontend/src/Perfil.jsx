import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Importar el hook
import './Perfil.css';

const Perfil = () => {
  const navigate = useNavigate(); // 2. Inicializar el hook
  const [formData, setFormData] = useState({
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    telefono: ''
  });

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No hay token disponible');
          return;
        }

        const response = await fetch('/api/perfil', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Error obteniendo perfil');

        const data = await response.json();
        if (data) setFormData(data);

      } catch (error) {
        console.error('Error obteniendo perfil:', error);
      }
    };

    fetchPerfil();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token'); // Obtener token del localStorage
      const response = await fetch('/api/perfil', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Añadir header de autorización
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Error guardando perfil');
      alert('Perfil actualizado exitosamente!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="perfil-container">
      <h2>Mi Perfil</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Primer Nombre:</label>
          <input
            type="text"
            name="primer_nombre"
            value={formData.primer_nombre}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Segundo Nombre:</label>
          <input
            type="text"
            name="segundo_nombre"
            value={formData.segundo_nombre}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Primer Apellido:</label>
          <input
            type="text"
            name="primer_apellido"
            value={formData.primer_apellido}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Segundo Apellido:</label>
          <input
            type="text"
            name="segundo_apellido"
            value={formData.segundo_apellido}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Teléfono:</label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            pattern="[0-9]{8,15}"
          />
        </div>

        <button type="submit">Guardar Perfil</button>
      </form>
        <button
          onClick={() => navigate('/dashboard-publico')}
          className="btn-volver"
        >
          ← Volver al Inicio
        </button>

    </div>
  );
};

export default Perfil;