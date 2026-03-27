'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Box,
  TableCell,
  TableRow,
  Typography,
  TextField,
  IconButton,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';
import type { CartItem } from '@/types/cart.types';
import { formatCurrency } from '@/lib/utils/formatUtil';

interface CartItemRowProps {
  item: CartItem;
  isUpdating: boolean;
  onQuantityChange: (cartItemId: number, quantity: number) => void;
  onRemove: (cartItemId: number) => void;
}

export default function CartItemRow({
  item,
  isUpdating,
  onQuantityChange,
  onRemove,
}: CartItemRowProps) {
  console.log('Rendering CartItemRow for item:', item);

  return (
    <TableRow sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
      {/* Product Info */}
      <TableCell>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Box sx={{ position: 'relative', width: 60, height: 60 }}>
            <Image
              src={item.imageUrl || '/img/fallbackplant.avif'}
              alt={item.productName}
              fill
              style={{ objectFit: 'cover', borderRadius: 4 }}
            />
          </Box>
          <Box>
            <Link href={`/products/${item.id}`}>
              <Typography
                sx={{
                  fontWeight: 500,
                  color: '#1976d2',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {item.productName}
              </Typography>
            </Link>
          </Box>
        </Box>
      </TableCell>

      {/* Price */}
      <TableCell align="center">
        <Typography sx={{ fontWeight: 500 }}>
          {(item.price || 0).toLocaleString('vi-VN')}₫
        </Typography>
      </TableCell>

      {/* Quantity */}
      <TableCell align="center">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <IconButton
            size="small"
            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 1}
            sx={{ color: '#999' }}
          >
            <RemoveIcon fontSize="small" />
          </IconButton>
          <TextField
            type="number"
            value={item.quantity}
            onChange={(e) =>
              onQuantityChange(item.id, parseInt(e.target.value, 10) || 0)
            }
            disabled={isUpdating}
            inputProps={{
              min: 1,
              style: { textAlign: 'center', width: 50 },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                padding: 0,
              },
            }}
          />
          <IconButton
            size="small"
            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
            disabled={isUpdating}
            sx={{ color: '#999' }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </TableCell>

      {/* Subtotal */}
      <TableCell align="center">
        <Typography sx={{ fontWeight: 'bold', color: '#4CAF50', fontSize: '0.95rem' }}>
          {formatCurrency(item.subtotal, 'vi-VN')}
        </Typography>
      </TableCell>

      {/* Action */}
      <TableCell align="center">
        <IconButton
          size="small"
          onClick={() => onRemove(item.id)}
          disabled={isUpdating}
          sx={{ color: '#d32f2f' }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
