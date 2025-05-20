import { useState, useEffect } from 'react';
import {
  Box, Flex, Icon, Text, Button, Grid, SimpleGrid,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure
} from '@chakra-ui/react';
import { FaBars, FaPause } from 'react-icons/fa';
import Swal from 'sweetalert2';

const DashboardPartido = () => {
  const [jugadores, setJugadores] = useState([
    { id: 1, dorsal: 7, nombre: "Pepe" },
    { id: 2, dorsal: 10, nombre: "Luis" },
    { id: 3, dorsal: 12, nombre: "Juan" },
    { id: 4, dorsal: 4, nombre: "Carlos" },
    { id: 5, dorsal: 11, nombre: "Pedro" },
    { id: 6, dorsal: 6, nombre: "Mario" },
    { id: 7, dorsal: 5, nombre: "Sergio" },
    { id: 8, dorsal: 8, nombre: "Hugo" }
  ]);
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);
  const [faseSeleccionada, setFaseSeleccionada] = useState("Ataque Posicional");
  const [partidoIniciado, setPartidoIniciado] = useState(false);
  const [modalTipo, setModalTipo] = useState(null);
  const [zonaDisparo, setZonaDisparo] = useState(null);
  const [zonaLanzador, setZonaLanzador] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [segundos, setSegundos] = useState(0);
  const [activo, setActivo] = useState(false);
  const [golesLocal, setGolesLocal] = useState(0);
  const [golesVisitante, setGolesVisitante] = useState(0);
  const [equipoRivalNombre, setEquipoRivalNombre] = useState("");
  const [fasesJuego, setFasesJuego] = useState([]);

  useEffect(() => {
    let interval = null;
    if (activo) {
      interval = setInterval(() => {
        setSegundos((prev) => (prev < 1800 ? prev + 1 : 1800));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activo]);

  const formatoTiempo = () => {
    const min = String(Math.floor(segundos / 60)).padStart(2, '0');
    const sec = String(segundos % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("https://myhandstats.onrender.com/fases_juego", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFasesJuego(data);
        else console.error("Respuesta inesperada:", data);
      })
      .catch((err) => console.error("Error al cargar fases del juego:", err));
  }, []);


  const handleGuardarGol = () => {
    if (!zonaDisparo || (modalTipo === "gol" && !zonaLanzador)) {
      Swal.fire("Faltan datos", "Debes seleccionar una zona de disparo y lanzador", "warning");
      return;
    }
    setGolesLocal((prev) => prev + 1);
    onClose();
    setZonaDisparo(null);
    setZonaLanzador(null);
    setModalTipo(null);
  };

  const handleAccion = (accion) => {
    if (accion !== "Gol en Contra" && !jugadorSeleccionado) {
      Swal.fire("Jugador no seleccionado", "Selecciona un jugador para registrar esta acción", "error");
      return;
    }
    if (accion.tipo) {
      setModalTipo(accion.tipo);
      onOpen();
    } else {
      console.log("Acción ejecutada:", accion);
    }
  };

  const confirmar = async (mensaje, confirmButton = "Sí") => {
    const result = await Swal.fire({
      title: mensaje,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: confirmButton,
      cancelButtonText: "Cancelar"
    });
    return result.isConfirmed;
  };

  const handleFinalizarParte = async () => {
    if (await confirmar("¿Estás seguro de finalizar la parte?")) {
      setActivo(false);
      setSegundos(0);
      Swal.fire("Parte finalizada", "Puedes comenzar la siguiente parte", "success");
    }
  };

  const handleFinalizarPartido = async () => {
    if (await confirmar("¿Finalizar el partido completamente?")) {
      setActivo(false);
      Swal.fire("Partido finalizado", "Buen trabajo", "success");
    }
  };

  if (!partidoIniciado) {
    return (
      <Box p={8} minH="100vh" bg="white" textAlign="center">
        <Text fontSize="xl" mb={4} fontWeight="bold">Comenzar nuevo partido</Text>
        <Button
          bg="#014C4C"
          color="white"
          _hover={{ bg: '#016666' }}
          onClick={async () => {
            const { value: nombreRival } = await Swal.fire({
              title: 'Nombre del equipo rival',
              input: 'text',
              inputPlaceholder: 'Ej. Atlético Madrid',
              confirmButtonText: 'Comenzar',
              showCancelButton: true,
              inputValidator: (value) => {
                if (!value) {
                  return 'Por favor, escribe un nombre';
                }
                return null;
              }
            });

            if (nombreRival) {
              setEquipoRivalNombre(nombreRival);
              setPartidoIniciado(true);
            }
          }}
        >
          Comenzar Partido
        </Button>
      </Box>
    );
  }

return (
  <Box p={4} minH="100vh" bg="white">
    <Flex align="center" justify="space-between" mb={6}>
      <Icon as={FaBars} boxSize={5} />
      <Flex align="center" gap={3}>
        <Text fontSize="2xl" color="blue.600" fontWeight="bold">{golesLocal}</Text>
        <Text fontSize="2xl" color="red.500" fontWeight="bold">:</Text>
        <Box textAlign="center">
          <Text fontSize="sm" color="gray.600" mt={-2}>{equipoRivalNombre}</Text>
          <Text fontSize="2xl" color="red.500" fontWeight="bold">{golesVisitante}</Text>
        </Box>
        <Flex
          align="center"
          justify="center"
          boxSize={8}
          bg="#014C4C"
          borderRadius="full"
          color="white"
          cursor="pointer"
          onClick={() => setActivo((prev) => !prev)}
        >
          <Icon as={FaPause} fontSize="xs" />
        </Flex>
        <Flex direction="column" align="center">
          <Text fontSize="sm">1º Parte</Text>
          <Text fontSize="xl" fontWeight="bold">{formatoTiempo()}</Text>
        </Flex>
      </Flex>
      <Button variant="outline" size="sm" onClick={handleFinalizarParte}>Acabar Parte</Button>
    </Flex>

    <Flex flexWrap="wrap" gap={6}>
      <Box minW="200px">
        <Text fontWeight="bold" mb={2}>Timeouts</Text>
        <Flex gap={2} mb={4}>
          {[1, 2, 3].map((num) => (
            <Button key={num} borderRadius="full" bg="#014C4C" color="white" size="sm">{num}</Button>
          ))}
        </Flex>
        <Text fontWeight="bold" mb={1}>Portero</Text>
        <Button colorScheme="teal" size="sm" mb={4}>1 Pepe</Button>
        <Text fontWeight="bold" mb={1}>En Pista</Text>
        <SimpleGrid columns={3} spacing={2} mb={4}>
          {jugadores.slice(0, 6).map((jugador) => (
            <Button key={jugador.id} size="sm" bg="#014C4C" color="white" onClick={() => setJugadorSeleccionado(jugador)}>
              {jugador.dorsal} {jugador.nombre}
            </Button>
          ))}
        </SimpleGrid>
        <Text fontWeight="bold" mb={1}>Banquillo</Text>
        <SimpleGrid columns={3} spacing={2}>
          {jugadores.slice(6).map((jugador) => (
            <Button key={jugador.id} size="sm" bg="#014C4C" color="white" onClick={() => setJugadorSeleccionado(jugador)}>
              {jugador.dorsal} {jugador.nombre}
            </Button>
          ))}
        </SimpleGrid>
      </Box>

      <Box flex="1">
        <Text fontWeight="bold" mb={2}>Fase del Juego</Text>
        <Flex wrap="wrap" gap={2} mb={4}>
          {fasesJuego.map((fase) => (
            <Button
              key={fase.id}
              size="sm"
              variant={faseSeleccionada === fase.nombre ? "solid" : "outline"}
              colorScheme={faseSeleccionada === fase.nombre ? "teal" : "gray"}
              onClick={() => setFaseSeleccionada(fase.nombre)}
            >
              {fase.nombre}
            </Button>
          ))}
        </Flex>

        <Text fontWeight="bold" mb={2}>Acciones</Text>
        <SimpleGrid columns={[2, 3, 4]} spacing={3} mb={6}>
          {[{ label: 'Gol', tipo: 'gol' }, { label: 'Gol 7M', tipo: 'gol7m' },
            'Parada', 'Parada 7M', 'Tiro Puerta', 'Tiro Fuera', 'Falta', 'Falta 7M',
            'Gol en Contra', 'Pérdida', 'Amarilla', 'Roja', 'Azul', '2 Minutos', 'Recupe.'
          ].map((accion) =>
            typeof accion === 'string' ? (
              <Button key={accion} padding="16dp" variant="outline" onClick={() => handleAccion(accion)}>{accion}</Button>
            ) : (
              <Button
                key={accion.label}
                size="sm"
                variant="outline"
                onClick={() => handleAccion(accion)}
              >
                {accion.label}
              </Button>
            )
          )}
        </SimpleGrid>
        <Flex justify="flex-end">
          <Button bg="#014C4C" color="white" _hover={{ bg: '#016666' }} onClick={handleFinalizarPartido}>
            Finalizar Partido
          </Button>
        </Flex>
      </Box>
    </Flex>

    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader textAlign="center" bg="#014C4C" color="white">
          Posición del Lanzamiento
        </ModalHeader>
        <ModalBody>
          <Grid templateColumns="repeat(3, 1fr)" gap={2} mb={6} textAlign="center">
            {Array.from({ length: 9 }, (_, i) => (
              <Button
                key={i + 1}
                onClick={() => setZonaDisparo(i + 1)}
                variant={zonaDisparo === i + 1 ? "solid" : "outline"}
                colorScheme="teal"
              >
                {i + 1}
              </Button>
            ))}
          </Grid>
          {modalTipo === "gol" && (
            <>
              <Text textAlign="center" fontWeight="bold" mb={2}>Posición del Lanzador</Text>
              <Grid templateColumns="repeat(5, 1fr)" gap={2} mb={2}>
                {["Ala Izquierda", "Izquierda 6M", "Centro 6M", "Derecha 6M", "Ala Derecha"].map((pos) => (
                  <Button
                    key={pos}
                    onClick={() => setZonaLanzador(pos)}
                    variant={zonaLanzador === pos ? "solid" : "outline"}
                    colorScheme="teal"
                    size="sm"
                  >
                    {pos}
                  </Button>
                ))}
              </Grid>
              <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                {["Izquierda 9M", "Centro 9M", "Derecha 9M", "Medio Campo", "Campo a Campo"].map((pos) => (
                  <Button
                    key={pos}
                    onClick={() => setZonaLanzador(pos)}
                    variant={zonaLanzador === pos ? "solid" : "outline"}
                    colorScheme="teal"
                    size="sm"
                  >
                    {pos}
                  </Button>
                ))}
              </Grid>
            </>
          )}
        </ModalBody>
        <ModalFooter justifyContent="space-between">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button colorScheme="teal" onClick={handleGuardarGol}>Guardar</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  </Box>
);
}

export default DashboardPartido;
