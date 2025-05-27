import { useState, useEffect } from 'react';
import {
  Box, Flex, Icon, Text, Button, Grid, SimpleGrid,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, VStack
} from '@chakra-ui/react';
import { FaBars, FaPause, FaPlay } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

// Creamos el componente DashboardPartido con todos los hooks y estados necesarios
const DashboardPartido = () => {
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
  const [convocados, setConvocados] = useState([]);
  const [jugadoresPartido, setJugadoresPartido] = useState([]);
  const [lanzamientos, setLanzamientos] = useState([]);
  const {isOpen: isLanzamientoOpen, onOpen: onLanzamientoOpen, onClose: onLanzamientoClose} = useDisclosure();
  const [goles, setGoles] = useState([]);
  const {isOpen: isGolesOpen, onOpen: onGolesOpen, onClose: onGolesClose} = useDisclosure();
  const [parte, setParte] = useState(1);
  const [golesEnContra, setGolesEnContra] = useState([]);
  const { isOpen: isGolesContraOpen, onOpen: onGolesContraOpen, onClose: onGolesContraClose } = useDisclosure();
  const navigate = useNavigate();


  /* Pruebas */
  const [partidoSimulado, setPartidoSimulado] = useState(null);

  // Creamos el efecto de carga inicial de datos
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

  // Creamos una función para formatear el tiempo en minutos y segundos
  const formatoTiempo = () => {
    const min = String(Math.floor(segundos / 60)).padStart(2, '0');
    const sec = String(segundos % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  // Si el partido no ha sido simulado, cargamos los datos del equipo local y sus jugadores
  useEffect(() => {
  if (!partidoSimulado) return;

  // Cargamos el token de autenticación, junto a el ID del equipo del partido 
  const token = localStorage.getItem("token");
  const equipoId = partidoSimulado.equipos_id;

  // Hacemos las peticiones para obtener el nombre del equipo y sus jugadores
  fetch(`https://myhandstats.onrender.com/equipo/${equipoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => {
      if (data.nombre) setNombreEquipoLocal(data.nombre);
    });

  // Obtenemos los jugadores del equipo  
  fetch(`https://myhandstats.onrender.com/equipo/${equipoId}/jugadores`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      if (Array.isArray(data)) setJugadores(data);
    });
}, [partidoSimulado]);


  // Cargamos las fases de juego y acciones disponibles al iniciar el componente
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
  }, []); 


  // Filtramos las acciones según la fase seleccionada
  useEffect(() => {
    const tiposPorFase = {
      "ofensiva": ["goles", "lanzamiento", "perdida"],
      "defensiva": ["recuperacion", "amonestacion", "gol_en_contra"],
      "contra_ataque": ["goles", "lanzamiento", "perdida"],
      "repliegue": ["gol_en_contra", "amonestacion"],
      "superioridad_ofensiva": ["goles", "lanzamiento", "perdida"],
      "superioridad_defensiva": ["recuperacion", "gol_en_contra"],
      "inferioridad_ofensiva": ["lanzamiento", "perdida", "gol"],
      "inferioridad_defensiva\n": ["gol_en_contra", "amonestacion"]
    };
    const tipos = tiposPorFase[faseSeleccionada] || [];
    const filtradas = acciones.filter(acc => tipos.includes(acc.tipo_accion));
    setAccionesFiltradas(filtradas);
  }, [faseSeleccionada, acciones]);

  // 
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

    const jugadorPartido = jugadoresPartido.find(jp => jp.jugadores_id === jugadorSeleccionado?.id);
    if (!jugadorPartido && accion.tipo_accion !== "gol_en_contra") {
      Swal.fire("Error", "No se encontró el jugador en el partido", "error");
      return;
    }

    const minuto = formatoTiempo();
    const fase = fasesJuego.find(f => f.nombre === faseSeleccionada);
    if (!fase) {
      Swal.fire("Error", "Fase de juego no válida", "error");
      return;
    }

    // ✅ Lógica para sumar al marcador
    if (accion.tipo_accion === "goles") {
      setGolesLocal(prev => prev + 1);
    } else if (accion.tipo_accion === "gol_en_contra") {
      setGolesVisitante(prev => prev + 1);
    }

    // Guardar acción en la BD si no es gol en contra sin jugador
    guardarAccionPartido({
      minuto,
      jugadores_partido_id: jugadorPartido?.id || null, // null si es gol_en_contra sin jugador
      acciones_id: accion.id,
      fases_juego_id: fase.id
    });

    const nuevaAccion = {
      jugador: jugadorSeleccionado?.nombre || "Sin jugador",
      tipo: accion.nombre
    };
    setAccionesRecientes(prev => [nuevaAccion, ...prev.slice(0, 4)]);
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
      setSegundos(1800); 
      setParte((prev) => (prev === 1 ? 2 : prev)); 
      Swal.fire("Parte finalizada", "Puedes comenzar la siguiente parte", "success");
    }
  };


