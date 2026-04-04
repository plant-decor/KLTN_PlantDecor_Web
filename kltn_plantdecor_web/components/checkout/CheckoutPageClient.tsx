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
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
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
  OrderCreateRequest,
} from '@/types/order.types';

interface CheckoutPageClientProps {
  userId: string;
  cartId: string;
}

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
  const searchParams = useSearchParams();
  const locale = useLocale();
  const tCheckout = useTranslations('checkout');
  const tCommon = useTranslations('common');
  const STEPS = [
    tCheckout('shipping'),
    tCheckout('review'),
    tCheckout('payment'),
    tCheckout('complete'),
  ];
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [userProfile, setUserProfile] = useState<CustomerProfile | null>(null);
  const [createdOrder, setCreatedOrder] = useState<OrderCreatePayload | null>(null);

  const isPlantInstanceOrder = searchParams.get('orderType') === '2';
  const plantInstanceIdFromQuery = Number(searchParams.get('plantInstanceId') || 0);
  const plantIdFromQuery = Number(searchParams.get('plantId') || 0);
  const instanceNameFromQuery = searchParams.get('instanceName') || '';
  const instancePriceFromQuery = Number(searchParams.get('instancePrice') || 0);
  const paymentStrategyFromQuery = Number(searchParams.get('paymentStrategy') || 1);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError('');

      try {
        const userProfileRes = await get<{ payload?: CustomerProfile }>(
          `/User/user-profile`
        );
        const profilePayload = userProfileRes.payload ?? null;
        let items: CartItem[] = [];

        if (isPlantInstanceOrder && plantInstanceIdFromQuery > 0) {
          const resolvedPrice =
            Number.isFinite(instancePriceFromQuery) && instancePriceFromQuery > 0
              ? instancePriceFromQuery
              : 0;

          items = [
            {
              id: plantInstanceIdFromQuery,
              cartId: 0,
              commonPlantId: plantIdFromQuery > 0 ? plantIdFromQuery : 0,
              price: resolvedPrice,
              productName:
                instanceNameFromQuery || `Plant Instance #${plantInstanceIdFromQuery}`,
              quantity: 1,
              subtotal: resolvedPrice,
              imageUrl: null,
            },
          ];
        } else {
          const cartRes = await fetchCartItems();
          const cartApiItems = cartRes.payload?.items ?? [];
          items = cartApiItems.map(toCartItem);
        }

        if (items.length === 0) {
          if (!isMounted) return;
          setError(tCheckout('errors.emptyCartGoBack'));
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
          paymentStrategy:
            isPlantInstanceOrder && paymentStrategyFromQuery === 2 ? 2 : 1,
          orderType: isPlantInstanceOrder ? 2 : 1,
          plantInstanceId:
            isPlantInstanceOrder && plantInstanceIdFromQuery > 0
              ? plantInstanceIdFromQuery
              : null,
          subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
          total: items.reduce((sum, item) => sum + item.subtotal, 0),
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        if (!isMounted) return;
        const errorMessage = err instanceof Error ? err.message : tCheckout('errors.loadFailed');
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
  }, [
    cartId,
    instanceNameFromQuery,
    instancePriceFromQuery,
    isPlantInstanceOrder,
    locale,
    paymentStrategyFromQuery,
    plantIdFromQuery,
    plantInstanceIdFromQuery,
    router,
    tCheckout,
    userId,
  ]);

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
            {tCheckout('backToCart')}
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
      setError(tCheckout('errors.missingShippingInfo'));
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      if (checkoutData.items.length === 0) {
        setError(tCheckout('errors.emptyCart'));
        return;
      }

      const { fullName, phone, address, notes } = checkoutData.shippingInfo;
      if (!fullName || !phone || !address) {
        setError(tCheckout('errors.missingRequiredShippingFields'));
        return;
      }

      const payload: OrderCreateRequest = {
        address,
        phone,
        customerName: fullName,
        note: notes ?? '',
        paymentStrategy: checkoutData.paymentStrategy ?? 1,
        orderType: checkoutData.orderType ?? 1,
        cartItemIds:
          checkoutData.orderType === 2
            ? []
            : checkoutData.items.map((item) => item.id),
        plantInstanceId:
          checkoutData.orderType === 2 ? checkoutData.plantInstanceId ?? 0 : 0,
      };

      const created: OrderCreatePayload = await createOrder(payload);

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
        err instanceof Error ? err.message : tCheckout('errors.submitFailed');
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewToPayment = () => {
    if (!createdOrder?.id) {
      setError(tCheckout('errors.orderNotCreated'));
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
            {tCommon('back')}
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
          {tCommon('back')}
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
          {activeStep === 0 ? tCheckout('actions.reviewOrder') : tCheckout('actions.goToPayment')}
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
