import React from 'react';
import { Container } from '@mui/material';
import CheckoutPageClient from '@/components/Checkout/CheckoutPageClient';

interface CheckoutPageProps {
  params: Promise<{
    userId: string;
    cartId: string;
  }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { userId, cartId } = await params;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <CheckoutPageClient userId={userId} cartId={cartId} />
    </Container>
  );
}
