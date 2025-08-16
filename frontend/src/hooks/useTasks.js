import { useState, useEffect } from 'react';
import { taskAPI } from '../services/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskAPI.getAllTasks();
      setTasks(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      const response = await taskAPI.createTask(taskData);
      await fetchTasks(); // 重新获取任务列表
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const response = await taskAPI.updateTask(taskId, taskData);
      await fetchTasks(); // 重新获取任务列表
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await taskAPI.deleteTask(taskId);
      await fetchTasks(); // 重新获取任务列表
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  const receiveTask = async (taskId) => {
    try {
      const response = await taskAPI.receiveTask(taskId);
      await fetchTasks(); // 重新获取任务列表
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  const completeTask = async (taskId) => {
    try {
      const response = await taskAPI.completeTask(taskId);
      await fetchTasks(); // 重新获取任务列表
      return { success: true, data: response.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    receiveTask,
    completeTask,
  };
};