'use client';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  ChevronRight as ChevronRightIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  ToggleOff as ToggleOffIcon,
  ToggleOn as ToggleOnIcon,
} from '@mui/icons-material';
import type { CategoryResponse } from '@/lib/api/categoriesService';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';

export interface HierarchicalCategoryRow {
  category: CategoryResponse;
  level: number;
  hasChildren: boolean;
}

interface CategorySectionProps {
  categoriesError: string | null;
  categoriesLoading: boolean;
  loading: boolean;
  hierarchicalCategories: HierarchicalCategoryRow[];
  expandedCategoryIds: Set<number>;
  onClearError: () => void;
  onOpenCreate: () => void;
  onToggleExpand: (categoryId: number) => void;
  onToggleActive: (category: CategoryResponse) => void;
  onEdit: (category: CategoryResponse) => void;
  onDelete: (category: CategoryResponse) => void;
}

interface CategoryCardProps {
  category: CategoryResponse;
  level: number;
  hasChildren: boolean;
  isExpanded: boolean;
  loading: boolean;
  onToggleExpand: (categoryId: number) => void;
  onToggleActive: (category: CategoryResponse) => void;
  onEdit: (category: CategoryResponse) => void;
  onDelete: (category: CategoryResponse) => void;
}

function CategoryCard({
  category,
  level,
  hasChildren,
  isExpanded,
  loading,
  onToggleExpand,
  onToggleActive,
  onEdit,
  onDelete,
}: CategoryCardProps) {
  const hasSubCategories = Array.isArray(category.subCategories) && category.subCategories.length > 0;
  const toggleTitle = hasSubCategories
    ? 'Cannot toggle category with subcategories'
    : category.isActive
      ? 'Deactivate category'
      : 'Activate category';

  return (
    <Card
      sx={{
        transition: 'box-shadow 0.3s',
        '&:hover': { boxShadow: 3 },
        ml: { xs: 0, md: Math.min(level, 4) * 2 },
        borderLeft: level ? '3px solid rgba(25, 118, 210, 0.25)' : '3px solid transparent',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, pl: `${level * 16}px` }}>
              {hasChildren ? (
                <IconButton
                  size="small"
                  onClick={() => onToggleExpand(category.id)}
                  title={isExpanded ? 'Collapse subcategories' : 'Expand subcategories'}
                  sx={{ mr: 0.5 }}
                >
                  {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                </IconButton>
              ) : (
                <Box sx={{ width: 32, height: 32, mr: 0.5 }} />
              )}

              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {category.name}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: '#777', display: 'block', mb: 1 }}>
              Level {level}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.5, mb: 1 }}>
              {category.parentCategoryName ? `Parent: ${category.parentCategoryName}` : 'Root Category'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.5, mb: 1 }}>
              Type: {category.categoryTypeName || category.categoryType}
            </Typography>
            <Chip label={category.isActive ? 'Active' : 'Inactive'} color={category.isActive ? 'success' : 'default'} size="small" />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              size="small"
              onClick={() => onToggleActive(category)}
              color={category.isActive ? 'success' : 'default'}
              title={toggleTitle}
              disabled={loading || hasSubCategories}
            >
              {category.isActive ? <ToggleOnIcon /> : <ToggleOffIcon />}
            </IconButton>
            <IconButton size="small" onClick={() => onEdit(category)} color="primary">
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(category)}
              color="error"
              title="Delete category"
              disabled={loading || hasSubCategories}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function CategorySection({
  categoriesError,
  categoriesLoading,
  loading,
  hierarchicalCategories,
  expandedCategoryIds,
  onClearError,
  onOpenCreate,
  onToggleExpand,
  onToggleActive,
  onEdit,
  onDelete,
}: CategorySectionProps) {
  return (
    <>
      {categoriesError && (
        <Alert severity="error" onClose={onClearError} sx={{ mb: 2 }}>
          {categoriesError}
        </Alert>
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 3,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ backgroundColor: 'var(--primary)', ...hoverLiftStyle }}
          onClick={onOpenCreate}
        >
          Thêm danh mục mới
        </Button>
      </Box>

      {!categoriesLoading && (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
          {hierarchicalCategories.length > 0 ? (
            hierarchicalCategories.map(({ category, level, hasChildren }) => (
              <CategoryCard
                key={category.id}
                category={category}
                level={level}
                hasChildren={hasChildren}
                isExpanded={expandedCategoryIds.has(category.id)}
                loading={loading}
                onToggleExpand={onToggleExpand}
                onToggleActive={onToggleActive}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          ) : (
            <Typography variant="body2" sx={{ color: '#999', gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
              No categories yet. Create one to get started!
            </Typography>
          )}
        </Box>
      )}
    </>
  );
}
