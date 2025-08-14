import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  Add as AddIcon
} from '@mui/icons-material';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppBar position="static">
      <Toolbar>
        <AssignmentIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Learn 2 Learn
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            variant={location.pathname === '/' ? 'outlined' : 'text'}
            sx={{ color: 'white', borderColor: 'white' }}
          >
            任务列表
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate('/create')}
            variant={location.pathname === '/create' ? 'outlined' : 'text'}
            sx={{ color: 'white', borderColor: 'white' }}
            startIcon={<AddIcon />}
          >
            创建任务
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;