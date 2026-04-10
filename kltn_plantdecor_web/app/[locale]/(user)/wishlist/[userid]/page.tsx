import WishlistPageClient from '@/components/wishlist/WishlistPageClient';
import { fetchWishlistItems } from '@/lib/api/cartWishlistService';

interface PageProps {
  params: Promise<{ userid: string }>;
}

export default async function WishlistPage({ params }: PageProps) {
  const { userid } = await params;
  let initialPayload = null;

  try {
    initialPayload = await fetchWishlistItems(
      {
        pageNumber: 1,
        pageSize: 10,
      },
      true,
      false
    );
  } catch (error) {
    console.error('Fetch wishlist SSR error:', error);
  }

  return <WishlistPageClient userid={userid} initialPayload={initialPayload} />;
}
