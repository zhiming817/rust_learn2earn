import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';

const TaskForm = () => {
  const navigate = useNavigate();
  const { createTask } = useTasks();
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    reward_cny: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 基础验证
    if (!formData.code || !formData.name || !formData.reward_cny) {
      setError('请填写所有必填字段');
      setLoading(false);
      return;
    }

    try {
      const taskData = {
        ...formData,
        reward_cny: parseFloat(formData.reward_cny)
      };

      const result = await createTask(taskData);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('创建任务失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={600} mx="auto">
      <Typography variant="h4" gutterBottom>
        创建新任务
      </Typography>

      <Paper sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="任务代码"
            name="code"
            value={formData.code}
            onChange={handleChange}
            margin="normal"
            required
            helperText="例如: task_9"
          />

          <TextField
            fullWidth
            label="任务名称"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="奖励金额（CNY）"
            name="reward_cny"
            type="number"
            value={formData.reward_cny}
            onChange={handleChange}
            margin="normal"
            required
            inputProps={{ min: 0, step: 0.01 }}
          />

          <TextField
            fullWidth
            label="任务描述"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
          />

          <Box display="flex" gap={2} mt={3}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : '创建任务'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
              fullWidth
            >
              取消
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default TaskForm;