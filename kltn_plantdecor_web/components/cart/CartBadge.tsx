'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Badge, IconButton } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuthStore } from '@/lib/store/authStore';
import { fetchCartItems } from '@/lib/api/cartWishlistService';
import { subscribeCartUpdated } from '@/lib/utils/cartEvents';

export default function CartBadge() {
  const [itemCount, setItemCount] = useState(0);
  const { user, accessToken } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const loadCartCount = async () => {
      if (!user?.id || !accessToken) {
        if (mounted) {
          setItemCount(0);
        }
        return;
      }

      try {
        const cartItems = await fetchCartItems();
        const totalItems = cartItems.payload?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

        if (mounted) {
          setItemCount(totalItems);
        }
      } catch (error) {
        if (mounted) {
          setItemCount(0);
        }
        console.error('Fetch cart count error:', error);
      }
    };

    loadCartCount();

    const unsubscribe = subscribeCartUpdated(() => {
      loadCartCount();
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [accessToken, user?.id]);

  const cartHref = user?.id ? `/cart/${user.id}` : '/login';
  const displayCount = user?.id ? itemCount : 0;

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
        <Badge badgeContent={displayCount} color="success">
          <ShoppingCartIcon />
        </Badge>
      </IconButton>
    </Link>
  );
}
