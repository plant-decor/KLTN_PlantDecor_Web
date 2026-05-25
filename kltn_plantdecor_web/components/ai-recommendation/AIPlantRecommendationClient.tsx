'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Stack, Step, StepLabel, Stepper, Typography } from '@mui/material';
import { HistoryOutlined } from '@mui/icons-material';
import { CustomLoading } from '@/components/CustomLoading';
import { addItemToCart } from '@/lib/api/cartWishlistService';
import { notifyCartUpdated } from '@/lib/utils/cartEvents';
import { parseCurrencyInput } from '@/lib/utils/formatUtil';
import { getRoomDesignEnums, type PlantEnumValue, type ShopNurseryListItem } from '@/lib/api/shopPlantsService';
import { getUserProfile } from '@/lib/api/userProfileService';
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
import Step1ImageUpload from './steps/Step1ImageUpload';
import Step2FengShui from './steps/Step2FengShui';
import Step3Lighting from './steps/Step3Lighting';
import Step4Budget from './steps/Step4Budget';
import RoomAnalysisCard from './RoomAnalysisCard';
import GeneratedImagesCard from './GeneratedImagesCard';
import MyDesignHistoryModal from './MyDesignHistoryModal';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

const STEP_LABELS = ['Room Images', 'Feng Shui', 'Lighting', 'Budget & Care', 'Results'];

type RoomDesignEnumMap = {
  roomTypes: PlantEnumValue[];
  roomStyles: PlantEnumValue[];
  lightRequirements: PlantEnumValue[];
  lightDirections: PlantEnumValue[];
  dominantDirections: PlantEnumValue[];
  fengShuiElements: PlantEnumValue[];
};

const resolveEnumMap = (groups: Array<{ enumName: string; values: PlantEnumValue[] }>): RoomDesignEnumMap => {
  const map = new Map<string, PlantEnumValue[]>();
  groups.forEach((g) => { if (g?.enumName) map.set(g.enumName, Array.isArray(g.values) ? g.values : []); });
  return {
    roomTypes: map.get('RoomType') ?? [],
    roomStyles: map.get('RoomStyle') ?? [],
    lightRequirements: map.get('LightRequirement') ?? [],
    lightDirections: map.get('LightDirection') ?? [],
    dominantDirections: map.get('DominantDirection') ?? [],
    fengShuiElements: map.get('FengShuiElement') ?? [],
  };
};

interface AIPlantRecommendationClientProps {
  userId: string;
}

type MessageState = { type: 'success' | 'error'; text: string } | null;

export default function AIPlantRecommendationClient({ userId }: AIPlantRecommendationClientProps) {
  const locale = useLocale();
  const router = useRouter();
  // ── Navigation ──────────────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // ── User profile (for Step 2 auto-fill) ─────────────────────────────────────
  // const [profileBirthDate, setProfileBirthDate] = useState('');
  const [profileFengShuiElement, setProfileFengShuiElement] = useState('');

  // ── Enums ────────────────────────────────────────────────────────────────────
  const [enumMap, setEnumMap] = useState<RoomDesignEnumMap>(() => resolveEnumMap([]));

  // ── Step 1: images ───────────────────────────────────────────────────────────
  const [imagesByViewAngle, setImagesByViewAngle] = useState<Partial<Record<RoomViewAngle, File>>>({});
  const [imagePreviewUrlsByViewAngle, setImagePreviewUrlsByViewAngle] = useState<Partial<Record<RoomViewAngle, string>>>({});
  const imagePreviewUrlsRef = useRef(imagePreviewUrlsByViewAngle);
  const [roomType, setRoomType] = useState('LivingRoom');
  const [roomStyle, setRoomStyle] = useState('Minimalist');
  const [roomArea, setRoomArea] = useState('0');

  // ── Step 2: fengshui ─────────────────────────────────────────────────────────
  const [fengShuiElement, setFengShuiElement] = useState('');
  // const [dominantDirection, setDominantDirection] = useState('');
  const [isBuyingForSelf, setIsBuyingForSelf] = useState(true);
  // const [otherBirthDate, setOtherBirthDate] = useState('');
  // const [calendarType, setCalendarType] = useState<'Solar' | 'Lunar'>('Solar');

  // ── Step 3: lighting ─────────────────────────────────────────────────────────
  const [lightDirection, setLightDirection] = useState('');
  const [naturalLightLevel, setNaturalLightLevel] = useState('');

  // ── Step 4: budget & care ────────────────────────────────────────────────────
  const [minBudget, setMinBudget] = useState('0');
  const [maxBudget, setMaxBudget] = useState('0');
  const [careLevelType, setCareLevelType] = useState('Easy');
  const [hasAllergy, setHasAllergy] = useState(true);
  const [allergyNote, setAllergyNote] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState<AllergyPlantOption[]>([]);
  const [petSafe, setPetSafe] = useState(true);
  const [childSafe, setChildSafe] = useState(true);
  const [selectedNurseries, setSelectedNurseries] = useState<ShopNurseryListItem[]>([]);

  // ── Analysis / results ───────────────────────────────────────────────────────
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeRoomUploadPayload | null>(null);
  const [generateResult, setGenerateResult] = useState<GenerateLayoutImagesPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<MessageState>(null);
  const [addingLayoutDesignPlantId, setAddingLayoutDesignPlantId] = useState<number | null>(null);
  const [isMyDesignModalOpen, setIsMyDesignModalOpen] = useState(false);

  // ── Lifecycle ────────────────────────────────────────────────────────────────
  useEffect(() => {
    imagePreviewUrlsRef.current = imagePreviewUrlsByViewAngle;
  }, [imagePreviewUrlsByViewAngle]);

  useEffect(() => {
    return () => {
      Object.values(imagePreviewUrlsRef.current).forEach((url) => { if (url) URL.revokeObjectURL(url); });
    };
  }, []);

  // Fetch user profile for Step 2 auto-fill
  useEffect(() => {
    void (async () => {
      try {
        const response = await getUserProfile(false);
        if (response?.payload) {
          const p = response.payload;
          // setProfileBirthDate(p.birthDate || '');
          setProfileFengShuiElement(p.fengShuiElement || '');
          if (p.fengShuiElement) setFengShuiElement(p.fengShuiElement);
        }
      } catch {
        // profile unavailable — user can still fill manually
      }
    })();
  }, []);

  // Fetch enums once for all steps
  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await getRoomDesignEnums(false, false).catch(() => null);
        if (!active) return;
        const payload = (response?.payload ?? response?.data ?? []) as Array<{ enumName: string; values: PlantEnumValue[] }>;
        setEnumMap(resolveEnumMap(Array.isArray(payload) ? payload : []));
      } catch { /* use fallback values in step components */ }
    })();
    return () => { active = false; };
  }, []);

  // ── Derived maps for cart resolution ─────────────────────────────────────────
  const recommendationsByCommonPlantId = useMemo(() => {
    const map = new Map<number, RoomPlantRecommendation>();
    (analysisResult?.recommendations ?? [])
      .filter((r) => r.entityType === 'CommonPlant')
      .forEach((r) => {
        if (r.entityId > 0 && !map.has(r.entityId)) map.set(r.entityId, r);
        if (r.productId > 0 && !map.has(r.productId)) map.set(r.productId, r);
      });
    return map;
  }, [analysisResult]);

  const recommendationsByPlantInstanceId = useMemo(() => {
    const map = new Map<number, RoomPlantRecommendation>();
    (analysisResult?.recommendations ?? [])
      .filter((r) => r.entityType === 'PlantInstance')
      .forEach((r) => {
        if (r.entityId > 0 && !map.has(r.entityId)) map.set(r.entityId, r);
        if (r.productId > 0 && !map.has(r.productId)) map.set(r.productId, r);
      });
    return map;
  }, [analysisResult]);

  const resolveRecommendationFromGeneratedItem = (item: GeneratedLayoutImageItem): RoomPlantRecommendation | null => {
    if (item.commonPlantId && item.commonPlantId > 0) {
      const m = recommendationsByCommonPlantId.get(item.commonPlantId);
      if (m) return m;
    }
    if (item.plantInstanceId && item.plantInstanceId > 0) {
      const m = recommendationsByPlantInstanceId.get(item.plantInstanceId);
      if (m) return m;
    }
    return null;
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleUploadImage = (viewAngle: RoomViewAngle, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const nextUrl = URL.createObjectURL(file);
    setImagesByViewAngle((prev) => ({ ...prev, [viewAngle]: file }));
    setImagePreviewUrlsByViewAngle((prev) => {
      const next = { ...prev };
      const existing = next[viewAngle];
      if (existing) URL.revokeObjectURL(existing);
      next[viewAngle] = nextUrl;
      return next;
    });
    event.target.value = '';
  };

  const handleRemoveImage = (viewAngle: RoomViewAngle) => {
    setImagesByViewAngle((prev) => { const n = { ...prev }; delete n[viewAngle]; return n; });
    setImagePreviewUrlsByViewAngle((prev) => {
      const n = { ...prev };
      if (n[viewAngle]) URL.revokeObjectURL(n[viewAngle]!);
      delete n[viewAngle];
      return n;
    });
  };

  const handleGenerateImages = async (layoutDesignId: number) => {
    try {
      setIsGenerating(true);
      setError(null);
      const payload = await generateLayoutImages(layoutDesignId, false, false);
      setGenerateResult(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate AI images.');
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
    setHasSubmitted(true);

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
          // dominantDirection: dominantDirection || undefined,
          naturalLightLevel: naturalLightLevel || undefined,
          minBudget: parseCurrencyInput(minBudget) > 0 ? parseCurrencyInput(minBudget) : undefined,
          maxBudget: parseCurrencyInput(maxBudget) > 0 ? parseCurrencyInput(maxBudget) : undefined,
          careLevelType: careLevelType || undefined,
          hasAllergy,
          allergyNote,
          allergicPlantIds: hasAllergy ? selectedAllergies.map((a) => a.plantId) : [],
          petSafe,
          childSafe,
          preferredNurseryIds: selectedNurseries.map((n) => n.id),
        },
        false,
        false
      );
      if (!result) { setError('No analysis result returned from server.'); return; }
      setAnalysisResult(result);
      if (result.layoutDesignId > 0) void handleGenerateImages(result.layoutDesignId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to analyze room.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddGeneratedPlantToCart = async (item: GeneratedLayoutImageItem) => {
    try {
      setMessage(null);
      setError(null);
      setAddingLayoutDesignPlantId(item.layoutDesignPlantId);
      if (!item.commonPlantId || item.commonPlantId <= 0) {
        setError('Cannot add to cart because plant id is missing.');
        return;
      }
      const matched = resolveRecommendationFromGeneratedItem(item);
      await addItemToCart({ commonPlantId: item.commonPlantId, quantity: 1 });
      notifyCartUpdated();
      setMessage({ type: 'success', text: `Added ${matched?.name ?? 'Recommended plant'} to cart.` });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add item to cart.');
    } finally {
      setAddingLayoutDesignPlantId(null);
    }
  };

  // ── Active stepper index (0-4) ───────────────────────────────────────────────
  const activeStepIndex = hasSubmitted ? 4 : currentStep;
  
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
        <Button
          className="bg-primary! font-semibold!"
          variant="outlined"
          onClick={() => setIsMyDesignModalOpen(true)}
        >
          My Designs <HistoryOutlined sx={{ ml: 0.5 }} />
        </Button>
      </Stack>

      <Stepper activeStep={activeStepIndex} sx={{ mb: 4, pt: 4 }} alternativeLabel>
        {STEP_LABELS.map((label) => (
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

      {/* ── Input wizard (steps 0-3) ── */}
      {!hasSubmitted && (
        <>
          {currentStep === 0 && (
            <Step1ImageUpload
              imagesByViewAngle={imagesByViewAngle}
              imagePreviewUrlsByViewAngle={imagePreviewUrlsByViewAngle}
              roomType={roomType}
              roomStyle={roomStyle}
              roomArea={roomArea}
              roomTypes={enumMap.roomTypes}
              roomStyles={enumMap.roomStyles}
              error={error}
              onUploadImage={handleUploadImage}
              onRemoveImage={handleRemoveImage}
              onRoomTypeChange={setRoomType}
              onRoomStyleChange={setRoomStyle}
              onRoomAreaChange={setRoomArea}
              onErrorDismiss={() => setError(null)}
              onNext={() => { setError(null); setCurrentStep(1); }}
            />
          )}

          {currentStep === 1 && (
            <Step2FengShui
              fengShui={fengShuiElement}
              fengShuiElements={enumMap.fengShuiElements}
              isBuyingForSelf={isBuyingForSelf}
              profileFengShuiElement={profileFengShuiElement}
              onFengShuiChange={setFengShuiElement}
              onIsBuyingForSelfChange={setIsBuyingForSelf}
              onBack={() => setCurrentStep(0)}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <Step3Lighting
              lightDirection={lightDirection}
              naturalLightLevel={naturalLightLevel}
              lightDirections={enumMap.lightDirections}
              lightLevels={enumMap.lightRequirements}
              onLightDirectionChange={setLightDirection}
              onNaturalLightLevelChange={setNaturalLightLevel}
              onBack={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <Step4Budget
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
              onMinBudgetChange={setMinBudget}
              onMaxBudgetChange={setMaxBudget}
              onCareLevelChange={setCareLevelType}
              onHasAllergyChange={setHasAllergy}
              onAllergyNoteChange={setAllergyNote}
              onPetSafeChange={setPetSafe}
              onChildSafeChange={setChildSafe}
              onSelectedNurseriesChange={setSelectedNurseries}
              onSelectedAllergiesChange={setSelectedAllergies}
              onBack={() => setCurrentStep(2)}
              onSubmit={handleAnalyze}
            />
          )}
        </>
      )}

      {/* ── Results (after submit) ── */}
      {hasSubmitted && (
        <>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {isAnalyzing && !analysisResult && (
            <Card sx={{ mb: 3, boxShadow: 2 }}>
              <CardContent>
                <Box className="flex items-center gap-2 w-fit">
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
              if (analysisResult?.layoutDesignId) void handleGenerateImages(analysisResult.layoutDesignId);
            }}
            onOpenManualEditor={handleOpenManualEditor}
          />

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-start' }}>
            <Button
              variant="outlined"
              onClick={() => {
                setHasSubmitted(false);
                setCurrentStep(0);
                setAnalysisResult(null);
                setGenerateResult(null);
                setError(null);
              }}
            >
              Start over
            </Button>
          </Box>
        </>
      )}
      
      <MyDesignHistoryModal
        open={isMyDesignModalOpen}
        userId={userId}
        onClose={() => setIsMyDesignModalOpen(false)}
      />
    </Box>
  );
}
