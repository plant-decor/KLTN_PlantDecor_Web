'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge, IconButton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuthStore } from '@/store/authStore';

export default function CartBadge() {
  const [itemCount, setItemCount] = useState(0);
  const { user } = useAuthStore();

  const userId = user?.id?.toString();

  // Fetch cart data to get item count
  useEffect(() => {
    if (!userId) {
      setItemCount(0);
      return;
    }

    const fetchCartCount = async () => {
      try {
        const response = await fetch(`/api/cart/get?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }

        const data = await response.json();
        const cartItems = data.data || [];
        const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setItemCount(totalItems);
      } catch (error) {
        console.error('Fetch cart count error:', error);
        setItemCount(0);
      }
    };

    fetchCartCount();
    
    // Reload cart count every 5 seconds or when needed
    const interval = setInterval(fetchCartCount, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const cartHref = userId ? `/cart/${userId}` : '/login';

  return (
    <Link href={cartHref} passHref>
      <IconButton
        sx={{
          color: '#333',
          '&:hover': {
            backgroundColor: '#f0f0f0',
          },
        }}
      >
        <Badge badgeContent={itemCount} color="success">
          <ShoppingCartIcon />
        </Badge>
      </IconButton>
    </Link>
  );
}
