'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Delete as DeleteIcon,
  Flip as FlipIcon,
  Publish as PublishIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { CustomLoading } from '@/components/CustomLoading';
import { addItemToCart } from '@/lib/api/cartWishlistService';
import {
  getManualEditorContext,
  publishCompositeManualImage,
  saveCompositeManualDraft,
  beautifyCompositeManualImage,
  calculateManualTotal,
} from '@/lib/api/aiRecommendationService';
import { useAuthStore } from '@/lib/store/authStore';
import type {
  LayoutDesignManualEditorContextDto,
  LayoutDesignManualEditorImageDto,
  ManualEditorCalculateTotalResult,
  LayoutDesignManualEditorPlantDto,
  ManualEditorLayerState,
  ManualEditorSnapshot,
} from '@/types/ai-recommendation.types';
import { notifyCartUpdated } from '@/lib/utils/cartEvents';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { Image as KonvaImage, Layer, Stage, Transformer } from 'react-konva';

interface ManualRoomEditorClientProps {
  layoutDesignId: number;
  userId: string;
}

type ApiMessage = { type: 'success' | 'error'; text: string } | null;

const DEFAULT_STAGE_WIDTH = 960;
const DEFAULT_LAYER_WIDTH = 180;
const currencyVndFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
});

const readImageSize = (url?: string | null): Promise<{ image: HTMLImageElement; width: number; height: number } | null> => {
  if (!url) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      resolve({ image, width: image.naturalWidth || image.width, height: image.naturalHeight || image.height });
    };
    image.onerror = () => resolve(null);
    image.src = url;
  });
};

const useLoadedImage = (url?: string | null) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    let active = true;

    if (!url) {
      return () => {
        active = false;
      };
    }

    const next = new window.Image();
    next.crossOrigin = 'anonymous';
    next.onload = () => {
      if (active) {
        setImage(next);
      }
    };
    next.onerror = () => {
      if (active) {
        setImage(null);
      }
    };
    next.src = url;

    return () => {
      active = false;
    };
  }, [url]);

  return image;
};

const normalizeLayerOrder = (layers: ManualEditorLayerState[]) =>
  layers
    .slice()
    .sort((left, right) => left.zIndex - right.zIndex)
    .map((layer, index) => ({
      ...layer,
      zIndex: index + 1,
    }));

const nextZIndex = (layers: ManualEditorLayerState[]) => layers.reduce((max, layer) => Math.max(max, layer.zIndex), 0) + 1;

const createUniqueLayerId = (plant: LayoutDesignManualEditorPlantDto) => {
  const sourceId = plant.layoutDesignPlantId ?? plant.commonPlantId ?? plant.plantInstanceId ?? 'plant';
  const randomSuffix = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `layer-${sourceId}-${randomSuffix}`;
};

const serializeSnapshot = (snapshot: ManualEditorSnapshot) =>
  JSON.stringify({ version: 1, ...snapshot });

const createLayerFromPlant = async (
  plant: LayoutDesignManualEditorPlantDto,
  anchorX: number,
  anchorY: number,
  zIndex: number
): Promise<ManualEditorLayerState | null> => {
  const loaded = await readImageSize(plant.imageUrl);
  if (!loaded) {
    return null;
  }

  const aspectRatio = loaded.width > 0 ? loaded.height / loaded.width : 1;
  const width = DEFAULT_LAYER_WIDTH;
  const height = Math.max(80, Math.round(DEFAULT_LAYER_WIDTH * aspectRatio));

  return {
    id: createUniqueLayerId(plant),
    type: 'image',
    name: plant.name,
    plantImageUrl: plant.imageUrl ?? '',
    layoutDesignPlantId: plant.layoutDesignPlantId,
    commonPlantId: plant.commonPlantId,
    plantInstanceId: plant.plantInstanceId,
    x: Math.max(0, Math.round(anchorX - width / 2)),
    y: Math.max(0, Math.round(anchorY - height / 2)),
    width,
    height,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    flipped: false,
    zIndex,
    opacity: 1,
    maskPoints: [],
  };
};

