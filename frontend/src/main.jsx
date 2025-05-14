import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import DashboardPublico from './DashboardPublico';
import DashboardProfesional from './DashboardProfesional';
import Citas from './Citas';
import RealizarEvaluacion from './RealizarEvaluacion';
import HistorialEvaluaciones from './HistorialEvaluaciones';
import Perfil from './Perfil';
import RegistrarPaciente from './RegistrarPaciente';
import EvaluarExpediente from './EvaluarExpediente';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      {/* Eliminar rutas anidadas */}
      <Route path="/dashboard-publico" element={<DashboardPublico />} />
      <Route path="/citas" element={<Citas />} />
      <Route path="/realizar-evaluacion" element={<RealizarEvaluacion />} />
      <Route path="/historial" element={<HistorialEvaluaciones />} />
      <Route path="/perfil" element={<Perfil />} />

      <Route path="/dashboard-profesional" element={<DashboardProfesional />} />
      <Route path="/registrar-paciente" element={<RegistrarPaciente />} />
      <Route path="/evaluar-expediente" element={<EvaluarExpediente />} />
      <Route path="/historial" element={<HistorialEvaluaciones />} />
      <Route path="/perfil" element={<Perfil />} />
    </Routes>
  </BrowserRouter>
);