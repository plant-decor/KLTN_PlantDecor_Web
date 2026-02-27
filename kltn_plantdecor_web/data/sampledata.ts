import type { UserRole } from '@/lib/constants/header';

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
    role: 'user',
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

export interface SamplePlant {
  id: number;
  name: string;
  scientificName: string;
  description: string;
  category: 'indoor' | 'outdoor' | 'succulent' | 'flowering' | 'air-purifying' | 'low-maintenance';
  price: number;
  originalPrice?: number;
  imageUrl: string;
  images?: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  careLevel: 'easy' | 'medium' | 'hard';
  lightRequirement: 'low' | 'medium' | 'bright' | 'direct-sun';
  wateringFrequency: 'daily' | 'weekly' | 'bi-weekly' | 'monthly';
  size: 'small' | 'medium' | 'large';
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  tags: string[];
  // Phân biệt 2 loại cây
  hasInstance: boolean; // true: theo dõi từng cây riêng biệt, false: chỉ quản lý theo số lượng
  careInstructions?: {
    watering?: string;
    sunlight?: string;
    humidity?: string;
    temperature?: string;
    fertilizing?: string;
    pruning?: string;
    propagation?: string;
    commonPests?: string;
  };
}

export const SAMPLE_PLANTS: SamplePlant[] = [
  {
    id: 1,
    name: 'Monstera Deliciosa',
    scientificName: 'Monstera deliciosa',
    description: 'A stunning tropical plant with large, glossy leaves that develop beautiful splits and holes as they mature. Perfect for adding a bold statement to any room.',
    category: 'indoor',
    price: 450000,
    originalPrice: 550000,
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    images: [
      'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
      'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    ],
    stock: 25,
    rating: 4.8,
    reviewCount: 156,
    careLevel: 'easy',
    lightRequirement: 'bright',
    wateringFrequency: 'weekly',
    size: 'large',
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    tags: ['tropical', 'statement plant', 'air-purifying'],
    hasInstance: true,
    careInstructions: {
      watering: 'Water when top 2-3 inches of soil are dry',
      sunlight: 'Bright indirect light (avoid direct sun)',
      humidity: '60-70%',
      temperature: '18-27°C',
      fertilizing: 'Monthly during growing season',
      pruning: 'Remove dead/yellowing leaves as needed',
      propagation: 'Stem cuttings in water or soil',
      commonPests: 'Spider mites, scale insects'
    }
  },
  {
    id: 2,
    name: 'Snake Plant',
    scientificName: 'Sansevieria trifasciata',
    description: 'One of the most popular and hardy houseplants. Known for its air-purifying qualities and ability to thrive with minimal care.',
    category: 'air-purifying',
    price: 180000,
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    images: [
      'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
      'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    ],
    stock: 50,
    rating: 4.9,
    reviewCount: 243,
    careLevel: 'easy',
    lightRequirement: 'low',
    wateringFrequency: 'bi-weekly',
    size: 'medium',
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    tags: ['low-maintenance', 'beginner-friendly', 'air-purifying'],
    hasInstance: false,
    careInstructions: {
      watering: 'Every 2-3 weeks (water less in winter)',
      sunlight: 'Low to bright indirect light',
      humidity: '30-50%',
      temperature: '15-29°C',
      fertilizing: 'Every 2-3 months during growing season',
      pruning: 'Remove damaged leaves at the base',
      propagation: 'Division or leaf cuttings',
      commonPests: 'Spider mites, mealybugs'
    }
  },
  {
    id: 3,
    name: 'Fiddle Leaf Fig',
    scientificName: 'Ficus lyrata',
    description: 'A trendy indoor tree with large, violin-shaped leaves. Makes a dramatic focal point in any modern interior space.',
    category: 'indoor',
    price: 650000,
    originalPrice: 750000,
    imageUrl: 'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=800',
    images: [
      'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=800',
    ],
    stock: 15,
    rating: 4.5,
    reviewCount: 89,
    careLevel: 'medium',
    lightRequirement: 'bright',
    wateringFrequency: 'weekly',
    size: 'large',
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: false,
    tags: ['trendy', 'statement plant', 'indoor tree'],
    hasInstance: true,
    careInstructions: {
      watering: 'Water when top inch of soil is dry',
      sunlight: 'Bright indirect light',
      humidity: '40-60%',
      temperature: '16-24°C',
      fertilizing: 'Monthly in spring and summer',
      pruning: 'Prune to control size and shape',
      propagation: 'Air layering or stem cuttings',
      commonPests: 'Scale, mealybugs, spider mites'
    }
  },
  {
    id: 4,
    name: 'Pothos',
    scientificName: 'Epipremnum aureum',
    description: 'A versatile trailing plant with heart-shaped leaves. Extremely easy to care for and can grow in various lighting conditions.',
    category: 'air-purifying',
    price: 120000,
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    stock: 60,
    rating: 4.9,
    reviewCount: 312,
    careLevel: 'easy',
    lightRequirement: 'low',
    wateringFrequency: 'weekly',
    size: 'small',
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    tags: ['trailing plant', 'low-maintenance', 'air-purifying'],
    hasInstance: false,
    careInstructions: {
      watering: 'Water when soil is dry',
      sunlight: 'Low to bright indirect light',
      humidity: '50-70%',
      temperature: '18-29°C',
      fertilizing: 'Every 4-6 weeks during growing season',
      pruning: 'Trim to maintain shape',
      propagation: 'Stem cuttings in water',
      commonPests: 'Mealybugs, scale'
    }
  },
  {
    id: 5,
    name: 'Succulent Collection',
    scientificName: 'Various species',
    description: 'A charming collection of assorted succulents perfect for desktops or small spaces. Requires minimal watering and care.',
    category: 'succulent',
    price: 90000,
    imageUrl: 'https://images.unsplash.com/photo-1459156212016-c812468e2115?w=800',
    stock: 100,
    rating: 4.7,
    reviewCount: 187,
    careLevel: 'easy',
    lightRequirement: 'bright',
    wateringFrequency: 'bi-weekly',
    size: 'small',
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    tags: ['succulent', 'compact', 'low-maintenance'],
    hasInstance: false,
    careInstructions: {
      watering: 'Water sparingly every 2-3 weeks',
      sunlight: 'Bright light with some direct sun',
      humidity: '30-50%',
      temperature: '15-27°C',
      fertilizing: 'Monthly during spring and summer',
      pruning: 'Remove dead leaves',
      propagation: 'Leaf or stem cuttings',
      commonPests: 'Mealybugs, aphids'
    }
  },
  {
    id: 6,
    name: 'Peace Lily',
    scientificName: 'Spathiphyllum',
    description: 'An elegant plant with glossy leaves and white flowers. Excellent air purifier and thrives in low light conditions.',
    category: 'air-purifying',
    price: 200000,
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    stock: 40,
    rating: 4.8,
    reviewCount: 145,
    careLevel: 'easy',
    lightRequirement: 'low',
    wateringFrequency: 'weekly',
    size: 'medium',
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: false,
    tags: ['flowering', 'air-purifying', 'low-light'],
    hasInstance: false,
    careInstructions: {
      watering: 'Keep soil consistently moist',
      sunlight: 'Low to medium indirect light',
      humidity: '50-60%',
      temperature: '18-27°C',
      fertilizing: 'Every 6-8 weeks during growing season',
      pruning: 'Remove spent flowers and yellow leaves',
      propagation: 'Division',
      commonPests: 'Scale, mealybugs'
    }
  },
  {
    id: 7,
    name: 'Rubber Plant',
    scientificName: 'Ficus elastica',
    description: 'A bold indoor plant with large, glossy burgundy leaves. Easy to care for and grows quickly in the right conditions.',
    category: 'indoor',
    price: 280000,
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    stock: 30,
    rating: 4.6,
    reviewCount: 98,
    careLevel: 'easy',
    lightRequirement: 'medium',
    wateringFrequency: 'weekly',
    size: 'large',
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    tags: ['statement plant', 'fast-growing'],
    hasInstance: true,
    careInstructions: {
      watering: 'Water when top 2 inches of soil dry',
      sunlight: 'Medium to bright indirect light',
      humidity: '40-60%',
      temperature: '18-27°C',
      fertilizing: 'Monthly during spring and summer',
      pruning: 'Prune to control size',
      propagation: 'Air layering or stem cuttings',
      commonPests: 'Spider mites, scale'
    }
  },
  {
    id: 8,
    name: 'String of Pearls',
    scientificName: 'Senecio rowleyanus',
    description: 'A unique trailing succulent with pearl-like leaves. Perfect for hanging baskets and adds a whimsical touch to any space.',
    category: 'succulent',
    price: 150000,
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    stock: 35,
    rating: 4.7,
    reviewCount: 76,
    careLevel: 'medium',
    lightRequirement: 'bright',
    wateringFrequency: 'bi-weekly',
    size: 'small',
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    tags: ['trailing plant', 'succulent', 'unique'],
    hasInstance: false,
    careInstructions: {
      watering: 'Water every 2-3 weeks',
      sunlight: 'Bright indirect light',
      humidity: '30-50%',
      temperature: '18-24°C',
      fertilizing: 'Monthly during growing season',
      pruning: 'Trim to encourage fuller growth',
      propagation: 'Stem cuttings',
      commonPests: 'Aphids, mealybugs'
    }
  },
  {
    id: 9,
    name: 'Bird of Paradise',
    scientificName: 'Strelitzia reginae',
    description: 'A stunning tropical plant with large banana-like leaves. Creates a bold, exotic look in any interior.',
    category: 'indoor',
    price: 550000,
    imageUrl: 'https://images.unsplash.com/photo-1512428813834-c702c7702b78?w=800',
    stock: 12,
    rating: 4.6,
    reviewCount: 54,
    careLevel: 'medium',
    lightRequirement: 'bright',
    wateringFrequency: 'weekly',
    size: 'large',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    tags: ['tropical', 'statement plant', 'exotic'],
    hasInstance: true,
    careInstructions: {
      watering: 'Water when top inch is dry',
      sunlight: 'Bright indirect to direct light',
      humidity: '50-70%',
      temperature: '18-30°C',
      fertilizing: 'Every 2 weeks during growing season',
      pruning: 'Remove dead leaves',
      propagation: 'Division or seeds',
      commonPests: 'Scale, spider mites'
    }
  },
  {
    id: 10,
    name: 'ZZ Plant',
    scientificName: 'Zamioculcas zamiifolia',
    description: 'An almost indestructible plant with glossy, dark green leaves. Perfect for beginners and busy plant parents.',
    category: 'low-maintenance',
    price: 220000,
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    stock: 45,
    rating: 4.9,
    reviewCount: 201,
    careLevel: 'easy',
    lightRequirement: 'low',
    wateringFrequency: 'bi-weekly',
    size: 'medium',
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    tags: ['low-maintenance', 'beginner-friendly', 'drought-tolerant'],
    hasInstance: false,
    careInstructions: {
      watering: 'Water every 2-3 weeks',
      sunlight: 'Low to bright indirect light',
      humidity: '30-50%',
      temperature: '15-27°C',
      fertilizing: 'Every 2 months during growing season',
      pruning: 'Remove yellow leaves',
      propagation: 'Division or leaf cuttings',
      commonPests: 'Mealybugs, scale'
    }
  },
  {
    id: 11,
    name: 'Calathea Orbifolia',
    scientificName: 'Calathea orbifolia',
    description: 'A stunning plant with large, round leaves featuring silver-green stripes. A true showstopper for plant collectors.',
    category: 'indoor',
    price: 380000,
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800',
    stock: 20,
    rating: 4.5,
    reviewCount: 67,
    careLevel: 'hard',
    lightRequirement: 'medium',
    wateringFrequency: 'weekly',
    size: 'medium',
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    tags: ['collector plant', 'tropical', 'unique patterns'],
    hasInstance: true,
    careInstructions: {
      watering: 'Keep soil consistently moist but not soggy',
      sunlight: 'Medium indirect light (no direct sun)',
      humidity: '60-70%',
      temperature: '18-27°C',
      fertilizing: 'Monthly during growing season',
      pruning: 'Remove damaged leaves',
      propagation: 'Division',
      commonPests: 'Spider mites, aphids'
    }
  },
  {
    id: 12,
    name: 'Aloe Vera',
    scientificName: 'Aloe barbadensis miller',
    description: 'A medicinal succulent known for its healing properties. Low-maintenance and perfect for sunny windowsills.',
    category: 'succulent',
    price: 100000,
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800',
    stock: 70,
    rating: 4.8,
    reviewCount: 234,
    careLevel: 'easy',
    lightRequirement: 'bright',
    wateringFrequency: 'bi-weekly',
    size: 'small',
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    tags: ['medicinal', 'succulent', 'low-maintenance'],
    hasInstance: false,
    careInstructions: {
      watering: 'Water deeply but infrequently (every 2-3 weeks)',
      sunlight: 'Bright indirect to direct sunlight',
      humidity: '30-50%',
      temperature: '13-27°C',
      fertilizing: 'Rarely (once or twice a year)',
      pruning: 'Remove dead outer leaves',
      propagation: 'Offsets (pups) or leaf cuttings',
      commonPests: 'Mealybugs, scale, aphids'
    }
  },
];

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
