import {
  Box,
  Button,
  Container,
  FormControl,
  Heading,
  Input,
  Stack,
  Text,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

const handleLogin = async (email, password) => {
  try {
    const res = await fetch("https://myhandstats.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok || !data.access_token) {
      throw new Error("Credenciales incorrectas");
    }

    const token = data.access_token;
    localStorage.setItem("token", token); // Guardamos el token
console.log("Token en SeleccionEquipo:", token);

    // Obtenemos el perfil para verificar el rol
    const perfilRes = await fetch("https://myhandstats.onrender.com/usuario/perfil", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const perfil = await perfilRes.json();

    // Verificamos el rol dentro de perfil.info
    if (perfil.info.rol !== "usuario") {
      localStorage.removeItem("token"); // Eliminamos token si no tiene acceso
      alert("Acceso denegado. Solo los usuarios con rol 'usuario' pueden acceder.");
      return;
    }

    // Rol válido, guardamos si hace falta más info
    localStorage.setItem("rol", perfil.info.rol);
    localStorage.setItem("nombre", perfil.info.nombre);
    localStorage.setItem("email", perfil.info.email);

    // Redirigimos al dashboard
    navigate("/seleccionar-equipo");

  } catch (err) {
    alert(err.message || "Error al iniciar sesión");
  }
};



  const handleCredentialResponse = async (response) => {
    try {
      const googleToken = response.credential;
      const res = await fetch("https://myhandstats.onrender.com/login/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: googleToken }),
      });

      if (!res.ok) throw new Error("Error en login con Google");

      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      navigate("/seleccionar-equipo");
    } catch (error) {
      setError(error.message || "Error al iniciar sesión con Google");
    }
  };

  useEffect(() => {
    const clientId = "580062200389-hblem47late6qfggkg4iv8gnba20ih91.apps.googleusercontent.com";

    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-login-button"),
        { theme: "outline", size: "large" }
      );
    }
  }, []);

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="white"
    >
      <Container maxW="container.sm">
        <Box
          bg="white"
          rounded="xl"
          boxShadow="xl"
          p={{ base: 6, md: 10 }}
          textAlign="center"
        >
          <Heading mb={2} fontSize="2xl" color="#F43F5E">
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
              <Button type="submit" bg="#F43F5E" color="white">
                Submit
              </Button>
            </Stack>
          </form>

          <Box id="google-login-button" mt={4}></Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
