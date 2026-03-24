'use client';

/**
 * Enhanced Support Chat Widget with SignalR Integration
 * 
 * Bản upgrade của SupportChatWidget.tsx với tích hợp SignalR real-time
 * 
 * 🎯 Features:
 * - Real-time chat với admin/staff
 * - Typing indicators
 * - Online status
 * - Message delivery/read status
 * - Auto-scroll to latest message
 * 
 * 📝 Cách sử dụng:
 * 1. Replace nội dung file components/chat/SupportChatWidget.tsx bằng code này
 * 2. Hoặc tạo component mới và thay thế trong layout
 */

import { useState, useEffect, useRef } from 'react';
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
  Avatar,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  ArrowUpward as SendIcon,
  ChatBubbleOutline as ChatIcon,
  Close as CloseIcon,
  Circle,
} from '@mui/icons-material';
import { useChatRoom, useTypingIndicator, useSignalR } from '@/hooks/useSignalR';
import { useAuthStore } from '@/lib/store/authStore';
import { formatDistanceToNow } from '@/lib/utils/dateUtils';
import type { ChatMessage } from '@/types/signalr.types';

const QUICK_REPLIES = ['Lịch chăm cây', 'Đơn hàng', 'Dịch vụ chăm sóc'];

export default function SupportChatWidgetEnhanced() {
  const [isOpen, setIsOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const { user } = useAuthStore();
  const { isConnected } = useSignalR();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Generate support room ID based on user ID
  const supportRoomId = user ? `support-${user.id}` : null;
  
  // SignalR hooks
  const { messages, sendMessage } = useChatRoom(supportRoomId);
  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(supportRoomId || '');

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !supportRoomId) return;

    await sendMessage(messageInput.trim());
    setMessageInput('');
    stopTyping();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = () => {
    startTyping();
  };

  const handleQuickReply = (reply: string) => {
    setMessageInput(reply);
  };

  // Don't show chat if user not logged in
  if (!user) {
    return null;
  }

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
            width: 380,
            height: 560,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.dark' }}>
                <ChatIcon sx={{ fontSize: 18 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Plant Decor Support
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Circle sx={{ fontSize: 8, color: isConnected ? 'success.light' : 'error.light' }} />
                  <Typography variant="caption">
                    {isConnected ? 'Online' : 'Offline'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Quick Replies */}
          {messages.length === 0 && (
            <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                Chủ đề phổ biến:
              </Typography>
              <Stack direction="row" spacing={1}>
                {QUICK_REPLIES.map((reply) => (
                  <Chip
                    key={reply}
                    label={reply}
                    size="small"
                    onClick={() => handleQuickReply(reply)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          <Divider />

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              bgcolor: 'grey.50',
            }}
          >
            {!isConnected && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={24} />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  Đang kết nối...
                </Typography>
              </Box>
            )}

            {messages.length === 0 && isConnected && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <ChatIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Chưa có tin nhắn nào
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Gửi tin nhắn để bắt đầu trò chuyện
                </Typography>
              </Box>
            )}

            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} currentUserId={user.id?.toString() || ''} />
            ))}

            {/* Typing Indicator */}
            {typingUsers.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 0.5,
                    bgcolor: 'white',
                    borderRadius: 2,
                    px: 1.5,
                    py: 1,
                  }}
                >
                  <Circle sx={{ fontSize: 8, color: 'text.disabled', animation: 'pulse 1.5s infinite' }} />
                  <Circle sx={{ fontSize: 8, color: 'text.disabled', animation: 'pulse 1.5s infinite 0.2s' }} />
                  <Circle sx={{ fontSize: 8, color: 'text.disabled', animation: 'pulse 1.5s infinite 0.4s' }} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {typingUsers[0]} đang nhập...
                </Typography>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          <Divider />

          {/* Input */}
          <Box sx={{ p: 2, bgcolor: 'white' }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              placeholder="Nhập tin nhắn..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyPress}
              onKeyUp={handleTyping}
              onBlur={stopTyping}
              disabled={!isConnected}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim() || !isConnected}
                        color="primary"
                      >
                        <SendIcon />
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
          color="primary"
          onClick={() => setIsOpen(true)}
          sx={{ width: 56, height: 56 }}
        >
          <ChatIcon />
        </Fab>
      )}
    </Box>
  );
}

/**
 * Message Bubble Component
 */
interface MessageBubbleProps {
  message: ChatMessage;
  currentUserId: string;
}

function MessageBubble({ message, currentUserId }: MessageBubbleProps) {
  const isOwnMessage = message.senderId === currentUserId;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
      }}
    >
      {!isOwnMessage && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, ml: 1 }}>
          {message.senderName}
        </Typography>
      )}
      
      <Box
        sx={{
          maxWidth: '75%',
          bgcolor: isOwnMessage ? 'primary.main' : 'white',
          color: isOwnMessage ? 'white' : 'text.primary',
          px: 2,
          py: 1.5,
          borderRadius: 2,
          borderBottomRightRadius: isOwnMessage ? 0 : 2,
          borderBottomLeftRadius: isOwnMessage ? 2 : 0,
          boxShadow: 1,
        }}
      >
        <Typography variant="body2">{message.message}</Typography>
      </Box>
      
      <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, mx: 1 }}>
        {formatDistanceToNow(message.timestamp)}
        {message.isRead && isOwnMessage && ' • Đã xem'}
      </Typography>
    </Box>
  );
}
