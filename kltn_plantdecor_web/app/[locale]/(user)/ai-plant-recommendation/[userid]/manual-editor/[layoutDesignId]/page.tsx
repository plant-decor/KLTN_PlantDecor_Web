import ManualRoomEditorRouteClient from '@/components/ai-recommendation/ManualRoomEditorRouteClient';

interface PageProps {
  params: Promise<{ userid: string; layoutDesignId: string }>;
}

export default async function ManualEditorPage({ params }: PageProps) {
  const { userid, layoutDesignId } = await params;

  return <ManualRoomEditorRouteClient layoutDesignId={Number(layoutDesignId)} userId={userid} />;
}
