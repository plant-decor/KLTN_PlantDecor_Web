'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import ProductCard from '@/components/product/ProductCard';
import CartEmptyState from '@/components/cart/CartEmptyState';
import {
  addItemToCart,
  checkWishlistItem,
  fetchWishlistItems,
  removeItemFromWishlist,
  type WishlistItemType,
  type WishlistListItem,
} from '@/lib/api/cartWishlistService';
import { ShopPlantListItem } from '@/lib/api/shopPlantsService';
import { notifyCartUpdated } from '@/lib/utils/cartEvents';
import { formatCurrency } from '@/lib/utils/formatUtil';

interface WishlistPageClientProps {
  userid: string;
}

const WISHLIST_TABS: WishlistItemType[] = [
  'CommonPlant',
  'PlantInstance',
  'NurseryPlantCombo',
  'NurseryMaterial',
];

const TAB_LABELS: Record<WishlistItemType, string> = {
  CommonPlant: 'Common Plants',
  PlantInstance: 'Plant Instances',
  NurseryPlantCombo: 'Plant Combos',
  NurseryMaterial: 'Materials',
};

const buildWishlistKey = (itemType: WishlistItemType, itemId: number): string =>
  `${itemType}:${itemId}`;

export default function WishlistPageClient({ userid }: WishlistPageClientProps) {
  const locale = useLocale();
  const router = useRouter();
  const tWishlist = useTranslations('wishlist');

  const [activeTab, setActiveTab] = useState<WishlistItemType>('CommonPlant');
  const [items, setItems] = useState<WishlistListItem[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [stockCheckMap, setStockCheckMap] = useState<Record<string, boolean>>({});
  const [isRemovingKey, setIsRemovingKey] = useState<string | null>(null);
  const [isAddingCartKey, setIsAddingCartKey] = useState<string | null>(null);

  const loadWishlist = useCallback(async () => {
    try {
      setIsLoading(true);
      const payload = await fetchWishlistItems({
        pageNumber,
        pageSize,
      });

      setItems(payload.items ?? []);
      setTotalCount(payload.totalCount ?? 0);
      setTotalPages(Math.max(1, payload.totalPages ?? 1));

      const stockChecks = await Promise.allSettled(
        (payload.items ?? []).map((item) => checkWishlistItem(item.itemType, item.itemId))
      );

      setStockCheckMap((current) => {
        const next = { ...current };
        (payload.items ?? []).forEach((item, index) => {
          const result = stockChecks[index];
          next[buildWishlistKey(item.itemType, item.itemId)] =
            result?.status === 'fulfilled' ? result.value : true;
        });
        return next;
      });
    } catch (error) {
      console.error('Fetch wishlist error:', error);
      setItems([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [pageNumber, pageSize]);

  useEffect(() => {
    void loadWishlist();
  }, [loadWishlist, userid]);

  const filteredItems = useMemo(
    () => items.filter((item) => item.itemType === activeTab),
    [items, activeTab]
  );

  const toShopPlantListItem = useCallback(
    (item: WishlistListItem): ShopPlantListItem => {
      const stockKey = buildWishlistKey(item.itemType, item.itemId);
      const isCheckedInStock = stockCheckMap[stockKey] !== false;
      const stock = isCheckedInStock ? Math.max(0, item.quantity) : 0;

      return {
        id: item.itemId,
        name: item.itemName,
        basePrice: item.price,
        size: 'medium',
        careLevel: 'easy',
        isActive: true,
        primaryImageUrl: item.itemImageUrl,
        totalInstances: stock,
        availableInstances: stock,
        availableCommonQuantity: stock,
        totalAvailableStock: stock,
        categoryNames: [],
        tagNames: [],
      };
    },
    [stockCheckMap]
  );

  const handleRemoveFromWishlist = async (itemType: WishlistItemType, itemId: number) => {
    const targetKey = buildWishlistKey(itemType, itemId);
    let nextItemsSnapshot: WishlistListItem[] = [];

    try {
      setIsRemovingKey(targetKey);
      setItems((current) => {
        nextItemsSnapshot = current.filter(
          (item) => !(item.itemType === itemType && item.itemId === itemId)
        );
        return nextItemsSnapshot;
      });

      await removeItemFromWishlist(itemType, itemId);
      setTotalCount((current) => Math.max(0, current - 1));

      const activeTabItemCount = nextItemsSnapshot.filter((item) => item.itemType === activeTab).length;
      if (activeTabItemCount === 0 && pageNumber > 1) {
        setPageNumber((current) => Math.max(1, current - 1));
      } else {
        await loadWishlist();
      }
    } catch (error) {
      console.error('Remove wishlist item error:', error);
      await loadWishlist();
    } finally {
      setIsRemovingKey(null);
    }
  };

  const handleAddToCart = async (item: WishlistListItem) => {
    if (item.itemType === 'PlantInstance') {
      return;
    }

    const targetKey = buildWishlistKey(item.itemType, item.itemId);
    const inStock = stockCheckMap[targetKey] !== false && item.quantity > 0;
    if (!inStock) {
      return;
    }

    try {
      setIsAddingCartKey(targetKey);

      if (item.itemType === 'CommonPlant') {
        await addItemToCart({ commonPlantId: item.itemId, quantity: 1 });
      } else if (item.itemType === 'NurseryPlantCombo') {
        await addItemToCart({ nurseryPlantComboId: item.itemId, quantity: 1 });
      } else if (item.itemType === 'NurseryMaterial') {
        await addItemToCart({ nurseryMaterialId: item.itemId, quantity: 1 });
      }

      notifyCartUpdated();
    } catch (error) {
      console.error('Add wishlist item to cart error:', error);
    } finally {
      setIsAddingCartKey(null);
    }
  };

  const handleChangeTab = (_: SyntheticEvent, tabValue: string) => {
    setActiveTab(tabValue as WishlistItemType);
    setPageNumber(1);
  };

  const handlePreviousPage = () => {
    setPageNumber((current) => Math.max(1, current - 1));
  };

  const handleNextPage = () => {
    setPageNumber((current) => Math.min(totalPages, current + 1));
  };

  const getItemDetailHref = (item: WishlistListItem): string => {
    if (item.itemType === 'NurseryMaterial') {
      return `/${locale}/materials/${item.itemId}`;
    }

    return `/${locale}/products/${item.itemId}`;
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 20 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (totalCount === 0) {
    return <CartEmptyState type="wishlist" />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1 }}>
        {tWishlist('title')}
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
        {tWishlist('subtitle', { count: totalCount })}
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleChangeTab} variant="scrollable" scrollButtons="auto">
          {WISHLIST_TABS.map((tab) => (
            <Tab key={tab} label={TAB_LABELS[tab]} value={tab} />
          ))}
        </Tabs>
      </Box>

      {filteredItems.length === 0 ? (
        <Typography variant="body1" color="text.secondary" sx={{ py: 6 }}>
          No items in this tab on page {pageNumber}.
        </Typography>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredItems.map((item) => {
            const stockKey = buildWishlistKey(item.itemType, item.itemId);
            const isInStock = stockCheckMap[stockKey] !== false && item.quantity > 0;
            const isRemoving = isRemovingKey === stockKey;
            const isAdding = isAddingCartKey === stockKey;

            if (item.itemType === 'CommonPlant') {
              return (
                <ProductCard
                  key={stockKey}
                  plant={toShopPlantListItem(item)}
                  showAddToWishlistButton={false}
                  showAddToCartButton
                  showRemoveFromWishlistButton
                  wishlistItemType={item.itemType}
                  wishlistItemId={item.itemId}
                  onRemoveFromWishlist={handleRemoveFromWishlist}
                />
              );
            }

            return (
              <Card key={stockKey} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ position: 'relative', width: '100%', height: 200 }}>
                  <Image
                    src={item.itemImageUrl || '/img/fallbackplant.avif'}
                    alt={item.itemName}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {item.itemName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Type: {TAB_LABELS[item.itemType]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Quantity: {item.quantity}
                  </Typography>
                  {item.additionalInfo && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {item.additionalInfo}
                    </Typography>
                  )}
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(item.price, locale)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0, display: 'grid', gap: 1 }}>
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={isRemoving}
                    onClick={() => void handleRemoveFromWishlist(item.itemType, item.itemId)}
                  >
                    {tWishlist('removeItem')}
                  </Button>

                  {item.itemType === 'PlantInstance' ? (
                    <Button
                      variant="contained"
                      onClick={() => router.push(getItemDetailHref(item))}
                      sx={{
                        bgcolor: 'var(--primary)',
                        '&:hover': { bgcolor: '#45a049' },
                      }}
                    >
                      View details
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      disabled={isAdding || !isInStock}
                      onClick={() => void handleAddToCart(item)}
                      sx={{
                        bgcolor: 'var(--primary)',
                        '&:hover': { bgcolor: '#45a049' },
                      }}
                    >
                      {!isInStock ? 'Out of stock' : 'Add to cart'}
                    </Button>
                  )}
                </CardActions>
              </Card>
            );
          })}
        </div>
      )}

      <Box
        sx={{
          mt: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Button variant="outlined" onClick={handlePreviousPage} disabled={pageNumber <= 1 || isLoading}>
          Previous
        </Button>
        <Typography variant="body2" color="text.secondary">
          Page {pageNumber} / {Math.max(1, totalPages)}
        </Typography>
        <Button
          variant="outlined"
          onClick={handleNextPage}
          disabled={pageNumber >= Math.max(1, totalPages) || isLoading}
        >
          Next
        </Button>
      </Box>
    </Container>
  );
}
