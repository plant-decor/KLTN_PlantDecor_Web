/**
 * Reusable button hover animations for MUI sx prop
 */

import type { Theme } from '@mui/material/styles';

export const hoverLiftStyle = {
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
  },
};

export const hoverGlowStyle = {
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: (theme: Theme) => `0 0 20px ${theme.palette.primary.main}40`,
  },
};

export const hoverScaleStyle = {
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
  },
};
