import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user, token } = useAuth();

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        个人资料
      </Typography>

      <Grid container spacing={3}>
        {/* 基本信息 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                基本信息
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  用户ID
                </Typography>
                <Typography variant="body1">
                  {user?.id}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  用户名
                </Typography>
                <Typography variant="body1">
                  {user?.username}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 角色信息 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                角色信息
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  当前角色
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {user?.roles?.map(role => (
                    <Chip 
                      key={role} 
                      label={role === 'admin' ? '管理员' : '普通用户'} 
                      color={role === 'admin' ? 'secondary' : 'default'}
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 权限列表 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                权限列表
              </Typography>
              {user?.permissions?.length > 0 ? (
                <List>
                  {user.permissions.map((permission, index) => (
                    <React.Fragment key={permission}>
                      <ListItem>
                        <ListItemText 
                          primary={permission}
                          secondary={getPermissionDescription(permission)}
                        />
                      </ListItem>
                      {index < user.permissions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  暂无特殊权限
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

// 权限描述映射
const getPermissionDescription = (permission) => {
  const descriptions = {
    'task:create': '创建任务',
    'task:update': '更新任务',
    'task:delete': '删除任务',
  };
  return descriptions[permission] || permission;
};

export default ProfilePage;