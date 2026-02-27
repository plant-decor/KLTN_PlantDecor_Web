// Mock data for all dashboard types

// ============= ADMIN BUSINESS DASHBOARD =============

// Revenue data by date
export const revenueByDate = [
  { date: '2026-02-01', revenue: 12500000 },
  { date: '2026-02-02', revenue: 15800000 },
  { date: '2026-02-03', revenue: 13200000 },
  { date: '2026-02-04', revenue: 18500000 },
  { date: '2026-02-05', revenue: 22000000 },
  { date: '2026-02-06', revenue: 19500000 },
  { date: '2026-02-07', revenue: 21000000 },
  { date: '2026-02-08', revenue: 17800000 },
  { date: '2026-02-09', revenue: 14500000 },
  { date: '2026-02-10', revenue: 16200000 },
  { date: '2026-02-11', revenue: 19800000 },
  { date: '2026-02-12', revenue: 23500000 },
  { date: '2026-02-13', revenue: 25000000 },
  { date: '2026-02-14', revenue: 28500000 }, // Valentine's Day spike
  { date: '2026-02-15', revenue: 21000000 },
  { date: '2026-02-16', revenue: 18500000 },
  { date: '2026-02-17', revenue: 17200000 },
  { date: '2026-02-18', revenue: 19500000 },
  { date: '2026-02-19', revenue: 22000000 },
  { date: '2026-02-20', revenue: 20500000 },
  { date: '2026-02-21', revenue: 19000000 },
  { date: '2026-02-22', revenue: 18200000 },
  { date: '2026-02-23', revenue: 21500000 },
  { date: '2026-02-24', revenue: 24000000 },
  { date: '2026-02-25', revenue: 22500000 },
  { date: '2026-02-26', revenue: 20800000 },
  { date: '2026-02-27', revenue: 23200000 },
  { date: '2026-02-28', revenue: 25500000 },
];

// Top selling plants
export const topSellingPlants = [
  { name: 'Phong Lộc', purchaseCount: 450, likeCount: 1250, viewCount: 8500 },
  { name: 'Kim Ngân', purchaseCount: 380, likeCount: 1100, viewCount: 7200 },
  { name: 'Lan Hồ Điệp', purchaseCount: 325, likeCount: 980, viewCount: 6800 },
  { name: 'Trầu Bà', purchaseCount: 290, likeCount: 850, viewCount: 5900 },
  { name: 'Monstera Deliciosa', purchaseCount: 275, likeCount: 920, viewCount: 6200 },
  { name: 'Cây Đa Búp Đỏ', purchaseCount: 240, likeCount: 780, viewCount: 5400 },
  { name: 'Cây Thiết Mộc Lan', purchaseCount: 220, likeCount: 690, viewCount: 4800 },
  { name: 'Sen Đá', purchaseCount: 195, likeCount: 650, viewCount: 4500 },
  { name: 'Xương Rồng', purchaseCount: 180, likeCount: 580, viewCount: 4200 },
  { name: 'Lưỡi Hổ', purchaseCount: 165, likeCount: 520, viewCount: 3800 },
];

// Summary statistics for Admin Business Dashboard
export const adminBusinessStats = {
  totalRevenue: 550000000,
  totalOrders: 2840,
  averageOrderValue: 193661,
  growthRate: 15.5, // percentage
};

// ============= ADMIN SYSTEM DASHBOARD =============

