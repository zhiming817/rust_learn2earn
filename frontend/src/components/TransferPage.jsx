import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AccountBalanceWallet as WalletIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { 
  useCurrentAccount, 
  useSignAndExecuteTransaction,
  useSuiClient,
  ConnectButton,
  useWallets,
  useConnectWallet,
  useSuiClientQuery
} from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { MIST_PER_SUI } from '@mysten/sui/utils';
import { taskSubmissionAPI } from '../services/api';

const TransferPage = () => {
  const { submissionId } = useParams();
  const navigate = useNavigate();
  
  // Sui dApp Kit hooks
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  
  // 基础状态
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 转账表单状态
  const [transferData, setTransferData] = useState({
    address: '',
    amount: '',
    tokenType: 'SUI',
    memo: ''
  });
  
  // 转账状态
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferResult, setTransferResult] = useState(null);
  
  // UI状态
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [confirmDialog, setConfirmDialog] = useState(false);

  // 获取钱包余额
  const { data: balance, refetch: refetchBalance } = useSuiClientQuery(
    'getBalance',
    {
      owner: currentAccount?.address || '',
      coinType: '0x2::sui::SUI'
    },
    {
      enabled: !!currentAccount?.address,
    }
  );

  const walletBalance = balance ? Number(balance.totalBalance) / Number(MIST_PER_SUI) : 0;

  // 获取提交详情
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const response = await taskSubmissionAPI.getSubmissionById(submissionId);
        setSubmission(response.data);
        setError(null);
      } catch (err) {
        setError('获取提交信息失败');
        console.error('Error fetching submission:', err);
      } finally {
        setLoading(false);
      }
    };

    if (submissionId) {
      fetchSubmission();
    }
  }, [submissionId]);

  const handleTransferDataChange = (field) => (event) => {
    setTransferData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const isValidSuiAddress = (address) => {
    return address && address.startsWith('0x') && address.length === 66;
  };

  const handleTransferClick = () => {
    if (!transferData.address || !transferData.amount) {
      setSnackbar({
        open: true,
        message: '请填写完整的转账信息',
        severity: 'warning'
      });
      return;
    }

    if (!isValidSuiAddress(transferData.address)) {
      setSnackbar({
        open: true,
        message: '请输入有效的SUI地址',
        severity: 'warning'
      });
      return;
    }

    if (parseFloat(transferData.amount) <= 0) {
      setSnackbar({
        open: true,
        message: '转账金额必须大于0',
        severity: 'warning'
      });
      return;
    }

    if (walletBalance && parseFloat(transferData.amount) > walletBalance) {
      setSnackbar({
        open: true,
        message: '余额不足',
        severity: 'warning'
      });
      return;
    }

    setConfirmDialog(true);
  };

  const executeTransfer = async () => {
    if (!currentAccount) {
      setSnackbar({
        open: true,
        message: '请先连接钱包',
        severity: 'warning'
      });
      return;
    }

    try {
      setTransferLoading(true);
      setConfirmDialog(false);

      // 创建交易 - 使用最新的Transaction类
      const tx = new Transaction();
      
      // 转换金额为MIST单位
      const amountInMist = BigInt(parseFloat(transferData.amount) * Number(MIST_PER_SUI));
      
      // 分割币对象
      const [coin] = tx.splitCoins(tx.gas, [amountInMist]);
      
      // 转账
      tx.transferObjects([coin], transferData.address);
      
      // 使用dApp Kit执行交易
      signAndExecuteTransaction(
        {
          transaction: tx,
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
        },
        {
          onSuccess: (result) => {
            console.log('Transfer successful:', result);
            setTransferResult({
              success: true,
              digest: result.digest,
              amount: transferData.amount,
              recipient: transferData.address
            });
            
            setSnackbar({
              open: true,
              message: '发放奖励成功！',
              severity: 'success'
            });

            // 刷新余额
            refetchBalance();
            
            // 重置表单
            setTransferData({
              address: '',
              amount: '',
              tokenType: 'SUI',
              memo: ''
            });
          },
          onError: (error) => {
            console.error('Transfer failed:', error);
            setTransferResult({
              success: false,
              error: error.message
            });
            setSnackbar({
              open: true,
              message: `转账失败: ${error.message}`,
              severity: 'error'
            });
          }
        }
      );
    } catch (err) {
      console.error('转账失败:', err);
      setSnackbar({
        open: true,
        message: `转账失败: ${err.message}`,
        severity: 'error'
      });
    } finally {
      setTransferLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const connectFirstWallet = () => {
    if (wallets.length > 0) {
      connect(
        { wallet: wallets[0] },
        {
          onSuccess: () => {
            setSnackbar({
              open: true,
              message: '钱包连接成功！',
              severity: 'success'
            });
          },
          onError: (error) => {
            setSnackbar({
              open: true,
              message: `连接失败: ${error.message}`,
              severity: 'error'
            });
          }
        }
      );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: 3 }}>
      {/* 页面头部 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} color="primary">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          发放奖励
        </Typography>
        <Chip label={`提交ID: ${submissionId}`} color="primary" variant="outlined" />
      </Box>

      {/* 提交信息卡片 */}
      {submission && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              提交信息
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">用户ID</Typography>
                <Typography variant="body1">{submission.user_id}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">任务ID</Typography>
                <Typography variant="body1">{submission.task_id}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">状态</Typography>
                <Chip 
                  label={submission.status === 'approved' ? '已通过' : submission.status} 
                  color="success" 
                  size="small" 
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">PR链接</Typography>
                <Typography 
                  variant="body1" 
                  component="a" 
                  href={submission.pr_url} 
                  target="_blank"
                  sx={{ color: 'primary.main', textDecoration: 'none' }}
                >
                  查看PR
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* 钱包连接状态 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">钱包状态</Typography>
            <IconButton onClick={() => refetchBalance()}>
              <RefreshIcon />
            </IconButton>
          </Box>
          
          {currentAccount ? (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                钱包已连接
              </Alert>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minWidth(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">钱包地址</Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.9em' }}>
                    {currentAccount.address?.substring(0, 20)}...
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">SUI余额</Typography>
                  <Typography variant="body1">
                    {walletBalance.toFixed(4)} SUI
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                钱包未连接
              </Alert>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <ConnectButton />
                {wallets.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    请安装SUI钱包插件（如Sui Wallet、Suiet等）
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 转账表单 */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            发放奖励信息
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              fullWidth
              label="收款地址"
              value={transferData.address}
              onChange={handleTransferDataChange('address')}
              placeholder="0x..."
              error={transferData.address && !isValidSuiAddress(transferData.address)}
              helperText={
                transferData.address && !isValidSuiAddress(transferData.address)
                  ? "请输入有效的SUI地址（以0x开头，长度为66位）"
                  : "请输入收款方的SUI钱包地址"
              }
            />
            
            <TextField
              fullWidth
              label="转账金额"
              type="number"
              value={transferData.amount}
              onChange={handleTransferDataChange('amount')}
              InputProps={{
                endAdornment: <InputAdornment position="end">SUI</InputAdornment>,
              }}
              inputProps={{
                min: 0,
                step: 0.01
              }}
              helperText={`可用余额: ${walletBalance.toFixed(4)} SUI`}
            />
            
            <FormControl fullWidth>
              <InputLabel>代币类型</InputLabel>
              <Select
                value={transferData.tokenType}
                label="代币类型"
                onChange={handleTransferDataChange('tokenType')}
              >
                <MenuItem value="SUI">SUI</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="备注（可选）"
              multiline
              rows={2}
              value={transferData.memo}
              onChange={handleTransferDataChange('memo')}
              placeholder="备注信息..."
            />

            <Button
              variant="contained"
              size="large"
              startIcon={transferLoading ? <CircularProgress size={20} /> : <SendIcon />}
              onClick={handleTransferClick}
              disabled={
                !currentAccount || 
                transferLoading || 
                !transferData.address || 
                !transferData.amount ||
                !isValidSuiAddress(transferData.address)
              }
              sx={{ mt: 2 }}
            >
              {transferLoading ? '转账中...' : '发起转账'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 奖励结果 */}
      {transferResult && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {transferResult.success ? (
                <CheckCircleIcon color="success" />
              ) : (
                <ErrorIcon color="error" />
              )}
              <Typography variant="h6">
                发放奖励{transferResult.success ? '成功' : '失败'}
              </Typography>
            </Box>
            
            {transferResult.success ? (
              <Box>
                <Typography variant="body2" color="text.secondary">交易哈希</Typography>
                <Typography 
                  variant="body1" 
                  sx={{ fontFamily: 'monospace', fontSize: '0.9em', mb: 2, wordBreak: 'break-all' }}
                >
                  {transferResult.digest}
                </Typography>
                <Typography variant="body2" color="text.secondary">详情</Typography>
                <Typography variant="body1">
                  向 {transferResult.recipient}发放奖励 {transferResult.amount} SUI
                </Typography>
              </Box>
            ) : (
              <Alert severity="error">
                {transferResult.error}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* 确认对话框 */}
      <Dialog
        open={confirmDialog}
        onClose={() => setConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>确认</DialogTitle>
        <DialogContent>
          <DialogContentText>
            您确定要执行以下操作吗？
          </DialogContentText>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2"><strong>收款地址:</strong> {transferData.address}</Typography>
            <Typography variant="body2"><strong>金额:</strong> {transferData.amount} SUI</Typography>
            <Typography variant="body2"><strong>代币类型:</strong> {transferData.tokenType}</Typography>
            {transferData.memo && (
              <Typography variant="body2"><strong>备注:</strong> {transferData.memo}</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>
            取消
          </Button>
          <Button onClick={executeTransfer} variant="contained" color="primary">
            确认转账
          </Button>
        </DialogActions>
      </Dialog>

      {/* 消息提示 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
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

export default TransferPage;