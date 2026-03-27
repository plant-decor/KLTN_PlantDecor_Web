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
import { useLocale } from 'next-intl';
import CheckoutShipping from '@/components/checkout/CheckoutShipping';
import CheckoutPayment from '@/components/checkout/CheckoutPayment';
import CheckoutReview from '@/components/checkout/CheckoutReview';
import CheckoutComplete from '@/components/checkout/CheckoutComplete';
import { get } from '@/lib/api/apiService';
import {
  fetchCartItems,
  type CartApiItem,
} from '@/lib/api/cartWishlistService';
import type { CheckoutData, CartItem } from '@/types/cart.types';
import type { CustomerProfile } from '@/types/auth.types';
import {
  createOrder,
} from '@/lib/api/orderService';
import type {
  OrderCreatePayload,
  OrderCreateRequestWithCartIds,
  OrderCreateRequestWithItems,
} from '@/types/order.types';

interface CheckoutPageClientProps {
  userId: string;
  cartId: string;
}

const STEPS = ['Shipping', 'Review', 'Payment', 'Complete'];

const toCartItem = (item: CartApiItem): CartItem => ({
  cartId: item.cartId,
  commonPlantId: item.commonPlantId,
  createdAt: item.createAt,
  id: item.id,
  // nurseryMaterialId: null,
  // nurseryPlantComboId: null,
  price: item.price,
  productName: item.productName,
  quantity: item.quantity,
  subtotal: item.subtotal,
  imageUrl: item.imageUrl,
});

export default function CheckoutPageClient({
  userId,
  cartId,
}: CheckoutPageClientProps) {
  const router = useRouter();
  const locale = useLocale();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [userProfile, setUserProfile] = useState<CustomerProfile | null>(null);
  const [createdOrder, setCreatedOrder] = useState<OrderCreatePayload | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError('');

      try {
        const [cartRes, userProfileRes] = await Promise.all([
          fetchCartItems(),
          get<{ payload?: CustomerProfile }>(`/User/user-profile`),
        ]);

        const cartApiItems = cartRes.payload?.items ?? [];
        const profilePayload = userProfileRes.payload ?? null;
        const items = cartApiItems.map(toCartItem);
        if (items.length === 0) {
          if (!isMounted) return;
          setError('Cart is empty. Please go back to cart.');
          setCheckoutData(null);
          setIsLoading(false);
          router.push(`/${locale}/cart/${userId}`);
          return;
        }

        const shippingInfo = {
          fullName: profilePayload?.fullName ?? profilePayload?.username ?? '',
          phone: profilePayload?.phoneNumber ?? '',
          address: profilePayload?.address ?? '',
          notes: '',
        };

        if (!isMounted) return;
        setUserProfile(profilePayload);
        setCheckoutData({
          cartId,
          items,
          shippingInfo,
          paymentMethod: 'credit_debit',
          subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
          total: items.reduce((sum, item) => sum + item.subtotal, 0),
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        if (!isMounted) return;
        const errorMessage = err instanceof Error ? err.message : 'Failed to load checkout data';
        setError(errorMessage);
        setCheckoutData(null);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [cartId, locale, router, userId]);

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
          <Button size="small" onClick={() => router.push(`/${locale}/cart/${userId}`)}>
            Back to Cart
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  const updateCheckoutData = (data: Partial<CheckoutData>) => {
    setCheckoutData((prev) => (prev ? { ...prev, ...data } : prev));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const handleCreateOrderAndGoReview = async () => {
    if (!checkoutData.shippingInfo) {
      setError('Missing shipping information.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      if (checkoutData.items.length === 0) {
        setError('Cart is empty.');
        return;
      }

      const { fullName, phone, address, notes } = checkoutData.shippingInfo;
      if (!fullName || !phone || !address) {
        setError('Please enter full name, phone and shipping address.');
        return;
      }

      const basePayload = {
        address,
        phone,
        customerName: fullName,
        note: notes ?? '',
        paymentStrategy: 1,
        orderType: 1,
      };
      const payloadWithCartIds: OrderCreateRequestWithCartIds = {
        ...basePayload,
        cartItemIds: checkoutData.items.map((item) => item.id),
        plantInstanceId: null,
      };

      let created: OrderCreatePayload;
      try {
        created = await createOrder(payloadWithCartIds);
      } catch (primaryError) {
        const canFallback =
          primaryError instanceof Error &&
          /(status 400|status 415|status 422)/i.test(primaryError.message);

        if (!canFallback) {
          throw primaryError;
        }

        const fallbackPayload: OrderCreateRequestWithItems = {
          ...basePayload,
          items: checkoutData.items.map((item) => ({
            commonPlantId: item.commonPlantId,
            quantity: item.quantity,
            price: item.price || 0,
          })),
        };
        created = await createOrder(fallbackPayload);
      }

      setCreatedOrder(created);

      setCheckoutData((prev) =>
        prev
          ? {
              ...prev,
              total: created.totalAmount ?? prev.total,
            }
          : prev
      );

      setActiveStep(1);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to submit order';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewToPayment = () => {
    if (!createdOrder?.id) {
      setError('Order has not been created yet.');
      return;
    }
    setError('');
    setActiveStep(2);
  };

  const handlePaymentCompleted = () => {
    setActiveStep(3);
  };

  const renderNavigation = () => {
    if (activeStep >= STEPS.length - 1) {
      return null;
    }

    if (activeStep === 2) {
      return (
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
            disabled={isSubmitting}
          >
            Back
          </Button>
        </Box>
      );
    }

    return (
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
          onClick={() => {
            if (activeStep === 0) {
              void handleCreateOrderAndGoReview();
              return;
            }
            if (activeStep === 1) {
              handleReviewToPayment();
            }
          }}
          disabled={isSubmitting}
          sx={{ backgroundColor: '#4CAF50' }}
        >
          {activeStep === 0 ? 'Review Order' : 'Go to Payment'}
        </Button>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: '400px', mb: 4 }}>
        {activeStep === 0 && (
          <CheckoutShipping
            checkoutData={checkoutData}
            userProfile={userProfile}
            onDataChange={updateCheckoutData}
          />
        )}

        {activeStep === 1 && (
          <CheckoutReview
            checkoutData={checkoutData}
            userId={userId}
            cartId={cartId}
            createdOrder={createdOrder}
          />
        )}

        {activeStep === 2 && createdOrder && (
          <CheckoutPayment
            checkoutData={checkoutData}
            onDataChange={updateCheckoutData}
            orderId={createdOrder.id}
            onPaymentCompleted={handlePaymentCompleted}
          />
        )}

        {activeStep === 3 && (
          <CheckoutComplete
            checkoutData={checkoutData}
            userId={userId}
            orderId={createdOrder?.id}
          />
        )}
      </Box>

      {renderNavigation()}
    </Container>
  );
}
