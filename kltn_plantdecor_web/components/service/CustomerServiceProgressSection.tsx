'use client';

import { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { CustomLoading } from '@/components/CustomLoading';
import FeedbackModal from '@/components/feedback/FeedbackModal';
import { getProgressByRegistrationId, postServiceProgressCustomerComment } from '@/lib/api/careServiceService';
import type { NurseryServiceScheduleItem } from '@/types/care-service.types';
import { formatDate, formatDateTime } from '@/lib/utils/dateUtils';
import { toast } from 'react-toastify';

interface CustomerServiceProgressSectionProps {
  registrationId: number;
  enabled: boolean;
}

const STATUS_CONFIG: Record<number, { label: string; color: 'default' | 'primary' | 'success' | 'warning' | 'error'; icon: React.ReactNode }> = {
  1: { label: 'Pending', color: 'default', icon: <RadioButtonUncheckedIcon sx={{ fontSize: 16 }} /> },
  2: { label: 'Assigned', color: 'primary', icon: <RadioButtonUncheckedIcon sx={{ fontSize: 16 }} /> },
  3: { label: 'In Progress', color: 'warning', icon: <AccessTimeIcon sx={{ fontSize: 16 }} /> },
  4: { label: 'Completed', color: 'success', icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> },
  5: { label: 'Cancelled', color: 'error', icon: <CancelIcon sx={{ fontSize: 16 }} /> },
};

interface ProgressItemProps {
  item: NurseryServiceScheduleItem;
  index: number;
  total: number;
  onOpenFeedback: (item: NurseryServiceScheduleItem) => void;
}

function ProgressItem({ item, index, total, onOpenFeedback }: ProgressItemProps) {
  const [expanded, setExpanded] = useState(false);
  const statusNum = typeof item.status === 'number' ? item.status : parseInt(String(item.status), 10);
  const cfg = STATUS_CONFIG[statusNum] ?? { label: item.statusName ?? String(item.status), color: 'default' as const, icon: null };
  const isLast = index === total - 1;
  const isCompleted = statusNum === 4;

  return (
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 24 }}>
        <Box sx={{ color: cfg.color === 'success' ? 'success.main' : cfg.color === 'warning' ? 'warning.main' : cfg.color === 'error' ? 'error.main' : cfg.color === 'primary' ? 'primary.main' : 'text.disabled', mt: 0.5 }}>
          {cfg.icon}
        </Box>
        {!isLast && <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', my: 0.5 }} />}
      </Box>

      <Box sx={{ flex: 1, pb: isLast ? 0 : 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" fontWeight={600}>
              Session {index + 1} — {formatDate(item.taskDate)}
            </Typography>
            {item.shift && (
              <Typography variant="caption" color="text.secondary">
                {item.shift.shiftName} ({item.shift.startTime.slice(0, 5)} – {item.shift.endTime.slice(0, 5)})
              </Typography>
            )}
            <Chip label={cfg.label} color={cfg.color} size="small" sx={{ height: 20, fontSize: 11 }} />
            {item.hasIncidents && (
              <Chip icon={<WarningAmberIcon sx={{ fontSize: 14 }} />} label="Incident" color="warning" size="small" sx={{ height: 20, fontSize: 11 }} />
            )}
            {item.customerFeedback && (
              <Chip
                icon={<ChatBubbleOutlineIcon sx={{ fontSize: 13 }} />}
                label="Feedback"
                color="info"
                size="small"
                sx={{ height: 20, fontSize: 11, cursor: 'pointer' }}
                onClick={() => onOpenFeedback(item)}
              />
            )}
          </Box>
          <IconButton size="small" onClick={() => setExpanded((v) => !v)} sx={{ p: 0.5 }}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Box>

        {item.caretaker && (
          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5 }}>
            <Avatar src={item.caretaker.avatar ?? undefined} sx={{ width: 18, height: 18, fontSize: 10 }}>
              <PersonIcon sx={{ fontSize: 12 }} />
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {item.caretaker.fullName}
            </Typography>
          </Stack>
        )}

        <Collapse in={expanded}>
          <Box sx={{ mt: 1, pl: 0.5, borderLeft: 2, borderColor: 'divider', ml: 0.5 }}>
            {(item.actualStartTime || item.actualEndTime) && (
              <Typography variant="caption" color="text.secondary" display="block">
                {item.actualStartTime ? `Started: ${formatDateTime(item.actualStartTime)}` : ''}
                {item.actualStartTime && item.actualEndTime ? ' · ' : ''}
                {item.actualEndTime ? `Ended: ${formatDateTime(item.actualEndTime)}` : ''}
              </Typography>
            )}

            {item.description && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                {item.description}
              </Typography>
            )}

            {item.evidenceImageUrl && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                  Evidence Photo
                </Typography>
                <Box
                  component="img"
                  src={item.evidenceImageUrl}
                  alt="Evidence"
                  sx={{ maxWidth: '100%', maxHeight: 180, borderRadius: 1, cursor: 'pointer', objectFit: 'cover' }}
                  onClick={() => window.open(item.evidenceImageUrl!, '_blank')}
                />
              </Box>
            )}

            {item.hasIncidents && (
              <Box sx={{ mt: 1, p: 1, bgcolor: 'warning.50', borderRadius: 1, border: '1px solid', borderColor: 'warning.200' }}>
                <Typography variant="caption" color="warning.dark" fontWeight={600} display="block">
                  Incident Report
                </Typography>
                {item.incidentReason && (
                  <Typography variant="caption" display="block" sx={{ mt: 0.25 }}>
                    {item.incidentReason}
                  </Typography>
                )}
                {item.incidentImageUrl && (
                  <Box sx={{ mt: 0.75 }}>
                    <Box
                      component="img"
                      src={item.incidentImageUrl}
                      alt="Incident"
                      sx={{ maxWidth: '100%', maxHeight: 150, borderRadius: 1, cursor: 'pointer', objectFit: 'cover' }}
                      onClick={() => window.open(item.incidentImageUrl!, '_blank')}
                    />
                  </Box>
                )}
              </Box>
            )}

            {isCompleted && (
              <Box sx={{ mt: 1 }}>
                <Button
                  size="small"
                  startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 14 }} />}
                  onClick={() => onOpenFeedback(item)}
                  sx={{ fontSize: 11, px: 1 }}
                  color={item.customerFeedback ? 'info' : 'inherit'}
                >
                  {item.customerFeedback ? 'View feedback' : 'Leave feedback'}
                </Button>
              </Box>
            )}
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}

