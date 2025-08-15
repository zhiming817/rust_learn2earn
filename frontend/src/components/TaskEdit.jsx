import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  InputAdornment,
  CircularProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  AttachMoney as MoneyIcon,
  Token as TokenIcon
} from '@mui/icons-material';
import { taskAPI } from '../services/api';

const TaskEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    reward_cny: 0,
    reward_token: '',
    description: '',
  });

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      setFetchLoading(true);
      const response = await taskAPI.getTaskById(id);
      const task = response.data;
      setFormData({
        name: task.name,
        reward_cny: task.reward_cny,
        reward_token: task.reward_token,
        description: task.description,
      });
    } catch (err) {
      setError('获取任务信息失败');
      console.error('Error fetching task:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'reward_cny' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      setError('请填写所有必填字段');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await taskAPI.updateTask(id, formData);
      navigate('/');
    } catch (err) {
      setError('更新任务失败');
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        编辑任务
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
              <Grid item xs={12}>
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
                    {loading ? '更新中...' : '更新任务'}
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

export default TaskEdit;