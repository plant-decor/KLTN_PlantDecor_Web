import AIChatbotClient from '@/components/ai-chatbot/AIChatbotClient';

interface PageProps {
  params: Promise<{ userid: string }>;
}

export default async function AIChatbotPage({ params }: PageProps) {
  const { userid } = await params;
  return (
    <>
      {userid && (
        <AIChatbotClient />
      )}
    </>
  )
}