export default function CustomerServiceProgressSection({ registrationId, enabled }: CustomerServiceProgressSectionProps) {
  const [progresses, setProgresses] = useState<NurseryServiceScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState<NurseryServiceScheduleItem | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      setLoading(true);
      try {
        const data = await getProgressByRegistrationId(registrationId, false);
        if (!cancelled) {
          const sorted = [...data].sort((a, b) => a.taskDate.localeCompare(b.taskDate));
          setProgresses(sorted);
        }
      } catch {
        if (!cancelled) setProgresses([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [registrationId, enabled]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <CustomLoading size={16} />
      </Box>
    );
  }

  if (progresses.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
        No service sessions scheduled yet.
      </Typography>
    );
  }

  const completed = progresses.filter((p) => (typeof p.status === 'number' ? p.status : parseInt(String(p.status), 10)) === 4).length;
  const targetIndex = feedbackTarget ? progresses.findIndex((p) => p.id === feedbackTarget.id) : -1;

  const handleSubmitFeedback = async (comment: string) => {
    if (!feedbackTarget) return;
    await postServiceProgressCustomerComment(feedbackTarget.id, comment, false);
    setProgresses((prev) => prev.map((p) => p.id === feedbackTarget.id ? { ...p, customerFeedback: comment } : p));
    setFeedbackTarget(null);
    toast.success('Feedback submitted');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle2" color="text.secondary">
          Service Progress
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {completed}/{progresses.length} sessions completed
        </Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <Box>
        {progresses.map((item, index) => (
          <ProgressItem
            key={item.id}
            item={item}
            index={index}
            total={progresses.length}
            onOpenFeedback={setFeedbackTarget}
          />
        ))}
      </Box>

      <FeedbackModal
        open={Boolean(feedbackTarget)}
        onClose={() => setFeedbackTarget(null)}
        title={targetIndex >= 0 ? `Session ${targetIndex + 1} Feedback` : 'Session Feedback'}
        existingFeedback={feedbackTarget?.customerFeedback}
        onSubmit={feedbackTarget?.customerFeedback ? undefined : handleSubmitFeedback}
      />
    </Box>
  );
}
