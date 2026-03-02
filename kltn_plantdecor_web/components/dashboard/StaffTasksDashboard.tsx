'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Assignment,
  Chat,
  CheckCircle,
  Star,
} from '@mui/icons-material';
import { PieChart } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import {
  serviceRegistrationStatus,
  serviceRequestsByTimeSlot,
  chatSupportByDay,
  staffTaskStats,
  serviceTypesDistribution,
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

export default function StaffTasksDashboard() {
  // Prepare data for service status pie chart
  const serviceStatusData = [
    { id: 0, value: serviceRegistrationStatus.pending, label: 'Chờ xác nhận', color: '#ff9800' },
    { id: 1, value: serviceRegistrationStatus.processing, label: 'Đang xử lý', color: '#2196f3' },
    { id: 2, value: serviceRegistrationStatus.completed, label: 'Hoàn thành', color: '#4caf50' },
    { id: 3, value: serviceRegistrationStatus.cancelled, label: 'Đã hủy', color: '#f44336' },
  ];

  // Prepare data for service requests by time slot
  const timeSlots = serviceRequestsByTimeSlot.map((item) => item.timeSlot);
  const requestCounts = serviceRequestsByTimeSlot.map((item) => item.requests);

  // Prepare data for chat support trends
  const chatDates = chatSupportByDay.map((item) => {
    const date = new Date(item.date);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  });
  const chatSessions = chatSupportByDay.map((item) => item.sessions);

  // Prepare data for service types bar chart
  const serviceTypes = serviceTypesDistribution.map((item) => item.serviceType);
  const serviceCounts = serviceTypesDistribution.map((item) => item.count);

  const totalServices = Object.values(serviceRegistrationStatus).reduce((a, b) => a + b, 0);
  const completionRate = ((serviceRegistrationStatus.completed / totalServices) * 100).toFixed(1);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Dashboard Nhiệm Vụ
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Quản lý dịch vụ chăm sóc và hỗ trợ khách hàng
      </Typography>

      {/* Statistics Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 3, mb: 4 }}>
        <StatCard
          title="Tổng Yêu Cầu Dịch Vụ"
          value={staffTaskStats.totalServiceRequests}
          icon={<Assignment sx={{ color: 'white', fontSize: 32 }} />}
          color="#2196f3"
          subtitle={`${staffTaskStats.completedToday} hoàn thành hôm nay`}
        />
        <StatCard
          title="Yêu Cầu Chờ Xử Lý"
          value={staffTaskStats.pendingRequests}
          icon={<Assignment sx={{ color: 'white', fontSize: 32 }} />}
          color="#ff9800"
        />
        <StatCard
          title="Phiên Chat Hỗ Trợ"
          value={staffTaskStats.totalChatSessions}
          icon={<Chat sx={{ color: 'white', fontSize: 32 }} />}
          color="#9c27b0"
          subtitle={`${staffTaskStats.averageResponseTime} phút phản hồi TB`}
        />
        <StatCard
          title="Đánh Giá Khách Hàng"
          value={`${staffTaskStats.customerSatisfaction}/5`}
          icon={<Star sx={{ color: 'white', fontSize: 32 }} />}
          color="#4caf50"
          subtitle="Mức độ hài lòng"
        />
      </Box>

      {/* Charts */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '0.7fr 1.3fr' }, gap: 3 }}>
        {/* Service Status Pie Chart */}
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Trạng Thái Đơn Dịch Vụ
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Phân bổ trạng thái đơn đăng ký dịch vụ
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
                    data: serviceStatusData,
                    highlightScope: { fade: 'global', highlight: 'item' },
                    faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                    innerRadius: 40,
                    outerRadius: 120,
                    paddingAngle: 2,
                    cornerRadius: 5,
                  },
                ]}
                height={350}
                slotProps={{
                  legend: {
                    position: { vertical: 'middle', horizontal: 'end' },
                  },
                }}
              />
            </Box>
          </Paper>

        {/* Service Requests by Time Slot */}
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Yêu Cầu Tư Vấn Theo Khung Giờ
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Thống kê số lượng yêu cầu trong ca làm việc
            </Typography>
            <Box sx={{ width: '100%', height: 350 }}>
              <LineChart
                xAxis={[
                  {
                    data: timeSlots,
                    scaleType: 'band',
                  },
                ]}
                series={[
                  {
                    data: requestCounts,
                    label: 'Số yêu cầu',
                    color: '#2196f3',
                    area: true,
                  },
                ]}
                height={350}
              />
            </Box>
          </Paper>
      </Box>

      {/* Middle Charts Row */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 3 }}>
        {/* Chat Support Trends */}
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Xu Hướng Hỗ Trợ Chat
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Số lượng phiên chat hỗ trợ theo ngày
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <LineChart
                xAxis={[
                  {
                    data: chatDates,
                    scaleType: 'band',
                  },
                ]}
                series={[
                  {
                    data: chatSessions,
                    label: 'Phiên chat',
                    color: '#9c27b0',
                    area: true,
                  },
                ]}
                height={300}
              />
            </Box>
          </Paper>

        {/* Service Types Distribution */}
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Phân Loại Dịch Vụ
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Số lượng đơn theo loại dịch vụ
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <BarChart
                yAxis={[
                  {
                    data: serviceTypes,
                    scaleType: 'band',
                  },
                ]}
                series={[
                  {
                    data: serviceCounts,
                    label: 'Số lượng',
                    color: '#4caf50',
                  },
                ]}
                layout="horizontal"
                height={300}
              />
            </Box>
          </Paper>
      </Box>

      {/* Bottom Section */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mt: 3 }}>
        {/* Service Status Breakdown */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Chi Tiết Trạng Thái Dịch Vụ
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Thống kê chi tiết và tỷ lệ hoàn thành
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)' }, gap: 2 }}>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff3e0', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="#ff9800">
                  {serviceRegistrationStatus.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Chờ xác nhận
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="#2196f3">
                  {serviceRegistrationStatus.processing}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Đang xử lý
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e9', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="#4caf50">
                  {serviceRegistrationStatus.completed}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Hoàn thành
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#ffebee', borderRadius: 2 }}>
                <Typography variant="h4" fontWeight="bold" color="#f44336">
                  {serviceRegistrationStatus.cancelled}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Đã hủy
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  Tỷ lệ hoàn thành
                </Typography>
                <Typography variant="body2" fontWeight="bold" color="primary">
                  {completionRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={parseFloat(completionRate)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>
          </Paper>

        {/* Performance Summary */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Tóm Tắt Hiệu Suất
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Các chỉ số hiệu suất chính
            </Typography>
            <Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Thời gian phản hồi trung bình</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {staffTaskStats.averageResponseTime} phút
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(staffTaskStats.averageResponseTime / 10) * 100}
                  color="success"
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Mức độ hài lòng khách hàng</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {staffTaskStats.customerSatisfaction}/5.0
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(staffTaskStats.customerSatisfaction / 5) * 100}
                  color="success"
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Hoàn thành hôm nay</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {staffTaskStats.completedToday}/{staffTaskStats.pendingRequests + staffTaskStats.completedToday}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={
                    (staffTaskStats.completedToday /
                      (staffTaskStats.pendingRequests + staffTaskStats.completedToday)) *
                    100
                  }
                  color="primary"
                  sx={{ height: 6, borderRadius: 3 }}
                />
              </Box>
            </Box>
          </Paper>
      </Box>
    </Box>
  );
}
