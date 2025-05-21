import React from 'react';
import {
  Drawer, DrawerOverlay, DrawerContent, DrawerHeader,
  DrawerBody, Flex, Icon, Text
} from '@chakra-ui/react';
import {
  FaTachometerAlt, FaUser, FaFutbol, FaPlusCircle, FaChartBar
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
      <DrawerOverlay />
      <DrawerContent bg="#014C4C" color="white">
        <DrawerHeader borderBottomWidth="1px">MENU</DrawerHeader>
        <DrawerBody>
          <Flex direction="column" gap={4} mt={4}>
            <MenuItem icon={FaUser} label="Jugadores" onClick={() => handleNavigate('/jugadores')} />
            <MenuItem icon={FaPlusCircle} label="Nuevo Partido" onClick={() => handleNavigate('/nuevo-partido')} />
            <MenuItem icon={FaUser} label="Seleccionar Equipo" onClick={() => handleNavigate('/seleccionar-equipo')} />
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

const MenuItem = ({ icon, label, onClick }) => (
  <Flex
    align="center"
    gap={3}
    px={3}
    py={2}
    borderRadius="md"
    _hover={{ bg: '#016666' }}
    cursor="pointer"
    onClick={onClick}
  >
    <Icon as={icon} />
    <Text fontWeight="medium">{label}</Text>
  </Flex>
);

export default Sidebar;
