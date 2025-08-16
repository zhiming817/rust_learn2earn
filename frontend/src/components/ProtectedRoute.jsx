import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredPermission, requiredRole }) => {
  const { isAuthenticated, loading, hasPermission, hasRole, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
        flexDirection="column"
      >
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          正在验证身份...
        </Typography>
      </Box>
    );
  }

  if (!isAuthenticated) {
    // 保存当前位置，登录后重定向回来
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 检查权限
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
        flexDirection="column"
      >
        <Typography variant="h6" color="error">
          权限不足
        </Typography>
        <Typography variant="body2" color="text.secondary">
          您没有访问此页面的权限
        </Typography>
      </Box>
    );
  }

  // 检查角色
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
        flexDirection="column"
      >
        <Typography variant="h6" color="error">
          角色权限不足
        </Typography>
        <Typography variant="body2" color="text.secondary">
          需要 {requiredRole} 角色权限
        </Typography>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;