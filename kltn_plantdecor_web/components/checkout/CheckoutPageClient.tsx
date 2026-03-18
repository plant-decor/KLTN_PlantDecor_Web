'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Container,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import CheckoutShipping from '@/components/checkout/CheckoutShipping';
import CheckoutPayment from '@/components/checkout/CheckoutPayment';
import CheckoutReview from '@/components/checkout/CheckoutReview';
import CheckoutComplete from '@/components/checkout/CheckoutComplete';
import { post } from '@/lib/api/apiService';

interface CheckoutPageClientProps {
  userId: string;
  cartId: string;
}

const STEPS = ['Shipping', 'Payment', 'Review', 'Complete'];

export default function CheckoutPageClient({
  userId,
  cartId,
}: CheckoutPageClientProps) {
  const router = useRouter();
  const { getCheckoutData, updateCheckoutData } = useCartStore();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const checkoutData = getCheckoutData();

  useEffect(() => {
    // Verify checkout data exists
    if (!checkoutData) {
      setError('Cart data not found. Please go back to cart.');
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [checkoutData]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!checkoutData) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error" action={
          <Button size="small" onClick={() => router.push('/cart')}>
            Back to Cart
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  const handleNext = () => {
    if (activeStep < STEPS.length - 1) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleSubmitOrder = async () => {
    try {
      setIsSubmitting(true);
      setError('');

      await post('/api/orders', {
          userId,
          cartId,
          checkoutData,
        });
      setActiveStep(3); // Complete step
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to submit order';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Box sx={{ minHeight: '400px', mb: 4 }}>
        {activeStep === 0 && (
          <CheckoutShipping
            checkoutData={checkoutData}
            onDataChange={updateCheckoutData}
          />
        )}
        {activeStep === 1 && (
          <CheckoutPayment
            checkoutData={checkoutData}
            onDataChange={updateCheckoutData}
          />
        )}
        {activeStep === 2 && (
          <CheckoutReview
            checkoutData={checkoutData}
            userId={userId}
            cartId={cartId}
          />
        )}
        {activeStep === 3 && <CheckoutComplete checkoutData={checkoutData} userId={userId} />}
      </Box>

      {/* Navigation Buttons */}
      {activeStep < 3 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            mt: 4,
          }}
        >
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0 || isSubmitting}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={
              activeStep === 2 ? handleSubmitOrder : handleNext
            }
            disabled={isSubmitting}
            sx={{ backgroundColor: '#4CAF50' }}
          >
            {activeStep === 2 ? 'Place Order' : 'Next'}
          </Button>
        </Box>
      )}
    </Container>
  );
}
