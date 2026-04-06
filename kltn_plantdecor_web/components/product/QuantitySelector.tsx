'use client';

import type { MouseEvent } from 'react';

interface QuantitySelectorProps {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
  showAvailable?: boolean;
  preventEventBubbling?: boolean;
}

export default function QuantitySelector({
  value,
  min = 1,
  max,
  onChange,
  label = 'Quantity',
  showAvailable = false,
  preventEventBubbling = false,
}: QuantitySelectorProps) {
  const handleQuantityClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!preventEventBubbling) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDecrease = (event: MouseEvent<HTMLButtonElement>) => {
    handleQuantityClick(event);
    onChange(Math.max(min, value - 1));
  };

  const handleIncrease = (event: MouseEvent<HTMLButtonElement>) => {
    handleQuantityClick(event);
    onChange(Math.min(max, value + 1));
  };

  return (
    <div>
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div className="flex items-center border border-gray-300 rounded-lg w-fit">
        <button
          type="button"
          onClick={handleDecrease}
          className="px-4 py-2 hover:bg-gray-100 transition-colors"
          disabled={value <= min}
        >
          -
        </button>
        <span className="px-6 py-2 border-x border-gray-300 min-w-14 text-center">{value}</span>
        <button
          type="button"
          onClick={handleIncrease}
          className="px-4 py-2 hover:bg-gray-100 transition-colors"
          disabled={value >= max}
        >
          +
        </button>
      </div>
      {showAvailable && <p className="text-xs text-gray-500 mt-1">Available: {max}</p>}
    </div>
  );
}
