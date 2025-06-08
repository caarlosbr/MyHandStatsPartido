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
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  Input,
  VStack,
  useToast,
  Image,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import AuthWrapper from "../components/AuthWrapper";

const SeleccionEquipo = () => {
  const [club, setClub] = useState({});
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);

  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const toast = useToast();

  const token = localStorage.getItem("token");

  // Cargar datos del club y equipos
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetch("https://myhandstats.onrender.com/club", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener el club");
        return res.json();
      })
      .then((data) => {
        setClub(data.info ? data.info[0] : data); 
      })
      .catch((err) => {
        console.error(
          "No se encontró el club en localStorage o error en la API",
          err
        );
        navigate("/jugadores");
      });

    fetch("https://myhandstats.onrender.com/equipo/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener los equipos");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setEquipos(data);
        } else {
          setEquipos([]);
        }
      })
      .catch((err) => {
        console.error("Error al obtener equipos:", err);
        setEquipos([]);
      })
      .finally(() => setLoading(false));

    // Comprobar si es admin
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      setEsAdmin(decoded.rol === "admin");
    } catch (error) {
      setEsAdmin(false);
      console.error("Error al decodificar el token", error);
      navigate("/login");
    }
  }, [token, navigate]);

  const [nuevoEquipo, setNuevoEquipo] = useState({
    nombre: "",
    categoria: "",
    descripcion: "",
  });

  const handleSeleccion = (equipo) => {
    localStorage.setItem("id_equipo", equipo.id);
    navigate("/jugadores");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoEquipo((prev) => ({ ...prev, [name]: value }));
  };

  const guardarEquipo = () => {
    if (
      !nuevoEquipo.nombre.trim() ||
      !nuevoEquipo.categoria.trim() ||
      !nuevoEquipo.descripcion.trim()
    ) {
      toast({
        title: "Por favor completa todos los campos.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }


  };

  const EquipoCard = ({ equipo }) => (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="xl"
      boxShadow="md"
      _hover={{ boxShadow: "lg", transform: "translateY(-2px)", bg: "#f0f4f4" }}
      transition="0.2s"
      bg="white"
      cursor="pointer"
      onClick={() => handleSeleccion(equipo)}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      role="group"
      maxW="400px" // Tamaño máximo reducido

    >
      {/* Información a la izquierda */}
      <Box textAlign="left" flex="1">
        <Text fontSize="xl" fontWeight="bold" color="#014C4C" mb={2}>
          {equipo.nombre}
        </Text>
        <Text fontSize="md" fontWeight="bold" color="#014C4C" mb={2}>
          {club.nombre}
        </Text>
        {equipo.descripcion && equipo.categoria && (
          <Text color="gray.600" mb={2}>
            {equipo.categoria} - {equipo.descripcion}
          </Text>
        )}
      </Box>
      {/* Foto a la derecha */}
      <Image
        src={equipo.logo || club.logo}
        alt={equipo.nombre}
        borderRadius="full"
        boxSize="90px"
        ml={6}
        objectFit="cover"
        border="2px solid #319795"
        transition="0.2s"
        _groupHover={{ borderColor: "#014C4C" }}
      />
    </Box>
  );

  const CrearEquipoCard = () => (
    <Box
      p={6}
      borderWidth="1px"
      borderRadius="xl"
      boxShadow="md"
      cursor="pointer"
      _hover={{ boxShadow: "lg", transform: "translateY(-2px)", bg: "gray.50" }}
      transition="0.2s"
      bg="white"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      onClick={onModalOpen}
      textAlign="center"
    >
      <Text fontSize="2xl" fontWeight="bold" color="teal.600" mb={2}>
        + Crear nuevo equipo
      </Text>
      <Text color="gray.500">Haz clic para añadir tu primer equipo</Text>
    </Box>
  );

  return (
    <AuthWrapper requiredRole={null}>
      <Box
        p={6}
        minH="100vh"
        bg="white"
        position="relative"
        overflow="hidden"
      >
        {/* Marca de agua centrada */}
        <Image
          src="/myHandstatsLogo.png"
          alt="Logo MyHandStats"
          position="fixed"
          left="50%"
          top="50%"
          transform="translate(-50%, -50%)"
          opacity={0.12}
          zIndex={0}
          boxSize={["250px", "350px", "450px"]}
          pointerEvents="none"
          userSelect="none"
        />


        <Flex
          justify="space-between"
          align="center"
          mb={6}
          zIndex={1}
          position="relative"
        >
          <Heading size="lg" color="#014C4C" textAlign="center" w="100%" >
            Selecciona tu equipo
          </Heading>
          <Box w="6" />
        </Flex>

        {loading ? (
          <Center mt={10} zIndex={1} position="relative">
            <Spinner size="xl" color="teal.600" />
          </Center>
        ) : equipos.length === 0 ? (
          <Center
            flexDirection="column"
            mt={10}
            zIndex={1}
            position="relative"
          >
            <Text fontSize="xl" mb={4} color="gray.600">
              No hay equipos disponibles.
            </Text>
            {esAdmin && <CrearEquipoCard />}
          </Center>
        ) : (
          <Flex
            wrap="wrap"
            gap={10}
            zIndex={1}
            position="relative"
            justify="center"
            align="flex-start"
          >
            {equipos.map((equipo) => (
              <EquipoCard key={equipo.id} equipo={equipo} />
            ))}
          </Flex>
        )}

        {/* Modal para crear nuevo equipo */}
        <Modal isOpen={isModalOpen} onClose={onModalClose} isCentered size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Crear Nuevo Equipo</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <Input
                    name="nombre"
                    placeholder="Nombre del equipo"
                    value={nuevoEquipo.nombre}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <FormControl>
                  <Input
                    name="categoria"
                    placeholder="Categoría"
                    value={nuevoEquipo.categoria}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <FormControl>
                  <Input
                    name="descripcion"
                    placeholder="Descripción"
                    value={nuevoEquipo.descripcion}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="teal" mr={3} onClick={guardarEquipo}>
                Crear Equipo
              </Button>
              <Button variant="ghost" onClick={onModalClose}>
                Cancelar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </AuthWrapper>
  );
};

export default SeleccionEquipo;
