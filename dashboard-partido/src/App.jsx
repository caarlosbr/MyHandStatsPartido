// Importaciones necesarias
import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Box, Flex } from '@chakra-ui/react';

import Sidebar from './components/Sidebar';
import Login from './views/Login';
import Registrar from './views/Registrar';
import SeleccionarEquipo from './views/SeleccionarEquipo';
import Jugadores from './views/Jugadores';
import DashboardPartido from './views/DashboardPartido';
import Perfil from './views/Perfil';

function App() {
  // Hook para obtener la ruta actual
  const location = useLocation();

  // Si la ruta es "/" o "/registrar", no mostramos el sidebar
  // En cualquier otra ruta mostramos el sidebar
  const mostrarSidebar = !(
    location.pathname === '/' ||
    location.pathname === '/registrar'
  );

  return (
    <Flex>
      {/*Si mostrarSidebar es true, renderizamos el Sidebar, si es false, nose se renderiza y el Login/Registrar ocuparán todo el ancho. */}
      {mostrarSidebar && <Sidebar />}

      {/* El contenido principal ocupa todo el espacio libre, cuando no hay sidebar, ocupará 100% del ancho.
         * Cuando si hay sidebar, se superpone por encima y no empuja nada.
         */}
      <Box flex="1" p={4} pl="50px">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/registrar" element={<Registrar />} />
          <Route path="/seleccionar-equipo" element={<SeleccionarEquipo />} />
          <Route path="/jugadores" element={<Jugadores />} />
          <Route path="/nuevo-partido" element={<DashboardPartido />} />
          <Route path="/perfil" element={<Perfil />} />
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
