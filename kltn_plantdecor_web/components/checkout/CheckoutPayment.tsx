'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  LocalAtm as CashIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import type { CheckoutData } from '@/types/cart.types';

interface CheckoutPaymentProps {
  checkoutData: CheckoutData;
  onDataChange: (data: Partial<CheckoutData>) => void;
}

const PAYMENT_METHODS = [
  {
    id: 'credit_debit',
    label: 'Credit / Debit Card',
    icon: <CreditCardIcon />,
  },
  {
    id: 'bank_transfer',
    label: 'Bank Transfer',
    icon: <BankIcon />,
  },
  {
    id: 'cod',
    label: 'Cash on Delivery (COD)',
    icon: <CashIcon />,
  },
  {
    id: 'ewallet',
    label: 'MoMo E-Wallet',
    icon: <WalletIcon />,
  },
];

export default function CheckoutPayment({
  checkoutData,
  onDataChange,
}: CheckoutPaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState(
    checkoutData.paymentMethod || 'credit_debit'
  );

  const handlePaymentMethodChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newMethod = e.target.value;
    setSelectedMethod(newMethod);
    onDataChange({
      paymentMethod: newMethod,
    });
  };

  return (
    <Card sx={{ boxShadow: 1 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          Payment Method
        </Typography>

        <RadioGroup value={selectedMethod} onChange={handlePaymentMethodChange}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {PAYMENT_METHODS.map((method) => (
              <Box key={method.id}>
                <FormControlLabel
                  value={method.id}
                  control={<Radio />}
                  label={
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        ml: 1,
                      }}
                    >
                      {method.icon}
                      <Typography variant="body1">{method.label}</Typography>
                    </Box>
                  }
                  sx={{
                    border: '1px solid',
                    borderColor:
                      selectedMethod === method.id ? '#4CAF50' : '#ddd',
                    borderRadius: 1,
                    p: 2,
                    width: '100%',
                    m: 0,
                    backgroundColor:
                      selectedMethod === method.id ? '#f1f8f4' : 'white',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: '#4CAF50',
                    },
                  }}
                />
              </Box>
            ))}
          </Box>
        </RadioGroup>

        {/* Payment Info Box */}
        <Box sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Selected Payment Method
          </Typography>
          <Typography variant="body2">
            {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