const handleFinalizarPartido = async () => {
  if (await confirmar("¿Finalizar el partido completamente?")) {
    setActivo(false);
    Swal.fire("Partido finalizado", "Buen trabajo", "success").then(() => {
      navigate("/seleccionar-equipo");
    });
  }
};


  

  const crearPartido = async (nombreRival) => {
    const token = localStorage.getItem("token");
    const equipoId = 27;

    const body = {
      fecha: new Date().toISOString(),
      goles_id_equipo: 0,
      goles_id_equiporival: 0,
      equiporival_id: nombreRival,
      equipos_id: equipoId
    };

    try {
      const res = await fetch(`https://myhandstats.onrender.com/equipo/${equipoId}/partido`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (res.ok && data.id) {
        setPartidoSimulado(data); // guardamos el objeto completo (incluye id)
        return data;
      } else {
        throw new Error("No se pudo crear el partido");
      }
    } catch (err) {
      Swal.fire("Error", "Error al crear el partido", "error");
      return null;
    }
  };


const seleccionarConvocados = async () => {
  return new Promise((resolve) => {
    let seleccionados = [];

    Swal.fire({
      title: 'Seleccionar Convocados',
      html: `
        <div id="convocados-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; padding:10px; max-height:300px; overflow:auto;"></div>
      `,
      willOpen: () => {
        const container = document.getElementById('convocados-grid');
        jugadores.forEach(j => {
          const card = document.createElement('div');
          card.classList.add('jugador-card');
          card.setAttribute('data-id', j.id);
          card.style.cursor = 'pointer';
          card.style.padding = '10px';
          card.style.border = '1px solid #ccc';
          card.style.borderRadius = '8px';
          card.style.background = '#eee'; // no convocado
          card.style.textAlign = 'center';
          card.innerHTML = `<strong>${j.dorsal}</strong><br>${j.nombre}`;

          card.onclick = () => {
            if (seleccionados.includes(j.id)) {
              seleccionados = seleccionados.filter(id => id !== j.id);
              card.style.background = '#eee';
            } else {
              seleccionados.push(j.id);
              card.style.background = '#fff'; // convocado
            }
          };

          container.appendChild(card);
        });
      },
      confirmButtonText: 'Confirmar',
      preConfirm: () => {
        setConvocados(jugadores.filter(j => seleccionados.includes(j.id)));
        return true;
      },
      showCancelButton: true
    }).then(result => {
      resolve(result.isConfirmed);
    });
  });
};

const crearJugadoresPartido = async (convocados, equipoId, partidoId) => {
  const token = localStorage.getItem("token");
  const jugadoresCreados = [];

  for (const jugador of convocados) {
    const payload = {
      golesli: 0, golesld: 0, golesei: 0, golesc: 0, goles7m: 0, golesed: 0, golest: 0, golespi: 0,
      tarjetas_amarillas: 0, tarjetas_rojas: 0,
      lanzamientos: 0, lanzamiento_7m: 0, exclusiones: 0, recuperaciones: 0, perdidas: 0,
      partidos_id: partidoId,
      jugadores_id: jugador.id,
      paradas: 0, lanzamiento_ed: 0, lanzamiento_li: 0, lanzamiento_c: 0, lanzamiento_pi: 0,
      lanzamiento_ext_ld: 0, lanzamiento_ext_li: 0, lanzamiento_ext_c: 0,
      exclusion_2_min: 0, tarjetas_azules: 0, fallo_pase: 0, fallo_recepcion: 0,
      pasos: 0, falta_en_ataque: 0, dobles: 0, invasion_area: 0, blocaje: 0, robo: 0
    };

    try {
      const res = await fetch(
        `https://myhandstats.onrender.com/equipo/${equipoId}/partido/${partidoId}/jugador_partido`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();
      jugadoresCreados.push(data); 
    } catch (err) {
      console.error("Error al crear jugador del partido", err);
    }
  }

  setJugadoresPartido(jugadoresCreados); 
  console.log("Jugadores del partido creados:", jugadoresCreados);
};




const guardarAccionPartido = async (accion) => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch("https://myhandstats.onrender.com/accion_partido", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(accion)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Error al guardar la acción");
    console.log("✅ Acción guardada:", data);
  } catch (error) {
    console.error("❌ Error guardando acción:", error.message);
    Swal.fire("Error", error.message, "error");
  }
};

const obtenerLanzamientos = async () => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch("https://myhandstats.onrender.com/acciones/filtrar?tipo_accion=lanzamiento", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      setLanzamientos(data);
      onLanzamientoOpen();
    }
  } catch (err) {
    console.error("Error al cargar lanzamientos", err);
  }
};