// User traffic by hour
export const userTrafficByHour = [
  { hour: '00:00', users: 45, chatSessions: 12 },
  { hour: '01:00', users: 32, chatSessions: 8 },
  { hour: '02:00', users: 28, chatSessions: 5 },
  { hour: '03:00', users: 25, chatSessions: 4 },
  { hour: '04:00', users: 30, chatSessions: 6 },
  { hour: '05:00', users: 42, chatSessions: 10 },
  { hour: '06:00', users: 68, chatSessions: 18 },
  { hour: '07:00', users: 95, chatSessions: 25 },
  { hour: '08:00', users: 145, chatSessions: 38 },
  { hour: '09:00', users: 220, chatSessions: 55 },
  { hour: '10:00', users: 285, chatSessions: 72 },
  { hour: '11:00', users: 310, chatSessions: 85 },
  { hour: '12:00', users: 295, chatSessions: 78 },
  { hour: '13:00', users: 265, chatSessions: 68 },
  { hour: '14:00', users: 290, chatSessions: 75 },
  { hour: '15:00', users: 305, chatSessions: 82 },
  { hour: '16:00', users: 320, chatSessions: 88 },
  { hour: '17:00', users: 335, chatSessions: 92 },
  { hour: '18:00', users: 310, chatSessions: 85 },
  { hour: '19:00', users: 280, chatSessions: 75 },
  { hour: '20:00', users: 240, chatSessions: 62 },
  { hour: '21:00', users: 195, chatSessions: 48 },
  { hour: '22:00', users: 135, chatSessions: 32 },
  { hour: '23:00', users: 85, chatSessions: 20 },
];

// AI Moderation statistics
export const aiModerationStats = {
  approved: 1850,
  rejected: 245,
  pending: 58,
  total: 2153,
};

// System statistics
export const adminSystemStats = {
  totalUsers: 15420,
  activeUsers: 8750,
  totalChatSessions: 12580,
  averageResponseTime: 2.3, // minutes
};

// ============= MANAGER STORE METRICS DASHBOARD =============

// Revenue by week
export const revenueByWeek = [
  { week: 'Tuần 1', revenue: 85000000, orders: 420 },
  { week: 'Tuần 2', revenue: 92500000, orders: 485 },
  { week: 'Tuần 3', revenue: 88000000, orders: 450 },
  { week: 'Tuần 4', revenue: 95500000, orders: 510 },
];

// Branch performance comparison
export const branchPerformance = [
  { branchName: 'Chi nhánh Quận 1', revenue: 125000000, orders: 680 },
  { branchName: 'Chi nhánh Quận 3', revenue: 98000000, orders: 520 },
  { branchName: 'Chi nhánh Quận 7', revenue: 110000000, orders: 590 },
  { branchName: 'Chi nhánh Thủ Đức', revenue: 88000000, orders: 475 },
];

// Order trends by date
export const managerOrderTrends = [
  { date: '2026-02-01', orders: 45 },
  { date: '2026-02-02', orders: 52 },
  { date: '2026-02-03', orders: 48 },
  { date: '2026-02-04', orders: 55 },
  { date: '2026-02-05', orders: 62 },
  { date: '2026-02-06', orders: 58 },
  { date: '2026-02-07', orders: 61 },
  { date: '2026-02-08', orders: 53 },
  { date: '2026-02-09', orders: 47 },
  { date: '2026-02-10', orders: 50 },
  { date: '2026-02-11', orders: 56 },
  { date: '2026-02-12', orders: 65 },
  { date: '2026-02-13', orders: 70 },
  { date: '2026-02-14', orders: 85 }, // Valentine spike
  { date: '2026-02-15', orders: 60 },
  { date: '2026-02-16', orders: 54 },
  { date: '2026-02-17', orders: 51 },
  { date: '2026-02-18', orders: 57 },
  { date: '2026-02-19', orders: 63 },
  { date: '2026-02-20', orders: 59 },
  { date: '2026-02-21', orders: 55 },
  { date: '2026-02-22', orders: 52 },
  { date: '2026-02-23', orders: 61 },
  { date: '2026-02-24', orders: 68 },
  { date: '2026-02-25', orders: 64 },
  { date: '2026-02-26', orders: 58 },
  { date: '2026-02-27', orders: 66 },
  { date: '2026-02-28', orders: 72 },
];

// Manager store metrics summary
export const managerStoreStats = {
  totalRevenue: 361000000,
  totalOrders: 1865,
  averageOrderValue: 193611,
  growthRate: 12.8,
};

