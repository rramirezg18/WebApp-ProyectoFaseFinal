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
import SubirFotografias from './SubirFotografias';
import Analisis from './Analisis';
import './styles.css';

// main.jsx (versión corregida)
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      {/* Ruta pública */}
      <Route path="/dashboard-publico" element={<DashboardPublico />} />
      <Route path="/realizar-evaluacion" element={<RealizarEvaluacion />} />
      <Route path="/citas" element={<Citas />} />
      <Route path="/historial" element={<HistorialEvaluaciones />} />
      <Route path="/perfil" element={<Perfil />} />
      <Route path="/subir-fotografias" element={<SubirFotografias />} />

      {/* Ruta profesional */}
      <Route path="/dashboard-profesional" element={<DashboardProfesional />} />
      <Route path="/registrar-paciente" element={<RegistrarPaciente />} />
      <Route path="/evaluar-expediente" element={<EvaluarExpediente />} />

      <Route path="/analisis" element={<Analisis />} /> 


    </Routes>
  </BrowserRouter>
);