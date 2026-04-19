'use client';

import React from 'react';
import StoreManagementPageClient from '@/components/store-management/StoreManagementPageClient';
import type { Plant, PlantCombo, Material } from '@/types/store-management.types';

const samplePlants: Plant[] = [];
const sampleCombos: PlantCombo[] = [];
// const sampleInstances: PlantInstance[] = [];
const sampleMaterials: Material[] = [];

export default function StoreManagementPage() {
  
  return (
    <StoreManagementPageClient
      initialPlants={samplePlants}
      initialCombos={sampleCombos}
      // initialInstances={sampleInstances}
      initialMaterials={sampleMaterials}
    />
  );
}
