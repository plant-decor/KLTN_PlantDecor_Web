'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Paper,
  Stack,
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
import {
  getManualEditorContext,
  publishCompositeManualImage,
  saveCompositeManualDraft,
} from '@/lib/api/aiRecommendationService';
import type {
  LayoutDesignManualEditorContextDto,
  LayoutDesignManualEditorPlantDto,
  ManualEditorLayerState,
  ManualEditorSnapshot,
} from '@/types/ai-recommendation.types';
import { hoverLiftStyle } from '@/lib/styles/buttonStyles';
import { Image as KonvaImage, Layer, Stage, Transformer } from 'react-konva';

interface ManualRoomEditorClientProps {
  layoutDesignId: number;
  userId: string;
}

type ApiMessage = { type: 'success' | 'error'; text: string } | null;

const DEFAULT_STAGE_WIDTH = 960;
const DEFAULT_LAYER_WIDTH = 180;

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
    id: `layer-${plant.layoutDesignPlantId ?? plant.commonPlantId ?? plant.plantInstanceId ?? Date.now()}`,
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
  const [context, setContext] = useState<LayoutDesignManualEditorContextDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<ApiMessage>(null);
  const [layers, setLayers] = useState<ManualEditorLayerState[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [roomImageUrl, setRoomImageUrl] = useState<string | null>(null);
  const [stageWidth, setStageWidth] = useState(DEFAULT_STAGE_WIDTH);
  const [stageHeight, setStageHeight] = useState(720);

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

      if (transformer) {
        transformer.visible(wasVisible);
        transformer.getLayer()?.batchDraw();
      }

      await publishCompositeManualImage(layoutDesignId, blob, serializeSnapshot(snapshot), false, false);
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

  return (
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
                <Button variant="outlined" onClick={clearSelection} disabled={!selectedLayerId}>
                  Clear selection
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
  );
}
