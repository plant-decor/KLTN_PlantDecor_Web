interface PageProps {
  params: Promise<{ userid: string }>;
}

export default async function OrdersPage({ params }: PageProps) {
  const { userid } = await params;
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Lịch sử đơn hàng</h1>
        <p className="text-xl text-gray-600">
          Đơn hàng của user: {userid}
        </p>
      </div>
    </div>
  );
}
