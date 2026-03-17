import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Board from './components/Board/Board';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ background:'#0a0a0f', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#7c5cfc', fontFamily:'monospace', fontSize:40 }}>
      ✦
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Toaster position="bottom-right" toastOptions={{
            style: { background:'#16161f', color:'#e8e6f0', border:'1px solid #ffffff0f', borderRadius:10 }
          }}/>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<PrivateRoute><Board /></PrivateRoute>} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}