import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  TextField,
  InputAdornment,
  Container
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbar
} from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  GetApp as GetAppIcon
} from '@mui/icons-material';
import { taskAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const TaskList = () => {
  const navigate = useNavigate();
  const { hasPermission, user } = useAuth();
  
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true); // 初始设置为 true
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, taskId: null, taskName: null });
  const [actionLoading, setActionLoading] = useState(null);
  
  // 分页状态
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [search, setSearch] = useState('');

  const fetchTasks = useCallback(async (page = 0, pageSize = 10, searchTerm = '') => {
    try {
      setLoading(true);
      setError(null);
      
      // 修改API调用，使用getAllTasks而不是分页接口
      const response = await taskAPI.getAllTasks();
      console.log('Tasks response:', response.data); // 调试日志
      
      let tasksData = response.data;
      
      // 如果后端返回的是数组，直接使用
      if (Array.isArray(tasksData)) {
        // 前端处理搜索
        if (searchTerm) {
          tasksData = tasksData.filter(task => 
            task.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        // 前端处理分页
        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedTasks = tasksData.slice(startIndex, endIndex);
        
        setTasks(paginatedTasks);
        setRowCount(tasksData.length);
      } else {
        // 如果返回的是分页对象
        setTasks(tasksData.data || []);
        setRowCount(tasksData.total || 0);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(`获取任务列表失败: ${err.message}`);
      setTasks([]); // 确保设置空数组
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks(paginationModel.page, paginationModel.pageSize, search);
  }, [paginationModel, search, fetchTasks]);

  const handlePaginationChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
  };

  const handleSearchChange = (event) => {
    const newSearch = event.target.value;
    setSearch(newSearch);
    // 搜索时重置到第一页
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  const handleViewSubmissions = (taskId) => {
    navigate(`/tasks/${taskId}/submissions`);
  };

  const handleDeleteClick = (task) => {
    setDeleteDialog({ open: true, taskId: task.id, taskName: task.name });
  };

  const handleDeleteConfirm = async () => {
    try {
      await taskAPI.deleteTask(deleteDialog.taskId);
      setDeleteDialog({ open: false, taskId: null, taskName: null });
      // 重新获取当前页数据
      fetchTasks(paginationModel.page, paginationModel.pageSize, search);
    } catch (err) {
      setError('删除任务失败');
      console.error('Error deleting task:', err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, taskId: null, taskName: null });
  };

  const handleReceiveTask = async (taskId) => {
    setActionLoading(taskId);
    try {
      await taskAPI.receiveTask(taskId);
      // 重新获取当前页数据
      fetchTasks(paginationModel.page, paginationModel.pageSize, search);
    } catch (err) {
      setError('领取任务失败');
      console.error('Error receiving task:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteTask = async (taskId) => {
    setActionLoading(taskId);
    try {
      await taskAPI.completeTask(taskId);
      // 重新获取当前页数据
      fetchTasks(paginationModel.page, paginationModel.pageSize, search);
    } catch (err) {
      setError('完成任务失败');
      console.error('Error completing task:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getTaskStatusChip = (params) => {
    const task = params.row;
    if (task.user_status === 1) {
      return <Chip label="已完成" color="success" size="small" />;
    }
    if (task.user_status === 0) {
      return <Chip label="已领取" color="warning" size="small" />;
    }
    return <Chip label="未领取" color="default" size="small" />;
  };

  const getTaskActions = (params) => {
    const task = params.row;
    const actions = [];

    // 查看提交记录（所有用户都可以）
    actions.push(
      <GridActionsCellItem
        key="view"
        icon={<AssignmentIcon />}
        label="查看提交"
        onClick={() => handleViewSubmissions(task.id)}
        color="info"
      />
    );

    // 任务操作按钮
    if (task.user_status === null || task.user_status === undefined) {
      // 未领取 - 显示领取按钮
      actions.push(
        <GridActionsCellItem
          key="receive"
          icon={actionLoading === task.id ? <CircularProgress size={16} /> : <GetAppIcon />}
          label="领取任务"
          onClick={() => handleReceiveTask(task.id)}
          disabled={actionLoading === task.id}
          color="primary"
        />
      );
    } else if (task.user_status === 0) {
      // 已领取 - 显示完成按钮
      actions.push(
        <GridActionsCellItem
          key="complete"
          icon={actionLoading === task.id ? <CircularProgress size={16} /> : <CheckCircleIcon />}
          label="完成任务"
          onClick={() => handleCompleteTask(task.id)}
          disabled={actionLoading === task.id}
          color="success"
        />
      );
    }

    // 管理员操作
    if (hasPermission('task:update')) {
      actions.push(
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="编辑"
          onClick={() => handleEdit(task.id)}
          color="primary"
        />
      );
    }

    if (hasPermission('task:delete')) {
      actions.push(
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="删除"
          onClick={() => handleDeleteClick(task)}
          color="error"
        />
      );
    }

    return actions;
  };

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80,
    },
    {
      field: 'code',
      headerName: '任务代码',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value || 'N/A'}
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      field: 'name',
      headerName: '任务名称',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'reward_cny',
      headerName: '奖励金额',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={`¥${params.value || 0}`}
          size="small"
          color="success"
          variant="filled"
        />
      ),
    },
    {
      field: 'description',
      headerName: '任务描述',
      flex: 2,
      minWidth: 250,
      renderCell: (params) => (
        <Box
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
          }}
          title={params.value || ''}
        >
          {params.value || '-'}
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: '任务状态',
      width: 100,
      renderCell: getTaskStatusChip,
      sortable: false,
    },
    {
      field: 'created_at',
      headerName: '创建时间',
      width: 160,
      valueFormatter: (params) => {
        if (!params.value) return '-';
        try {
          return new Date(params.value).toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch {
          return '-';
        }
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '操作',
      width: 200,
      sortable: false,
      getActions: getTaskActions,
    },
  ];

  // 渲染加载状态
  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="400px"
          flexDirection="column"
        >
          <CircularProgress size={40} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            正在加载任务列表...
          </Typography>
        </Box>
      </Container>
    );
  }

  // 渲染错误状态
  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
          <Button 
            size="small" 
            onClick={() => fetchTasks(paginationModel.page, paginationModel.pageSize, search)}
            sx={{ ml: 2 }}
          >
            重试
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ width: '100%', py: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h4" component="h1">
            任务列表
          </Typography>
          {hasPermission('task:create') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create')}
              size="large"
            >
              创建新任务
            </Button>
          )}
        </Box>

        {/* 搜索框 */}
        <Box sx={{ mb: 2 }}>
          <TextField
            placeholder="搜索任务名称、代码或描述..."
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 400 } }}
          />
        </Box>

        {/* 数据表格 */}
        <Paper sx={{ height: 650, width: '100%' }}>
          <DataGrid
            rows={tasks}
            columns={columns}
            loading={loading}
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationChange}
            rowCount={rowCount}
            paginationMode="client" // 改为客户端分页
            pageSizeOptions={[5, 10, 25, 50]}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: false,
              },
            }}
            disableRowSelectionOnClick
            sx={{
              border: 0,
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f0f0f0',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#fafafa',
                borderBottom: '2px solid #e0e0e0',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          />
        </Paper>

        {/* 删除确认对话框 */}
        <Dialog
          open={deleteDialog.open}
          onClose={handleDeleteCancel}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>确认删除任务</DialogTitle>
          <DialogContent>
            <Typography>
              确定要删除任务 "<strong>{deleteDialog.taskName}</strong>" 吗？
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              此操作不可撤销，与该任务相关的所有数据将被永久删除。
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>
              取消
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error"
              variant="contained"
            >
              确认删除
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default TaskList;