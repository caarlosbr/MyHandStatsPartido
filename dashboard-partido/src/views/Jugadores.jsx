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
      .catch((err) => console.error("Error al crear jugador:", err));
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
        if (Array.isArray(data)) {
          setJugadores(data);
        } else {
          console.error("Respuesta inesperada:", data);
          setJugadores([]);
        }
      })
      .catch((err) => console.error("Error al cargar jugadores:", err))
      .finally(() => setLoading(false));
  };

  const cargarPosiciones = () => {
    fetch("https://myhandstats.onrender.com/posiciones")
      .then((res) => res.json())
      .then((data) => setPosiciones(data))
      .catch((err) => console.error("Error al cargar posiciones:", err));
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
      ) : (
        <SimpleGrid columns={gridCols} spacing={6}>
          {jugadores.map((jugador) => (
            <Box
              key={jugador.id}
              bg="#e0f7f7"
              borderRadius="2xl"
              boxShadow="lg"
              p={6}
              textAlign="center"
              maxW="320px"
              w="100%"
              mx="auto"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "xl",
                bg: "#d3f0f0",
              }}
            >
              <Avatar icon={<FaUser />} size="2xl" bg="#a8dadc" mb={4} />
              <Text fontWeight="bold" fontSize="lg" color="#014C4C" mb={1}>
                {jugador.nombre}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Edad:{" "}
                {jugador.fecha_nac
                  ? calcularEdad(jugador.fecha_nac) + " años"
                  : "—"}
              </Text>

              <Text fontSize="sm" color="gray.600">
                Dorsal: {jugador.dorsal}
              </Text>
              <Text fontSize="sm" color="gray.600" mb={4}>
                {jugador.posicion
                  ? jugador.posicion.replace(/_/g, " ")
                  : "Sin posición"}
              </Text>
              <Button
                bg="#014C4C"
                color="white"
                size="md"
                borderRadius="lg"
                _hover={{ bg: "#013C3C" }}
                px={6}
              >
                Ver Stats
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      )}

      <IconButton
        icon={<FaPlus />}
        bg="#014C4C"
        color="white"
        borderRadius="full"
        size="lg"
        position="fixed"
        bottom={6}
        right={6}
        aria-label="Añadir jugador"
        boxShadow="lg"
        _hover={{ bg: "#013C3C" }}
        onClick={() => setIsModalOpen(true)}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isCentered
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Creación de Jugador</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <Input
                  name="nombre"
                  placeholder="Nombre del Jugador"
                  value={nuevoJugador.nombre}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl>
                <Input
                  name="fecha_nacimiento"
                  type="date"
                  placeholder="Fecha Nacimiento"
                  value={nuevoJugador.fecha_nacimiento}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl>
                <Input
                  name="dorsal"
                  placeholder="Dorsal"
                  value={nuevoJugador.dorsal}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl>
                <Select
                  name="posicion"
                  placeholder="Selecciona una posición"
                  value={nuevoJugador.posicion}
                  onChange={(e) =>
                    setNuevoJugador((prev) => ({
                      ...prev,
                      posicion: parseInt(e.target.value),
                    }))
                  }
                >
                  {posiciones.map((pos) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.nombre.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={crearJugador}>
              Crear
            </Button>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Jugadores;
