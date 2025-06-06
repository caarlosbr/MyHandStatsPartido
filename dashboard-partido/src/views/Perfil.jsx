import {
  Box,
  Input,
  Button,
  Avatar,
  VStack,
  FormControl,
  FormLabel,
  Heading,
  useToast,
  Flex,
  Icon,
  useDisclosure,
  Center,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import { createClient } from "@supabase/supabase-js";

// Configuración de Supabase
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://rdpazmfdbcundrogccsb.supabase.co";
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJkcGF6bWZkYmN1bmRyb2djY3NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MTA4MjksImV4cCI6MjA2MjA4NjgyOX0.sSfVgFsJvoFYnl-jc-wJabyYUisgwgDv1jwU9rpzsw4";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const Perfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [foto, setFoto] = useState(null);
  const [fotoUrl, setFotoUrl] = useState("");
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [club, setClub] = useState({ nombre: "", logo: "" });
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const cargarPerfil = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("https://myhandstats.onrender.com/usuario/perfil", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.info) {
          setUsuario(data.info);
          setNombre(data.info.nombre || "");
          setEmail(data.info.email || "");
          setFotoUrl(data.info.foto || "");
          setUserId(data.info.user_id);
          setUserName(data.info.nombre || "Usuario");
        }
      } catch (error) {
        toast({
          title: "Error al cargar perfil",
          description: error.message,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    };

    const cargarClub = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        fetch("https://myhandstats.onrender.com/club", {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            let clubId = null;
            try {
              const payload = JSON.parse(atob(token.split(".")[1]));
              clubId = payload.club_id || payload.club || payload.id || null;
            } catch {
              clubId = null;
            }
            let clubObj = null;
            if (Array.isArray(data.info)) {
              clubObj = data.info.find((c) => c.id == clubId);
            } else {
              clubObj = data;
            }
            setClub({
              nombre: clubObj?.nombre || "Club no encontrado",
              logo: clubObj?.logo || "",
            });
          });
      }
    };

    cargarPerfil();
    cargarClub();
  }, [toast]);

  const subirFotoPerfil = async (file, userId) => {
    const extension = file.name.split(".").pop();
    const nombreArchivo = `perfil_${userId}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("imagenes")
      .upload(nombreArchivo, file, { upsert: true });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("imagenes").getPublicUrl(nombreArchivo);

    return publicUrl;
  };

  const handleGuardar = async () => {
    const token = localStorage.getItem("token");
    try {
      let nuevaFotoUrl = fotoUrl;

      // Subir nueva foto si se seleccionó
      if (foto && userId) {
        nuevaFotoUrl = await subirFotoPerfil(foto, userId);
      }

      // PUT al endpoint correcto con el id del usuario
      const res = await fetch(`https://myhandstats.onrender.com/usuario/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombre,
          foto: nuevaFotoUrl,
          password: contraseña ? contraseña : undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Error al actualizar perfil");
      }

      toast({
        title: "Perfil actualizado",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setFotoUrl(nuevaFotoUrl);
      setContraseña("");
    } catch (error) {
      toast({
        title: "Error al actualizar perfil",
        description: error.message,
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  return (
      <Box p={6} bg="#fff" minH="100vh">

        <Flex
          direction="column"
          bg="white"
          p={6}
          borderRadius="xl"
          boxShadow="lg"
          maxW="600px"
          mx="auto"
        >
          <Center mb={6}>
            <Avatar
              size="2xl"
              src={fotoUrl && fotoUrl !== "foto.jpg" ? fotoUrl : undefined}
              name={nombre}
              border="3px solid #319795"
              boxShadow="md"
              bg="#a8dadc"
              fontSize="3xl"
            >
              {/* Iniciales si no hay foto */}
              {(!fotoUrl || fotoUrl === "foto.jpg") && nombre && (() => {
                const partes = nombre.trim().split(" ").filter(Boolean);
                if (partes.length === 1) {
                  return partes[0][0].toUpperCase();
                } else if (partes.length > 1) {
                  return (partes[0][0] + partes[1][0]).toUpperCase();
                }
                return "";
              })()}
            </Avatar>
          </Center>

          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel color="gray.700">Foto de perfil</FormLabel>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setFoto(e.target.files[0])}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel color="gray.700">Nombre</FormLabel>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel color="gray.700">Email</FormLabel>
              <Input value={email} isDisabled />
            </FormControl>

            <FormControl>
              <FormLabel color="gray.700">Nueva Contraseña</FormLabel>
              <Input
                type="password"
                placeholder="Deja en blanco si no quieres cambiarla"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
              />
            </FormControl>

            <Button
              mt={4}
              colorScheme="teal"
              size="md"
              onClick={handleGuardar}
              alignSelf="flex-end"
            >
              Guardar Cambios
            </Button>
          </VStack>
        </Flex>
      </Box>
  );
};

export default Perfil;