// Revenue by date for manager store (last 30 days)
export const managerRevenueByDate = [
  { date: '2026-01-29', revenue: 11500000 },
  { date: '2026-01-30', revenue: 13200000 },
  { date: '2026-01-31', revenue: 12800000 },
  { date: '2026-02-01', revenue: 12500000 },
  { date: '2026-02-02', revenue: 15800000 },
  { date: '2026-02-03', revenue: 13200000 },
  { date: '2026-02-04', revenue: 18500000 },
  { date: '2026-02-05', revenue: 22000000 },
  { date: '2026-02-06', revenue: 19500000 },
  { date: '2026-02-07', revenue: 21000000 },
  { date: '2026-02-08', revenue: 17800000 },
  { date: '2026-02-09', revenue: 14500000 },
  { date: '2026-02-10', revenue: 16200000 },
  { date: '2026-02-11', revenue: 19800000 },
  { date: '2026-02-12', revenue: 23500000 },
  { date: '2026-02-13', revenue: 25000000 },
  { date: '2026-02-14', revenue: 28500000 }, // Valentine spike
  { date: '2026-02-15', revenue: 21000000 },
  { date: '2026-02-16', revenue: 18500000 },
  { date: '2026-02-17', revenue: 17200000 },
  { date: '2026-02-18', revenue: 19500000 },
  { date: '2026-02-19', revenue: 22000000 },
  { date: '2026-02-20', revenue: 20500000 },
  { date: '2026-02-21', revenue: 19000000 },
  { date: '2026-02-22', revenue: 18200000 },
  { date: '2026-02-23', revenue: 21500000 },
  { date: '2026-02-24', revenue: 24000000 },
  { date: '2026-02-25', revenue: 22500000 },
  { date: '2026-02-26', revenue: 20800000 },
  { date: '2026-02-27', revenue: 23200000 },
  { date: '2026-02-28', revenue: 25500000 },
];

// Top selling plants for manager's store
export const managerTopSellingPlants = [
  { name: 'Phong Lộc', quantity: 285, revenue: 42750000 },
  { name: 'Kim Ngân', quantity: 245, revenue: 36750000 },
  { name: 'Lan Hồ Điệp', quantity: 210, revenue: 52500000 },
  { name: 'Trầu Bà', quantity: 195, revenue: 19500000 },
  { name: 'Monstera Deliciosa', quantity: 180, revenue: 36000000 },
  { name: 'Cây Đa Búp Đỏ', quantity: 165, revenue: 24750000 },
  { name: 'Cây Thiết Mộc Lan', quantity: 145, revenue: 21750000 },
  { name: 'Sen Đá', quantity: 128, revenue: 12800000 },
  { name: 'Xương Rồng', quantity: 115, revenue: 11500000 },
  { name: 'Lưỡi Hổ', quantity: 98, revenue: 14700000 },
];

// ============= MANAGER STORE OPERATIONS DASHBOARD =============

// Order status distribution
export const orderStatusDistribution = {
  pending: 125,
  processing: 88,
  shipping: 142,
  completed: 1450,
  cancelled: 60,
};

// Inventory stock levels with sales velocity
export const inventoryStockData = [
  { productName: 'Phong Lộc', stockQuantity: 85, salesVelocity: 15.2, reorderPoint: 50 },
  { productName: 'Kim Ngân', stockQuantity: 120, salesVelocity: 12.8, reorderPoint: 60 },
  { productName: 'Lan Hồ Điệp', stockQuantity: 45, salesVelocity: 10.5, reorderPoint: 40 },
  { productName: 'Trầu Bà', stockQuantity: 150, salesVelocity: 9.2, reorderPoint: 70 },
  { productName: 'Monstera', stockQuantity: 32, salesVelocity: 8.8, reorderPoint: 35 },
  { productName: 'Đa Búp Đỏ', stockQuantity: 95, salesVelocity: 7.5, reorderPoint: 45 },
  { productName: 'Thiết Mộc Lan', stockQuantity: 110, salesVelocity: 6.8, reorderPoint: 50 },
  { productName: 'Sen Đá', stockQuantity: 180, salesVelocity: 6.2, reorderPoint: 80 },
  { productName: 'Xương Rồng', stockQuantity: 200, salesVelocity: 5.5, reorderPoint: 90 },
  { productName: 'Lưỡi Hổ', stockQuantity: 75, salesVelocity: 5.0, reorderPoint: 40 },
];

// Store operations summary
export const storeOperationsStats = {
  totalInventoryValue: 425000000,
  lowStockItems: 3,
  outOfStock: 0,
  averageFulfillmentTime: 2.5, // days
};

// ============= STAFF TASKS DASHBOARD =============

// Service registration status
export const serviceRegistrationStatus = {
  pending: 45,
  processing: 32,
  completed: 215,
  cancelled: 8,
};

// Service requests by time slot
export const serviceRequestsByTimeSlot = [
  { timeSlot: '08:00', requests: 12 },
  { timeSlot: '09:00', requests: 18 },
  { timeSlot: '10:00', requests: 25 },
  { timeSlot: '11:00', requests: 22 },
  { timeSlot: '12:00', requests: 15 },
  { timeSlot: '13:00', requests: 14 },
  { timeSlot: '14:00', requests: 20 },
  { timeSlot: '15:00', requests: 28 },
  { timeSlot: '16:00', requests: 24 },
  { timeSlot: '17:00', requests: 19 },
];

// Chat support statistics by day
export const chatSupportByDay = [
  { date: '2026-02-22', sessions: 45, avgDuration: 8.5 },
  { date: '2026-02-23', sessions: 52, avgDuration: 9.2 },
  { date: '2026-02-24', sessions: 48, avgDuration: 7.8 },
  { date: '2026-02-25', sessions: 55, avgDuration: 10.1 },
  { date: '2026-02-26', sessions: 50, avgDuration: 8.9 },
  { date: '2026-02-27', sessions: 58, avgDuration: 9.5 },
  { date: '2026-02-28', sessions: 62, avgDuration: 10.3 },
];

// Staff task summary
export const staffTaskStats = {
  totalServiceRequests: 300,
  completedToday: 28,
  pendingRequests: 45,
  totalChatSessions: 370,
  averageResponseTime: 3.2, // minutes
  customerSatisfaction: 4.6, // out of 5
};

// Service types distribution
export const serviceTypesDistribution = [
  { serviceType: 'Chăm sóc định kỳ', count: 125 },
  { serviceType: 'Tư vấn chuyên sâu', count: 85 },
  { serviceType: 'Cấp cứu cây', count: 45 },
  { serviceType: 'Thiết kế sân vườn', count: 30 },
  { serviceType: 'Khác', count: 15 },
];

// ============= USER PROFILE DATA =============

export const userProfileData = {
  id: 'user-123',
  avatarUrl: '/img/avatar-placeholder.jpg',
  fullName: 'Nguyễn Văn An',
  email: 'nguyenvanan@example.com',
  phoneNumber: '0901234567',
  gender: 'Male', // Male, Female, Other
  birthYear: 1995,
  address: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  receiveNotifications: true,
  createdAt: '2024-01-15',
  membershipLevel: 'Gold', // Bronze, Silver, Gold, Platinum
};

// ============= ORDER HISTORY DATA =============

export const orderHistoryData = [
  {
    id: 'ORD-2026-0228-001',
    createdAt: '2026-02-28T10:30:00',
    totalAmount: 2850000,
    status: 'Pending', // Pending, Confirmed, Shipping, Delivered, Completed, Cancelled
    orderType: 'Product', // Product, Service
    customerName: 'Nguyễn Văn An',
    phoneNumber: '0901234567',
    address: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    items: [
      {
        itemName: 'Phong Lộc',
        quantity: 2,
        price: 850000,
        imageUrl: '/img/products/phong-loc.jpg',
      },
      {
        itemName: 'Lan Hồ Điệp',
        quantity: 1,
        price: 1150000,
        imageUrl: '/img/products/lan-ho-diep.jpg',
      },
    ],
  },
  {
    id: 'ORD-2026-0225-002',
    createdAt: '2026-02-25T14:20:00',
    totalAmount: 5420000,
    status: 'Shipping',
    orderType: 'Product',
    customerName: 'Nguyễn Văn An',
    phoneNumber: '0901234567',
    address: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    shippedAt: '2026-02-26T09:00:00',
    estimatedDelivery: '2026-03-01T17:00:00',
    items: [
      {
        itemName: 'Kim Ngân',
        quantity: 3,
        price: 750000,
        imageUrl: '/img/products/kim-ngan.jpg',
      },
      {
        itemName: 'Monstera Deliciosa',
        quantity: 2,
        price: 980000,
        imageUrl: '/img/products/monstera.jpg',
      },
      {
        itemName: 'Trầu Bà',
        quantity: 1,
        price: 450000,
        imageUrl: '/img/products/trau-ba.jpg',
      },
    ],
  },
  {
    id: 'ORD-2026-0220-003',
    createdAt: '2026-02-20T11:15:00',
    totalAmount: 3200000,
    status: 'Completed',
    orderType: 'Product',
    customerName: 'Nguyễn Văn An',
    phoneNumber: '0901234567',
    address: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    shippedAt: '2026-02-21T10:00:00',
    deliveredAt: '2026-02-23T15:30:00',
    completedAt: '2026-02-23T15:30:00',
    items: [
      {
        itemName: 'Cây Đa Búp Đỏ',
        quantity: 4,
        price: 650000,
        imageUrl: '/img/products/da-bup-do.jpg',
      },
      {
        itemName: 'Sen Đá',
        quantity: 2,
        price: 350000,
        imageUrl: '/img/products/sen-da.jpg',
      },
    ],
  },
  {
    id: 'SVC-2026-0218-004',
    createdAt: '2026-02-18T09:00:00',
    totalAmount: 1500000,
    status: 'Completed',
    orderType: 'Service',
    customerName: 'Nguyễn Văn An',
    phoneNumber: '0901234567',
    address: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    completedAt: '2026-02-22T16:00:00',
    items: [
      {
        itemName: 'Dịch vụ chăm sóc định kỳ (3 tháng)',
        quantity: 1,
        price: 1500000,
        imageUrl: '/img/services/care-service.jpg',
      },
    ],
  },
  {
    id: 'ORD-2026-0215-005',
    createdAt: '2026-02-15T16:45:00',
    totalAmount: 7850000,
    status: 'Delivered',
    orderType: 'Product',
    customerName: 'Nguyễn Văn An',
    phoneNumber: '0901234567',
    address: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    shippedAt: '2026-02-16T08:00:00',
    deliveredAt: '2026-02-18T14:20:00',
    items: [
      {
        itemName: 'Cây Thiết Mộc Lan',
        quantity: 1,
        price: 2500000,
        imageUrl: '/img/products/thiet-moc-lan.jpg',
      },
      {
        itemName: 'Xương Rồng',
        quantity: 5,
        price: 280000,
        imageUrl: '/img/products/xuong-rong.jpg',
      },
      {
        itemName: 'Lưỡi Hổ',
        quantity: 3,
        price: 550000,
        imageUrl: '/img/products/luoi-ho.jpg',
      },
      {
        itemName: 'Phong Lộc',
        quantity: 2,
        price: 850000,
        imageUrl: '/img/products/phong-loc.jpg',
      },
    ],
  },
  {
    id: 'ORD-2026-0210-006',
    createdAt: '2026-02-10T13:30:00',
    totalAmount: 1200000,
    status: 'Cancelled',
    orderType: 'Product',
    customerName: 'Nguyễn Văn An',
    phoneNumber: '0901234567',
    address: '123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    cancelledAt: '2026-02-11T10:00:00',
    cancelReason: 'Khách hàng đổi ý',
    items: [
      {
        itemName: 'Kim Ngân',
        quantity: 1,
        price: 750000,
        imageUrl: '/img/products/kim-ngan.jpg',
      },
      {
        itemName: 'Trầu Bà',
        quantity: 1,
        price: 450000,
        imageUrl: '/img/products/trau-ba.jpg',
      },
    ],
  },
];
