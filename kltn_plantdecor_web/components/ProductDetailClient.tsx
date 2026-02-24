'use client';

import { useState } from 'react';
import { SamplePlant } from '@/data/sampledata';

interface ProductDetailClientProps {
  plant: SamplePlant;
}

export default function ProductDetailClient({ plant }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddToMyPlants = async () => {
    if (quantity < 1) {
      setMessage('Vui lòng nhập số lượng hợp lệ');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      // Simulate API call to add plant instance
      // In real implementation, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 500));

      setMessage(`✓ Đã thêm ${quantity} cây ${plant.name} vào "Cây của tôi"`);
      setQuantity(1);
      
      // Auto-hide message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Có lỗi xảy ra. Vui lòng thử lại.');
      console.error('Error adding to my plants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quantity Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số lượng cây muốn thêm
        </label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={isLoading}
            className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
          >
            −
          </button>
          <input
            type="number"
            min="1"
            max={plant.stock}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-green-600 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={() => setQuantity(Math.min(plant.stock, quantity + 1))}
            disabled={isLoading}
            className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to My Plants Button */}
      <button
        onClick={handleAddToMyPlants}
        disabled={isLoading || plant.stock === 0}
        className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
          plant.stock === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : isLoading
            ? 'bg-green-600 opacity-75'
            : 'bg-green-600 hover:bg-green-700 active:scale-95'
        }`}
      >
        {isLoading ? 'Đang xử lý...' : plant.stock === 0 ? 'Hết hàng' : '➕ Thêm vào Cây của tôi'}
      </button>

      {/* Feedback Message */}
      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${
          message.includes('✓')
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Info Text */}
      <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        ℹ️ Các cây bạn thêm sẽ được lưu trong phần "Cây của tôi" để bạn quản lý và chăm sóc chi tiết.
      </p>
    </div>
  );
}
