'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import type { ReturnTicket } from '@/types/return-ticket.types';
import {
  RETURN_TICKET_ASSIGNMENT_STATUS_CHIP_COLOR,
  RETURN_TICKET_ITEM_STATUS_CHIP_COLOR,
  RETURN_TICKET_STATUS_CHIP_COLOR,
} from './returnTicket.constants';
import { formatCurrency, formatDate } from './orderHistoryUtils';
import FullscreenImageModal from '@/components/image-view/FullscreenImageModal';
import { ImageOutlined } from '@mui/icons-material';
import ClickableImageViewer from '../image-view/ClickableImageViewer';
import { CustomLoading } from '../CustomLoading';

interface MyReturnTicketsPanelProps {
  tickets: ReturnTicket[];
  loading: boolean;
  error: string;
}

export default function MyReturnTicketsPanel({ tickets, loading, error }: MyReturnTicketsPanelProps) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [activeItemImages, setActiveItemImages] = useState<string[]>([]);
  const handleOpenImageModal = (imageUrls: string[]) => {
    if (!imageUrls.length) {
      return;
    }

    setActiveItemImages(imageUrls);
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
    setActiveItemImages([]);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
        My Return Tickets
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CustomLoading size={18} />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : tickets.length === 0 ? (
        <Alert severity="info">You have not submitted any return tickets yet.</Alert>
      ) : (
        <Stack spacing={2}>
          {tickets.map((ticket) => (
            <Card key={ticket.id} variant="outlined">
              <CardContent>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Ticket #{ticket.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Order #{ticket.orderId} - Created: {formatDate(ticket.createdAt)}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Reason: {ticket.reason || '-'}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={ticket.statusName}
                      color={RETURN_TICKET_STATUS_CHIP_COLOR[ticket.status] || 'default'}
                      size="small"
                    />
                    <Typography variant="body2" fontWeight={600}>
                      Refunded: {formatCurrency(ticket.totalRefundedAmount)}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Items
                  </Typography>
                  {ticket.items.map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Box className='flex items-center gap-2'>
                        {item.productImageUrl && (
                          <ClickableImageViewer
                            images={[item.productImageUrl]}
                            alt={item.itemName}
                            containerClassName="w-16! h-16!"
                            className="w-full aspect-square object-cover"
                            showZoomHint={false}
                          />
                        )}
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {item.itemName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Refund Quantity: {item.requestedQuantity} | Approved Quantity: {item.approvedQuantity ?? '-'}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Reason: {item.reason}
                        </Typography>
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="medium"
                          label={item.statusName}
                          color={RETURN_TICKET_ITEM_STATUS_CHIP_COLOR[item.status] || 'default'}
                          />
                        {item.imageUrls.length > 0 && (
                          <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenImageModal(item.imageUrls)}
                            className='bg-primary! font-semibold rounded-full!'
                          >
                            Evidence <ImageOutlined sx={{ ml: 0.5 }} />
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={1}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Assignments
                  </Typography>
                  {ticket.assignments.map((assignment) => (
                    <Box
                      key={assignment.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Typography variant="body2">
                        Nursery #{assignment.nurseryId} - Manager: {assignment.managerName}
                      </Typography>
                      <Chip
                        size="small"
                        label={assignment.statusName}
                        color={RETURN_TICKET_ASSIGNMENT_STATUS_CHIP_COLOR[assignment.status] || 'default'}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <FullscreenImageModal
        images={activeItemImages}
        isOpen={imageModalOpen}
        onClose={handleCloseImageModal}
        alt="Return evidence image"
      />
    </Box>
  );
}
