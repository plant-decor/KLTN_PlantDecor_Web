'use client'; // Bắt buộc phải có dòng này

import { useState, useEffect } from 'react';
import { List, ListItemButton, ListItemText } from '@mui/material';
import type { NurseryResponse } from '@/types/nursery.types';

interface NurseryListProps {
  isNurseryAvailable: NurseryResponse[];
  onSelectNursery?: (nurseryId: number) => void;
  selectedNurseryId?: number | null;
}

export default function NurseryList({
  isNurseryAvailable,
  onSelectNursery,
  selectedNurseryId,
}: NurseryListProps) {
  const [internalSelectedId, setInternalSelectedId] = useState<number | null>(null);
  const selectedId = selectedNurseryId ?? internalSelectedId;
  // Tự động chọn item đầu tiên khi danh sách có dữ liệu
  useEffect(() => {
    if (isNurseryAvailable.length > 0 && !selectedId) {
      const firstId = isNurseryAvailable[0].nurseryId;
      setInternalSelectedId(firstId);
      onSelectNursery?.(firstId);
    }
  }, [isNurseryAvailable, selectedId, onSelectNursery]);
  
  const handleListNurseryClick = (id: number) => {
    setInternalSelectedId(id);
    onSelectNursery?.(id);
  };

  return (
    <>
      {isNurseryAvailable.length > 0 ? (
        <List
          component="nav" // Đổi thành nav hoặc div để hỗ trợ tương tác tốt hơn
          sx={{ 
            width: '100%', 
            maxWidth: 360, 
            bgcolor: 'background.paper',
            maxHeight: 400, // Giới hạn 5 item như đã bàn ở trên
            overflow: 'auto' 
          }}
          aria-label="nurseries"
        >
          {isNurseryAvailable.map((nursery) => (
            <ListItemButton
              key={nursery.nurseryId}
              selected={selectedId === nursery.nurseryId} // Trạng thái active (màu xanh nhẹ)
              onClick={() => handleListNurseryClick(nursery.nurseryId)}
              sx={{
                'borderRadius': '8px',
                '&.Mui-selected': {
                  backgroundColor: 'var(--primary)', // Hoặc màu bạn thích
                  borderLeft: '4px solid primary.main', // Thêm điểm nhấn bên trái
                },
              }}
            >
              <ListItemText 
              sx={{borderRadius: '8px'}}
                primary={nursery.nurseryName} 
                secondary={`${nursery.address} - ${nursery.phone}`} 
              />
            </ListItemButton>
          ))}
        </List>
      ) : (
        <p>No nurseries available.</p>
      )}
    </>
  );
}