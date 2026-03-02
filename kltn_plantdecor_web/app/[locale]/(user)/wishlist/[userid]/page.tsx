import WishlistPageClient from '@/components/wishlist/WishlistPageClient';

interface PageProps {
  params: Promise<{ userid: string }>;
}

export default async function WishlistPage({ params }: PageProps) {
  const { userid } = await params;
  return <WishlistPageClient userid={userid} />;
}