const obtenerGoles = async () => {
  if (!jugadorSeleccionado) {
    Swal.fire("Selecciona un jugador", "Debes elegir un jugador antes de registrar un gol", "warning");
    return;
  }

  const token = localStorage.getItem("token");
  try {
    const res = await fetch("https://myhandstats.onrender.com/acciones/filtrar?tipo_accion=goles", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      setGoles(data);
      onGolesOpen();
    }
  } catch (err) {
    console.error("Error al cargar goles", err);
  }
};

const obtenerGolesEnContra = async () => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch("https://myhandstats.onrender.com/acciones/filtrar?tipo_accion=gol_en_contra", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) {
      setGolesEnContra(data);
      onGolesContraOpen();
    }
  } catch (err) {
    console.error("Error al cargar goles en contra", err);
  }
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
              confirmButtonText: 'Continuar',
              showCancelButton: true,
              inputValidator: (value) => {
                if (!value) return 'Por favor, escribe un nombre';
              }
            });

            if (!nombreRival) return;

            const token = localStorage.getItem("token");
            const response = await fetch(`https://myhandstats.onrender.com/equipo/27/jugadores`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) {
              Swal.fire("Sin jugadores", "No hay jugadores disponibles", "error");
              return;
            }
            setJugadores(data);


            const confirmados = await new Promise((resolve) => {
              let seleccionados = [];

              Swal.fire({
                title: 'Seleccionar Convocados',
                html: `<div id="convocados-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; padding:10px; max-height:300px; overflow:auto;"></div>`,
                willOpen: () => {
                  const container = document.getElementById('convocados-grid');
                  data.forEach(j => {
                    const card = document.createElement('div');
                    card.classList.add('jugador-card');
                    card.setAttribute('data-id', j.id);
                    card.style.cursor = 'pointer';
                    card.style.padding = '10px';
                    card.style.border = '1px solid #ccc';
                    card.style.borderRadius = '8px';
                    card.style.background = '#eee';
                    card.style.textAlign = 'center';
                    card.innerHTML = `<strong>${j.dorsal}</strong><br>${j.nombre}`;

                    card.onclick = () => {
                      if (seleccionados.includes(j.id)) {
                        seleccionados = seleccionados.filter(id => id !== j.id);
                        card.style.background = '#eee';
                      } else {
                        seleccionados.push(j.id);
                        card.style.background = '#fff';
                      }
                    };

                    container.appendChild(card);
                  });
                },
                confirmButtonText: 'Confirmar',
                preConfirm: () => {
                  const seleccionadosIds = Array.from(document.querySelectorAll('#convocados-grid .jugador-card'))
                    .filter(card => card.style.background === 'rgb(255, 255, 255)')
                    .map(card => Number(card.getAttribute('data-id')));
                  
                  return data.filter(j => seleccionadosIds.includes(j.id)); // devuelve los jugadores seleccionados
                },

                showCancelButton: true
              }).then(result => {
                if (result.isConfirmed) {
                  resolve(result.value); // esto es el array de jugadores seleccionados
                } else {
                  resolve([]); // si canceló
                }
              });

            });

            const partido = await crearPartido(nombreRival);

            if (confirmados.length > 0 && partido?.id) {
              setConvocados(confirmados);
              setEquipoRivalNombre(nombreRival);
              setPartidoSimulado(partido);
              setPartidoIniciado(true);

              await crearJugadoresPartido(confirmados, partido.equipos_id, partido.id);
              console.log(partido.equipos_id,partido.id);
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
      <Flex align="center" justify="space-between" wrap="wrap" gap={4} mb={6}>
        {/* Botón menú */}
        <Icon as={FaBars} boxSize={6} cursor="pointer" />

        {/* Marcador con nombres */}
        <Flex align="center" justify="center" flex="1" gap={4}>
          <Text fontSize="2xl" fontWeight="bold" textTransform="uppercase">
            {nombreEquipoLocal}
          </Text>

          <Flex align="center" gap={1}>
            <Text fontSize="4xl" color="blue.500" fontWeight="extrabold">
              {golesLocal}
            </Text>
            <Text fontSize="4xl" fontWeight="extrabold" color="black">
              :
            </Text>
            <Text fontSize="4xl" color="red.400" fontWeight="extrabold">
              {golesVisitante}
            </Text>
          </Flex>

          <Text fontSize="2xl" fontWeight="bold" textTransform="uppercase">
            {equipoRivalNombre}
          </Text>
        </Flex>

        {/* Play/Pause */}
        <Flex
          align="center"
          justify="center"
          boxSize={10}
          bg="#014C4C"
          borderRadius="full"
          color="white"
          cursor="pointer"
          onClick={() => setActivo(prev => !prev)}
        >
          <Icon as={activo ? FaPause : FaPlay} fontSize="md" />
        </Flex>

        {/* Tiempo y parte */}
        <Flex direction="column" align="center">
          <Text fontSize="sm">{parte}º Parte</Text>
          <Text fontSize="xl" fontWeight="bold">{formatoTiempo()}</Text>
        </Flex>

        {/* Botón finalizar */}
        <Button variant="outline" size="sm" onClick={handleFinalizarParte}>
          Acabar Parte
        </Button>
      </Flex>


      <Flex flexWrap="wrap" gap={6}>
        <Box minW="200px">
          <Text fontWeight="bold" mb={1}>En Pista</Text>
          <SimpleGrid columns={3} spacing={2} mb={4}>
            {convocados.map((jugador) => (
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
          {["ofensiva", "contra_ataque", "superioridad_ofensiva", "inferioridad_ofensiva"].includes(faseSeleccionada) && (
            <Button
              size="sm"
              colorScheme="teal"
              mb={3}
              onClick={obtenerLanzamientos}
            >
              Ver Lanzamientos
            </Button>   
          )}

          {["ofensiva", "contra_ataque", "superioridad_ofensiva", "inferioridad_ofensiva"].includes(faseSeleccionada) && (
            <Button
              size="sm"
              colorScheme="teal"
              mb={3}
              ml={2}
              onClick={obtenerGoles}
            >
              Ver Goles
            </Button>
          )}
          
          {["defensiva", "repliegue", "superioridad_defensiva", "inferioridad_defensiva\n"].includes(faseSeleccionada) && (
          <Button
            size="sm"
            colorScheme="red"
            mb={3}
            ml={2}
            onClick={obtenerGolesEnContra}
          >
            Ver Goles en Contra
          </Button>
          )}



          <SimpleGrid columns={[2, 3, 4]} spacingX={3} spacingY={4} mb={6}>
          {accionesFiltradas
            .filter((accion) =>
              accion.tipo_accion !== "lanzamiento" && accion.tipo_accion !== "goles" && accion.tipo_accion !== "gol_en_contra"
            )
            .map((accion) => (
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

      <Modal isOpen={isLanzamientoOpen} onClose={onLanzamientoClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
        <ModalHeader textAlign="center" bg="#014C4C" color="white">
          Lanzamientos disponibles
          {jugadorSeleccionado && (
            <Text fontSize="sm" fontWeight="normal" color="white" mt={1}>
              {jugadorSeleccionado.dorsal} - {jugadorSeleccionado.nombre}
            </Text>
          )}
        </ModalHeader>

          <ModalBody>
            <SimpleGrid columns={[2, 3, 4]} spacingX={3} spacingY={4} mb={6}>
              {accionesFiltradas
                .filter(
                  (accion) =>
                    accion.tipo_accion !== "goles" &&
                    accion.tipo_accion !== "lanzamiento" &&
                    accion.tipo_accion !== "gol_en_contra" 
                )
                .map((accion) => (
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


          </ModalBody>
          <ModalFooter>
            <Button onClick={onLanzamientoClose}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isGolesOpen} onClose={onGolesClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
        <ModalHeader textAlign="center" bg="#014C4C" color="white">
          Goles disponibles
          {jugadorSeleccionado && (
            <Text fontSize="sm" fontWeight="normal" color="white" mt={1}>
              {jugadorSeleccionado.dorsal} - {jugadorSeleccionado.nombre}
            </Text>
          )}
        </ModalHeader>

          <ModalBody>
            <SimpleGrid columns={[2, 3, 4]} spacing={3}>
              {goles.map((accion) => (
                <Button
                  key={accion.id}
                  size="sm"
                  variant="outline"
                  bg="white"
                  _hover={{ bg: "gray.100" }}
                  _active={{ bg: "white", transform: "none" }}
                  _focus={{ boxShadow: "none", bg: "white" }}
                  onClick={() => {
                    handleAccion(accion);
                    onGolesClose();
                  }}
                >
                  {accion.nombre.replaceAll("_", " ")}
                </Button>
              ))}
            </SimpleGrid>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onGolesClose}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isGolesContraOpen} onClose={onGolesContraClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center" bg="red.500" color="white">
            Goles en Contra
          </ModalHeader>
          <ModalBody>
            <SimpleGrid columns={[2, 3, 4]} spacing={3}>
              {golesEnContra.map((accion) => (
                <Button
                  key={accion.id}
                  size="sm"
                  variant="outline"
                  bg="white"
                  _hover={{ bg: "gray.100" }}
                  onClick={() => {
                    handleAccion(accion);
                    onGolesContraClose();
                  }}
                >
                  {accion.nombre.replaceAll("_", " ")}
                </Button>
              ))}
            </SimpleGrid>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onGolesContraClose}>Cerrar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>


    </Box>
  );
};

export default DashboardPartido;