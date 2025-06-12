/* Importaciones */
import { useState, useEffect, useRef } from 'react';
import {
  Box, Flex, Icon, Text, Button, Grid, SimpleGrid,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure, VStack, useToast, Spinner, Tooltip
} from '@chakra-ui/react';
import { FaBars, FaPause, FaPlay, FaInfoCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

// Objeto de colores para definir la posición de los jugadores
const coloresPorPosicion = {
  portero: "#014C4C",
  central: "#3C3C8C",
  pivote: "#8C3C3C",
  lateral_derecho: "#D97706",
  lateral_izquierdo: "#059669",
  extremo_derecho: "#2563EB",
  extremo_izquierdo: "#EC4899",
  defensa: "#6B7280",
  sin_posicion: "#9CA3AF"
};

// Objeto para traducir los tipos de acciones a nombres legibles
const nombresLegibles = {
  golesli: "Gol Izquierda",
  golesld: "Gol Derecha",
  golesei: "Gol Ext. Izquierda",
  golesed: "Gol Ext. Derecha",
  golespi: "Gol Pivote",
  golesc: "Gol Centro",
  goles7m: "Gol 7 metros",
  lanzamiento_7m: "Lanzamiento 7m",
  lanzamiento_ed: "Lanz. Ext. Derecha",
  lanzamiento_ei: "Lanz. Ext. Izquierda",
  lanzamiento_ld: "Lanz. Lateral Der.",
  lanzamiento_li: "Lanz. Lateral Izq.",
  lanzamiento_c: "Lanz. Central",
  lanzamiento_pi: "Lanz. Pivote",
  lanzamiento_ext_li: "Lanz. Ext. Izq.",
  lanzamiento_ext_ld: "Lanz. Ext. Der.",
  lanzamiento_ext_c: "Lanz. Ext. Centro",
  gol_en_contra_ei: "Gol Contra Ext. Izq.",
  gol_en_contra_ed: "Gol Contra Ext. Der.",
  gol_en_contra_li: "Gol Contra Lateral Izq.",
  gol_en_contra_c: "Gol Contra Centro",
  gol_en_contra_ld: "Gol Contra Lateral Der.",
  gol_en_contra_pi: "Gol Contra Punto Izq.",
  gol_en_contra_7m: "Gol Contra 7m",
  lanzamiento_en_contra_ei: "Lanz. Contra Ext. Izq.",
  lanzamiento_en_contra_ed: "Lanz. Contra Ext. Der.",
  lanzamiento_en_contra_li: "Lanz. Contra Lateral Izq.",
  lanzamiento_en_contra_c: "Lanz. Contra Centro",
  lanzamiento_en_contra_ld: "Lanz. Contra Lateral Der.",
  lanzamiento_en_contra_pi: "Lanz. Contra Pivote",
  lanzamiento_en_contra_7m: "Lanz. Contra 7m",
  exclusion_2_min: "Exclusión 2 min",
  tarjetas_amarillas: "Tarjeta Amarilla",
  tarjetas_rojas: "Tarjeta Roja",
  tarjetas_azules: "Tarjeta Azul",
  fallo_pase: "Fallo de Pase",
  fallo_recepcion: "Fallo de Recepción",
  pasos: "Pasos",
  falta_en_ataque: "Falta en Ataque",
  dobles: "Dobles",
  invasion_area: "Invasión de Área",
  blocaje: "Blocaje",
  robo: "Robo"
};

// Mapeo de nombres de acciones a tipos de acción
const mapeoGolesALanzamientos = {
  golesli: "lanzamiento_li",
  golesld: "lanzamiento_ld",
  golesei: "lanzamiento_ei",
  golesed: "lanzamiento_ed",
  golespi: "lanzamiento_pi",
  golesc: "lanzamiento_c",
  goles7m: "lanzamiento_7m",
};

// Mapeo de goles en contra a lanzamientos en contra
const mapeoGolesEnContraALanzamientos = {
  gol_en_contra_li: "lanzamiento_en_contra_li",
  gol_en_contra_ld: "lanzamiento_en_contra_ld",
  gol_en_contra_ei: "lanzamiento_en_contra_ei",
  gol_en_contra_ed: "lanzamiento_en_contra_ed",
  gol_en_contra_pi: "lanzamiento_en_contra_pi",
  gol_en_contra_c: "lanzamiento_en_contra_c",
  gol_en_contra_7m: "lanzamiento_en_contra_7m"
};



// Constantes para los tiempos de las partes del partido
const TIEMPO_PRIMERA_PARTE = 1800; // 30 minutos en segundos
const TIEMPO_SEGUNDA_PARTE = 3600; // 60 minutos en segundos

// Creamos el componente DashboardPartido con todos los hooks y estados necesarios
const DashboardPartido = () => {
  const [jugadores, setJugadores] = useState([]); // para almacenar los jugadores del equipo
  const [acciones, setAcciones] = useState([]); // para almacenar todas las acciones
  const [accionesFiltradas, setAccionesFiltradas] = useState([]); // para filtrar por fase de juego
  const [accionesRecientes, setAccionesRecientes] = useState([]); // para almacenar las últimas acciones guardadas
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null); // para almacenar el jugador seleccionado y poder realizar acciones con este
  const [faseSeleccionada, setFaseSeleccionada] = useState("Ataque Posicional"); // fase de juego seleccionada, por defecto "Ataque Posicional"
  const [partidoIniciado, setPartidoIniciado] = useState(false); // para indicar si el partido ha sido iniciado
  const [segundos, setSegundos] = useState(0); // para almacenar el tiempo del cronómetro en segundos
  const [activo, setActivo] = useState(false); // para indicar si el cronómetro está activo o no
  const [golesLocal, setGolesLocal] = useState(0); // para almacenar los goles del equipo local
  const [golesVisitante, setGolesVisitante] = useState(0); // para almacenar los goles del equipo rival 
  const [equipoRivalNombre, setEquipoRivalNombre] = useState(""); // para almacenar el nombre del equipo rival
  const [nombreEquipoLocal, setNombreEquipoLocal] = useState("MiEquipo"); // para almacenar el nombre del equipo local
  const [fasesJuego, setFasesJuego] = useState([]); // para almacenar las fases de juego disponibles
  const [convocados, setConvocados] = useState([]); // para almacenar los jugadores convocados
  const [jugadoresPartido, setJugadoresPartido] = useState([]); // para almacenar los jugadores del partido en base a los convocados
  const [isLoadingJugadores, setIsLoadingJugadores] = useState(false); // para indicar si los jugadores del partido están siendo cargados
  const [iniciandoPartido, setIniciandoPartido] = useState(false); // para indicar si el partido está siendo iniciado
  const [lanzamientos, setLanzamientos] = useState([]); // para almacenar los lanzamientos disponibles
  const { isOpen: isLanzamientoOpen, onOpen: onLanzamientoOpen, onClose: onLanzamientoClose } = useDisclosure(); // para manejar el modal de lanzamientos
  const [goles, setGoles] = useState([]); // para almacenar los goles disponibles
  const { isOpen: isGolesOpen, onOpen: onGolesOpen, onClose: onGolesClose } = useDisclosure(); // para manejar el modal de goles
  const [parte, setParte] = useState(1); // para indicar en qué parte del partido estamos (1 o 2), por defecto 1
  const [golesEnContra, setGolesEnContra] = useState([]); // para almacenar los goles en contra
  const { isOpen: isGolesContraOpen, onOpen: onGolesContraOpen, onClose: onGolesContraClose } = useDisclosure(); // para manejar el modal de goles en contra
  const [lanzamientosEnContra, setLanzamientosEnContra] = useState([]); // para almacenar los lanzamientos en contra
  const [modalInfoOpen, setModalInfoOpen] = useState(false); // para manejar el modal de información
  const abrirModalInfo = () => setModalInfoOpen(true); // función para abrir el modal de información
  const cerrarModalInfo = () => setModalInfoOpen(false); // función para cerrar el modal de información
  const { isOpen: isLanzamientosContraOpen, onOpen: onLanzamientosContraOpen, onClose: onLanzamientosContraClose } = useDisclosure(); // para manejar el modal de lanzamientos en contra
  const toast = useToast(); // para mostrar notificaciones
  const navigate = useNavigate(); // para navegar entre rutas

  /* Pruebas */
  const [partidoSimulado, setPartidoSimulado] = useState(null);

  // Creamos el efecto de carga inicial de datos
  useEffect(() => {
    let interval;

    if (activo) {
      interval = setInterval(() => {
        setSegundos((prev) => {
          if (prev >= 3600) return 3600;
          if (parte === 1 && prev === 1800) return prev; // solo pausa en 30:00 si es primera parte
          return prev + 1;
        });
      }, 1000); // poner a 15 en pruebas
    }
    return () => clearInterval(interval);
  }, [activo, parte]);



  // Creamos una función para formatear el tiempo en minutos y segundos
  const formatoTiempo = () => {
    const min = String(Math.floor(segundos / 60)).padStart(2, '0'); // calcula los minutos
    const sec = String(segundos % 60).padStart(2, '0'); // calcula los segundos 
    return `${min}:${sec}`; // retorna el tiempo formateado
  };

  // Creamos una función para iniciar el partido que si llega a 30:00 pausa automáticamente, y espera a que se cambie a la segunda parte
  useEffect(() => {
    if (segundos === 1800 && parte === 1) {
      setActivo(false); // pausa automáticamente
      toast({
        title: "Fin de la primera parte",
        description: "Cambia a la segunda parte para continuar",
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top-left"
      });
    }

    // Si llega a 60:00 y es la segunda parte, para el cronómetro y muestra un mensaje de fin del partido, pero no acaba automáticamente el partido
    if (segundos === 3600 && parte === 2) {
      setActivo(false); // para el cronómetro al final del partido
      toast({
        title: "Fin del partido",
        description: "Tiempo cumplido: 60:00",
        status: "success",
        duration: 4000,
        isClosable: true,
        position: "top-left"
      });
    }
  }, [segundos, parte]);


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
        if (data.nombre) setNombreEquipoLocal(data.nombre); // asignamos el nombre del equipo local
      });

    // Obtenemos los jugadores del equipo  
    fetch(`https://myhandstats.onrender.com/equipo/${equipoId}/jugadores`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setJugadores(data); // asignamos los jugadores del equipo
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
      "defensiva": ["recuperacion", "amonestacion", "gol_en_contra", "lanzamiento_en_contra"],
      "contra_ataque": ["goles", "lanzamiento", "perdida"],
      "repliegue": ["gol_en_contra", "amonestacion", "lanzamiento_en_contra", "recuperacion", "amonestacion"],
      "superioridad_ofensiva": ["goles", "lanzamiento", "perdida"],
      "superioridad_defensiva": ["recuperacion", "gol_en_contra", "lanzamiento_en_contra", "amonestacion"],
      "inferioridad_ofensiva": ["lanzamiento", "perdida", "gol"],
      "inferioridad_defensiva\n": ["gol_en_contra", "amonestacion", "lanzamiento_en_contra", "recuperacion"],
    };
    const tipos = tiposPorFase[faseSeleccionada] || [];
    const filtradas = acciones.filter(acc => tipos.includes(acc.tipo_accion));
    setAccionesFiltradas(filtradas);
  }, [faseSeleccionada, acciones]);

  const bloquearPlay =
    (parte === 1 && segundos >= 1800) ||
    (parte === 2 && segundos >= 3600);


  useEffect(() => {
    if (!partidoIniciado) return;

    const toastId = 'jugador-toast';

    if (toast.isActive(toastId)) {
      toast.update(toastId, {
        title: jugadorSeleccionado
          ? 'Jugador seleccionado'
          : 'Ningún jugador seleccionado',
        description: jugadorSeleccionado
          ? `${jugadorSeleccionado.dorsal} - ${jugadorSeleccionado.nombre}`
          : 'Selecciona un jugador antes de realizar una acción.',
        status: jugadorSeleccionado ? 'success' : 'warning',
        duration: 2500,
        isClosable: true,
        position: 'top-left',
      });
    } else {
      toast({
        id: toastId,
        title: jugadorSeleccionado
          ? 'Jugador seleccionado'
          : 'Ningún jugador seleccionado',
        description: jugadorSeleccionado
          ? `${jugadorSeleccionado.dorsal} - ${jugadorSeleccionado.nombre}`
          : 'Selecciona un jugador antes de realizar una acción',
        status: jugadorSeleccionado ? 'success' : 'warning',
        duration: 2000,
        isClosable: true,
        position: 'top-left',
      });
    }
  }, [jugadorSeleccionado, partidoIniciado]);

  // Función para iniciar el partido
  const handleAccion = async (accion) => {
    // Verifica si el partido ha sido iniciado
    if (accion.tipo_accion !== "gol_en_contra" && !jugadorSeleccionado) {
      Swal.fire("Jugador no seleccionado", "Selecciona un jugador para registrar esta acción", "error");
      return;
    }

    // Verifica si el partido ha sido simulado
    const jugadorPartido = jugadoresPartido.find(jp => jp.jugadores_id === jugadorSeleccionado?.id); // obtiene el jugador del partido
    const posicion = jugadorSeleccionado?.posiciones?.[0]?.nombre?.toLowerCase(); // obtiene la posición del jugador seleccionado

    // Verifica si la acción es válida según la posición del jugador
    if (
      ["gol_en_contra", "lanzamiento_en_contra"].includes(accion.tipo_accion) &&
      posicion !== "portero"
    ) {
      Swal.fire("Acción inválida", "Solo los porteros pueden registrar esta acción", "error");
      return;
    }

    const minuto = formatoTiempo();
    const fase = fasesJuego.find(f => f.nombre === faseSeleccionada);
    if (!fase) {
      Swal.fire("Error", "Fase de juego no válida", "error");
      return;
    }

    // Guarda la acción principal
    const nuevaAccion = await guardarAccionPartido({
      minuto,
      jugadores_partido_id: jugadorPartido?.id || null,
      acciones_id: accion.id,
      fases_juego_id: fase.id
    });

    if (!nuevaAccion) return;

    let idLanzamiento = null;

    // Si es gol en contra, registra también lanzamiento en contra correspondiente
    if (accion.tipo_accion === "gol_en_contra") {
      const lanzamientoRelacionado = mapeoGolesEnContraALanzamientos[accion.nombre];
      const accionLanzamiento = acciones.find(a => a.nombre === lanzamientoRelacionado);

      if (accionLanzamiento) {
        const lanzamiento = await guardarAccionPartido({
          minuto,
          jugadores_partido_id: jugadorPartido?.id || null,
          acciones_id: accionLanzamiento.id,
          fases_juego_id: fase.id
        });

        if (lanzamiento) {
          idLanzamiento = lanzamiento.id;
        }
      }
    }


    // Si es un gol, también guarda el lanzamiento relacionado
    if (accion.tipo_accion === "goles") {
      setGolesLocal(prev => prev + 1);

      const lanzamientoRelacionado = mapeoGolesALanzamientos[accion.nombre];
      const accionLanzamiento = acciones.find(a => a.nombre === lanzamientoRelacionado);

      if (accionLanzamiento) {
        const lanzamiento = await guardarAccionPartido({
          minuto,
          jugadores_partido_id: jugadorPartido?.id || null,
          acciones_id: accionLanzamiento.id,
          fases_juego_id: fase.id
        });

        if (lanzamiento) {
          idLanzamiento = lanzamiento.id;
        }
      }
    } else if (accion.tipo_accion === "gol_en_contra") {
      setGolesVisitante(prev => prev + 1);
    }

    // Solo mostramos la acción principal (el gol) en el log visual
    setAccionesRecientes(prev => [
      {
        id: nuevaAccion.id,
        idLanzamiento, // Se guarda para borrarlo si se elimina el gol
        jugador: jugadorSeleccionado?.nombre || "Sin jugador",
        tipo: accion.nombre
      },
      ...prev.slice(0, 4)
    ]);

    toast({
      title: 'Acción registrada',
      description: `Se registró: ${accion.nombre.replaceAll('_', ' ')}${jugadorSeleccionado ? ` - ${jugadorSeleccionado.dorsal} ${jugadorSeleccionado.nombre}` : ''}`,
      status: 'info',
      duration: 2500,
      isClosable: true,
      position: 'bottom-left'
    });
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
    if (parte === 1 && segundos < 1800) {
      toast({
        title: "No se puede finalizar",
        description: "Debes esperar a que termine la primera parte (30:00).",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-left"
      });
      return;
    }

    if (await confirmar("¿Estás seguro de finalizar la parte?")) {
      setActivo(false); // pausa el cronómetro
      setParte((prev) => (prev === 1 ? 2 : prev)); // pasa a la segunda parte
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
    const equipoId = localStorage.getItem("id_equipo");

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
        html: `<div id="convocados-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; padding:10px; max-height:400px; overflow:auto;"></div>`,
        willOpen: () => {
          const container = document.getElementById("convocados-grid");

          const coloresPorPosicion = {
            portero: "#014C4C",
            central: "#3C3C8C",
            pivote: "#8C3C3C",
            lateral_derecho: "#D97706",
            lateral_izquierdo: "#059669",
            extremo_derecho: "#2563EB",
            extremo_izquierdo: "#EC4899",
            defensa: "#6B7280",
            sin_posicion: "#9CA3AF"
          };

          jugadores.forEach(j => {
            const card = document.createElement("div");
            card.classList.add("jugador-card");
            card.setAttribute("data-id", j.id);

            const posicion = j.posiciones?.[0]?.nombre?.toLowerCase() || "sin_posicion";
            const color = coloresPorPosicion[posicion] || "#f7f4f4";

            Object.assign(card.style, {
              backgroundColor: color,
              color: "white",
              padding: "10px",
              margin: "5px",
              borderRadius: "8px",
              cursor: "pointer",
              textAlign: "center",
              fontWeight: "bold",
              minWidth: "150px",
              userSelect: "none"
            });

            card.innerHTML = `<div>#${j.dorsal}</div><div>${j.nombre}</div>`;

            // ✅ Alternar clase "seleccionado"
            card.addEventListener("click", () => {
              card.classList.toggle("seleccionado");
              card.style.opacity = card.classList.contains("seleccionado") ? "1" : "0.6";
              card.style.border = card.classList.contains("seleccionado")
                ? "2px solid white"
                : "none";
            });

            container.appendChild(card);
          });
        },
        preConfirm: () => {
          const seleccionadosIds = Array.from(document.querySelectorAll('#convocados-grid .jugador-card.seleccionado'))
            .map(card => Number(card.getAttribute('data-id')));

          return data.filter(j => seleccionadosIds.includes(j.id));
        },
        showCancelButton: true,
        confirmButtonText: 'Confirmar'
      }).then(result => {
        if (result.isConfirmed) {
          resolve(result.value); // jugadores seleccionados
        } else {
          resolve([]); // cancelado
        }
      });

    });
  };


  const crearJugadoresPartido = async (convocados, equipoId, partidoId, setIsLoadingJugadores, setJugadoresPartido) => {
    const token = localStorage.getItem("token");
    const jugadoresCreados = [];

    setIsLoadingJugadores(true); // ⬅️ empieza la carga

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
        pasos: 0, falta_en_ataque: 0, dobles: 0, invasion_area: 0, blocaje: 0, robo: 0,
        lanzamiento_en_contra_ei: 0, lanzamiento_en_contra_ed: 0, lanzamiento_en_contra_li: 0,
        lanzamiento_en_contra_c: 0, lanzamiento_en_contra_ld: 0, lanzamiento_en_contra_pi: 0,
        lanzamiento_en_contra_7m: 0, gol_en_contra_ei: 0, gol_en_contra_ed: 0,
        gol_en_contra_li: 0, gol_en_contra_c: 0, gol_en_contra_ld: 0, gol_en_contra_pi: 0, gol_en_contra_7m: 0,
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

    setIsLoadingJugadores(false);
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
      return data; // <-- importante
    } catch (error) {
      console.error("❌ Error guardando acción:", error.message);
      Swal.fire("Error", error.message, "error");
      return null;
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

  const obtenerLanzamientosEnContra = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        "https://myhandstats.onrender.com/acciones/filtrar?tipo_accion=lanzamiento_en_contra",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setLanzamientosEnContra(data);
        onLanzamientosContraOpen();
      }
    } catch (err) {
      console.error("Error al cargar lanzamientos en contra", err);
      Swal.fire("Error", "No se pudieron cargar los lanzamientos en contra", "error");
    }
  };

  const eliminarAccion = async (idAccion) => {
    const confirmacion = await Swal.fire({
      title: "¿Eliminar acción?",
      text: "Esta acción se eliminará permanentemente",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      const accionOriginal = accionesRecientes.find(a => a.id === idAccion);

      // Eliminar acción principal
      await fetch(`https://myhandstats.onrender.com/accion_partido/${idAccion}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Eliminar lanzamiento asociado si existe
      if (accionOriginal?.idLanzamiento) {
        await fetch(`https://myhandstats.onrender.com/accion_partido/${accionOriginal.idLanzamiento}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // Actualiza marcador
      if (accionOriginal?.tipo?.startsWith("goles")) {
        setGolesLocal(prev => Math.max(prev - 1, 0));
      } else if (accionOriginal?.tipo?.includes("gol") && accionOriginal?.tipo?.includes("contra")) {
        setGolesVisitante(prev => Math.max(prev - 1, 0));
      }

      // Eliminar del array visual
      setAccionesRecientes(prev => prev.filter(a => a.id !== idAccion));

      Swal.fire("Eliminado", "La acción ha sido eliminada", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", error.message || "No se pudo eliminar la acción", "error");
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
            const equipoId = localStorage.getItem("id_equipo");
            const response = await fetch(`https://myhandstats.onrender.com/equipo/${equipoId}/jugadores`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (!Array.isArray(data) || data.length === 0) {
              Swal.fire("Sin jugadores", "No hay jugadores disponibles", "error");
              return;
            }
            setJugadores(data);

            const confirmados = await new Promise((resolve) => {
              Swal.fire({
                title: 'Seleccionar Convocados',
                html: `<div id="convocados-grid" style="display:grid; grid-template-columns:repeat(3,1fr); gap:10px; padding:10px; max-height:300px; overflow:auto;"></div>`,
                willOpen: () => {
                  const container = document.getElementById("convocados-grid");

                  data.forEach(j => {
                    const card = document.createElement("div");
                    card.classList.add("jugador-card");
                    card.setAttribute("data-id", j.id);

                    Object.assign(card.style, {
                      backgroundColor: "#f7f4f4",
                      color: "black",
                      padding: "10px",
                      margin: "5px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "center",
                      fontWeight: "",
                      minWidth: "100px",
                      userSelect: "none",
                      opacity: "0.6"
                    });

                    card.innerHTML = `<b>${j.nombre}</b><p>#${j.dorsal}</p>`;

                    card.addEventListener("click", () => {
                      card.classList.toggle("seleccionado");
                      card.style.opacity = card.classList.contains("seleccionado") ? "1" : "0.6";
                      card.style.border = card.classList.contains("seleccionado")
                        ? "2px solid white"
                        : "none";
                    });

                    container.appendChild(card);
                  });
                },
                preConfirm: () => {
                  const seleccionadosIds = Array.from(document.querySelectorAll('#convocados-grid .jugador-card.seleccionado'))
                    .map(card => Number(card.getAttribute('data-id')));

                  const seleccionados = data.filter(j => seleccionadosIds.includes(j.id));
                  console.log("Jugadores seleccionados:", seleccionados);
                  return seleccionados;
                },
                showCancelButton: true,
                confirmButtonText: 'Confirmar'
              }).then(result => {
                if (result.isConfirmed) {
                  resolve(result.value);
                } else {
                  resolve([]);
                }
              });
            });

            const partido = await crearPartido(nombreRival);

            if (confirmados.length > 0 && partido?.id) {
              setConvocados(confirmados);
              setEquipoRivalNombre(nombreRival);
              setPartidoSimulado(partido);
              setPartidoIniciado(true);

              await crearJugadoresPartido(
                confirmados,
                partido.equipos_id,
                partido.id,
                setIsLoadingJugadores,
                setJugadoresPartido
              );
              console.log(partido.equipos_id, partido.id);
            }
          }}
        >
          Comenzar Partido
        </Button>
      </Box>
    );
  }

  return (
    <>
      {iniciandoPartido && (
        <Box
          position="fixed"
          top="0"
          left="0"
          w="100vw"
          h="100vh"
          bg="rgba(255,255,255,0.8)"
          zIndex="9999"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner size="xl" color="#014C4C" />
          <Text mt={4}>Preparando partido...</Text>
        </Box>
      )}

      {/* Spinner mientras carga jugadores */}
      {isLoadingJugadores && (
        <Box
          position="fixed"
          top="0"
          left="0"
          w="100vw"
          h="100vh"
          bg="rgba(255,255,255,0.7)"
          zIndex="9999"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Spinner size="xl" thickness="4px" speed="0.65s" color="#014C4C" />
          <Text mt={4} fontSize="lg" fontWeight="semibold" color="#014C4C">
            Cargando jugadores...
          </Text>
        </Box>
      )}

      <Box p={4} minH="100vh" bg="white">
        <Flex align="center" justify="space-between" wrap="wrap" gap={4} mb={6}>

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
            bg={bloquearPlay ? "gray.400" : "#014C4C"}
            borderRadius="full"
            color="white"
            cursor={bloquearPlay ? "not-allowed" : "pointer"}
            opacity={bloquearPlay ? 0.5 : 1}
            pointerEvents={bloquearPlay ? "none" : "auto"}
            onClick={() => {
              if (!bloquearPlay) {
                setActivo(prev => !prev);
              }
            }}
          >
            <Icon as={activo ? FaPause : FaPlay} fontSize="md" />
          </Flex>




          {/* Tiempo y parte */}
          <Flex direction="column" align="center">
            <Text fontSize="sm">{parte}º Parte</Text>
            <Text fontSize="xl" fontWeight="bold">{formatoTiempo()}</Text>
          </Flex>

          {/* Botón finalizar */}
          {parte === 1 && (
            <Button variant="outline" size="sm" onClick={handleFinalizarParte}>
              Acabar Parte
            </Button>
          )}

        </Flex>


        <Flex flexWrap="wrap" gap={6}>
          <Box minW="200px">
            <Text fontWeight="bold" mb={1}>Porteros</Text>

            <SimpleGrid columns={2} spacing={2} mb={4}>
              {convocados
                .filter(jugador =>
                  jugador.posiciones?.some(pos => pos.nombre.toLowerCase() === "portero")
                )
                .map((jugador) => {
                  const isSelected = jugadorSeleccionado?.id === jugador.id;

                  return (
                    <Button
                      key={jugador.id}
                      h="52px"
                      px={2}
                      fontSize="sm"
                      bg={isSelected ? "teal.700" : "#014C4C"}
                      color="white"
                      border={isSelected ? "2px solid #319795" : "none"}
                      _hover={{ bg: isSelected ? "teal.600" : "#016666" }}
                      onClick={() => {
                        if (jugadorSeleccionado?.id === jugador.id) {
                          setJugadorSeleccionado(null);
                        } else {
                          setJugadorSeleccionado(jugador);
                        }
                      }}
                      textAlign="center"
                      whiteSpace="normal"
                    >
                      {jugador.dorsal} <br /> {jugador.nombre}
                    </Button>
                  );
                })}
            </SimpleGrid>

            {/* Título con icono de información */}
            <Flex align="center" gap={2} mb={1}>
              <Text fontWeight="bold">En Pista</Text>
              <Tooltip
                label={
                  <Box>
                    <Text><strong>Portero:</strong> <span style={{ color: '#014C4C' }}>verde oscuro</span></Text>
                    <Text><strong>Central:</strong> <span style={{ color: '#3C3C8C' }}>azul oscuro</span></Text>
                    <Text><strong>Lateral Izq.:</strong> <span style={{ color: '#059669' }}>verde</span></Text>
                    <Text><strong>Lateral Der.:</strong> <span style={{ color: '#D97706' }}>naranja</span></Text>
                    <Text><strong>Ext. Izq.:</strong> <span style={{ color: '#EC4899' }}>rosa</span></Text>
                    <Text><strong>Ext. Der.:</strong> <span style={{ color: '#2563EB' }}>azul</span></Text>
                    <Text><strong>Pivote:</strong> <span style={{ color: '#8C3C3C' }}>rojo</span></Text>
                  </Box>
                }
                fontSize="sm"
                bg="white"
                color="black"
                p={3}
                borderRadius="md"
                boxShadow="md"
                hasArrow
                placement="right"
              >
                <Icon as={FaInfoCircle} boxSize={4} color="gray.500" cursor="pointer" onClick={abrirModalInfo} />
              </Tooltip>
            </Flex>

            {/* Jugadores ordenados por posición */}
            {(() => {
              const ordenPosiciones = [
                "central",
                "lateral_izquierdo",
                "lateral_derecho",
                "extremo_izquierdo",
                "extremo_derecho",
                "pivote",
                "defensa",
                "sin_posicion"
              ];

              const jugadoresOrdenados = convocados
                .filter(jugador =>
                  !jugador.posiciones?.some(pos => pos.nombre.toLowerCase() === "portero")
                )
                .slice()
                .sort((a, b) => {
                  const posA = a.posiciones?.[0]?.nombre?.toLowerCase() || "sin_posicion";
                  const posB = b.posiciones?.[0]?.nombre?.toLowerCase() || "sin_posicion";
                  return ordenPosiciones.indexOf(posA) - ordenPosiciones.indexOf(posB);
                });

              return (
                <SimpleGrid columns={3} spacing={2} mb={4}>
                  {jugadoresOrdenados.map((jugador) => {
                    const isSelected = jugadorSeleccionado?.id === jugador.id;
                    const posicion = jugador.posiciones?.[0]?.nombre?.toLowerCase() || "sin_posicion";
                    const color = coloresPorPosicion[posicion] || "#014C4C";

                    return (
                      <Button
                        key={jugador.id}
                        h="52px"
                        px={2}
                        fontSize="sm"
                        bg={isSelected ? "teal.700" : color}
                        color="white"
                        border={isSelected ? "2px solid #319795" : "none"}
                        _hover={{ bg: isSelected ? "teal.600" : color }}
                        onClick={() => {
                          if (jugadorSeleccionado?.id === jugador.id) {
                            setJugadorSeleccionado(null);
                          } else {
                            setJugadorSeleccionado(jugador);
                          }
                        }}
                        textAlign="center"
                        whiteSpace="normal"
                      >
                        {jugador.dorsal} <br /> {jugador.nombre}
                      </Button>
                    );
                  })}
                </SimpleGrid>
              );
            })()}



            {/* Log de acciones abajo a la izquierda */}
            <Text fontWeight="bold" mt={6} mb={2}>Últimas Acciones</Text>
            <VStack align="stretch" spacing={1}>
              {accionesRecientes.map((accion, i) => (
                <Flex key={i} justify="space-between" align="center" p={2} borderWidth={1} borderRadius="md" bg="gray.50">
                  <Text fontSize="sm">
                    <strong>{nombresLegibles[accion.tipo] || accion.tipo}</strong> - {accion.jugador}
                  </Text>
                  <Button
                    size="xs"
                    colorScheme="red"
                    onClick={async () => {
                      const confirmacion = await Swal.fire({
                        title: "¿Eliminar acción?",
                        text: "Esta acción se eliminará permanentemente",
                        icon: "warning",
                        showCancelButton: true,
                        confirmButtonText: "Sí, eliminar",
                        cancelButtonText: "Cancelar",
                      });

                      if (!confirmacion.isConfirmed) return;

                      try {
                        const token = localStorage.getItem("token");
                        const res = await fetch(`https://myhandstats.onrender.com/accion_partido/${accion.id}`, {
                          method: "DELETE",
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        });

                        if (!res.ok) {
                          const data = await res.json();
                          throw new Error(data.detail || "No se pudo eliminar la acción");
                        }

                        // 🧠 Ajuste del marcador al eliminar
                        const tipo = accion.tipo.toLowerCase();
                        if (tipo.includes("gol") && !tipo.includes("contra")) {
                          setGolesLocal((prev) => Math.max(prev - 1, 0));
                        } else if (tipo.includes("gol") && tipo.includes("contra")) {
                          setGolesVisitante((prev) => Math.max(prev - 1, 0));
                        }

                        setAccionesRecientes((prev) => prev.filter((a) => a.id !== accion.id));
                        Swal.fire("Eliminado", "La acción ha sido eliminada", "success");
                      } catch (error) {
                        console.error(error);
                        Swal.fire("Error", error.message || "Error al eliminar la acción", "error");
                      }
                    }}

                  >
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
                  size="md"
                  h="44px"
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
                size="lg"
                colorScheme="teal"
                mb={3}
                onClick={obtenerLanzamientos}
              >
                Ver Lanzamientos
              </Button>
            )}

            {["ofensiva", "contra_ataque", "superioridad_ofensiva", "inferioridad_ofensiva"].includes(faseSeleccionada) && (
              <Button
                size="lg"
                colorScheme="teal"
                mb={3}
                ml={2}
                onClick={obtenerGoles}
              >
                Ver Goles
              </Button>
            )}

            {["defensiva", "repliegue", "superioridad_defensiva", "inferioridad_defensiva\n"].includes(faseSeleccionada) && (
              <>
                <Button
                  size="lg"
                  colorScheme="red"
                  mb={3}
                  onClick={obtenerGolesEnContra}
                >
                  Ver Goles en Contra
                </Button>

                <Button
                  size="lg"
                  colorScheme="red"
                  mb={3}
                  ml={2}
                  onClick={obtenerLanzamientosEnContra}
                >
                  Ver Lanzamientos en Contra
                </Button>
              </>
            )}



            <SimpleGrid columns={[2, 3, 4]} spacingX={3} spacingY={4} mb={6}>
              {accionesFiltradas
                .filter((accion) =>
                  accion.tipo_accion !== "lanzamiento" && accion.tipo_accion !== "goles" && accion.tipo_accion !== "gol_en_contra" && accion.tipo_accion !== "lanzamiento_en_contra"
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
                    {nombresLegibles[accion.nombre] || accion.nombre.replaceAll("_", " ")}
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

        <Modal isOpen={isLanzamientoOpen} onClose={onLanzamientoClose} size="3xl" isCentered>
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
                {lanzamientos.map((accion) => (
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
                    {nombresLegibles[accion.nombre] || accion.nombre.replaceAll("_", " ")}
                  </Button>
                ))}
              </SimpleGrid>
            </ModalBody>

            <ModalFooter>
              <Button onClick={onLanzamientoClose}>Cerrar</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={isGolesOpen} onClose={onGolesClose} size="3xl" isCentered>
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
                    size="md"
                    variant="outline"
                    bg="white"
                    _hover={{ bg: "gray.100" }}
                    _active={{ bg: "white", transform: "none" }}
                    _focus={{ boxShadow: "none", bg: "white" }}
                    onClick={() => {
                      handleAccion(accion);
                      onGolesClose();
                    }}
                    whiteSpace="normal"
                    wordBreak="break-word"
                    textAlign="center"
                    px={2}
                    h="50px"
                    fontSize="sm"
                    lineHeight="1.2"
                  >
                    {nombresLegibles[accion.nombre] || accion.nombre.replaceAll("_", " ")}
                  </Button>
                ))}
              </SimpleGrid>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onGolesClose}>Cerrar</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={isGolesContraOpen} onClose={onGolesContraClose} size="3xl" isCentered>
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
                    whiteSpace="normal"
                    wordBreak="break-word"
                    textAlign="center"
                    px={2}
                    h="50px"
                    fontSize="sm"
                    lineHeight="1.2"
                  >
                    {nombresLegibles[accion.nombre] || accion.nombre.replaceAll("_", " ")}
                  </Button>
                ))}
              </SimpleGrid>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onGolesContraClose}>Cerrar</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={isLanzamientosContraOpen} onClose={onLanzamientosContraClose} size="3xl" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader textAlign="center" bg="red.500" color="white">
              Lanzamientos en Contra
              {jugadorSeleccionado && (
                <Text fontSize="sm" fontWeight="normal" color="white" mt={1}>
                  {jugadorSeleccionado.dorsal} – {jugadorSeleccionado.nombre}
                </Text>
              )}
            </ModalHeader>
            <ModalBody>
              <SimpleGrid columns={[2, 3, 4]} spacing={4} mb={6}>
                {lanzamientosEnContra.map((accion) => (
                  <Button
                    key={accion.id}
                    size="sm"
                    variant="outline"
                    bg="white"
                    _hover={{ bg: "gray.100" }}
                    whiteSpace="normal"
                    wordBreak="break-word"
                    textAlign="center"
                    px={1}
                    py={7}
                    m={1}
                    onClick={() => {
                      handleAccion(accion);
                      onLanzamientosContraClose();
                    }}
                  >
                    {nombresLegibles[accion.nombre] || accion.nombre.replaceAll("_", " ")}

                  </Button>
                ))}
              </SimpleGrid>
            </ModalBody>
            <ModalFooter>
              <Button onClick={onLanzamientosContraClose}>Cerrar</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <Modal isOpen={modalInfoOpen} onClose={cerrarModalInfo} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader textAlign="center">Colores por Posición</ModalHeader>
            <ModalBody>
              <VStack align="start" spacing={2}>
                {Object.entries(coloresPorPosicion).map(([pos, color]) => (
                  <Flex key={pos} align="center" gap={3}>
                    <Box w="20px" h="20px" bg={color} borderRadius="full" />
                    <Text textTransform="capitalize">{pos.replaceAll('_', ' ')}</Text>
                  </Flex>
                ))}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button onClick={cerrarModalInfo}>Cerrar</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

      </Box>
    </>
  );
};

export default DashboardPartido;