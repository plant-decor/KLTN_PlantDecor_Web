'use client';

import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, IconButton, MenuItem, TextField, Typography } from '@mui/material';
import type { Tag } from '@/data/storeCatalogData';
import { hoverGlowStyle, hoverLiftStyle } from '@/lib/styles/buttonStyles';

interface TagsSectionProps {
  tagsError: string | null;
  tagsLoading: boolean;
  tags: Tag[];
  tagPageNumber: number;
  tagPageSize: number;
  tagTotalPages: number;
  tagHasPrevious: boolean;
  tagHasNext: boolean;
  onClearError: () => void;
  onChangePageSize: (size: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onOpenCreate: () => void;
  onEditTag: (tag: Tag) => void;
  onDeleteTag: (tag: Tag) => void;
}

export default function TagsSection({
  tagsError,
  tagsLoading,
  tags,
  tagPageNumber,
  tagPageSize,
  tagTotalPages,
  tagHasPrevious,
  tagHasNext,
  onClearError,
  onChangePageSize,
  onPrevPage,
  onNextPage,
  onOpenCreate,
  onEditTag,
  onDeleteTag,
}: TagsSectionProps) {
  return (
    <>
      {tagsError && (
        <Alert severity="error" onClose={onClearError} sx={{ mb: 2 }}>
          {tagsError}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            select
            size="small"
            label="Page size"
            value={tagPageSize}
            onChange={(e) => onChangePageSize(Number(e.target.value))}
            sx={{ minWidth: 120 }}
            disabled={tagsLoading}
          >
            <MenuItem value={20}>20</MenuItem>
            <MenuItem value={40}>40</MenuItem>
            <MenuItem value={60}>60</MenuItem>
          </TextField>

          <Button size="small" variant="outlined" disabled={!tagHasPrevious || tagsLoading} onClick={onPrevPage}>
            Trước
          </Button>

          <Typography variant="body2" sx={{ color: '#666' }}>
            Trang {tagPageNumber} / {Math.max(tagTotalPages, 1)}
          </Typography>

          <Button size="small" variant="outlined" disabled={!tagHasNext || tagsLoading} onClick={onNextPage}>
            Sau
          </Button>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />} onClick={onOpenCreate} sx={{ backgroundColor: 'var(--primary)', ...hoverLiftStyle }}>
          Thêm thẻ mới
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' }, gap: 2 }}>
        {tags.length > 0 ? (
          tags.map((tag) => (
            <Card
              key={tag.id}
              sx={{
                ...hoverGlowStyle,
              }}
              className="flex! items-center! justify-center!"
            >
              <CardContent className="w-full h-full flex-col! items-center! justify-center!" sx={{ p: 2,textAlign: 'center' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold'}}>
                    {tag.tagName}
                  </Typography>
                  <IconButton size="small" onClick={() => onEditTag(tag)} color="primary" sx={{...hoverLiftStyle}}>
                    <EditIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton size="small" onClick={() => onDeleteTag(tag)} color="error" sx={{...hoverLiftStyle}}>
                    <DeleteIcon sx={{ fontSize: 18 }} />
                  </IconButton>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body2" sx={{ color: '#999', gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
            No tags yet. Create one to get started!
          </Typography>
        )}
      </Box>
    </>
  );
}
