import { Routes, Route } from 'react-router-dom'
import { Box, Flex, Container, Heading, Spacer, Button } from '@chakra-ui/react'
import { useNavigate, useLocation } from 'react-router-dom'
import ItemManager from './components/ItemManager'
import POS from './components/POS'
import Checkout from './components/Checkout'
import './App.css'

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Box>
      <Box bg="blue.500" color="white" px={4} py={3}>
        <Container maxW="container.xl">
          <Flex align="center">
            <Heading size="md">Lightning POS</Heading>
            <Spacer />
            <Flex gap={2}>
              <Button 
                variant={location.pathname === '/' ? 'solid' : 'outline'} 
                colorScheme="whiteAlpha"
                onClick={() => navigate('/')}
              >
                Store
              </Button>
              <Button 
                variant={location.pathname === '/manage' ? 'solid' : 'outline'} 
                colorScheme="whiteAlpha"
                onClick={() => navigate('/manage')}
              >
                Manage Items
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Box>
      <Container maxW="container.xl" py={6}>
        <Routes>
          <Route path="/" element={<POS />} />
          <Route path="/manage" element={<ItemManager />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </Container>
    </Box>
  )
}

export default App
