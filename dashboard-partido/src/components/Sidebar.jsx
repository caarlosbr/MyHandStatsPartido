// src/components/SidebarCollapsible.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Icon,
  Text,
  VStack,
  Divider,
  useColorModeValue,
  useBreakpointValue,
  HStack,
  IconButton,
  Avatar,
  Spinner,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  FaHome,
  FaUsers,
  FaSignOutAlt,
  FaUserCircle,
  FaBars,
  FaArrowLeft,
} from 'react-icons/fa';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  // breakpoint: móvil (<md) → '0px'; desktop (>=md) → '260px'
  const baseSidebarWidth = useBreakpointValue({ base: '0px', md: '260px' });
  const sidebarWidth =
    baseSidebarWidth === '0px'
      ? '0px'
      : isCollapsed
      ? '50px'
      : '260px';

  const bgCard        = useColorModeValue('white',    'gray.900');
  const shadowCard    = useColorModeValue('xl',       'dark-lg');
  const textPrimary   = useColorModeValue('gray.800', 'gray.100');
  const textSecondary = useColorModeValue('gray.500', 'gray.400');
  const hoverBg       = useColorModeValue('gray.100', 'gray.700');
  const activeBg      = useColorModeValue('teal.50',  'teal.800');
  const accentColor   = useColorModeValue('teal.500','teal.300');
  const iconBg        = useColorModeValue('gray.100','gray.700');
  const iconBgActive  = useColorModeValue('teal.100','teal.900');
  const borderColor   = useColorModeValue('gray.200','gray.700');

  const IconMotion = motion(Icon);

  const menuItems = [
    { label: 'Seleccionar Equipo', icon: FaHome, to: '/seleccionar-equipo' },
    { label: 'Jugadores',         icon: FaUsers, to: '/jugadores' },
  ];

  // ===============================
  // useEffect para cargar perfil
  // ===============================
  useEffect(() => {
    // Si estoy en Login ("/") o en Registrar ("/registrar"), NO intento fetch ni redirect
    if (location.pathname === '/' || location.pathname === '/registrar') {
      setLoadingUser(false);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      // Si no hay token y NO estoy ya en "/", redirijo a login
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
      setLoadingUser(false);
      return;
    }

    // Tengo token y no estoy en rutas públicas: intento cargar perfil
    fetch('https://myhandstats.onrender.com/usuario/perfil', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          // Si devuelvo 401 ó 403, borro token y redirijo a "/"
          throw new Error('No autorizado');
        }
        return res.json();
      })
      .then((data) => {
        setUser({
          nombre: data.info.nombre,
          foto: data.info.foto,
        });
      })
      .catch((err) => {
        console.error('No se pudo cargar el perfil:', err);
        localStorage.removeItem('token');
        if (location.pathname !== '/') {
          navigate('/', { replace: true });
        }
      })
      .finally(() => {
        setLoadingUser(false);
      });
  }, [location.pathname, navigate]);

  return (
    <Box
      as="nav"
      position="fixed"
      top="0"
      left="0"
      h="100vh"
      w={sidebarWidth}
      bg={bgCard}
      boxShadow={shadowCard}
      borderRight={sidebarWidth === '260px' ? '1px solid' : 'none'}
      borderRightColor={borderColor}
      overflowY="auto"
      transition="width 0.2s"
      display={
        // Ocultamos por completo en móvil, o si estamos en "/" o "/registrar"
        baseSidebarWidth === '0px' ||
        location.pathname === '/' ||
        location.pathname === '/registrar'
          ? 'none'
          : 'block'
      }
      zIndex={1000}
    >
      {/* ─── BOTÓN DE COLLAPSE/EXPAND ─── */}
      <Flex justify={isCollapsed ? 'center' : 'flex-end'} p={2}>
        <IconButton
          aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          icon={isCollapsed ? <FaBars /> : <FaArrowLeft />}
          size="sm"
          fontSize="18px"
          color={useColorModeValue('gray.700', 'gray.200')}
          variant="ghost"
          onClick={() => setIsCollapsed((prev) => !prev)}
          _hover={{ bg: hoverBg }}
        />
      </Flex>

      <VStack align="stretch" spacing={4} mt={2} px={isCollapsed ? 0 : 2}>
        {/* ─── AVATAR + NOMBRE ─── */}
        <Flex
          align="center"
          flexDirection="column"
          mb={2}
          px={isCollapsed ? 0 : 4}
        >
          {loadingUser ? (
            <Spinner size="lg" color={accentColor} />
          ) : (
            <>
              {user?.foto ? (
                <Avatar
                  size={isCollapsed ? 'md' : 'xl'}
                  src={user.foto}
                  name={user.nombre}
                />
              ) : (
                <Avatar
                  size={isCollapsed ? 'md' : 'xl'}
                  icon={<FaUserCircle />}
                  bg={accentColor}
                />
              )}
              {!isCollapsed && (
                <Text mt={2} fontSize="lg" fontWeight="bold" color={textPrimary}>
                  {user?.nombre || 'Nombre Desconocido'}
                </Text>
              )}
            </>
          )}
        </Flex>

        <Divider borderColor={borderColor} />

        {/* ─── ÍTEMS PRINCIPALES ─── */}
        <VStack align="stretch" spacing={1}>
          {menuItems.map((item) => (
            <Box key={item.label} px={isCollapsed ? 0 : 2}>
              <NavLink to={item.to} style={{ textDecoration: 'none' }} end>
                {({ isActive }) => (
                  <HStack
                    w="100%"
                    spacing={isCollapsed ? 0 : 3}
                    px={isCollapsed ? 0 : 3}
                    py={2}
                    borderRadius="md"
                    bg={isActive ? activeBg : 'transparent'}
                    _hover={{ bg: hoverBg }}
                    borderLeftWidth={isActive ? '4px' : '4px'}
                    borderLeftColor={isActive ? accentColor : 'transparent'}
                    justify={isCollapsed ? 'center' : 'flex-start'}
                    cursor="pointer"
                  >
                    <Box
                      bg={isActive ? iconBgActive : iconBg}
                      p={2}
                      borderRadius="full"
                    >
                      <IconMotion
                        as={item.icon}
                        boxSize={5}
                        color={isActive ? accentColor : textSecondary}
                        whileHover={{ scale: isCollapsed ? 1 : 1.1 }}
                        transition={{ duration: 0.2 }}
                      />
                    </Box>
                    {!isCollapsed && (
                      <Text fontSize="md" fontWeight="medium" color={textPrimary}>
                        {item.label}
                      </Text>
                    )}
                  </HStack>
                )}
              </NavLink>
            </Box>
          ))}
        </VStack>

        {/* ─── SECCIÓN “CUENTA / CERRAR SESIÓN” ─── */}
        <Box mt={6} px={isCollapsed ? 0 : 2}>
          <Divider borderColor={borderColor} />
          <VStack align="stretch" spacing={2} mt={3}>
            {/* Perfil (opcional) */}
            <NavLink to="/perfil" style={{ textDecoration: 'none' }} end>
              {({ isActive }) => (
                <HStack
                  w="100%"
                  spacing={isCollapsed ? 0 : 3}
                  px={isCollapsed ? 0 : 3}
                  py={2}
                  borderRadius="md"
                  bg={isActive ? activeBg : 'transparent'}
                  _hover={{ bg: hoverBg }}
                  borderLeftWidth={isActive ? '4px' : '4px'}
                  borderLeftColor={isActive ? accentColor : 'transparent'}
                  justify={isCollapsed ? 'center' : 'flex-start'}
                  cursor="pointer"
                >
                  <Box
                    bg={isActive ? iconBgActive : iconBg}
                    p={2}
                    borderRadius="full"
                  >
                    <IconMotion
                      as={FaUsers}
                      boxSize={5}
                      color={isActive ? accentColor : textSecondary}
                      whileHover={{ scale: isCollapsed ? 1 : 1.1 }}
                      transition={{ duration: 0.2 }}
                    />
                  </Box>
                  {!isCollapsed && (
                    <Text fontSize="md" fontWeight="medium" color={textPrimary}>
                      Perfil
                    </Text>
                  )}
                </HStack>
              )}
            </NavLink>

            {/* Cerrar sesión */}
            <HStack
              w="100%"
              spacing={isCollapsed ? 0 : 3}
              px={isCollapsed ? 0 : 3}
              py={2}
              borderRadius="md"
              _hover={{ bg: hoverBg }}
              justify={isCollapsed ? 'center' : 'flex-start'}
              cursor="pointer"
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/', { replace: true });
              }}
            >
              <Box bg={iconBg} p={2} borderRadius="full">
                <IconMotion
                  as={FaSignOutAlt}
                  boxSize={5}
                  color={textSecondary}
                  whileHover={{ scale: isCollapsed ? 1 : 1.1 }}
                  transition={{ duration: 0.2 }}
                />
              </Box>
              {!isCollapsed && (
                <Text fontSize="md" fontWeight="medium" color={textPrimary}>
                  Cerrar sesión
                </Text>
              )}
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
};

export default Sidebar;
