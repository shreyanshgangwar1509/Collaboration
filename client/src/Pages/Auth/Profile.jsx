import { Avatar, Box, Button, Flex, Heading, Spinner, Text } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        console.log("No token found, redirecting to login");
        navigate("/login"); // Redirect if no token
        return;
      }

      try {
        const response = await axios.get("http://localhost:3000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

          setUser(response.data.user);
          console.log(response.data.user);
          localStorage.setItem("userinfo", JSON.stringify(response.data.user));
      } catch (error) {
        console.error("Error fetching profile:", error);
        navigate("/login"); 
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return <Spinner size="xl" color="blue.500" position="absolute" top="50%" left="50%" />;
  }

  if (!user) {
    return <Text textAlign="center" color="red.500">Failed to load profile.</Text>;
  }

  return (
    <Flex
      align="center"
      justify="center"
      height="100vh"
      bgGradient="linear(to-r, blue.400, purple.500)"
    >
      <Box
        p={8}
        bg="white"
        boxShadow="xl"
        borderRadius="lg"
        textAlign="center"
        maxW="400px"
      >
        <Avatar size="xl" name={user.name} src={user.avatar || "https://via.placeholder.com/150"} mb={4} />
        <Heading size="lg" mb={2}>{user.name}</Heading>
        <Text fontSize="lg" color="gray.600">{user.email}</Text>
       
        <Button mt={4} colorScheme="red" onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>
          Logout
        </Button>
      </Box>
    </Flex>
  );
};

export default Profile;
