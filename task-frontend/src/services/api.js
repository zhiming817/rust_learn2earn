import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const taskAPI = {
  // 获取所有任务
  getAllTasks: () => api.get('/tasks'),
  
  // 根据ID获取任务
  getTaskById: (id) => api.get(`/tasks/${id}`),
  
  // 创建任务
  createTask: (task) => api.post('/tasks', task),
  
  // 更新任务
  updateTask: (id, task) => api.put(`/tasks/${id}`, task),
  
  // 删除任务
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export default api;