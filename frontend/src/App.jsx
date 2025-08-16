import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui.js/client';
import { createNetworkConfig } from '@mysten/dapp-kit';
import '@mysten/dapp-kit/dist/index.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box } from '@mui/material';

// 组件导入
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import ProfilePage from './components/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import TaskEdit from './components/TaskEdit';
import TaskSubmissions from './components/TaskSubmissions';
import TransferPage from './components/TransferPage';

// 创建QueryClient
const queryClient = new QueryClient();

// 网络配置 - 添加devnet并设置为默认
const { networkConfig } = createNetworkConfig({
  devnet: { url: getFullnodeUrl('devnet') },
  testnet: { url: getFullnodeUrl('testnet') },
  mainnet: { url: getFullnodeUrl('mainnet') },
});

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="devnet">
        <WalletProvider autoConnect>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
              <Router>
                <Navbar />
                <Container 
                  maxWidth="xl" 
                  sx={{ 
                    mt: 4, 
                    mb: 4,
                    px: { xs: 1, sm: 2, md: 3 },
                    width: '100%',
                    minHeight: 'calc(100vh - 200px)'
                  }}
                >
                  <Routes>
                    {/* 公开路由 */}
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* 受保护的路由 */}
                    <Route path="/" element={
                      <ProtectedRoute>
                        <TaskList />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/create" element={
                      <ProtectedRoute requiredPermission="task:create">
                        <TaskForm />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/edit/:id" element={
                      <ProtectedRoute requiredPermission="task:update">
                        <TaskEdit />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/tasks/:taskId/submissions" element={
                      <ProtectedRoute>
                        <TaskSubmissions />
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/submissions/:submissionId/transfer" element={
                      <ProtectedRoute>
                        <TransferPage />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </Container>
              </Router>
            </AuthProvider>
          </ThemeProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
