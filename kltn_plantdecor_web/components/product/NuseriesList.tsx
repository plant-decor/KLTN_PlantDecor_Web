'use client';

import { useState } from 'react';
import { List, ListItemButton, ListItemText } from '@mui/material';
import { useTranslations } from 'next-intl';
import type { NurseryResponse } from '@/types/nursery.types';

interface NurseryListProps {
  isNurseryAvailable: NurseryResponse[];
  onSelectNursery?: (nursery: NurseryResponse) => void;
  selectedNurseryId?: number | null;
}

export default function NurseryList({
  isNurseryAvailable,
  onSelectNursery,
  selectedNurseryId,
}: NurseryListProps) {
  const tProducts = useTranslations('products');
  const [internalSelectedId, setInternalSelectedId] = useState<number | null>(null);
  const selectedId = selectedNurseryId ?? internalSelectedId ?? isNurseryAvailable[0]?.nurseryId ?? null;

  const handleListNurseryClick = (nursery: NurseryResponse) => {
    setInternalSelectedId(nursery.nurseryId);
    onSelectNursery?.(nursery);
  };

  return (
    <>
      {isNurseryAvailable.length > 0 ? (
        <List
          component="nav"
          sx={{
            width: '100%',
            bgcolor: 'background.paper',
            maxHeight: 400,
            overflow: 'auto',
          }}
          aria-label="nurseries"
        >
          {isNurseryAvailable.map((nursery) => (
            <ListItemButton
              key={nursery.nurseryId}
              selected={selectedId === nursery.nurseryId}
              onClick={() => handleListNurseryClick(nursery)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '8px',
                '&.Mui-selected': {
                  backgroundColor: 'var(--primary)',
                  borderLeft: '4px solid primary.main',
                },
              }}
            >
              {/* text box 1 */}
              <ListItemText
                sx={{
                  borderRadius: '8px',
                  flex: '0 0 70%',
                  maxWidth: '70%',
                  pr: 1,
                }}
                primary={nursery.nurseryName}
                secondary={`${nursery.address} - ${nursery.phone}`}
              />

              {/* text box 2 */}
              <ListItemText
                sx={{
                  flex: '0 0 30%',
                  maxWidth: '30%',
                  textAlign: 'right',
                  fontWeight: 'semibold'
                }}
                primary={`${tProducts('nurseryDrawer.quantity')}: ${nursery.availableInstanceCount}`}
              />
            </ListItemButton>
          ))}
        </List>
      ) : (
        <p>{tProducts('nurseryDrawer.noNurseries')}</p>
      )}
    </>
  );
}
