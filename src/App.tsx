import { Routes, Route } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import ItemManager from './components/ItemManager'
import POS from './components/POS'
import Checkout from './components/Checkout'
import './App.css'

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-screen">
      <header className="bg-blue-600 text-white px-4 py-3 shadow-md">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Web POS</h1>
            <div className="flex gap-2">
              <button 
                className={`px-4 py-2 rounded-md transition-colors ${
                  location.pathname === '/' 
                    ? 'bg-white text-blue-600 font-medium' 
                    : 'bg-transparent border border-white/60 hover:bg-white/10'
                }`}
                onClick={() => navigate('/')}
              >
                Store
              </button>
              <button 
                className={`px-4 py-2 rounded-md transition-colors ${
                  location.pathname === '/manage' 
                    ? 'bg-white text-blue-600 font-medium' 
                    : 'bg-transparent border border-white/60 hover:bg-white/10'
                }`}
                onClick={() => navigate('/manage')}
              >
                Manage Items
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto max-w-7xl py-6 px-4">
        <Routes>
          <Route path="/" element={<POS />} />
          <Route path="/manage" element={<ItemManager />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
