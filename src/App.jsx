import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import BolaoHome from './pages/bolao/BolaoHome'
import PeladaHome from './pages/pelada/PeladaHome'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#18181b',
              color: '#fff',
              border: '1px solid #3f3f46',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
            },
            success: {
              iconTheme: { primary: '#FFD600', secondary: '#000' }
            }
          }}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bolao" element={<BolaoHome />} />
          <Route path="/pelada" element={<PeladaHome />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
