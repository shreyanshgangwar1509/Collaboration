
import { Box, Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, Flex, FormControl, Input } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import io from "socket.io-client";
import ChatArea from "../../components/chat/ChatArea";
import Sidebar from "../../components/chat/Sidebar";

const ENDPOINT = "http://localhost:3000";

const Chat = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [socket, setSocket] = useState(null);
  

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found!");
      return;
    }

    const newSocket = io(ENDPOINT, {
      auth: { token }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <Flex h="100vh">
    
      <Box w="300px" borderRight="1px solid" borderColor="gray.200">
        <Sidebar setSelectedGroup={setSelectedGroup} />
      </Box>
      <Box flex="1">
        {socket && <ChatArea selectedGroup={selectedGroup} socket={socket} />}
      </Box>
    </Flex>
  );
};

export default Chat;
