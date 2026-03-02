'use client';

import React from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import type { CartItem } from '@/types/cart.types';
import CartItemRow from './CartItemRow';

interface CartTableProps {
  items: CartItem[];
  isUpdating: boolean;
  onQuantityChange: (plantId: number, quantity: number) => void;
  onRemove: (plantId: number) => void;
  onClearCart: () => void;
}

export default function CartTable({
  items,
  isUpdating,
  onQuantityChange,
  onRemove,
  onClearCart,
}: CartTableProps) {
  return (
    <>
      <TableContainer component={Paper} sx={{ boxShadow: 1 }}>
        <Table>
          <TableHead>
            <TableRow className='bg-green-200' >
              <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '15%' }} align="center">
                Price
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '20%' }} align="center">
                Quantity
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '15%' }} align="center">
                Subtotal
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', width: '15%' }} align="center">
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                isUpdating={isUpdating}
                onQuantityChange={onQuantityChange}
                onRemove={onRemove}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Clear Cart Button */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          disabled={isUpdating}
          sx={{
            borderColor: '#d32f2f',
            color: '#d32f2f',
            textTransform: 'none',
            px: 3,
            '&:hover': {
              borderColor: '#d32f2f',
              backgroundColor: '#ffebee',
            },
          }}
          onClick={onClearCart}
        >
          Clear Cart
        </Button>
      </Box>
    </>
  );
}
