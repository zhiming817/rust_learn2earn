import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Button
} from '@mui/material';

const RejectDialog = ({ 
  open, 
  submission, 
  note,
  loading, 
  onConfirm, 
  onCancel,
  onNoteChange 
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>拒绝提交</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          确定要拒绝用户 {submission?.user_id} 的提交吗？
        </DialogContentText>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="拒绝原因（可选）"
          value={note}
          onChange={onNoteChange}
          placeholder="请输入拒绝原因..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          取消
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          disabled={loading}
        >
          {loading ? '处理中...' : '确认拒绝'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectDialog;