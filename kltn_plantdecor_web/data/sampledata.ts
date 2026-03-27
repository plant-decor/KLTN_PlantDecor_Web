import type { UserRole } from '@/lib/constants/header';
import { Category, Tag } from './storeCatalogData';

// SamplePlant Interface (used across components)
export interface Plant {
  "id": number,
  "productName": string,
  "basePrice": number,
  "size": string,
  "careLevel": string,
  "isActive": boolean,
  "primaryImageUrl": string | null,
  "totalInstances": number,
  "availableInstances": number,
  "availableCommonQuantity": number,
  "totalAvailableStock": number,
  "categoryNames": Category[],
  "tagNames": Tag[]
}

export interface SampleUser {
  id: number;
  role: UserRole;
  email: string;
  phoneNumber: string;
  password: string;
  userName: string;
  avatarUrl: string;
  status: 'active' | 'inactive';
  createAt: string;
  updateAt: string;
}

export const SAMPLE_USERS: SampleUser[] = [
  {
    id: 1001,
    role: 'customer',
    email: 'user@plantdecor.local',
    phoneNumber: '0900000001',
    password: 'User@123',
    userName: 'Green Lover',
    avatarUrl: '',
    status: 'active',
    createAt: '2026-02-23T08:00:00Z',
    updateAt: '2026-02-23T08:00:00Z',
  },
  {
    id: 2001,
    role: 'admin',
    email: 'admin@plantdecor.local',
    phoneNumber: '0900000002',
    password: 'Admin@123',
    userName: 'Admin',
    avatarUrl: '',
    status: 'active',
    createAt: '2026-02-23T08:00:00Z',
    updateAt: '2026-02-23T08:00:00Z',
  },
  {
    id: 2002,
    role: 'manager',
    email: 'manager@plantdecor.local',
    phoneNumber: '0900000002B',
    password: 'Manager@123',
    userName: 'Manager',
    avatarUrl: '',
    status: 'active',
    createAt: '2026-02-23T08:00:00Z',
    updateAt: '2026-02-23T08:00:00Z',
  },
  {
    id: 3001,
    role: 'staff',
    email: 'staff@plantdecor.local',
    phoneNumber: '0900000003',
    password: 'Staff@123',
    userName: 'Staff',
    avatarUrl: '',
    status: 'active',
    createAt: '2026-02-23T08:00:00Z',
    updateAt: '2026-02-23T08:00:00Z',
  },
  {
    id: 3002,
    role: 'consultant',
    email: 'consultant@plantdecor.local',
    phoneNumber: '0900000003B',
    password: 'Consultant@123',
    userName: 'Consultant',
    avatarUrl: '',
    status: 'active',
    createAt: '2026-02-23T08:00:00Z',
    updateAt: '2026-02-23T08:00:00Z',
  },
  {
    id: 4001,
    role: 'shipper',
    email: 'shipper@plantdecor.local',
    phoneNumber: '0900000004',
    password: 'Shipper@123',
    userName: 'Shipper',
    avatarUrl: '',
    status: 'active',
    createAt: '2026-02-23T08:00:00Z',
    updateAt: '2026-02-23T08:00:00Z',
  },
  {
    id: 5001,
    role: 'caretaker',
    email: 'caretaker@plantdecor.local',
    phoneNumber: '0900000005',
    password: 'Caretaker@123',
    userName: 'Caretaker',
    avatarUrl: '',
    status: 'active',
    createAt: '2026-02-23T08:00:00Z',
    updateAt: '2026-02-23T08:00:00Z',
  },
];

export const ACTIVE_SAMPLE_USER_ID = 1002;
export const STORE_USER_ID = 9999; // Virtual user for store inventory

// Plant Instance - Cho các cây có hasInstance = true
// Mỗi instance đại diện cho một cây cụ thể mà user sở hữu
export interface PlantInstance {
  id: number;
  plantId: number; // Tham chiếu đến SamplePlant.id
  userId: number; // Tham chiếu đến SampleUser.id
  customName?: string; // Tên do user đặt cho cây của mình
  acquiredDate: string; // Ngày mua/nhận cây
  status: 'healthy' | 'needs-attention' | 'critical' | 'thriving';
  location?: string; // Vị trí đặt cây (ví dụ: "Living Room", "Balcony")
  notes?: string; // Ghi chú của user
  lastWatered?: string;
  lastFertilized?: string;
  imageUrl?: string; // Ảnh cây thực tế của user
  price?: number; // Giá bán cho instance này (có thể khác giá mặc định)
  careHistory?: {
    date: string;
    type: 'watered' | 'fertilized' | 'pruned' | 'repotted' | 'treated' | 'other';
    notes?: string;
  }[];
}

// Sample Plant Instances - Các cây cụ thể mà user đang sở hữu
export const SAMPLE_PLANT_INSTANCES: PlantInstance[] = [
  // Monstera Deliciosa instances (plantId: 1) - STORE INVENTORY
  {
    id: 2001,
    plantId: 1, // Monstera Deliciosa - Cây #1
    userId: 9999,
    customName: 'Cây #1',
    acquiredDate: '2026-01-15T00:00:00Z',
    status: 'healthy',
    location: 'Living Room',
    notes: 'Growing beautifully, added new leaf last week',
    lastWatered: '2026-02-20T00:00:00Z',
    lastFertilized: '2026-02-10T00:00:00Z',
    price: 899000,
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    careHistory: [
      {
        date: '2026-02-20T10:00:00Z',
        type: 'watered',
        notes: 'Regular watering'
      },
      {
        date: '2026-02-10T09:00:00Z',
        type: 'fertilized',
        notes: 'Applied liquid fertilizer'
      }
    ]
  },
  {
    id: 2002,
    plantId: 1, // Monstera Deliciosa - Cây #2
    userId: 9999,
    customName: 'Cây #2',
    acquiredDate: '2025-12-20T00:00:00Z',
    status: 'thriving',
    location: 'Office',
    notes: 'Large and mature, excellent condition',
    lastWatered: '2026-02-21T00:00:00Z',
    lastFertilized: '2026-02-08T00:00:00Z',
    price: 1299000,
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    careHistory: []
  },
  {
    id: 2003,
    plantId: 1, // Monstera Deliciosa - Cây #3
    userId: 9999,
    customName: 'Cây #3',
    acquiredDate: '2026-02-05T00:00:00Z',
    status: 'healthy',
    location: 'Bedroom',
    notes: 'Young plant, developing well',
    lastWatered: '2026-02-22T00:00:00Z',
    price: 799000,
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    careHistory: []
  },
  {
    id: 2004,
    plantId: 1, // Monstera Deliciosa - Cây #4
    userId: 9999,
    customName: 'Cây #4',
    acquiredDate: '2026-01-30T00:00:00Z',
    status: 'healthy',
    location: 'Kitchen',
    notes: 'Compact size, perfect for small space',
    lastWatered: '2026-02-19T00:00:00Z',
    lastFertilized: '2026-02-12T00:00:00Z',
    price: 699000,
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    careHistory: []
  },
  {
    id: 2005,
    plantId: 1, // Monstera Deliciosa - Cây #5
    userId: 9999,
    customName: 'Cây #5',
    acquiredDate: '2025-11-10T00:00:00Z',
    status: 'thriving',
    location: 'Balcony',
    notes: 'Extra large specimen, very impressive',
    lastWatered: '2026-02-21T00:00:00Z',
    lastFertilized: '2026-02-15T00:00:00Z',
    price: 1499000,
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    careHistory: []
  },
  {
    id: 2006,
    plantId: 1, // Monstera Deliciosa - Cây #6
    userId: 9999,
    customName: 'Cây #6',
    acquiredDate: '2026-01-25T00:00:00Z',
    status: 'healthy',
    location: 'Entry Hall',
    notes: 'Medium size, excellent leaves',
    lastWatered: '2026-02-20T00:00:00Z',
    lastFertilized: '2026-02-09T00:00:00Z',
    price: 950000,
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    careHistory: []
  },
  
  // Other plant instances
  {
    id: 1002,
    plantId: 3, // Fiddle Leaf Fig
    userId: 1001,
    customName: 'Fiddle',
    acquiredDate: '2025-11-20T00:00:00Z',
    status: 'needs-attention',
    location: 'Office',
    notes: 'Some brown spots on lower leaves, might need more humidity',
    lastWatered: '2026-02-18T00:00:00Z',
    lastFertilized: '2026-01-25T00:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=800',
    careHistory: [
      {
        date: '2026-02-18T14:00:00Z',
        type: 'watered',
        notes: 'Checked soil moisture first'
      },
      {
        date: '2026-02-15T00:00:00Z',
        type: 'treated',
        notes: 'Wiped leaves to remove dust'
      }
    ]
  },
  {
    id: 1003,
    plantId: 9, // Bird of Paradise
    userId: 1001,
    customName: 'Paradise',
    acquiredDate: '2026-02-01T00:00:00Z',
    status: 'thriving',
    location: 'Balcony',
    notes: 'New growth appearing, loves the bright spot',
    lastWatered: '2026-02-21T00:00:00Z',
    lastFertilized: '2026-02-15T00:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=800',
    careHistory: [
      {
        date: '2026-02-21T08:00:00Z',
        type: 'watered',
        notes: 'Deep watering'
      },
      {
        date: '2026-02-15T10:00:00Z',
        type: 'fertilized',
        notes: 'Balanced fertilizer applied'
      },
      {
        date: '2026-02-10T00:00:00Z',
        type: 'pruned',
        notes: 'Removed one dead leaf'
      }
    ]
  },
  {
    id: 1004,
    plantId: 11, // Calathea Orbifolia
    userId: 1001,
    customName: 'Callie',
    acquiredDate: '2026-01-10T00:00:00Z',
    status: 'healthy',
    location: 'Bedroom',
    notes: 'Beautiful patterns, keeping humidity high',
    lastWatered: '2026-02-22T00:00:00Z',
    lastFertilized: '2026-02-05T00:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    careHistory: [
      {
        date: '2026-02-22T09:00:00Z',
        type: 'watered',
        notes: 'Soil was getting dry'
      }
    ]
  }
];
