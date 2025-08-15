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
  DialogContentText,
  CircularProgress,
  TextField,
  InputAdornment
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
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { taskAPI } from '../services/api';

const TaskList = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, task: null });
  
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
      const response = await taskAPI.getTasks({
        page: page + 1, // 后端从1开始计数
        page_size: pageSize,
        search: searchTerm
      });
      
      setTasks(response.data.data);
      setRowCount(response.data.pagination.total);
      setError(null);
    } catch (err) {
      setError('获取任务列表失败');
      console.error('Error fetching tasks:', err);
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
    setDeleteDialog({ open: true, task });
  };

  const handleDeleteConfirm = async () => {
    try {
      await taskAPI.deleteTask(deleteDialog.task.id);
      setDeleteDialog({ open: false, task: null });
      // 重新获取当前页数据
      fetchTasks(paginationModel.page, paginationModel.pageSize, search);
    } catch (err) {
      setError('删除任务失败');
      console.error('Error deleting task:', err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, task: null });
  };

  const columns = [
    {
      field: 'code',
      headerName: '任务',
      minWidth: 120,
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          color="primary"
        />
      ),
    },
    {
      field: 'name',
      headerName: '名称',
      minWidth: 150,
      flex: 1.5,
    },
    {
      field: 'reward_cny',
      headerName: '人民币等值Token',
      minWidth: 140,
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={`¥${params.value}`}
          size="small"
          color="success"
          variant="filled"
        />
      ),
    },
    {
      field: 'description',
      headerName: '说明',
      minWidth: 200,
      flex: 2,
      renderCell: (params) => (
        <Box
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            width: '100%',
          }}
          title={params.value}
        >
          {params.value}
        </Box>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '操作',
      minWidth: 150,
      flex: 0.8,
      sortable: false,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<AssignmentIcon />}
          label="查看PR"
          onClick={() => handleViewSubmissions(params.id)}
          color="info"
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="编辑"
          onClick={() => handleEdit(params.id)}
          color="primary"
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="删除"
          onClick={() => handleDeleteClick(params.row)}
          color="error"
        />,
      ],
    },
  ];

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/create')}
          size="large"
        >
          创建新任务
        </Button>
      </Box>

      {/* 搜索框 */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
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
          sx={{ maxWidth: 400 }}
        />
      </Box>

      <Paper sx={{ 
        height: 'calc(100vh - 300px)', 
        minHeight: 400,
        width: '100%',
      }}>
        <DataGrid
          rows={tasks}
          columns={columns}
          loading={loading}
          pagination
          paginationMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={handlePaginationChange}
          rowCount={rowCount}
          pageSizeOptions={[5, 10, 25, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          autoHeight={false}
          sx={{
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
            '& .MuiDataGrid-main': {
              overflow: 'hidden',
            },
            '& .MuiDataGrid-virtualScroller': {
              overflow: 'auto',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: 'grey.50',
            },
            width: '100%',
            height: '100%',
          }}
        />
      </Paper>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="alert-dialog-title">
          确认删除任务
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            确定要删除任务 "{deleteDialog.task?.name}" 吗？此操作无法撤销。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>取消</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaskList;