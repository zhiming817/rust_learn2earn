import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Grid,
  Card,
  CardContent,
  InputAdornment
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Assignment as AssignmentIcon,
  AttachMoney as MoneyIcon,
  Token as TokenIcon
} from '@mui/icons-material';
import { taskAPI } from '../services/api';

const TaskForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    reward_cny: 0,
    reward_token: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'reward_cny' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.code || !formData.name || !formData.description) {
      setError('请填写所有必填字段');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await taskAPI.createTask(formData);
      navigate('/');
    } catch (err) {
      setError('创建任务失败');
      console.error('Error creating task:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        创建新任务
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="任务代码"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentIcon />
                      </InputAdornment>
                    ),
                  }}
                  helperText="任务的唯一标识符"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="任务名称"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  helperText="任务的显示名称"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="奖励金额"
                  name="reward_cny"
                  type="number"
                  value={formData.reward_cny}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MoneyIcon />
                      </InputAdornment>
                    ),
                    endAdornment: <InputAdornment position="end">CNY</InputAdornment>,
                  }}
                  inputProps={{ min: 0 }}
                  helperText="完成任务的人民币奖励"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="奖励代币"
                  name="reward_token"
                  value={formData.reward_token}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TokenIcon />
                      </InputAdornment>
                    ),
                  }}
                  helperText="完成任务的代币奖励（可选）"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="任务描述"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  multiline
                  rows={4}
                  helperText="详细描述任务内容和要求"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                    startIcon={<CancelIcon />}
                    size="large"
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={<SaveIcon />}
                    size="large"
                  >
                    {loading ? '创建中...' : '创建任务'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TaskForm;