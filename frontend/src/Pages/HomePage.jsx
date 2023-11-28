import {
  Box,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Flex,
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import Login from '../components/Authentication/Login'
import Signup from '../components/Authentication/Signup'
import logo from '../assets/app logo.png'

function Homepage() {
  const navigate = useNavigate()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'))

    if (user) navigate('/chats')
  }, [navigate])

  return (
    <Container maxW="xl" display="flex" alignItems={"center"} justifyContent={"center"} centerContent>
      <Box
        bg="white"
        boxSize={"md"}
        p={10}
        h={"40rem"}
        rounded={"md"}
        boxShadow="lg"
      >
        <Tabs isFitted pt={"2rem"} variant="soft-rounded">
          <TabList mb="1em">
            <Tab>Login</Tab>
            <Tab>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Login />
            </TabPanel>
            <TabPanel>
              <Signup />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
}

export default Homepage
