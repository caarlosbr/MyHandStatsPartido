import { useState, useEffect } from 'react';
import {
  Box, Flex, Icon, Text, Button, Grid, SimpleGrid,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, VStack
} from '@chakra-ui/react';
import { FaBars, FaPause } from 'react-icons/fa';
import Swal from 'sweetalert2';

const DashboardPartidoPruebas = () => {
  const [jugadores, setJugadores] = useState([]);
  const [acciones, setAcciones] = useState([]);
  const [accionesFiltradas, setAccionesFiltradas] = useState([]);
  const [accionesRecientes, setAccionesRecientes] = useState([]);
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
  const [nombreEquipoLocal, setNombreEquipoLocal] = useState("MiEquipo");
  const [fasesJuego, setFasesJuego] = useState([]);

  /* Pruebas */
  const [partidoSimulado, setPartidoSimulado] = useState(null);

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
  if (!partidoSimulado) return;

  const token = localStorage.getItem("token");
  const equipoId = partidoSimulado.equipos_id;

  fetch(`https://myhandstats.onrender.com/equipo/${equipoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      if (data.nombre) setNombreEquipoLocal(data.nombre);
    });

  fetch(`https://myhandstats.onrender.com/equipo/${equipoId}/jugadores`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) setJugadores(data);
    });
}, [partidoSimulado]);


  useEffect(() => {
    const token = localStorage.getItem("token");

    fetch("https://myhandstats.onrender.com/fases_juego", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setFasesJuego(data);
      });

    fetch("https://myhandstats.onrender.com/acciones", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAcciones(data);
      });

  });

  useEffect(() => {
    const tiposPorFase = {
      "ofensiva": ["goles", "lanzamiento", "perdida"],
      "defensiva": ["recuperacion", "amonestacion", "gol_en_contra"],
      "contra_ataque": ["goles", "lanzamiento", "perdida"],
      "repliegue": ["gol_en_contra", "amonestacion"],
      "superioridad_ofensiva": ["goles", "lanzamiento"],
      "superioridad_defensiva": ["recuperacion", "gol_en_contra"],
      "inferioridad_ofensiva": ["lanzamiento", "perdida"],
      "inferioridad_defensiva\n": ["gol_en_contra", "amonestacion"]
    };
    const tipos = tiposPorFase[faseSeleccionada] || [];
    const filtradas = acciones.filter(acc => tipos.includes(acc.tipo_accion));
    setAccionesFiltradas(filtradas);
  }, [faseSeleccionada, acciones]);

  const handleGuardarGol = () => {
    if (!zonaDisparo || (modalTipo === "gol" && !zonaLanzador)) {
      Swal.fire("Faltan datos", "Debes seleccionar una zona de disparo y lanzador", "warning");
      return;
    }
    const nuevaAccion = {
      jugador: jugadorSeleccionado?.nombre || "Sin jugador",
      tipo: "Gol",
      zona: zonaDisparo
    };
    setAccionesRecientes(prev => [nuevaAccion, ...prev.slice(0, 4)]);
    setGolesLocal((prev) => prev + 1);
    onClose();
    setZonaDisparo(null);
    setZonaLanzador(null);
    setModalTipo(null);
  };

  const handleAccion = (accion) => {
    if (accion.tipo_accion !== "gol_en_contra" && !jugadorSeleccionado) {
      Swal.fire("Jugador no seleccionado", "Selecciona un jugador para registrar esta acción", "error");
      return;
    }
    if (accion.tipo_accion === "goles") {
      setModalTipo("gol");
      onOpen();
    } else {
      const nuevaAccion = {
        jugador: jugadorSeleccionado?.nombre || "Sin jugador",
        tipo: accion.nombre
      };
      setAccionesRecientes(prev => [nuevaAccion, ...prev.slice(0, 4)]);
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

  const crearPartidoSimulado = (nombreRival) => {
  const partidoData = {
    fecha: new Date().toISOString(),
    goles_id_equipo: 0,
    goles_id_equiporival: 0,
    equiporival_id: nombreRival,
    equipos_id: 27
  };
  console.log("Simulación de creación de partido:", partidoData);
  setPartidoSimulado(partidoData);
};


  const acortarNombre = (nombre) => nombre.slice(0, 6);

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
                if (!value) return 'Por favor, escribe un nombre';
              }
            });

            if (nombreRival) {
              setEquipoRivalNombre(nombreRival);
              crearPartidoSimulado(nombreRival); 
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
      <Flex align="center" justify="space-between" mb={4}>
        <Icon as={FaBars} boxSize={5} />
        <Text fontSize="sm" noOfLines={1}>
          {acortarNombre(nombreEquipoLocal)} vs {acortarNombre(equipoRivalNombre)}
        </Text>
        <Flex align="center" gap={2}>
          <Text fontSize="2xl" color="blue.600" fontWeight="bold">{golesLocal}</Text>
          <Text fontSize="2xl" color="red.500" fontWeight="bold">:</Text>
          <Text fontSize="2xl" color="red.500" fontWeight="bold">{golesVisitante}</Text>
        </Flex>
        <Flex align="center" justify="center" boxSize={8} bg="#014C4C" borderRadius="full" color="white" cursor="pointer" onClick={() => setActivo(prev => !prev)}>
          <Icon as={FaPause} fontSize="xs" />
        </Flex>
        <Flex direction="column" align="center">
          <Text fontSize="sm">1º Parte</Text>
          <Text fontSize="xl" fontWeight="bold">{formatoTiempo()}</Text>
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
            {jugadores.map((jugador) => (
              <Button
                key={jugador.id}
                size="sm"
                bg="#014C4C"
                color="white"
                onClick={() => setJugadorSeleccionado(jugador)}
                px={2}
                fontSize="xs"
                textAlign="center"
                whiteSpace="normal"
              >
                {jugador.dorsal} <br /> {jugador.nombre}
              </Button>
            ))}
          </SimpleGrid>

          {/* Log de acciones abajo a la izquierda */}
          <Text fontWeight="bold" mt={6} mb={2}>Últimas Acciones</Text>
          <VStack align="stretch" spacing={1}>
            {accionesRecientes.map((accion, i) => (
              <Flex key={i} justify="space-between" align="center" p={2} borderWidth={1} borderRadius="md" bg="gray.50">
                <Text fontSize="sm">
                  <strong>{accion.tipo}</strong> - {accion.jugador}
                </Text>
                <Button size="xs" colorScheme="red" onClick={() => {
                  setAccionesRecientes(prev => prev.filter((_, index) => index !== i));
                }}>
                  X
                </Button>
              </Flex>
            ))}
          </VStack>

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
          <SimpleGrid columns={[2, 3, 4]} spacingX={3} spacingY={4} mb={6}>
            {accionesFiltradas.map((accion) => (
              <Button
                key={accion.id}
                size="sm"
                variant="outline"
                onClick={() => handleAccion(accion)}
                whiteSpace="normal"
                wordBreak="break-word"
                textAlign="center"
                px={2}
                h="50px"
                fontSize="sm"
                lineHeight="1.2"
              >
                {accion.nombre.replaceAll("_", " ")}
              </Button>
            ))}
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
};

export default DashboardPartidoPruebas;