type PlantLayerNodeProps = {
  layer: ManualEditorLayerState;
  isSelected: boolean;
  imageUrl?: string | null;
  onSelect: (layerId: string) => void;
  onChange: (layerId: string, patch: Partial<ManualEditorLayerState>) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  registerNode: (layerId: string, node: any) => void;
  // shadow controls
  // shadow controls removed
};

function PlantLayerNode({ layer, isSelected, imageUrl, onSelect, onChange, registerNode }: PlantLayerNodeProps) {
  const image = useLoadedImage(imageUrl);  
  
  return (  
    <KonvaImage  
      id={layer.id}
      name={layer.name}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={(node: any) => registerNode(layer.id, node)}
      image={image ?? undefined}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      rotation={layer.rotation}
      opacity={layer.opacity}
      draggable
      scaleX={layer.flipped ? -1 : 1}
      scaleY={1}
      onClick={() => onSelect(layer.id)}
      onTap={() => onSelect(layer.id)}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onDragEnd={(event: any) => {
        onChange(layer.id, {
          x: Math.round(event.target.x()),
          y: Math.round(event.target.y()),
        });
      }}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onTransformEnd={(event: any) => {
        const node = event.target;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const nextWidth = Math.max(40, Math.round(node.width() * Math.abs(scaleX)));
        const nextHeight = Math.max(40, Math.round(node.height() * Math.abs(scaleY)));
        const flipped = scaleX < 0 ? !layer.flipped : layer.flipped;

        node.scaleX(1);
        node.scaleY(1);

        onChange(layer.id, {
          x: Math.round(node.x()),
          y: Math.round(node.y()),
          rotation: Math.round(node.rotation()),
          width: nextWidth,
          height: nextHeight,
          flipped,
        });
      }}
      shadowColor={isSelected ? 'rgba(16, 185, 129, 0.8)' : undefined}
      shadowBlur={isSelected ? 12 : 0}
      shadowOpacity={isSelected ? 0.45 : 0}
    />
  );
}

