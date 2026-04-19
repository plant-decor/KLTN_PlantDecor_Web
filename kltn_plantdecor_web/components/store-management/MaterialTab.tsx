'use client';

import React from 'react';
import type { Material } from '@/types/store-management.types';
import AdminMaterialMode from './AdminMaterialMode';
import ManagerMaterialMode from './ManagerMaterialMode';

interface MaterialTabProps {
  initialMaterials?: Material[];
  mode?: 'admin' | 'manager';
}

export default function MaterialTab({ mode = 'admin' }: MaterialTabProps) {
  if (mode === 'manager') {
    return <ManagerMaterialMode />;
  }

  return <AdminMaterialMode />;
}
