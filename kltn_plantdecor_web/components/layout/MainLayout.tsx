import Header from './Header';
import Footer from './Footer';
import { getCategoryTreeSSR } from '@/lib/api/categoriesService.server';
import type { CategoryTreeNode } from '@/lib/api/categoriesService';
import { cache } from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}


const getInitialStoreCategories = cache(async (): Promise<CategoryTreeNode[]> => {
  try {
    const response = await getCategoryTreeSSR();
    return response.payload ?? response.data ?? [];
  } catch (error) {
    console.error('Failed to fetch categories tree for SSR navigation:', error);
    return [];
  }
});

export default async function MainLayout({ children }: MainLayoutProps) {
  const initialStoreCategories = await getInitialStoreCategories();

  return (
    <div className="min-h-screen flex flex-col">
      <Header initialStoreCategories={initialStoreCategories} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
