import type { SubscriptionTier } from '@/types/auth.types';
import Image from 'next/image';

const TIER_CONFIG: Record<SubscriptionTier, { bg: string; text: string; border: string; icon: string }> = {
  Bronze: {
    bg: '#fdf3e7',
    text: '#92400e',
    border: '#d97706',
    icon: '/logo/bronze-subcription.png'
  },
  Silver: {
    bg: '#f3f4f6',
    text: '#374151',
    border: '#9ca3af',
    icon: '/logo/silver-subcription.png'
  },
  Gold: {
    bg: '#fefce8',
    text: '#78350f',
    border: '#f59e0b',
    icon: '/logo/gold-subcription.png'
  },
};

interface SubscriptionBadgeProps {
  tier?: SubscriptionTier | null;
  /** 'chip' for profile page, 'compact' for header (no text, just colored dot + label) */
  variant?: 'chip' | 'compact' | 'inline';
  className?: string;
}

export default function SubscriptionBadge({
  tier,
  variant = 'chip',
  className = '',
}: SubscriptionBadgeProps) {
  const resolved: SubscriptionTier = tier ?? 'Bronze';
  const cfg = TIER_CONFIG[resolved];

  if (variant === 'compact') {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          padding: '1px 6px',
          borderRadius: 999,
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.02em',
          background: cfg.bg,
          color: cfg.text,
          border: `1px solid ${cfg.border}`,
          lineHeight: 1.5,
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ display: 'inline-block', overflow: 'hidden', width: 40, height: 40, position: 'relative', flexShrink: 0 }}>
          <Image src={cfg.icon} alt={resolved} width={40} height={40} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', scale: 1.5, marginLeft: 10, marginTop: 5 }} />
        </span> {resolved}
      </span>
    );
  }

  if (variant === 'inline') {
    return (
      <span
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '2px 8px',
          borderRadius: 999,
          fontSize: '0.75rem',
          fontWeight: 600,
          background: cfg.bg,
          color: cfg.text,
          border: `1px solid ${cfg.border}`,
          lineHeight: 1.6,
        }}
      >
        <span style={{ display: 'inline-block', overflow: 'hidden', width: 40, height: 40, position: 'relative', flexShrink: 0 }}>
          <Image src={cfg.icon} alt={resolved} width={60} height={60} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', scale: 1.5, marginLeft: 10, marginTop: 5 }}/>
        </span> {resolved}
      </span>
    );
  }

  // chip (default) — used on profile page
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '2px 4px',
        borderRadius: 999,
        fontSize: '0.875rem',
        fontWeight: 700,
        background: cfg.bg,
        color: cfg.text,
        border: `1px solid ${cfg.border}`,
        lineHeight: 1.6,
      }}
    >
      <span style={{ display: 'inline-block', overflow: 'hidden', width: 40, height: 40, position: 'relative', flexShrink: 0, aspectRatio: '1 / 1' }}>
        <Image src={cfg.icon} alt={resolved} width={80} height={80} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', scale: 1.5, marginLeft: 10, marginTop: 5 }} />
      </span> {resolved} Member
    </span>
  );
}
