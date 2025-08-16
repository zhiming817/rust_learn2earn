import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理401错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token过期，清除本地存储并重定向到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  // 用户登录
  login: (credentials) => {
    return axios.post(`${API_BASE_URL}/auth/login`, credentials, {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  // 获取用户信息
  getProfile: () => api.get('/api/auth/profile'),

  // 获取所有角色
  getRoles: () => api.get('/api/auth/roles'),

  // 获取所有权限
  getPermissions: () => api.get('/api/auth/permissions'),

  // 创建用户（管理员功能）
  createUser: (userData) => api.post('/api/auth/admin/users', userData),
};

export const taskAPI = {
  // 获取分页任务列表
  getTasks: (params = {}) => {
    const { page = 1, page_size = 10, search = '' } = params;
    return api.get('/tasks', {
      params: { page, page_size, search }
    });
  },
  
  // 获取所有任务（不分页）
  getAllTasks: () => api.get('/tasks/all'),
  
  // 根据ID获取任务
  getTaskById: (id) => api.get(`/tasks/${id}`),
  
  // 创建任务
  createTask: (task) => api.post('/tasks', task),
  
  // 更新任务
  updateTask: (id, task) => api.put(`/tasks/${id}`, task),
  
  // 删除任务
  deleteTask: (id) => api.delete(`/tasks/${id}`),
};

export const taskSubmissionAPI = {
  // 根据任务ID获取提交记录
  getSubmissionsByTaskId: (taskId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/tasks/${taskId}/submissions?${queryString}`);
  },

  // 根据提交ID获取提交详情
  getSubmissionById: (submissionId) => {
    return api.get(`/submissions/${submissionId}`);
  },

  // 通过提交
  approveSubmission: (submissionId) => {
    return api.post(`/submissions/${submissionId}/approve`);
  },

  // 拒绝提交
  rejectSubmission: (submissionId, note = '') => {
    return api.post(`/submissions/${submissionId}/reject`, {
      note: note || null
    });
  },

  // 创建新的提交
  createSubmission: (data) => {
    return api.post('/submissions', data);
  },

  // 更新提交状态
  updateSubmission: (submissionId, data) => {
    return api.put(`/submissions/${submissionId}`, data);
  },
};

export default api;