export default function ManualRoomEditorClient({ layoutDesignId, userId }: ManualRoomEditorClientProps) {
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuthStore();

  const [context, setContext] = useState<LayoutDesignManualEditorContextDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishedImageUrl, setPublishedImageUrl] = useState<string | null>(null);
  const [beautifiedImageUrl, setBeautifiedImageUrl] = useState<string | null>(null);
  const [isBeautifiedDialogOpen, setIsBeautifiedDialogOpen] = useState(false);
  const [beautifying, setBeautifying] = useState(false);
  const [isImagesDialogOpen, setIsImagesDialogOpen] = useState(false);
  const [contextImages, setContextImages] = useState<LayoutDesignManualEditorImageDto[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [calculateResult, setCalculateResult] = useState<ManualEditorCalculateTotalResult | null>(null);
  const [isCalculateDialogOpen, setIsCalculateDialogOpen] = useState(false);
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<ApiMessage>(null);
  const [layers, setLayers] = useState<ManualEditorLayerState[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [roomImageUrl, setRoomImageUrl] = useState<string | null>(null);
  const [stageWidth, setStageWidth] = useState(DEFAULT_STAGE_WIDTH);
  const [stageHeight, setStageHeight] = useState(720);
  // shadow controls removed per user request

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stageRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformerRef = useRef<any>(null);
  const canvasShellRef = useRef<HTMLDivElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeRefs = useRef<Record<string, any>>({});
  const saveTimerRef = useRef<number | null>(null);

  const roomImage = useLoadedImage(roomImageUrl);
  const activeLayer = useMemo(
    () => layers.find((layer) => layer.id === selectedLayerId) ?? null,
    [layers, selectedLayerId]
  );

  const plantsByKey = useMemo(() => {
    const map = new Map<string, LayoutDesignManualEditorPlantDto>();
    (context?.plants ?? []).forEach((plant) => {
      const key =
        plant.layoutDesignPlantId?.toString() ??
        plant.commonPlantId?.toString() ??
        plant.plantInstanceId?.toString() ??
        plant.name;
      map.set(key, plant);
    });
    return map;
  }, [context?.plants]);

  const snapshot = useMemo<ManualEditorSnapshot>(
    () => ({
      roomImageUrl: roomImageUrl ?? '',
      canvasWidth: stageWidth,
      canvasHeight: stageHeight,
      layers,
    }),
    [layers, roomImageUrl, stageHeight, stageWidth]
  );

  const updateLayer = useCallback((layerId: string, patch: Partial<ManualEditorLayerState>) => {
    setLayers((current) =>
      normalizeLayerOrder(current.map((layer) => (layer.id === layerId ? { ...layer, ...patch } : layer)))
    );
  }, []);

  const addPlantLayer = useCallback(
    async (plant: LayoutDesignManualEditorPlantDto, pointerX?: number, pointerY?: number) => {
      // Enforce one-time placement for PlantInstance entities
      if (plant.plantInstanceId && layers.some((l) => l.plantInstanceId === plant.plantInstanceId)) {
        setMessage({ type: 'error', text: 'This plant instance is already placed. Delete it first to add again.' });
        return;
      }
      const anchorX = typeof pointerX === 'number' ? pointerX : stageWidth / 2;
      const anchorY = typeof pointerY === 'number' ? pointerY : stageHeight / 2;
      const nextLayer = await createLayerFromPlant(plant, anchorX, anchorY, nextZIndex(layers));
      if (!nextLayer) {
        setError(`Unable to load plant image for ${plant.name}`);
        return;
      }

      setLayers((current) => normalizeLayerOrder([...current, nextLayer]));
      setSelectedLayerId(nextLayer.id);
    },
    [layers, stageHeight, stageWidth]
  );

  const attachTransformer = useCallback(() => {
    if (!transformerRef.current || !selectedLayerId) {
      return;
    }

    const selectedNode = nodeRefs.current[selectedLayerId];
    if (selectedNode) {
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedLayerId]);

  const handleSelectLayer = useCallback((layerId: string) => {
    setSelectedLayerId((current) => (current === layerId ? null : layerId));
  }, []);

  const clearSelection = useCallback(() => {
    if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
    setSelectedLayerId(null);
  }, []);

  useEffect(() => {
    let active = true;

    const loadContext = async () => {
      try {
        setLoading(true);
        setError(null);
        const payload = await getManualEditorContext(layoutDesignId, false, false);
        if (!active || !payload) {
          return;
        }

        setContext(payload);
        setRoomImageUrl(payload.roomImageUrl);
        setContextImages(payload.images ?? []);

        const latestDraft = [...payload.images]
          .filter((item) => item.manualLayerJson?.trim())
          .sort((left, right) => {
            const leftTime = Date.parse(left.createdAt ?? '');
            const rightTime = Date.parse(right.createdAt ?? '');
            return (Number.isNaN(rightTime) ? 0 : rightTime) - (Number.isNaN(leftTime) ? 0 : leftTime);
          })[0];

        if (latestDraft?.manualLayerJson) {
          try {
            const parsed = JSON.parse(latestDraft.manualLayerJson) as Partial<ManualEditorSnapshot>;
            const parsedLayers = Array.isArray(parsed.layers) ? (parsed.layers as ManualEditorLayerState[]) : [];
            setLayers(normalizeLayerOrder(parsedLayers));
            setSelectedLayerId(parsedLayers[0]?.id ?? null);
            if (typeof parsed.canvasWidth === 'number' && parsed.canvasWidth > 0) {
              setStageWidth(parsed.canvasWidth);
            }
            if (typeof parsed.canvasHeight === 'number' && parsed.canvasHeight > 0) {
              setStageHeight(parsed.canvasHeight);
            }
            return;
          } catch (parseError) {
            console.warn('Failed to parse manual editor draft', parseError);
          }
        }

        const roomSize = await readImageSize(payload.roomImageUrl);
        if (roomSize) {
          const width = Math.min(DEFAULT_STAGE_WIDTH, Math.max(640, roomSize.width));
          const ratio = roomSize.width > 0 ? roomSize.height / roomSize.width : 1;
          setStageWidth(width);
          setStageHeight(Math.max(320, Math.round(width * ratio)));
        }

        setLayers([]);
        setSelectedLayerId(null);
      } catch (apiError) {
        const errorMessage = apiError instanceof Error ? apiError.message : 'Failed to load manual editor context.';
        setError(errorMessage);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadContext();

    return () => {
      active = false;
    };
  }, [layoutDesignId]);

  useEffect(() => {
    attachTransformer();
  }, [attachTransformer, layers]);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (!canvasShellRef.current || !roomImage) {
        return;
      }

      const rect = canvasShellRef.current.getBoundingClientRect();
      if (rect.width <= 0) {
        return;
      }

      const width = Math.min(Math.max(640, Math.floor(rect.width)), DEFAULT_STAGE_WIDTH);
      const ratio = roomImage.naturalWidth > 0 ? roomImage.naturalHeight / roomImage.naturalWidth : 1;
      setStageWidth(width);
      setStageHeight(Math.max(320, Math.round(width * ratio)));
    };

    updateCanvasSize();

    const observer = new ResizeObserver(() => updateCanvasSize());
    if (canvasShellRef.current) {
      observer.observe(canvasShellRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [roomImage]);

  useEffect(() => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
    }

    if (!context || layers.length === 0) {
      return;
    }

    saveTimerRef.current = window.setTimeout(() => {
      void (async () => {
        try {
          setSavingDraft(true);
          const layerJson = serializeSnapshot(snapshot);
          await saveCompositeManualDraft(layoutDesignId, layerJson, false, false);
          setMessage({ type: 'success', text: 'Draft saved.' });
        } catch (draftError) {
          const draftMessage = draftError instanceof Error ? draftError.message : 'Failed to save draft.';
          setError(draftMessage);
        } finally {
          setSavingDraft(false);
        }
      })();
    }, 1200);

    return () => {
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
      }
    };
  }, [context, layoutDesignId, layers, snapshot]);

  const handleCanvasDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const plantKey = event.dataTransfer.getData('text/plain');
      const plant = plantsByKey.get(plantKey);
      if (!plant) {
        return;
      }

      const bounds = canvasShellRef.current?.getBoundingClientRect();
      if (!bounds) {
        await addPlantLayer(plant);
        return;
      }

      await addPlantLayer(plant, Math.max(0, event.clientX - bounds.left), Math.max(0, event.clientY - bounds.top));
    },
    [addPlantLayer, plantsByKey]
  );

  const handlePublish = useCallback(async () => {
    if (!stageRef.current) {
      setError('Canvas is not ready yet.');
      return;
    }

    try {
      setPublishing(true);
      setError(null);
      const transformer = transformerRef.current;
      const wasVisible = transformer?.visible?.() ?? true;

      if (transformer) {
        transformer.visible(false);
        transformer.getLayer()?.batchDraw();
      }

      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2, mimeType: 'image/png' });
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // send publish request and capture returned image url
      const published = await publishCompositeManualImage(layoutDesignId, blob, serializeSnapshot(snapshot), false, false);

      if (transformer) {
        transformer.visible(wasVisible);
        transformer.getLayer()?.batchDraw();
      }

      const returnedUrl = published?.imageUrl ?? null;
      setPublishedImageUrl(returnedUrl);
      setMessage({ type: 'success', text: 'Manual image published.' });
    } catch (publishError) {
      if (transformerRef.current) {
        transformerRef.current.visible(true);
        transformerRef.current.getLayer()?.batchDraw();
      }
      const publishMessage = publishError instanceof Error ? publishError.message : 'Failed to publish manual image.';
      setError(publishMessage);
    } finally {
      setPublishing(false);
    }
  }, [layoutDesignId, snapshot]);

  const handleBeautify = useCallback(async () => {
    // Always use the most recently published image URL.
    const imageToUse = publishedImageUrl;
    if (!imageToUse) {
      setMessage({ type: 'error', text: 'Please publish the design before using Beautify with AI.' });
      return;
    }

    try {
      setBeautifying(true);
      setError(null);
      const result = await beautifyCompositeManualImage(layoutDesignId, imageToUse, serializeSnapshot(snapshot), false, false);
      const returnedUrl = result?.imageUrl ?? null;
      if (returnedUrl) {
        setBeautifiedImageUrl(returnedUrl);
        setIsBeautifiedDialogOpen(true);
        setContextImages((prev) => (result ? [result, ...prev.filter((img) => img.imageId !== result.imageId)] : prev));
      }
      setMessage({ type: 'success', text: 'Beautify job submitted.' });
    } catch (beautifyError) {
      const beautifyMessage = beautifyError instanceof Error ? beautifyError.message : 'Failed to submit beautify job.';
      setError(beautifyMessage);
    } finally {
      setBeautifying(false);
    }
  }, [layoutDesignId, publishedImageUrl, snapshot]);

  const handleRefreshImages = useCallback(async () => {
    try {
      setLoadingImages(true);
      const payload = await getManualEditorContext(layoutDesignId, false, false);
      if (payload) {
        setContextImages(payload.images ?? []);
      }
    } finally {
      setLoadingImages(false);
    }
  }, [layoutDesignId]);

  const handleCalculateTotal = useCallback(async () => {
    if (!layers || layers.length === 0) {
      setMessage({ type: 'error', text: 'No plants on canvas to calculate.' });
      return;
    }

    try {
      setCalculating(true);
      setError(null);

      const map = new Map<string, { layoutDesignPlantId?: number | null; commonPlantId?: number | null; plantInstanceId?: number | null; quantity: number }>();

      layers.forEach((layer) => {
        const key = layer.layoutDesignPlantId?.toString() ?? layer.commonPlantId?.toString() ?? layer.plantInstanceId?.toString() ?? layer.name;
        const existing = map.get(key);
        if (existing) {
          existing.quantity += 1;
        } else {
          map.set(key, {
            layoutDesignPlantId: layer.layoutDesignPlantId,
            commonPlantId: layer.commonPlantId,
            plantInstanceId: layer.plantInstanceId,
            quantity: 1,
          });
        }
      });

      const items = Array.from(map.values());
      const response = await calculateManualTotal(layoutDesignId, items, false, false);
      if (!response) {
        setError('No calculation data returned from server.');
        return;
      }

      setCalculateResult(response);
      setIsCalculateDialogOpen(true);
      setMessage({ type: 'success', text: 'Calculated manual total.' });
      if (response?.summary) {
        setMessage({ type: 'success', text: response.summary });
      }
    } catch (calcError) {
      const calcMessage = calcError instanceof Error ? calcError.message : 'Failed to calculate manual total.';
      setError(calcMessage);
    } finally {
      setCalculating(false);
    }
  }, [layers, layoutDesignId]);

  const moveSelected = useCallback(
    (direction: 'forward' | 'backward') => {
      if (!activeLayer) {
        return;
      }

      setLayers((current) => {
        const next = current.map((layer) => {
          if (layer.id === activeLayer.id) {
            return { ...layer, zIndex: direction === 'forward' ? layer.zIndex + 1 : Math.max(1, layer.zIndex - 1) };
          }

          if (direction === 'forward' && layer.zIndex === activeLayer.zIndex + 1) {
            return { ...layer, zIndex: layer.zIndex - 1 };
          }

          if (direction === 'backward' && layer.zIndex === activeLayer.zIndex - 1) {
            return { ...layer, zIndex: layer.zIndex + 1 };
          }

          return layer;
        });

        return normalizeLayerOrder(next);
      });
    },
    [activeLayer]
  );

  const handleDelete = useCallback(() => {
    if (!activeLayer) {
      return;
    }

    setLayers((current) => normalizeLayerOrder(current.filter((layer) => layer.id !== activeLayer.id)));
    setSelectedLayerId(null);
    delete nodeRefs.current[activeLayer.id];
  }, [activeLayer]);

  const getResultItemActionKey = useCallback(
    (item: { commonPlantId?: number | null; plantInstanceId?: number | null }, index: number) =>
      `${item.commonPlantId ?? 'cp'}-${item.plantInstanceId ?? 'pi'}-${index}`,
    []
  );

  const handleAddCommonPlantToCart = useCallback(
    async (item: { commonPlantId?: number | null; quantity?: number; name?: string | null }, index: number) => {
      const commonPlantId = item.commonPlantId ?? 0;
      if (commonPlantId <= 0) {
        setMessage({ type: 'error', text: 'Cannot add to cart because commonPlantId is missing.' });
        return;
      }

      const actionKey = getResultItemActionKey(item, index);

      try {
        setActionLoadingKey(actionKey);
        setError(null);
        await addItemToCart({
          commonPlantId,
          quantity: Math.max(1, Number(item.quantity ?? 1)),
        });
        notifyCartUpdated();
        setMessage({
          type: 'success',
          text: `Added ${item.name?.trim() ? item.name : 'plant'} to cart.`,
        });
      } catch (cartError) {
        const errorMessage = cartError instanceof Error ? cartError.message : 'Failed to add item to cart.';
        setError(errorMessage);
      } finally {
        setActionLoadingKey(null);
      }
    },
    [getResultItemActionKey]
  );

  const handleBuyNowPlantInstance = useCallback(
    (item: { plantInstanceId?: number | null; name?: string | null; unitPrice?: number | null }) => {
      if (!user?.id) {
        router.push(`/${locale}/login`);
        return;
      }

      const plantInstanceId = item.plantInstanceId ?? 0;
      if (plantInstanceId <= 0) {
        setMessage({ type: 'error', text: 'Cannot proceed because plantInstanceId is missing.' });
        return;
      }

      const query = new URLSearchParams({
        orderType: '2',
        paymentStrategy: '1',
        plantId: String(plantInstanceId),
        plantInstanceId: String(plantInstanceId),
        instanceName: item.name?.trim() || 'Plant instance',
        instancePrice: String(item.unitPrice ?? 0),
      });

      router.push(`/${locale}/checkout/${user.id}/0?${query.toString()}`);
    },
    [locale, router, user?.id]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CustomLoading size={24} />
          <Typography variant="body2" color="text.secondary">
            Loading manual editor...
          </Typography>
        </Stack>
      </Box>
    );
  }

  const calculateItems = calculateResult?.items ?? [];
  const totalAmount = calculateItems.reduce((sum, item) => {
    const safeSubTotal = typeof item.subTotal === 'number' ? item.subTotal : 0;
    return sum + safeSubTotal;
  }, 0);

  return (
    <>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', lg: '320px minmax(0, 1fr) 320px' }, minHeight: 'calc(100vh - 120px)' }}>
      <Card sx={{ boxShadow: 2, minHeight: 0 }}>
        <CardContent>
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Plants
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Drag a plant onto the room image or click to insert it.
            </Typography>
            <Chip label={context?.isFullCatalog ? 'Full catalog' : 'Recommended set'} size="small" color="primary" variant="outlined" />
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1.5} sx={{ maxHeight: { xs: 'auto', lg: 'calc(100vh - 300px)' }, overflowY: 'auto', pr: 1 }}>
            {(context?.plants ?? []).map((plant) => {
              const key =
                plant.layoutDesignPlantId?.toString() ??
                plant.commonPlantId?.toString() ??
                plant.plantInstanceId?.toString() ??
                plant.name;

              return (
                <Paper
                  key={key}
                  variant="outlined"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', key);
                    event.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => void addPlantLayer(plant)}
                  sx={{
                    p: 1.5,
                    cursor: 'grab',
                    display: 'grid',
                    gridTemplateColumns: '64px 1fr',
                    gap: 1.5,
                    alignItems: 'center',
                    '&:hover': { borderColor: 'primary.main', boxShadow: 1 },
                  }}
                >
                  <Box sx={{ width: 64, height: 64, overflow: 'hidden', borderRadius: 1, backgroundColor: '#f4f6f8' }}>
                    {plant.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={plant.imageUrl} alt={plant.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : null}
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {plant.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {plant.isRecommended ? 'Recommended' : 'Catalog'}
                      {plant.placementPosition ? ` • ${plant.placementPosition}` : ''}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: 2, minHeight: 0 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={1.5} sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Room Canvas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Original room photo from the user upload. Editing as user {userId}.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => window.history.back()}>
                Back
              </Button>
              <Button variant="outlined" startIcon={<SaveIcon />} onClick={() => void saveCompositeManualDraft(layoutDesignId, serializeSnapshot(snapshot), false, false)} disabled={savingDraft}>
                {savingDraft ? 'Saving...' : 'Save draft'}
              </Button>
              <Button variant="contained" startIcon={<PublishIcon />} onClick={() => void handlePublish()} disabled={publishing} sx={{ backgroundColor: 'var(--primary)', fontWeight: 700, ...hoverLiftStyle }}>
                {publishing ? 'Publishing...' : 'Publish'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<PublishIcon />}
                onClick={() => void handleBeautify()}
                disabled={!publishedImageUrl || beautifying}
                sx={{ fontWeight: 700 }}
              >
                {beautifying ? 'Beautifying...' : 'Beautify with AI'}
              </Button>
              <Button variant="outlined" onClick={() => void handleCalculateTotal()} disabled={calculating || layers.length === 0}>
                {calculating ? 'Calculating...' : 'Calculate total'}
              </Button>
              {/* shadow controls removed */}
              <Button variant="outlined" onClick={clearSelection} disabled={!selectedLayerId}>
                Clear selection
              </Button>
              <Button variant="outlined" onClick={() => setIsImagesDialogOpen(true)}>
                View Created Images
              </Button>
            </Stack>
          </Stack>

          {message && (
            <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
              {message.text}
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Box
            ref={canvasShellRef}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => void handleCanvasDrop(event)}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: 'linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)',
              overflow: 'hidden',
            }}
          >
            {roomImage ? (
              <Stage
                ref={stageRef}
                width={stageWidth}
                height={stageHeight}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onMouseDown={(event: any) => {
                  const clickedOnEmpty = event.target === event.target.getStage();
                  if (clickedOnEmpty) {
                    clearSelection();
                  }
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onTouchStart={(event: any) => {
                  const clickedOnEmpty = event.target === event.target.getStage();
                  if (clickedOnEmpty) {
                    clearSelection();
                  }
                }}
              >
                <Layer>
                  <KonvaImage image={roomImage} x={0} y={0} width={stageWidth} height={stageHeight} listening={false} />
                </Layer>

                <Layer>
                  {normalizeLayerOrder(layers).map((layer) => (
                    <PlantLayerNode
                      key={layer.id}
                      layer={layer}
                      isSelected={selectedLayerId === layer.id}
                      imageUrl={layer.plantImageUrl}
                      onSelect={handleSelectLayer}
                      onChange={updateLayer}
                      registerNode={(layerId, node) => {
                        nodeRefs.current[layerId] = node;
                      }}
                      
                    />
                  ))}
                  <Transformer
                    ref={transformerRef}
                    rotateEnabled
                    keepRatio={false}
                    enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    boundBoxFunc={(oldBox: any, newBox: any) => {
                      if (newBox.width < 40 || newBox.height < 40) {
                        return oldBox;
                      }
                      return newBox;
                    }}
                  />
                </Layer>
              </Stage>
            ) : (
              <Box sx={{ p: 4 }}>
                <Typography color="text.secondary">Room image is not available.</Typography>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ boxShadow: 2, minHeight: 0 }}>
        <CardContent>
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>
              Layer Controls
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Arrange and fine-tune the selected plant.
            </Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />

          {activeLayer ? (
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" fontWeight={700}>
                {activeLayer.name}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`X: ${Math.round(activeLayer.x)}`} />
                <Chip label={`Y: ${Math.round(activeLayer.y)}`} />
                <Chip label={`Rotate: ${Math.round(activeLayer.rotation)}°`} />
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button variant="outlined" size="small" onClick={() => moveSelected('backward')} startIcon={<ArrowBackIcon />}>
                  Back
                </Button>
                <Button variant="outlined" size="small" onClick={() => moveSelected('forward')} startIcon={<ArrowForwardIcon />}>
                  Front
                </Button>
                <Button variant="outlined" size="small" onClick={() => updateLayer(activeLayer.id, { flipped: !activeLayer.flipped })} startIcon={<FlipIcon />}>
                  Flip
                </Button>
                <Button variant="outlined" size="small" color="error" onClick={handleDelete} startIcon={<DeleteIcon />}>
                  Delete
                </Button>
              </Stack>
              <TextField
                label="Opacity"
                type="number"
                value={activeLayer.opacity}
                onChange={(event) => updateLayer(activeLayer.id, { opacity: Number(event.target.value) || 1 })}
                inputProps={{ min: 0.1, max: 1, step: 0.1 }}
                fullWidth
                size="small"
              />
              <Typography variant="body2" color="text.secondary">
                Position and transform are saved automatically as a draft.
              </Typography>
            </Stack>
          ) : (
            <Alert severity="info">Select a plant on the canvas to edit it.</Alert>
          )}
        </CardContent>
      </Card>
      </Box>

      <Dialog
        open={isCalculateDialogOpen}
        onClose={() => setIsCalculateDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Manual Total Details</DialogTitle>
        <DialogContent dividers>
          {calculateItems.length === 0 ? (
            <Alert severity="info">Khong co du lieu tinh toan.</Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Plant</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {calculateItems.map((item, index) => (
                    <TableRow key={`${item.layoutDesignPlantId ?? 'lp'}-${item.commonPlantId ?? 'cp'}-${item.plantInstanceId ?? 'pi'}-${index}`}>
                      <TableCell>{item.name?.trim() || 'Unknown plant'}</TableCell>
                      <TableCell align="right">{currencyVndFormatter.format(Number(item.unitPrice ?? 0))}</TableCell>
                      <TableCell align="right">{item.quantity ?? 0}</TableCell>
                      <TableCell align="right">{currencyVndFormatter.format(Number(item.subTotal ?? 0))}</TableCell>
                      <TableCell align="center" sx={{ minWidth: 220 }}>
                        <Stack direction="row" spacing={1} justifyContent="center">
                          {item.commonPlantId && item.commonPlantId > 0 ? (
                            <Button
                              size="small"
                              variant="contained"
                              sx={{ backgroundColor: 'var(--primary)', fontWeight: 700, ...hoverLiftStyle }}
                              disabled={actionLoadingKey === getResultItemActionKey(item, index)}
                              onClick={() => void handleAddCommonPlantToCart(item, index)}
                            >
                              {actionLoadingKey === getResultItemActionKey(item, index) ? 'Adding...' : 'Add to cart'}
                            </Button>
                          ) : null}

                          {item.plantInstanceId && item.plantInstanceId > 0 ? (
                            <Button
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 700 }}
                              onClick={() => handleBuyNowPlantInstance(item)}
                            >
                              Buy now
                            </Button>
                          ) : null}

                          {!item.commonPlantId && !item.plantInstanceId ? (
                            <Typography variant="caption" color="text.secondary">-</Typography>
                          ) : null}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} sx={{ fontWeight: 700 }}>
                      Total
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>
                      {currencyVndFormatter.format(totalAmount)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCalculateDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isBeautifiedDialogOpen} onClose={() => setIsBeautifiedDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Beautified Image</DialogTitle>
        <DialogContent dividers>
          {beautifiedImageUrl && (
            <Box
              component="img"
              src={beautifiedImageUrl}
              alt="Beautified result"
              sx={{ width: '100%', borderRadius: 2, display: 'block' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          {beautifiedImageUrl && (
            <Button component="a" href={beautifiedImageUrl} target="_blank" rel="noopener noreferrer">
              Open in new tab
            </Button>
          )}
          <Button onClick={() => setIsBeautifiedDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isImagesDialogOpen} onClose={() => setIsImagesDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <span>Created Images</span>
            <Button size="small" onClick={() => void handleRefreshImages()} disabled={loadingImages}>
              {loadingImages ? 'Refreshing...' : 'Refresh'}
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {contextImages.filter((img) => img.imageUrl).length === 0 ? (
            <Alert severity="info">No created images yet.</Alert>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {contextImages
                .filter((img) => img.imageUrl)
                .sort((a, b) => Date.parse(b.createdAt ?? '') - Date.parse(a.createdAt ?? ''))
                .map((img) => (
                  <Box
                    key={img.imageId}
                    component="a"
                    href={img.imageUrl!}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'block', width: 200, flexShrink: 0 }}
                  >
                    <Box
                      component="img"
                      src={img.imageUrl!}
                      alt={`Image ${img.imageId}`}
                      sx={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {img.createdAt ? new Date(img.createdAt).toLocaleString() : ''}
                    </Typography>
                  </Box>
                ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsImagesDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
