import {
  Box,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
  Button,
  Flex,
  Icon,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';

const SeleccionEquipo = () => {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const token = localStorage.getItem('token');
  useEffect(() => {
    fetch('https://myhandstats.onrender.com/club/equipos', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener los equipos');
        return res.json();
      })
      .then((data) => {
        console.log('Datos recibidos de equipos:', data); 
        if (Array.isArray(data)) {
          setEquipos(data);
        } else {
          console.error('Respuesta inesperada:', data);
          setEquipos([]);
        }
      })
      .catch((err) => console.error('Error:', err))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSeleccion = (equipo) => {
    console.log('Equipo seleccionado:', equipo);
    localStorage.setItem('id_equipo', equipo.id);
    navigate('/nuevo-partido');
  };

  return (
    <Box p={6} minH="100vh" bg="white">
      {/* Sidebar desplegable */}
      <Sidebar isOpen={isOpen} onClose={onClose} />

      {/* Header con icono de menú y título */}
      <Flex justify="space-between" align="center" mb={6}>
        <Icon as={FaBars} boxSize={6} onClick={onOpen} cursor="pointer" />
        <Heading size="lg" color="#014C4C">Selecciona tu equipo</Heading>
        <Box w="6" />
      </Flex>

      {/* Contenido principal */}
      {loading ? (
        <Box textAlign="center" mt={10}>
          <Spinner size="xl" color="teal.600" />
        </Box>
      ) : (
        <SimpleGrid columns={[1, 2, 3]} spacing={6}>
          {equipos.map((equipo) => (
            <Box
              key={equipo.id}
              p={6}
              borderWidth="1px"
              borderRadius="xl"
              boxShadow="md"
              _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}
              transition="0.2s"
            >
              <Text fontSize="xl" fontWeight="bold" color="#014C4C" mb={1}>
                {equipo.nombre}
              </Text>
              <Text fontSize="md" color="gray.600" mb={1}>
                <Box as="span" fontWeight="bold" color="#014C4C">
                  Categoría:
                </Box>{' '}
                {equipo.categoria || 'No especificada'}
              </Text>
              <Text fontSize="sm" color="gray.500" mb={3}>
                <Box as="span" fontWeight="bold" color="#014C4C">
                  Descripción:
                </Box>{' '}
                {equipo.descripcion || 'Sin descripción'}
              </Text>

              <Button
                colorScheme="teal"
                variant="solid"
                onClick={() => handleSeleccion(equipo)}
              >
                Seleccionar
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default SeleccionEquipo;
