'use client';

import dynamic from 'next/dynamic';
import { CustomLoading } from '@/components/CustomLoading';

interface ManualRoomEditorRouteClientProps {
  layoutDesignId: number;
  userId: string;
}

const ManualRoomEditorClient = dynamic(() => import('./ManualRoomEditorClient'), {
  ssr: false,
  loading: () => <CustomLoading />,
});

export default function ManualRoomEditorRouteClient({ layoutDesignId, userId }: ManualRoomEditorRouteClientProps) {
  return <ManualRoomEditorClient layoutDesignId={layoutDesignId} userId={userId} />;
}