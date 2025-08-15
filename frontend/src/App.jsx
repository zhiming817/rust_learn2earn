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
import Navbar from './components/Navbar';
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
                  <Route path="/" element={<TaskList />} />
                  <Route path="/create" element={<TaskForm />} />
                  <Route path="/edit/:id" element={<TaskEdit />} />
                  <Route path="/tasks/:taskId/submissions" element={<TaskSubmissions />} />
                  <Route path="/submissions/:submissionId/transfer" element={<TransferPage />} />
                </Routes>
              </Container>
            </Router>
          </ThemeProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

export default App;
