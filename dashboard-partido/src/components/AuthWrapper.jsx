// src/components/AuthWrapper.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Spinner, Center } from "@chakra-ui/react";

const AuthWrapper = ({ children, requiredRole = null }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(null); // null = en proceso

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setIsAuthorized(false); // Actualizamos estado
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      if (requiredRole && payload.rol !== requiredRole) {
        setIsAuthorized(false); // Usuario con rol incorrecto
        return;
      }

      setIsAuthorized(true); // Usuario autorizado
    } catch (error) {
      console.error("Token inválido:", error);
      setIsAuthorized(false); // Token malformado
    }
  }, [requiredRole]);

  useEffect(() => {
    if (isAuthorized === false) {
      // Redirige tras un pequeño retardo para evitar conflictos de navegación
      setTimeout(() => {
        navigate("/login");
      }, 100);
    }
  }, [isAuthorized, navigate]);

  if (isAuthorized === null) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!isAuthorized) {
    return null; // Evita renderizar contenido durante la redirección
  }

  return children;
};

export default AuthWrapper;
