import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbar
} from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { taskAPI } from '../services/api';

const TaskList = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, task: null });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskAPI.getAllTasks();
      setTasks(response.data);
      setError(null);
    } catch (err) {
      setError('获取任务列表失败');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  const handleDeleteClick = (task) => {
    setDeleteDialog({ open: true, task });
  };

  const handleDeleteConfirm = async () => {
    try {
      await taskAPI.deleteTask(deleteDialog.task.id);
      setTasks(tasks.filter(task => task.id !== deleteDialog.task.id));
      setDeleteDialog({ open: false, task: null });
    } catch (err) {
      setError('删除任务失败');
      console.error('Error deleting task:', err);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, task: null });
  };

  const columns = [
    // {
    //   field: 'id',
    //   headerName: 'ID',
    //   width: 70,
    // },
    {
      field: 'code',
      headerName: '任务',
      width: 130,
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
      width: 150,
      flex: 1,
    },
    {
      field: 'reward_cny',
      headerName: '人民币等值Token',
      width: 160,
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
      width: 300,
      flex: 2,
    },
    
    {
      field: 'actions',
      type: 'actions',
      headerName: '操作',
      width: 120,
      getActions: (params) => [
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
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

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={tasks}
          columns={columns}
          loading={loading}
          slots={{
            toolbar: GridToolbar,
            loadingOverlay: CircularProgress,
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25]}
          checkboxSelection
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell:hover': {
              color: 'primary.main',
            },
          }}
        />
      </Paper>

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
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