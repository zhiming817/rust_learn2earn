import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskAPI } from '../services/api';
import './TaskList.css';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getAllTasks();
      setTasks(response.data);
    } catch (err) {
      setError('获取任务列表失败');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个任务吗？')) {
      try {
        await taskAPI.deleteTask(id);
        setTasks(tasks.filter(task => task.id !== id));
      } catch (err) {
        setError('删除任务失败');
        console.error('Error deleting task:', err);
      }
    }
  };

  if (loading) return <div className="loading">加载中...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="task-list">
      <div className="header">
        <h2>任务列表</h2>
        <Link to="/create" className="btn btn-primary">创建新任务</Link>
      </div>
      
      {tasks.length === 0 ? (
        <div className="empty-state">暂无任务</div>
      ) : (
        <div className="task-grid">
          {tasks.map(task => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <h3>{task.name}</h3>
                <span className="task-code">{task.code}</span>
              </div>
              
              <div className="task-content">
                <p className="task-description">{task.description}</p>
                <div className="task-rewards">
                  <span className="reward-cny">¥{task.reward_cny}</span>
                  <span className="reward-token">{task.reward_token}</span>
                </div>
              </div>
              
              <div className="task-footer">
                <small>创建时间: {new Date(task.created_at).toLocaleString()}</small>
                <div className="task-actions">
                  <Link to={`/edit/${task.id}`} className="btn btn-secondary">编辑</Link>
                  <button 
                    onClick={() => handleDelete(task.id)}
                    className="btn btn-danger"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskList;