'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
} from '@mui/material';
import {
  People,
  Chat,
  Speed,
  CheckCircle,
} from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import {
  userTrafficByHour,
  aiModerationStats,
  adminSystemStats,
} from '@/data/dashboardMockData';

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function AdminSystemDashboard() {
  // Prepare data for user traffic area chart
  const trafficHours = userTrafficByHour.map((item) => item.hour);
  const userCounts = userTrafficByHour.map((item) => item.users);
  const chatSessionCounts = userTrafficByHour.map((item) => item.chatSessions);

  // Prepare data for AI moderation pie chart
  const moderationData = [
    { id: 0, value: aiModerationStats.approved, label: 'Đã duyệt', color: '#4caf50' },
    { id: 1, value: aiModerationStats.rejected, label: 'Từ chối', color: '#f44336' },
    { id: 2, value: aiModerationStats.pending, label: 'Chờ xử lý', color: '#ff9800' },
  ];

  const approvalRate = (
    (aiModerationStats.approved / aiModerationStats.total) *
    100
  ).toFixed(1);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard Hệ Thống
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Giám sát hoạt động người dùng và kiểm duyệt AI
      </Typography>

      {/* Statistics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <StatCard
          title="Tổng Người Dùng"
          value={adminSystemStats.totalUsers.toLocaleString()}
          icon={<People sx={{ color: 'white', fontSize: 32 }} />}
          color="#2196f3"
          subtitle={`${adminSystemStats.activeUsers.toLocaleString()} đang hoạt động`}
        />
        <StatCard
          title="Phiên Chat"
          value={adminSystemStats.totalChatSessions.toLocaleString()}
          icon={<Chat sx={{ color: 'white', fontSize: 32 }} />}
          color="#9c27b0"
        />
        <StatCard
          title="Thời Gian Phản Hồi TB"
          value={`${adminSystemStats.averageResponseTime} phút`}
          icon={<Speed sx={{ color: 'white', fontSize: 32 }} />}
          color="#ff9800"
        />
        <StatCard
          title="Tỷ Lệ Duyệt AI"
          value={`${approvalRate}%`}
          icon={<CheckCircle sx={{ color: 'white', fontSize: 32 }} />}
          color="#4caf50"
          subtitle={`${aiModerationStats.approved.toLocaleString()} ảnh được duyệt`}
        />
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* User Traffic Area Chart */}
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Lưu Lượng Người Dùng & Phiên Chat Theo Giờ
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Theo dõi hoạt động người dùng trong 24 giờ
            </Typography>
            <Box sx={{ width: '100%', height: 350 }}>
              <LineChart
                xAxis={[
                  {
                    data: trafficHours,
                    scaleType: 'band',
                  },
                ]}
                series={[
                  {
                    data: userCounts,
                    label: 'Người dùng',
                    color: '#2196f3',
                    area: true,
                    showMark: false,
                  },
                  {
                    data: chatSessionCounts,
                    label: 'Phiên chat',
                    color: '#9c27b0',
                    area: true,
                    showMark: false,
                  },
                ]}
                height={350}
              />
            </Box>
          </Paper>

        {/* AI Moderation Pie Chart */}
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Trạng Thái Kiểm Duyệt AI
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Tỷ lệ phê duyệt hình ảnh
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 350,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PieChart
                series={[
                  {
                    data: moderationData,
                    innerRadius: 30,
                    outerRadius: 120,
                    paddingAngle: 2,
                    cornerRadius: 5,
                  },
                ]}
                height={350}
                slotProps={{
                  legend: {
                    position: { vertical: 'bottom', horizontal: 'center' },
                  },
                }}
              />
            </Box>
          </Paper>
      </Box>

      {/* AI Moderation Details and Peak Hours */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 3 }}>
        {/* AI Moderation Details */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Chi Tiết Kiểm Duyệt AI
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Thống kê chi tiết về xét duyệt hình ảnh
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)' }, gap: 2 }}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e9', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="#4caf50">
                  {aiModerationStats.approved.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Đã Duyệt
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#ffebee', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="#f44336">
                  {aiModerationStats.rejected.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Từ Chối
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff3e0', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="#ff9800">
                  {aiModerationStats.pending.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Chờ Xử Lý
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="#2196f3">
                  {aiModerationStats.total.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Tổng Cộng
                </Typography>
              </Box>
            </Box>
          </Paper>

        {/* Peak Hours Analysis */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Phân Tích Giờ Cao Điểm
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Các khung giờ có lượng truy cập cao nhất
            </Typography>
            <Box>
              {userTrafficByHour
                .sort((a, b) => b.users - a.users)
                .slice(0, 5)
                .map((item, index) => (
                  <Box
                    key={item.hour}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 2,
                      mb: 1,
                      backgroundColor: index === 0 ? '#e3f2fd' : '#f5f5f5',
                      borderRadius: 1,
                      borderLeft: index === 0 ? '4px solid #2196f3' : 'none',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {item.hour}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.chatSessions} phiên chat
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {item.users.toLocaleString()}
                      <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        người
                      </Typography>
                    </Typography>
                  </Box>
                ))}
            </Box>
          </Paper>
      </Box>
    </Box>
  );
}
