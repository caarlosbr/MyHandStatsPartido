// Imortarmos todo lo necesario
import {
  Box,
  Button,
  Container,
  FormControl,
  Heading,
  Input,
  Stack,
  Text,
  Image,
  Alert,
  AlertIcon,
  Spinner,
  useToast 
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import avatar1 from "../assets/avatars/avatar_1.png";
import avatar2 from "../assets/avatars/avatar_2.png";
import avatar3 from "../assets/avatars/avatar_3.png";
import avatar4 from "../assets/avatars/avatar_4.png";
import Swal from "sweetalert2";

// Avatares 
const avatars = [avatar1, avatar2, avatar3, avatar4];
const clientId = "580062200389-hblem47late6qfggkg4iv8gnba20ih91.apps.googleusercontent.com"; // tu client ID (cambiar a env, cuando esté en producción)

// Componente Login, para manejar el inicio de sesión, esto incluye también el inicio de sesión con Google
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("https://myhandstats.onrender.com/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Credenciales inválidas");
      }

      const data = await response.json();
      const token = data.access_token;
      localStorage.setItem("token", token);

      const perfilRes = await fetch("https://myhandstats.onrender.com/usuario/perfil", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const perfil = await perfilRes.json();

      if (perfil.info.rol !== "usuario") {
        localStorage.removeItem("token");

        // Detenemos la carga ANTES del SweetAlert
        setIsLoading(false);

        await Swal.fire({
          icon: "error",
          title: "Acceso denegado",
          text: "Solo los usuarios con rol 'usuario' pueden acceder.",
          confirmButtonColor: "#014C4C",
        });

        return;
      }


      localStorage.setItem("rol", perfil.info.rol);
      localStorage.setItem("nombre", perfil.info.nombre);
      localStorage.setItem("email", perfil.info.email);

      navigate("/seleccionar-equipo");
    } catch (error) {
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };



  // Función para manejar el inicio de sesión con Google
  const handleGoogleLogin = async (credentialResponse) => {
    setIsLoading(true);
    setError("");
    try {
      const googleToken = credentialResponse.credential;
      const response = await fetch("https://myhandstats.onrender.com/login/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential: googleToken }),
      });
      if (!response.ok) {
        throw new Error("Error al iniciar sesión con Google");
      }
      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      navigate("/seleccionar-equipo"); // Redirigir a la página de selección de equipo
    } catch (error) {
      setError(error.message || "Error al iniciar sesión con Google"); // Manejo de errores
    } finally {
      setIsLoading(false);
    }
  };

  // Renderizamos el componente de inicio de sesión
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="white"
        position="relative"
        overflow="hidden"
      >
        {/* Spinner pantalla completa */}
        {isLoading && (
          <Box
            position="fixed"
            top="0"
            left="0"
            w="100vw"
            h="100vh"
            bg="rgba(255,255,255,0.7)"
            zIndex="9999"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner size="xl" thickness="4px" speed="0.65s" color="#014C4C" /> 
          </Box>
        )}

        {/* Box para  la imagen arriba a izquierda*/}
        <Box
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          backgroundImage="url('/Group 4.svg')"
          backgroundRepeat="no-repeat"
          backgroundSize="400px"
          backgroundPosition="top left"
          zIndex={0}
        />

        {/* Contenedor principal para el formulario principal */}
        <Container maxW="container.sm" zIndex={1}>
          <Box
            bg="white"
            rounded="xl"
            boxShadow="xl"
            p={{ base: 6, md: 10 }}
            textAlign="center"
          >

            {/* Mostramos en heading para el login */}
            <Heading mb={2} fontSize="2xl" color="#014C4C">
              Inicia Sesión
            </Heading>
            <Text fontSize="sm" mb={6} color="gray.600">
              ¿Cuántos goles has marcado? ¿Cuántos pases has fallado?
              <br />
              ¿Cuánta posesión ha tenido tu equipo? Esto y mucho más.
            </Text>

            {error && (
              <Alert status="error" mb={4} borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}

            {/* Formulario */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin(email, password);
              }}
            >
              <Stack spacing={4} mb={4}>
                <FormControl>
                  <Input
                    placeholder="tucorreo@gmail.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg="gray.100"
                    _placeholder={{ color: "gray.500" }}
                  />
                </FormControl>
                <FormControl>
                  <Input
                    placeholder="******"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    bg="gray.100"
                    _placeholder={{ color: "gray.500" }}
                  />
                </FormControl>
                <Button
                  type="submit"
                  bg="#014C4C"
                  color="white"
                  isLoading={isLoading}
                  loadingText="Iniciando sesión..."
                >
                  Submit
                </Button>
              </Stack>
            </form>

             {/* Boton del login con Google */} 
            <Box mt={4} width="100%">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError("Error al iniciar sesión con Google")}
                locale="es"
                text="signin_with"
                shape="pill"
                theme="outline"
                size="large"
              />
            </Box>

            {/* Footer */}  
            <Box mt={10}>
              <Text fontWeight="bold" fontSize="lg">
                Únete{" "}
                <Text as="span" color="#014C4C">
                  a
                </Text>{" "}
                MyHandStats
              </Text>
              <Stack direction="row" justify="center" mt={3} spacing={-2}>
                {avatars.map((src, index) => (
                  <Image
                    key={index}
                    src={src}
                    boxSize="40px"
                    borderRadius="full"
                    border="3px solid white"
                    zIndex={avatars.length - index}
                  />
                ))}
                <Box
                  boxSize="40px"
                  borderRadius="full"
                  bg="black"
                  color="white"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="bold"
                  fontSize="sm"
                  border="3px solid white"
                >
                  Tú
                </Box>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>
    </GoogleOAuthProvider>
  );
};

export default Login;
