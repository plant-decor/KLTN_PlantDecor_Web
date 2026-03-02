import CartPageClient from '@/components/cart/CartPageClient';

interface PageProps {
  params: Promise<{ userid: string }>;
}

export default async function CartPage({ params }: PageProps) {
  const { userid } = await params;
  return <CartPageClient userid={userid} />;
}
