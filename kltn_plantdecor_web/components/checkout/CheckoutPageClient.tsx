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

const parsePositiveInt = (value: string | null): number => {
  const parsed = Number(value ?? 0);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return Math.floor(parsed);
};

const parsePositiveNumber = (value: string | null): number => {
  const parsed = Number(value ?? 0);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return parsed;
};

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

  const orderTypeFromQuery = parsePositiveInt(searchParams.get('orderType')) || 1;
  const isPlantInstanceOrder = orderTypeFromQuery === 2;
  const isBuyNowOrder = orderTypeFromQuery === 3;
  const plantInstanceIdFromQuery = parsePositiveInt(searchParams.get('plantInstanceId'));
  const plantIdFromQuery = parsePositiveInt(searchParams.get('plantId'));
  const instanceNameFromQuery = searchParams.get('instanceName') || searchParams.get('buyNowItemName') || '';
  const instancePriceFromQuery = parsePositiveNumber(searchParams.get('instancePrice') || searchParams.get('buyNowItemPrice'));
  const buyNowItemIdFromQuery = parsePositiveInt(searchParams.get('buyNowItemId'));
  const buyNowItemTypeFromQuery = parsePositiveInt(searchParams.get('buyNowItemType')) || 1;
  const buyNowQuantityFromQuery = Math.max(1, parsePositiveInt(searchParams.get('buyNowQuantity')) || 1);
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
        } else if (isBuyNowOrder && buyNowItemIdFromQuery > 0) {
          const resolvedPrice = instancePriceFromQuery > 0 ? instancePriceFromQuery : 0;

          items = [
            {
              id: buyNowItemIdFromQuery,
              cartId: 0,
              commonPlantId: buyNowItemTypeFromQuery === 1 ? buyNowItemIdFromQuery : null,
              nurseryPlantComboId: buyNowItemTypeFromQuery === 2 ? buyNowItemIdFromQuery : null,
              nurseryMaterialId: buyNowItemTypeFromQuery === 3 ? buyNowItemIdFromQuery : null,
              price: resolvedPrice,
              productName: instanceNameFromQuery || `Buy now item #${buyNowItemIdFromQuery}`,
              quantity: buyNowQuantityFromQuery,
              subtotal: resolvedPrice * buyNowQuantityFromQuery,
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
          orderType: isPlantInstanceOrder ? 2 : isBuyNowOrder ? 3 : 1,
          plantInstanceId:
            isPlantInstanceOrder && plantInstanceIdFromQuery > 0
              ? plantInstanceIdFromQuery
              : null,
          buyNowItemId: isBuyNowOrder && buyNowItemIdFromQuery > 0 ? buyNowItemIdFromQuery : null,
          buyNowItemType: isBuyNowOrder ? buyNowItemTypeFromQuery : null,
          buyNowQuantity: isBuyNowOrder ? buyNowQuantityFromQuery : null,
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
    buyNowItemIdFromQuery,
    buyNowItemTypeFromQuery,
    buyNowQuantityFromQuery,
    instanceNameFromQuery,
    instancePriceFromQuery,
    isPlantInstanceOrder,
    isBuyNowOrder,
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

      const basePayload = {
        address,
        phone,
        customerName: fullName,
        note: notes ?? '',
        paymentStrategy: checkoutData.orderType === 2 ? (checkoutData.paymentStrategy ?? 1) : 1,
      };

      let payload: OrderCreateRequest;
      if (checkoutData.orderType === 2) {
        payload = {
          ...basePayload,
          orderType: 2,
          plantInstanceId: checkoutData.plantInstanceId ?? 0,
        };
      } else if (checkoutData.orderType === 3) {
        payload = {
          ...basePayload,
          orderType: 3,
          buyNowItemId: checkoutData.buyNowItemId ?? checkoutData.items[0]?.id ?? 0,
          buyNowItemType: (checkoutData.buyNowItemType ?? 1) as 1 | 2 | 3,
          buyNowQuantity: checkoutData.buyNowQuantity ?? checkoutData.items[0]?.quantity ?? 1,
        };
      } else {
        payload = {
          ...basePayload,
          orderType: 1,
          cartItemIds: checkoutData.items.map((item) => item.id),
        };
      }

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
