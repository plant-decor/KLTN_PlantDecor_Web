'use client';

import React, { useEffect, useState } from 'react';
import {
  TextField,
  Typography,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import type { CheckoutData } from '@/types/cart.types';
import type { CustomerProfile } from '@/types/auth.types';

interface CheckoutShippingProps {
  checkoutData: CheckoutData;
  userProfile: CustomerProfile | null;
  onDataChange: (data: Partial<CheckoutData>) => void;
}

export default function CheckoutShipping({
  checkoutData,
  userProfile,
  onDataChange,
}: CheckoutShippingProps) {
  const [formData, setFormData] = useState({
    fullName: checkoutData.shippingInfo?.fullName ?? userProfile?.fullName ?? '',
    phone: checkoutData.shippingInfo?.phone ?? userProfile?.phoneNumber ?? '',
    address: checkoutData.shippingInfo?.address ?? userProfile?.address ?? '',
    notes: checkoutData.shippingInfo?.notes ?? '',
  });

  useEffect(() => {
    if (!userProfile) return;

    // Only prefill fields that are empty (so user input is not overwritten)
    const fullName = checkoutData.shippingInfo?.fullName || userProfile.fullName || '';
    const phone = checkoutData.shippingInfo?.phone || userProfile.phoneNumber || '';
    const address = checkoutData.shippingInfo?.address || userProfile.address || '';
    const nextNotes = checkoutData.shippingInfo?.notes ?? formData.notes ?? '';

    const shouldUpdateParent =
      !checkoutData.shippingInfo?.fullName ||
      !checkoutData.shippingInfo?.phone ||
      !checkoutData.shippingInfo?.address;

    setFormData((prev) => ({
      ...prev,
      fullName,
      phone,
      address,
      notes: nextNotes,
    }));

    if (shouldUpdateParent) {
      onDataChange({
        shippingInfo: {
          fullName,
          phone,
          address,
          notes: nextNotes,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile]);
    

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Update store with new shipping info
      onDataChange({
        shippingInfo: {
          fullName: updated.fullName,
          phone: updated.phone,
          address: updated.address,
          notes: updated.notes,
        },
      });

      return updated;
    });
  };

  return (
    <Card sx={{ boxShadow: 1 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          Shipping Information
        </Typography>

        <Grid container spacing={2}>
          {/* Full Name */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Your name"
              variant="outlined"
              size="small"
            />
          </Grid>

          {/* Phone */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone number"
              variant="outlined"
              size="small"
            />
          </Grid>

          {/* Address */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Shipping Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Nguyen Hue, Ho Chi Minh City"
              variant="outlined"
              size="small"
              multiline
              rows={3}
            />
          </Grid>

          {/* Notes */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Notes (Optional)"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any special instructions..."
              variant="outlined"
              size="small"
              multiline
              rows={2}
            />
          </Grid>
        </Grid>

        {/* Shipping Details */}
        {/* <Box sx={{ mt: 4, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Shipping Details
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Name:</strong> {formData.fullName || 'Not provided'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Phone:</strong> {formData.phone || 'Not provided'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Address:</strong> {formData.address || 'Not provided'}
          </Typography>
          {formData.notes && (
            <Typography variant="body2">
              <strong>Notes:</strong> {formData.notes}
            </Typography>
          )}
        </Box> */}
      </CardContent>
    </Card>
  );
}
