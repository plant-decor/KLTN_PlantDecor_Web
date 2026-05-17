'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { CustomLoading } from '@/components/CustomLoading';
import { addItemToCart } from '@/lib/api/cartWishlistService';
import { notifyCartUpdated } from '@/lib/utils/cartEvents';
import { parseCurrencyInput } from '@/lib/utils/formatUtil';
import type { ShopNurseryListItem } from '@/lib/api/shopPlantsService';
import {
  analyzeRoom,
  generateLayoutImages,
  uploadRoomImages,
} from '@/lib/api/aiRecommendationService';
import type {
  AllergyPlantOption,
  AnalyzeRoomUploadPayload,
  GeneratedLayoutImageItem,
  GenerateLayoutImagesPayload,
  RoomPlantRecommendation,
  RoomViewAngle,
} from '@/types/ai-recommendation.types';
import RoomInputCard from './RoomInputCard';
import RoomAnalysisCard from './RoomAnalysisCard';
import GeneratedImagesCard from './GeneratedImagesCard';
import MyDesignHistoryModal from './MyDesignHistoryModal';
import { HistoryOutlined } from '@mui/icons-material';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/heif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface AIPlantRecommendationClientProps {
  userId: string;
}

type MessageState = {
  type: 'success' | 'error';
  text: string;
} | null;

export default function AIPlantRecommendationClient({ userId }: AIPlantRecommendationClientProps) {
  const locale = useLocale();
  const router = useRouter();
  const [imagesByViewAngle, setImagesByViewAngle] = useState<Partial<Record<RoomViewAngle, File>>>({});
  const [imagePreviewUrlsByViewAngle, setImagePreviewUrlsByViewAngle] = useState<Partial<Record<RoomViewAngle, string>>>(
    {}
  );
  const imagePreviewUrlsRef = useRef(imagePreviewUrlsByViewAngle);
  const [fengShuiElement, setFengShuiElement] = useState('');
  const [roomType, setRoomType] = useState('LivingRoom');
  const [roomStyle, setRoomStyle] = useState('Minimalist');
  const [roomArea, setRoomArea] = useState('0');
  const [lightDirection, setLightDirection] = useState('');
  const [dominantDirection, setDominantDirection] = useState('');
  const [naturalLightLevel, setNaturalLightLevel] = useState('');
  const [minBudget, setMinBudget] = useState('0');
  const [maxBudget, setMaxBudget] = useState('0');
  const [careLevelType, setCareLevelType] = useState('Easy');
  const [hasAllergy, setHasAllergy] = useState(true);
  const [allergyNote, setAllergyNote] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState<AllergyPlantOption[]>([]);
  const [petSafe, setPetSafe] = useState(true);
  const [childSafe, setChildSafe] = useState(true);
  const [selectedNurseries, setSelectedNurseries] = useState<ShopNurseryListItem[]>([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeRoomUploadPayload | null>(null);
  const [generateResult, setGenerateResult] = useState<GenerateLayoutImagesPayload | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<MessageState>(null);
  const [addingLayoutDesignPlantId, setAddingLayoutDesignPlantId] = useState<number | null>(null);
  const [isMyDesignModalOpen, setIsMyDesignModalOpen] = useState(false);

  useEffect(() => {
    imagePreviewUrlsRef.current = imagePreviewUrlsByViewAngle;
  }, [imagePreviewUrlsByViewAngle]);

  useEffect(() => {
    return () => {
      Object.values(imagePreviewUrlsRef.current).forEach((url) => {
        if (url) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);

  const selectedAllergyIds = useMemo(
    () => selectedAllergies.map((item) => item.plantId),
    [selectedAllergies]
  );

  const stepIndex = useMemo(() => {
    if (isGenerating || generateResult) {
      return 2;
    }

    if (isAnalyzing) {
      return 1;
    }

    if (analysisResult?.roomAnalysis) {
      return 1;
    }

    return 0;
  }, [analysisResult, generateResult, isAnalyzing, isGenerating]);

  const recommendationsByCommonPlantId = useMemo(() => {
    const map = new Map<number, RoomPlantRecommendation>();

    (analysisResult?.recommendations ?? [])
      .filter((recommendation) => recommendation.entityType === 'CommonPlant')
      .forEach((recommendation) => {
        if (recommendation.entityId > 0 && !map.has(recommendation.entityId)) {
          map.set(recommendation.entityId, recommendation);
        }
        if (recommendation.productId > 0 && !map.has(recommendation.productId)) {
          map.set(recommendation.productId, recommendation);
        }
      });

    return map;
  }, [analysisResult]);

  const recommendationsByPlantInstanceId = useMemo(() => {
    const map = new Map<number, RoomPlantRecommendation>();

    (analysisResult?.recommendations ?? [])
      .filter((recommendation) => recommendation.entityType === 'PlantInstance')
      .forEach((recommendation) => {
        if (recommendation.entityId > 0 && !map.has(recommendation.entityId)) {
          map.set(recommendation.entityId, recommendation);
        }
        if (recommendation.productId > 0 && !map.has(recommendation.productId)) {
          map.set(recommendation.productId, recommendation);
        }
      });

    return map;
  }, [analysisResult]);

  const resolveRecommendationFromGeneratedItem = (item: GeneratedLayoutImageItem): RoomPlantRecommendation | null => {
    if (item.commonPlantId && item.commonPlantId > 0) {
      const matched = recommendationsByCommonPlantId.get(item.commonPlantId);
      if (matched) {
        return matched;
      }
    }

    if (item.plantInstanceId && item.plantInstanceId > 0) {
      const matched = recommendationsByPlantInstanceId.get(item.plantInstanceId);
      if (matched) {
        return matched;
      }
    }

    return null;
  };

  const handleGenerateImages = async (layoutDesignId: number) => {
    try {
      setIsGenerating(true);
      setError(null);
      const payload = await generateLayoutImages(layoutDesignId, false, false);
      setGenerateResult(payload);
    } catch (generateError) {
      const errorMessage =
        generateError instanceof Error ? generateError.message : 'Failed to generate AI images.';
      setError(errorMessage);
      console.error('Generate image error:', generateError);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!imagesByViewAngle.Front) {
      setError('Please upload at least 1 image from the Front view.');
      return;
    }

    setMessage(null);
    setError(null);
    setAnalysisResult(null);
    setGenerateResult(null);
    setAddingLayoutDesignPlantId(null);

    try {
      setIsAnalyzing(true);
      const uploadPayload = await uploadRoomImages({ imagesByViewAngle }, false, false);
      const roomImageIds = (uploadPayload?.roomImages ?? []).map((item) => item.roomImageId).filter((id) => id > 0);

      if (roomImageIds.length === 0) {
        setError('Image upload failed or no roomImageIds were returned.');
        return;
      }

      const result = await analyzeRoom(
        {
          roomImageIds,
          fengShuiElement: fengShuiElement || undefined,
          roomType,
          roomStyle,
          roomArea: Number(roomArea) || 0,
          lightDirection: lightDirection || undefined,
          dominantDirection: dominantDirection || undefined,
          naturalLightLevel: naturalLightLevel || undefined,
          minBudget: parseCurrencyInput(minBudget) > 0 ? parseCurrencyInput(minBudget) : undefined,
          maxBudget: parseCurrencyInput(maxBudget) > 0 ? parseCurrencyInput(maxBudget) : undefined,
          careLevelType: careLevelType || undefined,
          hasAllergy,
          allergyNote,
          allergicPlantIds: hasAllergy ? selectedAllergyIds : [],
          petSafe,
          childSafe,
          preferredNurseryIds: selectedNurseries.map((nursery) => nursery.id),
        },
        false,
        false
      );

      if (!result) {
        setError('No analysis result returned from server.');
        return;
      }

      setAnalysisResult(result);

      if (result.layoutDesignId > 0) {
        void handleGenerateImages(result.layoutDesignId);
      }
    } catch (analyzeError) {
      const errorMessage =
        analyzeError instanceof Error ? analyzeError.message : 'Failed to analyze room image.';
      setError(errorMessage);
      console.error('Analyze room error:', analyzeError);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadImage = (viewAngle: RoomViewAngle, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Unsupported image format. Please select JPEG, JPG, PNG or HEIF.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than or equal to 10MB.');
      return;
    }

    setError(null);

    const nextUrl = URL.createObjectURL(file);
    setImagesByViewAngle((prev) => ({ ...prev, [viewAngle]: file }));
    setImagePreviewUrlsByViewAngle((prev) => {
      const next = { ...prev };
      const existingUrl = next[viewAngle];
      if (existingUrl) {
        URL.revokeObjectURL(existingUrl);
      }
      next[viewAngle] = nextUrl;
      return next;
    });
    event.target.value = '';
  };

  const handleRemoveImage = (viewAngle: RoomViewAngle) => {
    setImagesByViewAngle((prev) => {
      const next = { ...prev };
      delete next[viewAngle];
      return next;
    });

    setImagePreviewUrlsByViewAngle((prev) => {
      const next = { ...prev };
      const existingUrl = next[viewAngle];
      if (existingUrl) {
        URL.revokeObjectURL(existingUrl);
      }
      delete next[viewAngle];
      return next;
    });
  };

  const handleAddGeneratedPlantToCart = async (item: GeneratedLayoutImageItem) => {
    try {
      setMessage(null);
      setError(null);
      setAddingLayoutDesignPlantId(item.layoutDesignPlantId);

      if (!item.commonPlantId || item.commonPlantId <= 0) {
        setError('Cannot add this recommendation to cart because plant id is missing.');
        return;
      }

      const matchedRecommendation = resolveRecommendationFromGeneratedItem(item);

      await addItemToCart({ commonPlantId: item.commonPlantId, quantity: 1 });
      notifyCartUpdated();
      setMessage({
        type: 'success',
        text: `Added ${matchedRecommendation?.name ?? 'Recommended plant'} to cart.`,
      });
    } catch (cartError) {
      const errorMessage =
        cartError instanceof Error ? cartError.message : 'Failed to add item to cart.';
      setError(errorMessage);
      console.error('Add common plant to cart error:', cartError);
    } finally {
      setAddingLayoutDesignPlantId(null);
    }
  };

  const handleOpenManualEditor = (layoutDesignId: number) => {
    router.push(`/${locale}/ai-plant-recommendation/${userId}/manual-editor/${layoutDesignId}`);
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 1280, mx: 'auto' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1.5}
        sx={{ mb: 1 }}
      >
        <Typography variant="h4" fontWeight="bold">
          AI Plant Recommendation
        </Typography>
        <Button className='bg-primary! font-semibold!' variant="outlined" onClick={() => setIsMyDesignModalOpen(true)}>
          My Design <HistoryOutlined  sx={{ ml: 0.5 }} />
        </Button>
      </Stack>

      <Stepper activeStep={stepIndex} sx={{ mb: 4, pt: 4 }}>
        {[
          'Room Input',
          'Room Analysis',
          'Results',
        ].map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <RoomInputCard
        imagesByViewAngle={imagesByViewAngle}
        imagePreviewUrlsByViewAngle={imagePreviewUrlsByViewAngle}
        fengShuiElement={fengShuiElement}
        roomType={roomType}
        roomStyle={roomStyle}
        roomArea={roomArea}
        lightDirection={lightDirection}
        dominantDirection={dominantDirection}
        naturalLightLevel={naturalLightLevel}
        minBudget={minBudget}
        maxBudget={maxBudget}
        careLevelType={careLevelType}
        hasAllergy={hasAllergy}
        allergyNote={allergyNote}
        selectedAllergies={selectedAllergies}
        petSafe={petSafe}
        childSafe={childSafe}
        selectedNurseries={selectedNurseries}
        isAnalyzing={isAnalyzing}
        error={error}
        onUploadImage={handleUploadImage}
        onRemoveImage={handleRemoveImage}
        onFengShuiChange={setFengShuiElement}
        onRoomTypeChange={setRoomType}
        onRoomStyleChange={setRoomStyle}
        onRoomAreaChange={setRoomArea}
        onLightDirectionChange={setLightDirection}
        onDominantDirectionChange={setDominantDirection}
        onNaturalLightLevelChange={setNaturalLightLevel}
        onMinBudgetChange={setMinBudget}
        onMaxBudgetChange={setMaxBudget}
        onCareLevelChange={setCareLevelType}
        onHasAllergyChange={setHasAllergy}
        onAllergyNoteChange={setAllergyNote}
        onPetSafeChange={setPetSafe}
        onChildSafeChange={setChildSafe}
        onSelectedNurseriesChange={setSelectedNurseries}
        onSelectedAllergiesChange={setSelectedAllergies}
        onAnalyze={handleAnalyze}
        onErrorDismiss={() => setError(null)}
      />

      {isAnalyzing && !analysisResult && (
        <Card sx={{ mb: 3, boxShadow: 2 }}>
          <CardContent>
            <Box className='flex items-center gap-2 w-fit'>
            <Box sx={{ width: 30, height: 30, display: 'flex', flexShrink: 0, alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>                
              <CustomLoading size={26} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Analyzing room...
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {analysisResult && <RoomAnalysisCard analysisResult={analysisResult} />}

      <GeneratedImagesCard
        isGenerating={isGenerating}
        generateResult={generateResult}
        analysisResult={analysisResult}
        resolveRecommendationFromGeneratedItem={resolveRecommendationFromGeneratedItem}
        addingLayoutDesignPlantId={addingLayoutDesignPlantId}
        onAddToCart={handleAddGeneratedPlantToCart}
        onRetryGenerate={() => {
          if (analysisResult?.layoutDesignId) {
            void handleGenerateImages(analysisResult.layoutDesignId);
          }
        }}
        onOpenManualEditor={handleOpenManualEditor}
      />

      <MyDesignHistoryModal
        open={isMyDesignModalOpen}
        userId={userId}
        onClose={() => setIsMyDesignModalOpen(false)}
      />
    </Box>
  );
}
