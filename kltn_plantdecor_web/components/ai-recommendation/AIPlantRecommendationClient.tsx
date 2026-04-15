'use client';

import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { addItemToCart } from '@/lib/api/cartWishlistService';
import { notifyCartUpdated } from '@/lib/utils/cartEvents';
import { searchShopNurseries, type ShopNurseryListItem } from '@/lib/api/shopPlantsService';
import ClickableImageViewer from '@/components/image-view/ClickableImageViewer';
import {
  analyzeRoomUpload,
  generateLayoutImages,
} from '@/lib/api/aiRecommendationService';
import type {
  AllergyPlantOption,
  AnalyzeRoomUploadPayload,
  GenerateLayoutImagesPayload,
  RoomPlantRecommendation,
} from '@/types/ai-recommendation.types';
import RoomInputCard from './RoomInputCard';
import RoomAnalysisCard from './RoomAnalysisCard';
import PlantRecommendationsGrid from './PlantRecommendationsGrid';
import GeneratedImagesCard from './GeneratedImagesCard';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/heif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface AIPlantRecommendationClientProps {
  userId: string;
}

type MessageState = {
  type: 'success' | 'error';
  text: string;
} | null;

const resolveCommonPlantId = (recommendation: RoomPlantRecommendation): number | null => {
  if (recommendation.entityId > 0) {
    return recommendation.entityId;
  }

  if (recommendation.productId > 0) {
    return recommendation.productId;
  }

  return null;
};

const resolvePlantInstanceId = (recommendation: RoomPlantRecommendation): number | null => {
  if (recommendation.productId > 0) {
    return recommendation.productId;
  }

  return null;
};

export default function AIPlantRecommendationClient({ userId }: AIPlantRecommendationClientProps) {
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuthStore();
  const t = useTranslations('aiRecommendation');
  const parsedRouteUserId = Number(userId);

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
    if (generateResult) {
      return 3;
    }

    if (analysisResult?.recommendations?.length) {
      return 2;
    }

    if (analysisResult?.roomAnalysis) {
      return 1;
    }

    return 0;
  }, [analysisResult, generateResult]);

  const handleGenerateImages = async (layoutDesignId: number) => {
    try {
      setIsGenerating(true);
      setError(null);
      const payload = await generateLayoutImages(layoutDesignId, false, true);
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
        true
      );

      if (!result) {
        setError(t('errors.noAnalysisResult'));
        return;
      }

      setAnalysisResult(result);

      if (result.layoutDesignId > 0) {
        await handleGenerateImages(result.layoutDesignId);
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

  const handleAddCommonPlantToCart = async (recommendation: RoomPlantRecommendation) => {
    try {
      setMessage(null);
      setError(null);

      const commonPlantId = resolveCommonPlantId(recommendation);
      if (!commonPlantId) {
        setError(t('recommendations.errors.missingCommonPlantId'));
        return;
      }

      await addItemToCart({ commonPlantId, quantity: 1 });
      notifyCartUpdated();
      setMessage({ type: 'success', text: t('recommendations.errors.addedToCart', { name: recommendation.name }) });
    } catch (cartError) {
      const errorMessage = cartError instanceof Error ? cartError.message : t('recommendations.errors.addToCartFailed');
      setError(errorMessage);
      console.error('Add common plant to cart error:', cartError);
    }
  };

  const handleBuyPlantInstanceNow = (recommendation: RoomPlantRecommendation) => {
    const checkoutUserId = user?.id ?? (Number.isInteger(parsedRouteUserId) && parsedRouteUserId > 0 ? parsedRouteUserId : null);

    if (!checkoutUserId) {
      router.push(`/${locale}/login`);
      return;
    }

    const plantInstanceId = resolvePlantInstanceId(recommendation);
    if (!plantInstanceId) {
      setError(t('recommendations.errors.checkoutFailed'));
      return;
    }

    const query = new URLSearchParams({
      orderType: '2',
      paymentStrategy: '1',
      plantId: String(recommendation.entityId > 0 ? recommendation.entityId : 0),
      plantInstanceId: String(plantInstanceId),
      instanceName: recommendation.name,
      instancePrice: String(recommendation.price ?? 0),
    });

    router.push(`/${locale}/checkout/${checkoutUserId}/0?${query.toString()}`);
  };

  return (
    <Box sx={{ py: 4, px: { xs: 2, md: 4 }, maxWidth: 1280, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        {t('title')}
      </Typography>

      <Stepper activeStep={stepIndex} sx={{ mb: 4 }}>
        {[
          t('steps.roomInput'),
          t('steps.roomAnalysis'),
          t('steps.recommendations'),
          t('steps.generatedImages'),
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

      {analysisResult && <RoomAnalysisCard analysisResult={analysisResult} />}

      <PlantRecommendationsGrid
        analysisResult={analysisResult}
        onAddToCart={handleAddCommonPlantToCart}
        onBuyNow={handleBuyPlantInstanceNow}
      />

      <GeneratedImagesCard
        isGenerating={isGenerating}
        generateResult={generateResult}
        analysisResult={analysisResult}
        onRetryGenerate={() => {
          if (analysisResult?.layoutDesignId) {
            void handleGenerateImages(analysisResult.layoutDesignId);
          }
        }}
      />
    </Box>
  );
}
