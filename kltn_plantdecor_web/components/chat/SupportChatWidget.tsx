'use client';

import { useMemo, useState } from 'react';
import {
  Box,
  Chip,
  Fab,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowUpward as SendIcon,
  ChatBubbleOutline as ChatIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

const MOCK_MESSAGES: ChatMessage[] = [
  { id: 1, sender: 'ai', text: 'Xin chào, mình là AI hỗ trợ FAQ Plant care.' },
  { id: 2, sender: 'user', text: 'Cách theo dõi lịch chăm cây ở đâu?' },
  { id: 3, sender: 'ai', text: 'Bạn vào My Plant > lịch chăm sóc theo từng chậu cây.' },
];

const QUICK_REPLIES = ['Lịch chăm cây', 'Đơn hàng', 'Dịch vụ chăm sóc'];

export default function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const messages = useMemo(() => MOCK_MESSAGES, []);

  return (
    <Box
      sx={{
        position: 'fixed',
        right: 20,
        bottom: 20,
        zIndex: 1200,
      }}
    >
      {isOpen ? (
        <Paper
          elevation={8}
          sx={{
            width: { xs: 'calc(100vw - 32px)', sm: 340 },
            maxWidth: 'calc(100vw - 32px)',
            overflow: 'hidden',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.5,
            }}
                      className='bg-primary!'

          >
            <Stack direction="row" spacing={1} alignItems="center">
              <ChatIcon sx={{ fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={600}>
                Tin nhắn hỗ trợ Plant care
              </Typography>
            </Stack>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng khung chat hỗ trợ"
              sx={{ color: 'common.white' }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box
            sx={{
              height: 360,
              overflowY: 'auto',
              bgcolor: 'grey.50',
              px: 2,
              py: 2,
            }}
          >
            <Stack spacing={1.5}>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '85%',
                      borderRadius: 3,
                      px: 1.5,
                      py: 1,
                      fontSize: 14,
                      bgcolor: message.sender === 'user' ? 'secondary.light' : 'common.white',
                      color: 'text.primary',
                      boxShadow: message.sender === 'user' ? 'none' : 1,
                    }}
                  >
                    {message.text}
                  </Box>
                </Box>
              ))}
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" mt={3}>
              {QUICK_REPLIES.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  size="small"
                  clickable
                  sx={{ bgcolor: 'secondary.light', color: 'text.primary' }}
                />
              ))}
            </Stack>
          </Box>

          <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'grey.200', bgcolor: 'common.white' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tôi có thể giúp gì cho bạn?"
              slotProps={{
                input: {
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        aria-label="Gửi tin nhắn"
                        sx={{ bgcolor: 'grey.200' }}
                      >
                        <SendIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Box>
        </Paper>
      ) : (
        <Fab
          onClick={() => setIsOpen(true)}
          aria-label="Mở chat hỗ trợ"
          sx={{
            width:  70,
            height: 70,
            borderRadius: 9999,
          }}
          className='bg-primary! hover:bg-success! text-white! hover:text-white! transition-colors'
        >
          <ChatIcon sx={{ fontSize: 40 }} />
        </Fab>
      )}
    </Box>
  );
}