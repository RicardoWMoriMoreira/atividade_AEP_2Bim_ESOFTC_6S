// Importações do React e bibliotecas
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importa os componentes da aplicação
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ProjectBoard from './components/ProjectBoard/ProjectBoard';
import Navbar from './components/Layout/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// Componente de Rota Privada - protege páginas que só usuários logados podem ver
// É tipo um "porteiro" que verifica se você está logado antes de deixar passar
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Se ainda está carregando (verificando se está logado), mostra "Carregando..."
  if (loading) {
    return <div className="loading">Carregando...</div>;
  }
  
  // Se está autenticado (logado), mostra o conteúdo
  // Se não está logado, redireciona para a página de login
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Define todas as rotas (páginas) da aplicação
function AppRoutes() {
  return (
    <Routes>
      {/* Páginas públicas - qualquer pessoa pode acessar */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Página do Dashboard - lista de projetos (precisa estar logado) */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      
      {/* Página do quadro Kanban de um projeto específico (precisa estar logado) */}
      <Route
        path="/project/:projectId"
        element={
          <PrivateRoute>
            <ProjectBoard />
          </PrivateRoute>
        }
      />
      
      {/* Rota raiz (/) - redireciona para o dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

// Componente principal da aplicação
function App() {
  return (
    // AuthProvider envolve tudo para gerenciar o estado de autenticação (se está logado ou não)
    <AuthProvider>
      {/* Router habilita a navegação entre páginas */}
      <Router>
        <div className="App">
          {/* Navbar aparece em todas as páginas */}
          <Navbar />
          {/* As rotas/páginas aparecem aqui */}
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

