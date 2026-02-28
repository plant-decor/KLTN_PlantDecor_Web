import Image from 'next/image';
import Link from 'next/link';

interface Error404ContentProps {
  homeHref?: string;
  title?: string;
  description?: string;
  buttonLabel?: string;
  imageAlt?: string;
}

export default function Error404Content({
  homeHref = '/',
  title = 'Không tìm thấy trang',
  description = 'Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.',
  buttonLabel = 'Về trang chủ',
  imageAlt = '404 Not Found',
}: Error404ContentProps) {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10 bg-white">
      <div className="w-full max-w-2xl text-center">
        <Image
          src="/Icon404.png"
          alt={imageAlt}
          width={420}
          height={420}
          className="mx-auto h-auto w-full max-w-sm"
          priority
        />
        <h1 className="mt-6 text-3xl md:text-4xl font-bold text-gray-900">{title}</h1>
        <p className="mt-3 text-gray-600">{description}</p>
        <div className="mt-8">
          <Link
            href={homeHref}
            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-6 py-3 text-white font-medium hover:bg-green-700 transition-colors"
          >
            {buttonLabel}
          </Link>
        </div>
      </div>
    </main>
  );
}
