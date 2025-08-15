import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button
} from '@mui/material';

const ApproveDialog = ({ 
  open, 
  submission, 
  loading, 
  onConfirm, 
  onCancel 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>确认通过提交</DialogTitle>
      <DialogContent>
        <DialogContentText>
          确定要通过用户 {submission?.user_id} 的提交吗？
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          取消
        </Button>
        <Button 
          onClick={onConfirm} 
          color="success" 
          variant="contained"
          disabled={loading}
        >
          {loading ? '处理中...' : '确认通过'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApproveDialog;