'use client';

import { Box, Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material';

const CHAT_SESSIONS = [
  {
    id: 'S-1021',
    customerName: 'Nguyễn Văn An',
    summary: 'AI chưa xử lý được yêu cầu đổi lịch chăm cây...',
    waitingMinutes: 10,
    status: 'waiting' as const,
  },
  {
    id: 'S-1020',
    customerName: 'Trần Thu Hà',
    summary: 'Cần xác nhận lại đơn dịch vụ định kỳ',
    waitingMinutes: 6,
    status: 'waiting' as const,
  },
  {
    id: 'S-1019',
    customerName: 'Lê Minh Khoa',
    summary: 'AI hỗ trợ xong FAQ về vận chuyển cây',
    waitingMinutes: 2,
    status: 'active' as const,
  },
  {
    id: 'S-1018',
    customerName: 'Phạm Ngọc My',
    summary: 'Phiên chat đã đóng bởi staff',
    waitingMinutes: 0,
    status: 'closed' as const,
  },
];

const CHAT_LOG = [
  { id: 1, sender: 'customer' as const, text: 'or we could make this?' },
  { id: 2, sender: 'staff' as const, text: 'that looks so good!' },
];

export default function ChatManagementPage() {
  const waitingCount = CHAT_SESSIONS.filter((s) => s.status === 'waiting').length;
  const activeCount = CHAT_SESSIONS.filter((s) => s.status === 'active').length;
  const closedCount = CHAT_SESSIONS.filter((s) => s.status === 'closed').length;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        gap: 2,
        bgcolor: 'grey.50',
        height: '100%',
        minHeight: 0,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Waiting
          </Typography>
          <Typography variant="h5" fontWeight={600} color="warning.main">
            {waitingCount}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Active
          </Typography>
          <Typography variant="h5" fontWeight={600} color="info.main">
            {activeCount}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Closed Today
          </Typography>
          <Typography variant="h5" fontWeight={600} color="success.main">
            {closedCount}
          </Typography>
        </Paper>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', xl: '280px minmax(0, 1fr)' },
          minHeight: 0,
        }}
      >
        <Paper variant="outlined" sx={{ p: 1.5, minHeight: 0, overflow: 'auto' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
            <Typography variant="subtitle2" fontWeight={600}>
              Chat Sessions
            </Typography>
            <Button size="small" variant="outlined">
              Refresh
            </Button>
          </Stack>

          <Stack direction="row" spacing={1} mb={1.5}>
            <Chip label="Waiting" color="success" size="small" />
            <Chip label="Active" variant="outlined" size="small" />
            <Chip label="Closed" variant="outlined" size="small" />
          </Stack>

          <Stack spacing={1}>
            {CHAT_SESSIONS.map((session, index) => (
              <Button
                key={session.id}
                variant="outlined"
                sx={{
                  display: 'block',
                  textAlign: 'left',
                  borderColor: index === 0 ? 'success.light' : 'divider',
                  bgcolor: index === 0 ? 'success.light' : 'common.white',
                  color: 'text.primary',
                  textTransform: 'none',
                  borderRadius: 2,
                  py: 1.25,
                  px: 1.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight={600}>
                    {session.customerName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {session.waitingMinutes} min
                  </Typography>
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {session.summary}
                </Typography>
              </Button>
            ))}
          </Stack>
        </Paper>

        <Paper variant="outlined" sx={{ overflow: 'hidden', minHeight: 0, display: 'grid', gridTemplateRows: 'auto 1fr auto' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography fontWeight={600}>Nguyễn Văn An</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" sx={{ textTransform: 'none' }}>
                Join chat
              </Button>
              <Button size="small" variant="contained" sx={{ textTransform: 'none' }} className='bg-primary! hover:bg-success!'>
                Take over AI
              </Button>
            </Stack>
          </Box>

          <Box sx={{ bgcolor: 'grey.50', p: 2, minHeight: 0, overflow: 'auto' }}>
            <Stack spacing={1.5}>
              {CHAT_LOG.map((entry) => (
                <Box
                  key={entry.id}
                  sx={{ display: 'flex', justifyContent: entry.sender === 'customer' ? 'flex-end' : 'flex-start' }}
                >
                  <Box
                    sx={{
                      borderRadius: 3,
                      px: 1.5,
                      py: 1,
                      fontSize: 14,
                      bgcolor: entry.sender === 'customer' ? 'secondary.dark' : 'secondary.light',
                      color: entry.sender === 'customer' ? 'common.white' : 'text.primary',
                    }}
                  >
                    {entry.text}
                  </Box>
                </Box>
              ))}
            </Stack>

            <Stack direction="row" spacing={1} justifyContent="flex-end" mt={3}>
              <Chip label="Let's do it" clickable sx={{ bgcolor: 'secondary.light' }} />
              <Chip label="Great!" clickable sx={{ bgcolor: 'secondary.light' }} />
            </Stack>
          </Box>

          <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                fullWidth
                size="small"
                placeholder="Staff có thể nhập phản hồi khi join..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 999 } }}
              />
              <Button variant="contained" sx={{ borderRadius: 999, textTransform: 'none' }}>
                Send
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
