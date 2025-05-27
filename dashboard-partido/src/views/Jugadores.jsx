import {
  Box,
  Text,
  SimpleGrid,
  IconButton,
  Avatar,
  Button,
  useBreakpointValue,
  Spinner,
  useDisclosure,
  Flex,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  Input,
  VStack,
  Select,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaPlus, FaUser, FaBars } from "react-icons/fa";
import Sidebar from "../components/Sidebar";

const Jugadores = () => {
  const gridCols = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [equipoSeleccionado, setEquipoSeleccionado] = useState("");
  const [jugadores, setJugadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [posiciones, setPosiciones] = useState([]);

  const [nuevoJugador, setNuevoJugador] = useState({
    nombre: "",
    fecha_nacimiento: "",
    dorsal: "",
    posicion: "",
    foto: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoJugador((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setNuevoJugador((prev) => ({ ...prev, foto: e.target.files[0] }));
  };

  const crearJugador = () => {
    const token = localStorage.getItem("token");

    const body = {
      nombre: nuevoJugador.nombre,
      fecha_nac: nuevoJugador.fecha_nacimiento,
      foto: "foto.jpg",
      dorsal: parseInt(nuevoJugador.dorsal),
      equipos_id: parseInt(equipoSeleccionado),
      posicion_id: nuevoJugador.posicion,
      golesei: 0,
      golesli: 0,
      golesld: 0,
      goles7m: 0,
      golesc: 0,
      golesed: 0,
      golest: 0,
      golespi: 0,
      lanzamiento_7m: 0,
      lanzamientos: 0,
      perdidas: 0,
      recuperaciones: 0,
      exclusiones: 0,
      tarjetas_amarillas: 0,
      tarjetas_rojas: 0,
      tarjetas_azules: 0,
      lanzamiento_ed: 0,
      lanzamiento_ei: 0,
      lanzamiento_ld: 0,
      lanzamiento_li: 0,
      lanzamiento_c: 0,
      lanzamiento_pi: 0,
      lanzamiento_ext_li: 0,
      lanzamiento_ext_ld: 0,
      lanzamiento_ext_c: 0,
      exclusion_2_min: 0,
      fallo_pase: 0,
      fallo_recepcion: 0,
      pasos: 0,
      falta_en_ataque: 0,
      dobles: 0,
      invasion_area: 0,
      blocaje: 0,
      robo: 0,
    };

    fetch(
      `https://myhandstats.onrender.com/equipo/${equipoSeleccionado}/jugador/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("No se pudo crear el jugador");
        return res.json();
      })
      .then(() => {
        setIsModalOpen(false);
        setNuevoJugador({
          nombre: "",
          fecha_nacimiento: "",
          dorsal: "",
          posicion: "",
          foto: null,
        });
        cargarJugadores(); // refrescar lista
      })
      .catch((err) =>  err);
  };

const cargarJugadores = () => {
  const token = localStorage.getItem("token");
  const equipoId = localStorage.getItem("id_equipo");

  if (!equipoId) return;

  setEquipoSeleccionado(equipoId);
  setLoading(true);

  fetch(`https://myhandstats.onrender.com/equipo/${equipoId}/jugadores`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
     // console.log("Datos recibidos de jugadores:", data); 
      if (Array.isArray(data)) {
        setJugadores(data);
      } else {
        // console.error("Respuesta inesperada:", data);
        setJugadores([]);
      }
    })
    .catch((err) =>  err)
    .finally(() => setLoading(false));
};


  const cargarPosiciones = () => {
    fetch("https://myhandstats.onrender.com/posiciones")
      .then((res) => res.json())
      .then((data) => setPosiciones(data))
      .catch((err) => err);
  };

  useEffect(() => {
    cargarJugadores();
    cargarPosiciones();
  }, []);

  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  return (
    <Box p={4} position="relative">
      <Sidebar isOpen={isOpen} onClose={onClose} />
      <Flex align="center" justify="space-between" mb={8}>
        <Icon as={FaBars} boxSize={6} onClick={onOpen} cursor="pointer" />
        <Text fontSize="2xl" fontWeight="bold" color="#014C4C">
          Jugadores
        </Text>
        <Box w="6" />
      </Flex>

      {loading ? (
        <Box textAlign="center" mt={10}>
          <Spinner size="xl" color="teal.600" />
        </Box>
        ) : jugadores.length === 0 ? (
          <Box textAlign="center" mt={10}>
            <Text fontSize="lg" color="gray.600">
              Aún no hay jugadores con ficha para este equipo.
            </Text>
          </Box>
        ) : (
        <SimpleGrid columns={gridCols} spacing={6}>
          {jugadores.map((jugador) => (
            <Box
              key={jugador.id}
              bg="white"
              borderRadius="2xl"
              boxShadow="md"
              p={6}
              textAlign="left"
              maxW="320px"
              w="100%"
              mx="auto"
              transition="all 0.3s ease"
              border="1px solid #e2e8f0"
              _hover={{
                transform: "translateY(-4px)",
                boxShadow: "lg",
                borderColor: "#319795",
              }}
            >
              <Flex direction="column" align="center" mb={4}>
                <Avatar icon={<FaUser />} size="2xl" bg="#a8dadc" />
                <Text fontSize="lg" fontWeight="bold" color="#014C4C" mt={3}>
                  {jugador.nombre}
                </Text>
              </Flex>

              <VStack align="start" spacing={2}>
                <Text fontSize="sm" color="gray.700">
                  <Box as="span" fontWeight="bold" color="#014C4C">Edad:</Box>{' '}
                  {jugador.fecha_nac ? `${calcularEdad(jugador.fecha_nac)} años` : "—"}
                </Text>
                <Text fontSize="sm" color="gray.700">
                  <Box as="span" fontWeight="bold" color="#014C4C">Dorsal:</Box>{' '}
                  {jugador.dorsal || "—"}
                </Text>
                <Text fontSize="sm" color="gray.700">
                  <Box as="span" fontWeight="bold" color="#014C4C">Posición:</Box>{' '}
                  {jugador.posiciones?.length > 0
                    ? jugador.posiciones.map(p => p.nombre.replace(/_/g, " ")).join(", ")
                    : "Sin posición"}
                </Text>
              </VStack>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default Jugadores;
