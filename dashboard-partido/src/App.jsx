// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';

import Sidebar from './components/Sidebar';
import Login from './views/Login';
import Registrar from './views/Registrar';
import SeleccionarEquipo from './views/SeleccionarEquipo';
import Jugadores from './views/Jugadores';
import DashboardPartido from './views/DashboardPartido';

function App() {
  // Hook para obtener la ruta actual
  const location = useLocation();

  // Si la ruta es "/" o "/registrar", devolvemos false => no mostramos el sidebar
  // En cualquier otra ruta devolvemos true => mostramos el sidebar
  const shouldShowSidebar = !(
    location.pathname === '/' ||
    location.pathname === '/registrar'
  );

  return (
    <Flex>
      {/**
         * Si shouldShowSidebar === true, renderizamos el SidebarCollapsible.
         * Si es false, NO se renderiza y el Login/Registrar ocuparán todo el ancho.
         */}
      {shouldShowSidebar && <Sidebar />}

      {/**
         * El contenido principal (cajas de ruta) ocupa todo el espacio libre.
         * Cuando no hay sidebar, <Box flex="1" p={4}> ocupará 100% del ancho.
         * Cuando sí hay sidebar, se "superpone" por encima y no empuja nada.
         */}
      <Box flex="1" p={4} pl="50px">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registrar" element={<Registrar />} />
          <Route path="/seleccionar-equipo" element={<SeleccionarEquipo />} />
          <Route path="/jugadores" element={<Jugadores />} />
          <Route path="/nuevo-partido" element={<DashboardPartido />} />
          {/**
             * Agrega aquí el resto de tus rutas, por ejemplo:
             * <Route path="/otra-vista" element={<OtraVista />} />
             */}
        </Routes>
      </Box>
    </Flex>
  );
}

// Para que useLocation() funcione, debemos envolver App dentro de BrowserRouter
export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
