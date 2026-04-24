'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import { CustomLoading } from '@/components/CustomLoading';
import { addItemToCart } from '@/lib/api/cartWishlistService';
import { notifyCartUpdated } from '@/lib/utils/cartEvents';
import type { ShopNurseryListItem } from '@/lib/api/shopPlantsService';
import {
  analyzeRoomUpload,
  generateLayoutImages,
} from '@/lib/api/aiRecommendationService';
import type {
  AllergyPlantOption,
  AnalyzeRoomUploadPayload,
  GeneratedLayoutImageItem,
  GenerateLayoutImagesPayload,
  RoomPlantRecommendation,
} from '@/types/ai-recommendation.types';
import RoomInputCard from './RoomInputCard';
import RoomAnalysisCard from './RoomAnalysisCard';
import GeneratedImagesCard from './GeneratedImagesCard';
import MyDesignHistoryModal from './MyDesignHistoryModal';
import { HistoryOutlined } from '@mui/icons-material';

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
  const t = useTranslations('aiRecommendation');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [fengShuiElement, setFengShuiElement] = useState('');
  const [roomType, setRoomType] = useState('LivingRoom');
  const [roomStyle, setRoomStyle] = useState('Minimalist');
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
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(imageFile);
    setImagePreviewUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [imageFile]);

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

  const recommendationsByProductId = useMemo(() => {
    const map = new Map<number, RoomPlantRecommendation>();

    (analysisResult?.recommendations ?? []).forEach((recommendation) => {
      if (recommendation.productId > 0 && !map.has(recommendation.productId)) {
        map.set(recommendation.productId, recommendation);
      }
    });

    return map;
  }, [analysisResult]);

  const resolveRecommendationFromGeneratedItem = (item: GeneratedLayoutImageItem): RoomPlantRecommendation | null => {
    if (!item.commonPlantId || item.commonPlantId <= 0) {
      return null;
    }

    return recommendationsByProductId.get(item.commonPlantId) ?? null;
  };

  const handleGenerateImages = async (layoutDesignId: number) => {
    try {
      setIsGenerating(true);
      setError(null);
      const payload = await generateLayoutImages(layoutDesignId, false, false);
      setGenerateResult(payload);
    } catch (generateError) {
      const errorMessage = generateError instanceof Error ? generateError.message : t('generatedImages.errors.generateFailed');
      setError(errorMessage);
      console.error('Generate image error:', generateError);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError(t('roomInput.errors.selectImage'));
      return;
    }

    setMessage(null);
    setError(null);
    setAnalysisResult(null);
    setGenerateResult(null);
    setAddingLayoutDesignPlantId(null);

    try {
      setIsAnalyzing(true);
      const result = await analyzeRoomUpload(
        {
          image: imageFile,
          fengShuiElement: fengShuiElement || undefined,
          roomType,
          roomStyle,
          minBudget: Number(minBudget) || 0,
          maxBudget: Number(maxBudget) || 0,
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
        setError(t('errors.noAnalysisResult'));
        return;
      }

      setAnalysisResult(result);

      if (result.layoutDesignId > 0) {
        void handleGenerateImages(result.layoutDesignId);
      }
    } catch (analyzeError) {
      const errorMessage = analyzeError instanceof Error ? analyzeError.message : t('errors.analyzeRoomFailed');
      setError(errorMessage);
      console.error('Analyze room error:', analyzeError);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(t('roomInput.errors.unsupportedFormat'));
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(t('roomInput.errors.fileTooLarge'));
      return;
    }

    setError(null);
    setImageFile(file);
  };

  const handleAddGeneratedPlantToCart = async (item: GeneratedLayoutImageItem) => {
    try {
      setMessage(null);
      setError(null);
      setAddingLayoutDesignPlantId(item.layoutDesignPlantId);

      if (!item.commonPlantId || item.commonPlantId <= 0) {
        setError(t('recommendations.errors.missingCommonPlantId'));
        return;
      }

      const matchedRecommendation = resolveRecommendationFromGeneratedItem(item);

      await addItemToCart({ commonPlantId: item.commonPlantId, quantity: 1 });
      notifyCartUpdated();
      setMessage({
        type: 'success',
        text: t('recommendations.errors.addedToCart', {
          name: matchedRecommendation?.name ?? t('generatedImages.plantFallbackName'),
        }),
      });
    } catch (cartError) {
      const errorMessage = cartError instanceof Error ? cartError.message : t('recommendations.errors.addToCartFailed');
      setError(errorMessage);
      console.error('Add common plant to cart error:', cartError);
    } finally {
      setAddingLayoutDesignPlantId(null);
    }
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
          {t('title')}
        </Typography>
        <Button className='bg-primary! font-semibold!' variant="outlined" onClick={() => setIsMyDesignModalOpen(true)}>
          {t('myDesign.buttonLabel')} <HistoryOutlined  sx={{ ml: 0.5 }} />
        </Button>
      </Stack>

      <Stepper activeStep={stepIndex} sx={{ mb: 4, pt: 4 }}>
        {[
          t('steps.roomInput'),
          t('steps.roomAnalysis'),
          t('steps.results'),
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
        imageFile={imageFile}
        imagePreviewUrl={imagePreviewUrl}
        fengShuiElement={fengShuiElement}
        roomType={roomType}
        roomStyle={roomStyle}
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
        onFengShuiChange={setFengShuiElement}
        onRoomTypeChange={setRoomType}
        onRoomStyleChange={setRoomStyle}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CustomLoading size={20} />
              <Typography variant="body2" color="text.secondary">
                {t('roomInput.analyzingButton')}
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
      />

      <MyDesignHistoryModal
        open={isMyDesignModalOpen}
        userId={userId}
        onClose={() => setIsMyDesignModalOpen(false)}
      />
    </Box>
  );
}
