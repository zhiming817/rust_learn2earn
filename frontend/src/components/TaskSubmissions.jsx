import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Box,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem
} from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  OpenInNew as OpenInNewIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
import { taskSubmissionAPI } from '../services/api';
import ApproveDialog from './dialogs/ApproveDialog';
import RejectDialog from './dialogs/RejectDialog';

const TaskSubmissions = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [taskInfo, setTaskInfo] = useState(null);
  
  // 分页状态
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [rowCount, setRowCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  // 对话框状态
  const [approveDialog, setApproveDialog] = useState({ open: false, submission: null });
  const [rejectDialog, setRejectDialog] = useState({ open: false, submission: null });
  const [rejectNote, setRejectNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // 消息提示
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchSubmissions = useCallback(async (page = 0, pageSize = 10, status = '') => {
    try {
      setLoading(true);
      const params = {
        page: page + 1, // 后端从1开始计数
        page_size: pageSize,
      };
      
      if (status) {
        params.status = status;
      }

      const response = await taskSubmissionAPI.getSubmissionsByTaskId(taskId, params);
      
      setSubmissions(response.data.data);
      setRowCount(response.data.pagination.total);
      setError(null);
    } catch (err) {
      setError('获取提交记录失败');
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchSubmissions(paginationModel.page, paginationModel.pageSize, statusFilter);
  }, [paginationModel, statusFilter, fetchSubmissions]);

  const handlePaginationChange = (newPaginationModel) => {
    setPaginationModel(newPaginationModel);
  };

  const handleStatusFilterChange = (event) => {
    const newStatus = event.target.value;
    setStatusFilter(newStatus);
    // 状态筛选时重置到第一页
    setPaginationModel(prev => ({ ...prev, page: 0 }));
  };

  const handleViewSubmission = (submissionId) => {
    navigate(`/submissions/${submissionId}`);
  };

  const handleTransferClick = (submission) => {
    navigate(`/submissions/${submission.id}/transfer`);
  };

  // 通过相关处理函数
  const handleApproveClick = (submission) => {
    setApproveDialog({ open: true, submission });
  };

  const handleApproveConfirm = async () => {
    if (!approveDialog.submission) return;
    
    try {
      setActionLoading(true);
      await taskSubmissionAPI.approveSubmission(approveDialog.submission.id);
      
      setSnackbar({
        open: true,
        message: '提交已通过！',
        severity: 'success'
      });
      
      setApproveDialog({ open: false, submission: null });
      
      // 刷新列表
      fetchSubmissions(paginationModel.page, paginationModel.pageSize, statusFilter);
    } catch (err) {
      setSnackbar({
        open: true,
        message: '操作失败，请重试',
        severity: 'error'
      });
      console.error('Error approving submission:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveCancel = () => {
    setApproveDialog({ open: false, submission: null });
  };

  // 拒绝相关处理函数
  const handleRejectClick = (submission) => {
    setRejectDialog({ open: true, submission });
    setRejectNote('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectDialog.submission) return;
    
    try {
      setActionLoading(true);
      await taskSubmissionAPI.rejectSubmission(rejectDialog.submission.id, rejectNote);
      
      setSnackbar({
        open: true,
        message: '提交已拒绝！',
        severity: 'success'
      });
      
      setRejectDialog({ open: false, submission: null });
      setRejectNote('');
      
      // 刷新列表
      fetchSubmissions(paginationModel.page, paginationModel.pageSize, statusFilter);
    } catch (err) {
      setSnackbar({
        open: true,
        message: '操作失败，请重试',
        severity: 'error'
      });
      console.error('Error rejecting submission:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCancel = () => {
    setRejectDialog({ open: false, submission: null });
    setRejectNote('');
  };

  const handleRejectNoteChange = (event) => {
    setRejectNote(event.target.value);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'reviewing':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '待审核';
      case 'approved':
        return '已通过';
      case 'rejected':
        return '已拒绝';
      case 'reviewing':
        return '审核中';
      default:
        return status;
    }
  };

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      minWidth: 80,
      flex: 0.5,
    },
    {
      field: 'user_id',
      headerName: '用户ID',
      minWidth: 100,
      flex: 0.8,
    },
    {
      field: 'pr_url',
      headerName: 'PR链接',
      minWidth: 200,
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Link
            href={params.value}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '150px',
            }}
          >
            {params.value}
          </Link>
          <IconButton
            size="small"
            onClick={() => window.open(params.value, '_blank')}
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: '状态',
      minWidth: 100,
      flex: 0.8,
      renderCell: (params) => (
        <Chip
          label={getStatusText(params.value)}
          size="small"
          color={getStatusColor(params.value)}
          variant="filled"
        />
      ),
    },
    {
      field: 'note',
      headerName: '备注',
      minWidth: 150,
      flex: 1.2,
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
          {params.value || '-'}
        </Box>
      ),
    },
    {
      field: 'created_at',
      headerName: '提交时间',
      minWidth: 160,
      flex: 1,
      renderCell: (params) => (
        new Date(params.value).toLocaleString('zh-CN')
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '操作',
      minWidth: 250,
      flex: 1.2,
      sortable: false,
      getActions: (params) => {
        const actions = [
          <GridActionsCellItem
            icon={<VisibilityIcon />}
            label="查看详情"
            onClick={() => handleViewSubmission(params.id)}
            color="primary"
          />,
        ];

        // 只有待审核状态才显示通过和拒绝按钮
        if (params.row.status.toLowerCase() === 'pending') {
          actions.push(
            <GridActionsCellItem
              icon={<CheckCircleIcon />}
              label="通过"
              onClick={() => handleApproveClick(params.row)}
              color="success"
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="拒绝"
              onClick={() => handleRejectClick(params.row)}
              color="error"
            />
          );
        }

        // 已通过的提交显示转账按钮
        if (params.row.status.toLowerCase() === 'approved') {
          actions.push(
            <GridActionsCellItem
              icon={<WalletIcon />}
              label="转账"
              onClick={() => handleTransferClick(params.row)}
              color="info"
            />
          );
        }

        return actions;
      },
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/tasks')} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            任务提交记录
          </Typography>
          {taskId && (
            <Chip label={`任务ID: ${taskId}`} color="primary" variant="outlined" />
          )}
        </Box>
      </Box>

      {/* 状态筛选器 */}
      <Box sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>状态筛选</InputLabel>
          <Select
            value={statusFilter}
            label="状态筛选"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="">全部状态</MenuItem>
            <MenuItem value="pending">待审核</MenuItem>
            <MenuItem value="reviewing">审核中</MenuItem>
            <MenuItem value="approved">已通过</MenuItem>
            <MenuItem value="rejected">已拒绝</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Paper sx={{ 
        height: 'calc(100vh - 300px)', 
        minHeight: 400,
        width: '100%',
      }}>
        <DataGrid
          rows={submissions}
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

      {/* 对话框组件 */}
      <ApproveDialog
        open={approveDialog.open}
        submission={approveDialog.submission}
        loading={actionLoading}
        onConfirm={handleApproveConfirm}
        onCancel={handleApproveCancel}
      />

      <RejectDialog
        open={rejectDialog.open}
        submission={rejectDialog.submission}
        note={rejectNote}
        loading={actionLoading}
        onConfirm={handleRejectConfirm}
        onCancel={handleRejectCancel}
        onNoteChange={handleRejectNoteChange}
      />

      {/* 消息提示 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskSubmissions;