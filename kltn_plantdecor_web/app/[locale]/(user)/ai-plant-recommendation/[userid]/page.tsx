import AIPlantRecommendationClient from '@/components/ai-recommendation/AIPlantRecommendationClient';

interface PageProps {
  params: Promise<{ userid: string }>;
}

export default async function AIPlantRecommendationPage({ params }: PageProps) {
  const { userid } = await params;

  return <AIPlantRecommendationClient userId={userid} />;
}
