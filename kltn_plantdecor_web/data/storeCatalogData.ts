// Mock data for Store Catalog Management

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface PlantInstance {
  id: string;
  sku: string;
  quantity: number;
  price: number; // Price for this specific instance
  condition: 'excellent' | 'good' | 'fair';
  location: string;
  dateAdded: string;
  imageUrl: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  scientificName: string;
  imageUrl: string;
  thumbnailInstanceId?: string; // ID of instance to use for thumbnail
  price: number;
  categoryIds: string[];
  tagIds: string[];
  instances: PlantInstance[];
  createdAt: string;
  updatedAt: string;
}

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Indoor Plants',
    description: 'Plants suitable for indoor environments',
  },
  {
    id: 'cat-2',
    name: 'Outdoor Plants',
    description: 'Plants suitable for outdoor environments',
  },
  {
    id: 'cat-3',
    name: 'Succulents',
    description: 'Low maintenance succulent plants',
  },
  {
    id: 'cat-4',
    name: 'Flowering Plants',
    description: 'Plants with beautiful flowers',
  },
];

export const mockTags: Tag[] = [
  { id: 'tag-1', name: 'Low Light', color: '#FFB6C1' },
  { id: 'tag-2', name: 'Pet Friendly', color: '#90EE90' },
  { id: 'tag-3', name: 'Water Resistant', color: '#87CEEB' },
  { id: 'tag-4', name: 'High Maintenance', color: '#FFD700' },
  { id: 'tag-5', name: 'Air Purifying', color: '#DDA0DD' },
  { id: 'tag-6', name: 'Drought Tolerant', color: '#F0E68C' },
];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Monstera Deliciosa',
    description: 'A popular houseplant known for its large split leaves',
    scientificName: 'Monstera deliciosa',
    imageUrl: 'https://via.placeholder.com/200?text=Monstera',
    thumbnailInstanceId: 'inst-1-1',
    price: 350000,
    categoryIds: ['cat-1'],
    tagIds: ['tag-1', 'tag-5'],
    instances: [
      {
        id: 'inst-1-1',
        sku: 'MON-001-001',
        quantity: 15,
        price: 350000,
        condition: 'excellent',
        location: 'Shelf A1',
        dateAdded: '2026-01-15',
        imageUrl: 'https://via.placeholder.com/200?text=Monstera+A1',
      },
      {
        id: 'inst-1-2',
        sku: 'MON-001-002',
        quantity: 8,
        price: 300000,
        condition: 'good',
        location: 'Shelf A2',
        dateAdded: '2026-01-20',
        imageUrl: 'https://via.placeholder.com/200?text=Monstera+A2',
      },
    ],
    createdAt: '2026-01-10',
    updatedAt: '2026-02-20',
  },
  {
    id: 'prod-2',
    name: 'Peace Lily',
    description: 'An elegant plant with white flowers and dark green leaves',
    scientificName: 'Spathiphyllum wallisii',
    imageUrl: 'https://via.placeholder.com/200?text=Peace+Lily',
    price: 250000,
    categoryIds: ['cat-1', 'cat-4'],
    tagIds: ['tag-1', 'tag-2', 'tag-5'],
    instances: [
      {
        id: 'inst-2-1',
        sku: 'PEA-001-001',
        quantity: 20,
        price: 250000,
        condition: 'excellent',
        location: 'Shelf B1',
        dateAdded: '2026-01-18',
        imageUrl: 'https://via.placeholder.com/200?text=Peace+Lily',
      },
    ],
    createdAt: '2026-01-12',
    updatedAt: '2026-02-19',
  },
  {
    id: 'prod-3',
    name: 'Aloe Vera',
    description: 'A succulent plant with healing properties',
    scientificName: 'Aloe barbadensis',
    imageUrl: 'https://via.placeholder.com/200?text=Aloe+Vera',
    price: 150000,
    categoryIds: ['cat-3'],
    tagIds: ['tag-3', 'tag-6'],
    instances: [
      {
        id: 'inst-3-1',
        sku: 'ALO-001-001',
        quantity: 30,
        price: 150000,
        condition: 'good',
        location: 'Shelf C1',
        dateAdded: '2026-02-01',
        imageUrl: 'https://via.placeholder.com/200?text=Aloe+C1',
      },
      {
        id: 'inst-3-2',
        sku: 'ALO-001-002',
        quantity: 12,
        price: 120000,
        condition: 'fair',
        location: 'Shelf C2',
        dateAdded: '2026-02-05',
        imageUrl: 'https://via.placeholder.com/200?text=Aloe+C2',
      },
    ],
    createdAt: '2026-01-25',
    updatedAt: '2026-02-18',
  },
  {
    id: 'prod-4',
    name: 'Pothos',
    description: 'A fast-growing climbing plant',
    scientificName: 'Epipremnum aureum',
    imageUrl: 'https://via.placeholder.com/200?text=Pothos',
    price: 200000,
    categoryIds: ['cat-1'],
    tagIds: ['tag-1', 'tag-2'],
    instances: [
      {
        id: 'inst-4-1',
        sku: 'POT-001-001',
        quantity: 25,
        price: 200000,
        condition: 'excellent',
        location: 'Shelf D1',
        dateAdded: '2026-01-30',
        imageUrl: 'https://via.placeholder.com/200?text=Pothos',
      },
    ],
    createdAt: '2026-02-01',
    updatedAt: '2026-02-20',
  },
  {
    id: 'prod-5',
    name: 'Snake Plant',
    description: 'A tough plant that requires minimal care',
    scientificName: 'Sansevieria trifasciata',
    imageUrl: 'https://via.placeholder.com/200?text=Snake+Plant',
    price: 200000,
    categoryIds: ['cat-1', 'cat-3'],
    tagIds: ['tag-6', 'tag-5'],
    instances: [
      {
        id: 'inst-5-1',
        sku: 'SNA-001-001',
        quantity: 40,
        price: 200000,
        condition: 'good',
        location: 'Shelf E1',
        dateAdded: '2026-02-03',
        imageUrl: 'https://via.placeholder.com/200?text=Snake+Plant',
      },
    ],
    createdAt: '2026-02-02',
    updatedAt: '2026-02-21',
  },
];
