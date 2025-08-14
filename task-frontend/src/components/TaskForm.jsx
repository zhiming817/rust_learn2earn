import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskAPI } from '../services/api';
import './TaskForm.css';

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
    <div className="task-form">
      <h2>创建新任务</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="code">任务代码 *</label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="name">任务名称 *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="reward_cny">奖励金额 (CNY)</label>
          <input
            type="number"
            id="reward_cny"
            name="reward_cny"
            value={formData.reward_cny}
            onChange={handleChange}
            min="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="reward_token">奖励代币</label>
          <input
            type="text"
            id="reward_token"
            name="reward_token"
            value={formData.reward_token}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">任务描述 *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/')} className="btn btn-secondary">
            取消
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? '创建中...' : '创建任务'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;