import Image from "next/image";
import Link from "next/link";
import MainLayout from "@/components/layout/MainLayout";

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-50 to-green-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Nâng tầm không gian sống với{" "}
                <span className="text-green-600">AI</span>
              </h1>
              <p className="text-xl text-gray-600 mt-6 leading-relaxed">
                Khám phá thế giới cây cảnh với công nghệ AI hiện đại. Chúng tôi giúp bạn tạo ra không gian sống xanh, thông minh và tràn đầy sức sống.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link
                  href="/products"
                  className="bg-green-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors text-center"
                >
                  Khám phá ngay
                </Link>
                <Link
                  href="/services"
                  className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-green-600 hover:text-white transition-colors text-center"
                >
                  Tư vấn AI
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="w-full h-32 bg-green-200 rounded-lg"></div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="w-full h-24 bg-green-300 rounded-lg"></div>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="w-full h-24 bg-green-400 rounded-lg"></div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="w-full h-32 bg-green-500 rounded-lg"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="w-full h-28 bg-green-600 rounded-lg"></div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <div className="w-full h-20 bg-green-700 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Cách thức hoạt động
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Từ việc tư vấn thiết kế đến chăm sóc cây cảnh, chúng tôi đồng hành cùng bạn trong mọi bước
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Tư vấn thiết kế</h3>
              <p className="text-gray-600">
                Đội ngũ chuyên gia của chúng tôi sẽ tư vấn và thiết kế không gian xanh phù hợp với nhu cầu của bạn
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Chăm sóc AI</h3>
              <p className="text-gray-600">
                Ứng dụng công nghệ AI để theo dõi và chăm sóc cây cảnh một cách thông minh và hiệu quả
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Đội tác nghiệp</h3>
              <p className="text-gray-600">
                Dịch vụ giao hàng nhanh chóng và đội ngũ kỹ thuật viên chuyên nghiệp hỗ trợ 24/7
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Sản phẩm nổi bật
              </h2>
              <p className="text-xl text-gray-600">
                Khám phá những sản phẩm cây cảnh được yêu thích nhất
              </p>
            </div>
            <Link
              href="/products"
              className="text-green-600 hover:text-green-700 font-semibold flex items-center"
            >
              Xem tất cả
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-green-200 relative">
                <span className="absolute top-4 left-4 bg-green-600 text-white px-2 py-1 text-xs rounded">New</span>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Cây Monstera Deliciosa</h3>
                <p className="text-gray-600 text-sm mb-4">Cây cảnh không khí, dễ trồng và chăm sóc</p>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-bold text-lg">450.000đ</span>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-green-300"></div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Cây Lưỡi Hổ</h3>
                <p className="text-gray-600 text-sm mb-4">Lọc không khí hiệu quả, phù hợp văn phòng</p>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-bold text-lg">250.000đ</span>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-green-400"></div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Combo Sen Đá Mix</h3>
                <p className="text-gray-600 text-sm mb-4">Bộ sưu tập sen đá nhiều màu sắc</p>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-bold text-lg">180.000đ</span>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <div className="w-full h-48 bg-green-500 relative">
                <span className="absolute top-4 left-4 bg-red-600 text-white px-2 py-1 text-xs rounded">Sale</span>
              </div>
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Cây Tù Và lá Tím</h3>
                <p className="text-gray-600 text-sm mb-4">Màu sắc độc đáo, thu hút ánh nhìn</p>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-400 line-through text-sm">350.000đ</span>
                    <span className="text-green-600 font-bold text-lg ml-2">280.000đ</span>
                  </div>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors">
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Cảm nhận chăm sóc tự chuyên gia
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Hãy để AI giúp bạn tối ưu hóa việc chăm sóc cây cảnh. Chúng tôi cung cấp những gợi ý thông minh dựa trên tình trạng thực tế của từng loại cây.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Phân tích thông minh</h3>
                    <p className="text-gray-600">AI phân tích tình trạng cây và đưa ra lời khuyên chăm sóc phù hợp</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Nhắc nhở thông minh</h3>
                    <p className="text-gray-600">Được nhắc nhở tưới nước, bón phân đúng thời điểm</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Theo dõi thông số</h3>
                    <p className="text-gray-600">Giám sát nhiệt độ, độ ẩm và ánh sáng tự động</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="w-full h-64 bg-gradient-to-br from-green-200 to-green-400 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
